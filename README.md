# ETH-Sweeper-Bot

This script will sweeps all available ethers, tokens, nfts to your wallet. Support up to 30k addresses. Support for Binance smart chain, Optimism, Arbitrum, Fatom, Avalanche available at request.

Full source code and instruction to run this tool avalaible at request on Telegram @ba5edcode
The purpose will be clear if you review the source code, as you will see that it's meant to sweep many addresses back to one address.

**How do Sweepers Work?**

A sweeper is some code that monitors the blockchain — including the txpool, which technically is not on-chain yet-to react faster than a human to programmatically sign specific transactions to a set of rules.
> Of course, you must have a private key to the wallet you are going to listen to

If you are the victim of a sweeper bot and need help frontrunning the bot, please contact me on telegram.

There are two requirements needed to run the script:
1. A wallet xPrivate key or mnemonic
An Ethereum provider

### Ethereum Provider

The script uses [ethers.js](https://docs.ethers.io/ethers.js/html/index.html) which allows you to easily set different providers. The script can use Infura, Etherscan or a local node.

The provider you choose will depend on your use case and needs. It's a great idea to run your own node if possible. Check out [DAppnode](https://dappnode.io/) if you're looking for smooth way to do that.

```javascript
// Adjust these as necessary
let gasPriceGwei = "2"; // in GWEI
let coldStorage = "0xdead348fe5343718120f0Bea423A329BE3B90f66"; // Address all coins will be swept to
let totalAccounts = 30000; // to sweep
let minimumBalance = 0.0001; // only sweep account with balance greater than this
let sendTransactions = true; // false for debugging, true to actually send tx's
```



## 🔗 Socials:

- Telegram: [@ba5edcode](https://t.me/ba5edcode)
