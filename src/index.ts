import { DataCollectorService } from './services/data-collector';
import * as fs from 'fs';

async function main() {
    const collector = new DataCollectorService();

    try {
        console.log('Starting data collection...');
        const data = await collector.collectAllTokensData();

        // 保存结果到文件
        fs.writeFileSync(
            './data/collected_data.json',
            JSON.stringify(data, null, 2)
        );

        console.log('Data collection completed successfully');
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

main(); 