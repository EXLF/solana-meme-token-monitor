import dotenv from 'dotenv';
dotenv.config();

export const config = {
    heliusApiKey: process.env.HELIUS_API_KEY || '',
    postgresUrl: process.env.POSTGRES_URL || ''
}; 