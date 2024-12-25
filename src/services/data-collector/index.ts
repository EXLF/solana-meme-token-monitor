import { TokenHistoryService } from '../helius/token-history';
import { tokenAddresses } from '../../config/token_addresses.json';

export class DataCollectorService {
    private tokenHistoryService: TokenHistoryService;

    constructor() {
        this.tokenHistoryService = new TokenHistoryService();
    }

    async collectAllTokensData() {
        const results = {
            goldenDogs: [],
            trashTokens: []
        };

        // 收集金狗代币数据
        for (const address of tokenAddresses.golden_dog_tokens) {
            try {
                const data = await this.tokenHistoryService.getTokenHistory(address);
                results.goldenDogs.push(data);
            } catch (error) {
                console.error(`Failed to collect data for golden dog token ${address}:`, error);
            }
        }

        // 收集垃圾代币数据
        for (const address of tokenAddresses.trash_tokens) {
            try {
                const data = await this.tokenHistoryService.getTokenHistory(address);
                results.trashTokens.push(data);
            } catch (error) {
                console.error(`Failed to collect data for trash token ${address}:`, error);
            }
        }

        return results;
    }
} 