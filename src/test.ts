import { TokenHistoryService } from './services/helius/token-history';
import fs from 'fs';
import path from 'path';

async function test() {
    const service = new TokenHistoryService();
    
    // 测试一个金狗代币
    const testAddress = "2bzZPAfSxSS27R7F4d5NzptjzEzSkXrpj6RRah63pump";
    
    try {
        console.log('Starting test...');
        await service.getTokenHistory(testAddress);
        console.log('Test completed successfully.');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test(); 