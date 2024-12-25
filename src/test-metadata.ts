import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount } from '@solana/spl-token';
import { Metaplex } from '@metaplex-foundation/js';
import axios from 'axios';

async function testGetTokenMetadata() {
  const tokenAddress = "eY9WSFEWVhMQPHKBMur8hpYNWESBNHoXBhyQyt2pump";
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=b38736d5-a829-4f6b-a37f-93487de37917');
  const metaplex = new Metaplex(connection);

  try {
    console.log('测试获取代币元数据...');
    
    // 获取代币元数据
    const mintInfo = await getMint(
      connection,
      new PublicKey(tokenAddress)
    );

    console.log('\n代币元数据:');
    console.log('地址:', tokenAddress);
    console.log('铸币权限:', mintInfo.mintAuthority?.toBase58() || 'null');
    console.log('冻结权限:', mintInfo.freezeAuthority?.toBase58() || 'null');
    console.log('小数位数:', mintInfo.decimals);
    console.log('是否可铸造:', mintInfo.mintAuthority !== null);
    console.log('是否可冻结:', mintInfo.freezeAuthority !== null);
    console.log('总供应量:', Number(mintInfo.supply));
    console.log('是否已初始化:', mintInfo.isInitialized);

    // 获取代币账户信息
    console.log('\n尝试获取代币账户信息...');
    const accountInfo = await connection.getAccountInfo(new PublicKey(tokenAddress));
    
    if (accountInfo) {
      console.log('\n账户信息:');
      console.log('所有者:', accountInfo.owner.toBase58());
      console.log('可执行:', accountInfo.executable);
      console.log('余额:', accountInfo.lamports);
      console.log('数据长度:', accountInfo.data.length);
      console.log('租金时期:', accountInfo.rentEpoch);
    } else {
      console.log('未找到账户信息');
    }

    // 获取代币元数据账户信息
    console.log('\n尝试获取代币元数据账户信息...');
    const metadata = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(tokenAddress) });
    
    if (metadata) {
      console.log('\n元数据账户信息:');
      console.log('名称:', metadata.name);
      console.log('符号:', metadata.symbol);
      console.log('URI:', metadata.uri);
      if (metadata.creators && metadata.creators.length > 0) {
        console.log('发行者:', metadata.creators[0].address.toBase58());
      }
      console.log('版税:', metadata.sellerFeeBasisPoints / 100 + '%');

      // 获取 URI 元数据内容
      console.log('\n尝试获取 URI 元数据内容...');
      const ipfsHash = metadata.uri.split('/ipfs/')[1];
      const gateways = [
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://dweb.link/ipfs/${ipfsHash}`,
        `https://ipfs.io/ipfs/${ipfsHash}`
      ];

      for (const gateway of gateways) {
        try {
          console.log('\n尝试网关:', gateway);
          const response = await axios.get(gateway);
          console.log('\nURI 元数据内容:');
          console.log(JSON.stringify(response.data, null, 2));
          break;
        } catch (error) {
          console.log('网关访问失败:', gateway);
          continue;
        }
      }
    } else {
      console.log('未找到元数据账户信息');
    }

  } catch (error: any) {
    console.error('请求失败:', error);
  }
}

testGetTokenMetadata(); 