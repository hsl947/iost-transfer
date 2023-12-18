require('dotenv').config()
const IOST = require('iost');
const bs58 = require('bs58');
const KeyPair = require("./lib/crypto/key_pair");

// 创建一个 IOST 实例
const iost = new IOST.IOST({ /* 配置参数 */ });

const rpc = new IOST.RPC(new IOST.HTTPProvider('http://api.iost.io'));
iost.setRPC(rpc);

// 设置私钥
const privateKey = process.env.PRIVATE_KEY;

// 设置转账的发送方账户
const fromAccount = process.env.FROM_ACCOUNT;

// 设置转账的接收方账户
const toAccount = process.env.TO_ACCOUNT;

// 设置转账的金额
const amount = process.env.AMOUNT;

// 设置转账的次数
const transferCount = process.env.TRANSFER_COUNT;

// 设置自定义的数据
const customData = process.env.CUSTOM_DATA;

// 导入私钥
const account = new IOST.Account(fromAccount);
const kp = new KeyPair(bs58.decode(privateKey));
account.addKeyPair(kp, "owner");
account.addKeyPair(kp, "active");

// 将账户添加到 IOST 实例中
iost.setAccount(account);

// 创建一个循环来进行多次转账
for (let i = 0; i < transferCount; i++) {
  // 创建一个转账交易
  const tx = iost.transfer('iost', fromAccount, toAccount, amount, customData);

  // 签名并发送交易
  iost.signAndSend(tx)
    .on('pending', (res) => {
      console.log(`Transaction pending:`, res);
    })
    .on('success', (res) => {
      console.log('-'.repeat(50))
      console.log(`Transaction ${i} successful:`, res.tx_hash);
      console.log('-'.repeat(50))
    })
    .on('failed', (err) => {
      console.error(`Transaction failed:`, err);
    });
}
