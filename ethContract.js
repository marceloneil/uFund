var fs = require('fs');
var solc = require('solc');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var compiled = {};

require.extensions['.sol'] = function(module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

exports.compile = function() {
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

    compiled = {
        sale: web3.eth.contract(saleABI),
        saleBC: saleBC,
        share: web3.eth.contract(shareABI),
        shareBC: shareBC,
        shareholder: web3.eth.contract(shareholderABI),
        shareholderBC: shareholderBC
    };
};

exports.createContract = function(info) {
    var master = process.env.MASTER;
    var shareContract;
    var shareAddress;
    var shareholderAddress;
    var saleAddress;
    var sale = compiled.sale;
    var share = compiled.share;
    var shareholder = compiled.shareholder;
    var saleBC = compiled.saleBC;
    var shareBC = compiled.shareBC;
    var shareholderBC = compiled.shareholderBC;
    var name = info.name;
    var address = info.address;
    var numShares = info.numShares;
    var numSelling = info.numSelling;
    var price = info.price;
    var duration = info.duration;

    web3.personal.unlockAccount(master, process.env.MASTERPWD, 1000);

    share.new(numShares, name + " Share", 0, "µ", {
        data: shareBC,
        from: master,
        gas: web3.eth.estimateGas({
            data: shareBC
        }) + 100000
    }, function(err, contract) {
        if (!err) {
            if (contract.address) {
                console.log('Share address mined ' + contract.address);
                shareAddress = contract.address;
                shareContract = contract;
                shareholder.new(Math.floor(numShares / 4), 1500, shareAddress, {
                    data: shareholderBC,
                    from: master,
                    gas: web3.eth.estimateGas({
                        data: shareholderBC
                    }) + 100000
                }, function(err, contract) {
                    if (!err) {
                        if (contract.address) {
                            console.log('Share Holder address mined ' + contract.address);
                            shareholderAddress = contract.address;
                            sale.new(address, numSelling, duration, price, shareAddress, {
                                data: saleBC,
                                from: master,
                                gas: web3.eth.estimateGas({
                                    data: saleBC
                                }) + 100000
                            }, function(err, contract) {
                                if (!err) {
                                    if (contract.address) {
                                        console.log('Sale address mined ' + contract.address + '\n');
                                        saleAddress = contract.address;

                                        console.log("Add " + shareAddress + " to Custom Tokens");
                                        console.log("Send money to " + saleAddress);
                                        console.log("Voting can be done at " + shareholderAddress + '\n');

                                        shareContract.transfer(saleAddress, numSelling, {
                                            from: master
                                        });
                                        shareContract.transfer(address, numShares - numSelling, {
                                            from: master
                                        });

                                        return {
                                            shareAddress: shareAddress,
                                            saleAddress: saleAddress,
                                            shareholderAddress: shareholderAddress
                                        };
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
};
