require('dotenv').config()

const ethers = require('ethers')

const { utils } = ethers

const provider = new ethers.providers.JsonRpcProvider(
  process.env.INFURA_ID,
  'bnb',
)

const depositWallet = new ethers.Wallet(
  process.env.DEPOSIT_WALLET_PRIVATE_KEY,
  provider,
)

const withdrawFunds = async (balanceWei) => {
  const recipientAddress = process.env.VAULT_WALLET_ADDRESS;
  console.log(recipientAddress, 'recipientAddress');
  console.log(balanceWei, 'balanceWei');
  try {
    const gasPrice = await provider.getGasPrice();
    const gasLimit = 21000;
    const gasCost = gasPrice.mul(gasLimit);

    // Subtract gas cost from balance
    const value = balanceWei.sub(gasCost);

    if (value.lte(0)) {
      console.log('Insufficient balance to cover gas fees');
      return;
    }

    const tx = {
      to: recipientAddress,
      value: value,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    const transaction = await depositWallet.sendTransaction(tx);
    const receipt = await transaction.wait();

    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
  } catch (error) {
    console.error('Error in withdrawing funds:', error);
  }
};

const main = async () => {
  const depositWalletAddress = await depositWallet.getAddress();
  console.log(`Watching for incoming tx to ${depositWalletAddress}…`);

  setInterval(async () => {
    const balance = await depositWallet.getBalance();
    const balanceBNB = utils.formatUnits(balance, 'ether');
    console.log(`Wallet balance: ${balanceBNB}`);

    if (parseFloat(balanceBNB) > 0) {
      // await withdrawFunds(balance);
    }
  }, 10); // Kiểm tra mỗi giây
};

if (require.main === module) {
  main();
}
