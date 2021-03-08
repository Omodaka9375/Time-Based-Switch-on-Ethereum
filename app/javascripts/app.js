// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

import TimeBasedSwitch_artifacts from '../../build/contracts/TimeBasedSwitch.json'

var TimeBasedSwitch = contract(TimeBasedSwitch_artifacts);

var accounts;
let account;

window.App = {
  start: function () {
    var self = this;
    TimeBasedSwitch.setProvider(web3.currentProvider);
    this.connectMetamask();

  },

  connectMetamask: function() {
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }
      account = accs[0];

      if(account) {
        const connectMetamaskDiv = document.getElementById("connectMetamask");
        connectMetamaskDiv.style.display = "none";
        const walletDiv = document.getElementById("wallet");
        walletDiv.style.display = "flex";
        const walletAddress = document.getElementById("walletAddress");
        walletAddress.innerHTML = `${account.substring(0, 6)}...${account.substring(38)}`;
        web3.eth.getBalance(account, function(err, result) {
          const walletBalance = document.getElementById("walletBalance");
          const balance = web3.fromWei(result.toString(), 'ether');
          walletBalance.innerHTML = `${balance.substring(0, 4)} ETH`;
        });
      } else {
        console.error("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
    });
  },

  openExternalWebsite: function (uri) {
    window.open(uri);
  },

  showCreatePage: function () {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "none";
    const createDiv = document.getElementById("create");
    createDiv.style.display = "flex";
    const createFooter = document.getElementById("createFooter");
    createFooter.style.display = "flex";
    const assetsFooter = document.getElementById("assetsFooter");
    assetsFooter.style.display = "none";
  },

  reset: function () {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "block";
    const footer = document.getElementById("createFooter");
    footer.style.display = "none";
  },

  showAssetsPage: function() {
    const createDiv = document.getElementById('create');
    createDiv.style.display = 'none';
    const assestsDiv = document.getElementById('assets');
    assestsDiv.style.display = "flex";
    const footer = document.getElementById("createFooter");
    footer.style.display = "none";
    const executionFooter = document.getElementById("executionFooter");
    executionFooter.style.display = "none";
    const assetsFooter = document.getElementById("assetsFooter");
    assetsFooter.style.display = "flex";
  },

  showExecutionPage: function() {
    const assestsDiv = document.getElementById('assets');
    assestsDiv.style.display = "none";
    const executionDiv = document.getElementById('execution');
    executionDiv.style.display = "flex";
    const assetsFooter = document.getElementById("assetsFooter");
    assetsFooter.style.display = "none";
    const executionFooter = document.getElementById("executionFooter");
    executionFooter.style.display = "flex";
  },

  // showCheck: function () {
  //   var checkDiv = document.getElementById("checkSwitch");
  //   if(checkDiv.style.display == "none"){
  //     checkDiv.style.display = "block";
  //   } else {
  //     checkDiv.style.display = "none";
  //   }
  // },

  // createSwitch: function () {
  //   var self = this;
  //   var tbs;
  //   var timeleft_element = document.getElementById("timeleft");

  //   TimeBasedSwitch.deployed().then(function(instance) {
  //   tbs = instance;
  //   return tbs.createSwitch.call();}).then(function(value) {
  //    	var timeleft_element = document.getElementById("timeleft");
	//     var d = new Date(value.valueOf()*1000);
  //    	      timeleft_element.innerHTML = d.toString();
  //    	}).catch(function(e){
  //   console.log(e);
  //   self.setStatus(e);
  //   });
  // },

  // showCreatorOptions: function () {
  //   var checkDiv = document.getElementById("creatorR");
  //   if(checkDiv.style.display == "none"){
  //     checkDiv.style.display = "block";
  //   } else {
  //     checkDiv.style.display = "none";
  //   }
  // },

  // showExecutorsOptions: function () {
  //   var checkDiv = document.getElementById("executorR");
  //   if(checkDiv.style.display == "none"){
  //     checkDiv.style.display = "block";
  //   } else {
  //     checkDiv.style.display = "none";
  //   }
  // },

  // terminate: function () {
  //   var self = this;
  //   var TBS;
  //   TimeBasedSwitch.deployed().then(function (instance) {
  //     TBS = instance;
  //     return TBS.tick({ from: account });
  //   }).then(function () {
  //     self.setStatus("Tick complete!");
  //     self.refreshTimeLeft();
  //   }).catch(function (e) {
  //     console.log(e);
  //     self.setStatus(e);
  //   });
  // },

  // tryExecute: function () {
  //   var self = this;

  //   var TBS;
  //   TimeBasedSwitch.deployed().then(function (instance) {
  //     TBS = instance;
  //     return TBS.kick( Date.now()/1000 + 30, {from: account});
  //   }).then(function() {
  //     self.setStatus("Kick complete!");
  //     self.refreshTimeLeft();
  //   }).catch(function (e) {
  //     console.log(e);
  //     self.setStatus(e);
  //   });


  // },

  // updateAmount: function () {
  //   var self = this;

  //   var beneficiary = document.getElementById("beneficiary").value;
  //   var data = document.getElementById("data").value;

  //   var TBS;

  //   TimeBasedSwitchh.deployed().then(function (instance) {
  //     TBS = instance;
  //     return TBS.CreateDeadAccountSwitch(beneficiary, data, Date.now()/1000, {from: account, gas: 3141592});
  //   }).then(function() {
  //     self.setStatus("Transaction complete!");

  //   }).catch(function (e) {
  //     console.log(e);
  //     self.setStatus(e);
  //   });
  // },

  // updateBenefitor: function () {
  //   console.log("readmessage");
  //   var self = this;
  //   var sender = document.getElementById("sender").value;

  //   self.getLastHeartbeat(sender);
  //   self.getMessage(sender);

  // },

  // updateExecutor: function (sender) {
  //   var self = this;
  //   var TBS;
  //   var message_element = document.getElementById("message");
  //   console.log("getMessage for " + sender);
  //   TimeBasedSwitch.deployed().then(function (instance) {
  //     TBS = instance;
  //     console.log("resolved contract instance getMessage");
  //     return TBS.getDataFromAddress.call(sender, {from: account});
  //   }).then(function (value) {
  //     console.log("resolved getDataFromAddress");
  //     message_element.innerHTML = web3.toAscii(value.valueOf());
  //   }).catch(function (e) {
  //     console.log("catch getDataFromAddress");
  //     console.log(e);
  //     self.setStatus(e);
  //     message_element.innerHTML = "Your friend is not dead yet";
  //   });
  // },

  // updateCooldown: function (sender) {
  //   var self = this;
  //   var TBS;
  //   var heatbeat_time_element = document.getElementById("heartbeat");
  //   console.log("getLastHeartbeat for " + sender);
  //   TimeBasedSwitch.deployed().then(function (instance) {
  //     console.log("getLastHeartbeat resolved contract instance");
  //     TBS = instance;
  //     return TBS.getExpirationTime.call(sender);
  //   }).then(function (value) {
  //     console.log("resolved getExpirationTime " + value);
  //     var lastHeartbeat = new Date((value * 1000) - 30);
  //     console.log("last heartbeat date value" + lastHeartbeat);
  //     heatbeat_time_element.innerHTML = lastHeartbeat.toString();;
  //   }).catch(function (e) {
  //     heatbeat_time_element.innerHTML = "Entry not found";
  //     console.log("catch getExpirationTime");
  //     console.log(e);
  //     self.setStatus(e);
  //   });
  // },

  initWeb3: function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
        // Request account access
        window.ethereum.enable().then(function(){


        }).catch(function(e){
        // User denied account access...
        console.error("User denied account access")
      });
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    
  }
};

window.addEventListener('load', function () {
  console.warn("Loaded");
/*   // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);

  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }   */
 
// Modern dapp browsers...
App.initWeb3();

  App.start();
});
