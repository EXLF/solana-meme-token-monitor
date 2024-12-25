import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
  fee: number;
  status: string;
  events: any[];
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
}

interface ApiKeyConfig {
  key: string;
  purpose: string;
  usageCount: number;
}

export class TokenHistoryService {
  private readonly apiKeys: ApiKeyConfig[];
  private readonly baseUrl: string;
  private currentKeyIndex: number;

  constructor() {
    this.apiKeys = [
      {
        key: 'b38736d5-a829-4f6b-a37f-93487de37917',
        purpose: 'testing',
        usageCount: 0
      },
      {
        key: '7b72a78a-f16f-46b2-bb24-53d2614c41b7',
        purpose: 'production',
        usageCount: 0
      }
    ];
    this.currentKeyIndex = 0;
    this.baseUrl = 'https://api.helius.xyz/v0';
  }

  private getNextApiKey(): string {
    // 轮询使用API key
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    const config = this.apiKeys[this.currentKeyIndex];
    config.usageCount++;
    return config.key;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry<T>(
    fn: (apiKey: string) => Promise<T>,
    retries = 3,
    delayMs = 1000
  ): Promise<T> {
    try {
      const apiKey = this.getNextApiKey();
      return await fn(apiKey);
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      console.log(`请求失败，${delayMs}ms 后重试，剩余重试次数：${retries}`);
      await this.delay(delayMs);
      return this.fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
  }

  private async fetchTransactionsBatch(signatures: string[]): Promise<Transaction[]> {
    try {
      const response = await this.fetchWithRetry(async (apiKey) => {
        return axios.post<Transaction[]>(`${this.baseUrl}/transactions`, {
          transactions: signatures
        }, {
          params: {
            'api-key': apiKey
          }
        });
      });

      return response.data;
    } catch (error) {
      console.error('获取批次交易失败:', error);
      throw error;
    }
  }

  public async getTokenHistory(tokenAddress: string): Promise<void> {
    try {
      // 1. 获取所有交易签名
      const signaturesResponse = await this.fetchWithRetry(async (apiKey) => {
        return axios.get<SignatureResponse[]>(`${this.baseUrl}/addresses/${tokenAddress}/transactions`, {
          params: {
            'api-key': apiKey,
            'limit': 100
          }
        });
      });

      const signatures = signaturesResponse.data.map(tx => tx.signature);
      console.log(`找到 ${signatures.length} 个交易`);

      // 2. 批量获取交易详情
      const transactions: Transaction[] = [];
      const batchSize = 5; // 减小批量大小
      
      for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);
        console.log(`处理第 ${i + 1} 到 ${i + batch.length} 个交易，共 ${signatures.length} 个`);
        
        try {
          const batchTransactions = await this.fetchTransactionsBatch(batch);
          if (batchTransactions) {
            transactions.push(...batchTransactions);
          }
          
          // 添加延迟，避免触发限流
          await this.delay(500);
        } catch (error) {
          console.error(`处理批次 ${i + 1} 到 ${i + batch.length} 失败:`, error);
          break;
        }
      }

      // 3. 保存结果
      const outputDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, 'test_result.json');
      const outputData = {
        tokenAddress,
        totalTransactions: transactions.length,
        transactions,
        apiKeyUsage: this.apiKeys.map(config => ({
          key: config.key,
          purpose: config.purpose,
          usageCount: config.usageCount
        }))
      };

      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
      console.log(`数据已保存到: ${outputPath}`);
      console.log(`共处理 ${transactions.length} 笔交易`);
      console.log('API Key 使用情况:', 
        this.apiKeys.map(config => 
          `${config.purpose}: ${config.usageCount}次`
        ).join(', ')
      );
    } catch (error) {
      console.error('获取代币历史记录失败:', error);
      throw error;
    }
  }
} 