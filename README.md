# uFund

### Setup

Download [geth](https://www.ethereum.org/cli#geth)

```
$ git clone https://github.com/marceloneil.com/uFund.git
$ cd uFund
$ geth --datadir ~/.ethereum_private init genesis.json
$ geth --fast --cache 512 --ipcpath ~/Library/Ethereum/geth.ipc --networkid 1234 --datadir ~/.ethereum_private  console 
```
