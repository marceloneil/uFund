var fs = require('fs');
var solc = require('solc');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

require.extensions['.sol'] = function(module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var saleSource = require('./sale.sol');
var shareSource = require('./share.sol');
var shareholderSource = require('./shareholder.sol');
var saleComp = solc.compile(saleSource, 1);
var shareComp = solc.compile(shareSource, 1);
var shareholderComp = solc.compile(shareholderSource, 1);
var saleBC = saleComp.contracts.Sale.bytecode;
var saleABI = JSON.parse(saleComp.contracts.Sale.interface);
var shareBC = shareComp.contracts.Share.bytecode;
var shareABI = JSON.parse(shareComp.contracts.Share.interface);
var shareholderBC = shareholderComp.contracts.Association.bytecode;
var shareholderABI = JSON.parse(shareholderComp.contracts.Association.interface);

var sale = web3.eth.contract(saleABI);
var share = web3.eth.contract(shareABI);
var shareholder = web3.eth.contract(shareholderABI);

var master = "0x32724503BDC7279409f4D723Bec8B5cA9f95d964";
var successAddress = "0x2b645AE3bce483B26B65B934513aF0228F46BDfa";
var shareContract;
var shareAddress;
var shareholderAddress;
var saleAddress;
var tokenNumber = 100;
var tokenSelling = 40;
var tokenName = "Share";
var fundingGoal = 40;
var duration = 60;
var cost = 1;



web3.personal.unlockAccount(master, "testtesttest", 1000);

share.new(tokenNumber, tokenName, 0, "µ", {
    data: shareBC,
    from: master,
    gas: web3.eth.estimateGas({
        data: shareBC
    }) + 100000
}, function(err, contract) {
    if (!err) {
        if (contract.address) {
            shareAddress = contract.address;
            shareContract = contract;
            shareholder.new(Math.floor(tokenNumber / 4), 1500, shareAddress, {
                data: shareholderBC,
                from: master,
                gas: web3.eth.estimateGas({
                    data: shareholderBC
                }) + 100000
            }, function(err, contract) {
                if (!err) {
                    if (contract.address) {
                        shareholderAddress = contract.address;
                        sale.new(successAddress, fundingGoal, duration, cost, shareAddress, {
                            data: saleBC,
                            from: master,
                            gas: web3.eth.estimateGas({
                                data: saleBC
                            }) + 100000
                        }, function(err, contract) {
                            if (!err) {
                                if (contract.address) {
                                    saleAddress = contract.address;

                                    console.log("Add " + shareAddress + " to Custom Tokens");
                                    console.log("Send money to " + saleAddress);

                                    shareContract.transfer(saleAddress, tokenSelling, {
                                        from: master
                                    });
                                    shareContract.transfer(successAddress, tokenNumber - tokenSelling, {
                                        from: master
                                    });
                                }
                            } else {
                                console.log(err);
                            }
                        });
                    }
                } else {
                    console.log(err);
                }
            });
        }
    } else {
        console.log(err);
    }
});
