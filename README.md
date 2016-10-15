# uFund

### Setup
[Download Ethereum Wallet](https://ethereum.org)
Run on testnet

### Setup (Old)

Download [geth](https://www.ethereum.org/cli#geth)

```
git clone https://github.com/marceloneil/uFund.git
cd uFund
cp genesisTemplate.json genesis.json
geth --datadir ~/.ethereum_private init genesis.json
geth --fast --cache 512 --ipcpath ~/Library/Ethereum/geth.ipc --networkid 1234 --datadir ~/.ethereum_private  console

personal.newAccount(passwd);
```

Now add your address to genesis.json and restart geth

```
geth --fast --cache 512 --ipcpath ~/Library/Ethereum/geth.ipc --networkid 1234 --datadir ~/.ethereum_private  console

miner.start();
// Mine some blocks
miner.stop();
// Print your balance
eth.getBalance("<Address>");
// Congrats, you know have some imaginary internet points
```
