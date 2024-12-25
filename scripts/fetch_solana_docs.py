import requests
from bs4 import BeautifulSoup
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from urllib.parse import urljoin

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 无头模式
    chrome_options.add_argument('--disable-gpu')
    return webdriver.Chrome(options=chrome_options)

def fetch_page_content(driver, url):
    try:
        driver.get(url)
        # 等待页面加载
        time.sleep(2)
        return driver.page_source
    except Exception as e:
        print(f"获取页面内容失败 {url}: {str(e)}")
        return None

def extract_links(soup, base_url):
    links = []
    for link in soup.find_all('a'):
        href = link.get('href')
        if not href:
            continue
            
        # 处理相对URL
        full_url = urljoin(base_url, href)
        
        # 只处理docs/core/下的链接
        if 'solana.com/docs/core/' not in full_url:
            continue
            
        title = link.get_text().strip()
        if not title:
            title = link.get('title', '').strip()
        if not title:
            continue
            
        links.append({
            "pattern": full_url,
            "title": title,
            "description": "Solana Core文档"
        })
    
    return links

def fetch_solana_docs():
    # 首先添加JavaScript文档页面
    all_links = [
        {
            "pattern": "https://solana.com/docs/clients/javascript",
            "title": "JavaScript Client for Solana",
            "description": "Solana JavaScript客户端文档"
        },
        {
            "pattern": "https://solana.com/docs/clients/javascript-reference", 
            "title": "Web3.js API Examples",
            "description": "Solana Web3.js API参考文档"
        }
    ]
    
    core_base_url = "https://solana.com/docs/core"
    visited_urls = set()
    
    try:
        driver = setup_driver()
        
        # 获取core目录下的子页面链接
        print(f"正在处理Core目录: {core_base_url}")
        content = fetch_page_content(driver, core_base_url)
        if content:
            soup = BeautifulSoup(content, 'html.parser')
            core_links = extract_links(soup, core_base_url)
            all_links.extend(core_links)
            
            # 访问每个core子页面获取更多链接
            for link in core_links:
                url = link["pattern"]
                if url not in visited_urls:
                    print(f"正在处理: {url}")
                    visited_urls.add(url)
                    content = fetch_page_content(driver, url)
                    if content:
                        soup = BeautifulSoup(content, 'html.parser')
                        page_links = extract_links(soup, url)
                        all_links.extend(page_links)
                    time.sleep(1)
        
        driver.quit()
        
        # 去重
        unique_links = []
        seen_patterns = set()
        for link in all_links:
            if link["pattern"] not in seen_patterns:
                seen_patterns.add(link["pattern"])
                unique_links.append(link)
        
        # 保存到新文件
        output_file = 'solana_docs.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique_links, f, ensure_ascii=False, indent=2)
            
        print(f"成功保存 {len(unique_links)} 个Solana文档链接到 {output_file}")
        
    except Exception as e:
        print(f"获取Solana文档失败: {str(e)}")

if __name__ == "__main__":
    fetch_solana_docs() 