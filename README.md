# Solana金狗智能监控

一个用于监控 Solana 链上金狗代币的智能工具。

## 功能特性

- 获取代币元数据和基本信息
- 监控代币交易历史
- 分析代币创建时间和早期交易
- 智能识别潜在的金狗代币

## 技术栈

- TypeScript
- Solana Web3.js
- Helius API
- Metaplex

## 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/solana金狗智能监控.git

# 安装依赖
npm install
```

## 使用方法

1. 配置环境变量:
```bash
cp .env.example .env
# 编辑 .env 文件添加你的 API keys
```

2. 运行测试:
```bash
npm run test
```

3. 启动服务:
```bash
npm start
```

## API 文档

### 获取代币信息
```typescript
const tokenInfo = await getTokenInfo(tokenAddress);
```

### 获取交易历史
```typescript
const history = await getTokenHistory(tokenAddress);
```

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一�� Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解更多细节 