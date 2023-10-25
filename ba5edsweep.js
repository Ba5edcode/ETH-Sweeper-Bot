let ethers = require('ethers');
let debug = require('debug')('verbose'); // DEBUG=verbose node sweep.js
let coins = require('debug')('coins'); // DEBUG=coins node sweep.js
let addyHunt = require('debug')('addyHunt'); // used if you're hunting for a given address

// please set one of these
let xpriv = process.env.XPRIV; // xPriv key for the wallet you're sweeping
let mnemonic = process.env.MNEMONIC; // Mnemonic used to dervive wallet

// It's optional to set one of the following providers, Ethers will use it's own API keys if you don't set these
let local_URL = process.env.LOCAL_URL; 
let infuraKey = process.env.INFURA_KEY;
let etherscanKey = process.env.ETHERSCAN_KEY;

// Adjust these as necessary
let gasPriceGwei = '2'; // in GWEI
let coldStorage = '0xdead348fe5343718120f0Bea423A329BE3B90f66'; // Address all coins will be swept to
let totalAccounts = 1; // to check/sweep
let minimumBalance = 0.0001; // only sweep account with balance greater than this
let sendTransactions = true; // false means no coins will be sent. True will sweep coins to the address above. Make sure you own the addy if you set this to true!
let network = 'rinkeby' // use 'homestead' for ETH mainnet 

// if you're looking to know if a given address exists within provided key/mnemonic you should set this and turn addyHunt logging on
if ('FIND_ADDY' in process.env) {
  var findAddress = process.env.FIND_ADDY;
} else {
  var findAddress = '0x0000....addy_to_hunt_here';
}

// No need to adjust these
let totalBalance = 0; // total balance of ETH we're sweeping
let gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, 'gwei');

// If you're running a local node then we'll use that as provider
if ('LOCAL_URL' in process.env) {
  var localProvider = new ethers.providers.JsonRpcProvider(local_URL);
} else {
  debug('No local provider set!');
}

// If infura API key is set then we will use it as a provider
if ('INFURA_KEY' in process.env) {
  var infuraProvider = new ethers.providers.InfuraProvider(
    network,
    infuraKey
  );
} else {
  debug('No Infura provider key set!');
}

// if Etherscan env is set then we can use it as a provider
if ('ETHERSCAN_KEY' in process.env) {
  var etherscanProvider = new ethers.providers.EtherscanProvider(
    network,
    etherscanKey
  );
} else {
  debug('No Etherscan key set!');
}

// If Infura and/or Etherscan keys are set, use one or both of those, else local node
// https://docs.ethers.io/ethers.js/html/api-providers.html?highlight=defaultprovider
if (infuraProvider) {
  var defaultProvider = infuraProvider;
} else if (etherscanProvider){
  var defaultProvider = etherscanProvider; 
} else if (localProvider){
  var defaultProvider = localProvider;
} else if (!defaultProvider) { // no luck, fallback on Ethers default 
  var defaultProvider = ethers.getDefaultProvider(network);
}
debug('Sweeping with provider:', defaultProvider);

// Should we use Extended Key or Mnemonic?
if ('XPRIV' in process.env) {
  console.log('....Beginning sweep from extended key!');
} else if ('MNEMONIC' in process.env) {
  console.log('....Beginning sweep from mnemonic!');
} else {
  console.log(
    'Please set either MNEMONIC or XPRIV envars before running the script!'
  );
  process.exit(-1);
}

function Ba5edSweep() {
  for (i = 0; i < totalAccounts; i++) {
    if ('XPRIV' in process.env) {
      var HDnode = ethers.utils.HDNode.fromExtendedKey(xpriv);
    } else if ('MNEMONIC' in process.env) {
      var HDnode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    }
    let thisWallet = HDnode.derivePath("m/44'/60'/0'/0/" + i);
    let wallet = new ethers.Wallet(thisWallet.privateKey, defaultProvider);
    debug('account id:', i, thisWallet.address);
    if (thisWallet.address == findAddress) {
      addyHunt('FOUND ADDRESS!!!', i, thisWallet.address);
    }
    getBalance(thisWallet.address, wallet, i);
  }
}

function getBalance(address, wallet, i) {
  defaultProvider
    .getBalance(address)
    .then(async function(balance) {
      var etherString = ethers.utils.formatEther(balance); // balance is a BigNumber (in wei); format is as a sting (in ether)
      totalBalance = (
        parseFloat(totalBalance) + parseFloat(etherString)
      ).toFixed(15); // calc running total
      debug(
        'userid:',
        i,
        address,
        '\n',
        '                ╚══════> balance:',
        etherString
      );
      if (etherString > minimumBalance) {
        coins('coins found!', address, etherString);

        try {
          const nonce = await defaultProvider // get nonce for non zero balance accounts
            .getTransactionCount(address);
          return sendTx(balance, nonce, wallet);
        } catch (err) {
          console.log('ERROR getting nonce:', err);
        }
      }
    })
    .catch(err => {
      console.log('ERROR getting balance:', err);
    });
}

function sendTx(balance, nonce, wallet) {
  var gasLimit = ethers.BigNumber.from('21000');
  var maxCostWei = gasPriceWei.mul(gasLimit); // how much gas can we use?
  var bigBal = ethers.BigNumber.from(balance); // balance to big number
  var value = bigBal.sub(maxCostWei); // subtract the fees from the balance to get actual send amount

  var transaction = {
    nonce: nonce,
    gasLimit: ethers.utils.hexlify(gasLimit),
    gasPrice: ethers.utils.hexlify(gasPriceWei),
    to: ethers.utils.hexlify(coldStorage), // account we're sending too
    value: ethers.utils.hexlify(value), // total amount to send
  };
  coins('TX before send', transaction);

  if (sendTransactions) {
    let sendPromise = wallet.sendTransaction(transaction);
    sendPromise
      .then(tx => {
        debug(tx);
        console.log('TX SENT: ', tx.hash);
      })
      .catch(err => {
        console.log('ERROR sending TX!', err);
      });
  }
  coins('current sweep total: ', totalBalance);
} // sendTX

Ba5edSweep();
