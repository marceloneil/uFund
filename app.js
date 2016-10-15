var fs = require('fs');
var solc = require('solc');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

require.extensions['.sol'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var saleSource = require('./sale.sol');
var shareSource = require('./share.sol');
var shareholderSource = require('./shareholder.sol');
var saleComp = solc.compile(saleSource, 1);
var shareComp = solc.compile(shareSource, 1);
var shareholderComp = solc.compile(shareholderSource, 1);
var saleBC = saleComp.contracts.Sale.bytecode;
var saleABI = saleComp.contracts.Sale.interface;
var shareBC = shareComp.contracts.Share.bytecode;
var shareABI = shareComp.contracts.Share.interface;
var shareholderBC = shareholderComp.contracts.Association.bytecode;
var shareholderABI = shareholderComp.contracts.Association.interface;

var sale = web3.eth.contract(saleABI);
var share = web3.eth.contract(shareABI);
var shareholder = web3.eth.contract(shareholderABI);
