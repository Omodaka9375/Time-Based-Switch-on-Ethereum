// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";

import TimeBasedSwitch_artifacts from '../../build/contracts/TimeBasedSwitch.json'
// import TimeBasedSwitch_artifacts from "web3";

var TimeBasedSwitch = contract(TimeBasedSwitch_artifacts);

var accounts;
let account;
let idNew = 0;

const graphqlUri =
  "https://api.thegraph.com/subgraphs/name/andrejrakic/time-based-switch";

window.App = {
  start: function () {
    var self = this;
    TimeBasedSwitch.setProvider(web3.currentProvider);
    this.connectMetamask();
    document.getElementById("myReceivedSwitchData").style.display="none";
  },

  connectMetamask: function () {
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }
      account = accs[0];

      if (account) {
        const connectMetamaskDiv = document.getElementById("connectMetamask");
        connectMetamaskDiv.style.display = "none";
        const walletDiv = document.getElementById("wallet");
        walletDiv.style.display = "flex";
        const walletAddress = document.getElementById("walletAddress");
        walletAddress.innerHTML = `${account.substring(
          0,
          6
        )}...${account.substring(38)}`;
        web3.eth.getBalance(account, function (err, result) {
          const walletBalance = document.getElementById("walletBalance");
          const balance = web3.fromWei(result.toString(), "ether");
          walletBalance.innerHTML = `${balance.substring(0, 4)} ETH`;
        });

        App.fetchMySwitches(account);
        App.fetchReceivedSwitches(account);
      } else {
        console.error(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }
    });
  },

  fetchMySwitches: function (_account) {
    const SWITCHES = `{
      switch(id: "${_account}") {
        id
        name
        executor
        benefitor
        unlockTimestamp
        isExecuted
        ethersLocked
        tokensLocked {
          id
          amountLocked
        }
        collectiblesLocked {
          id
          collectibleId
          benefitor
        }
      }
    }`
    // const SWITCHES = `{
    //   switch(id: "0x80da8831a594327cd9e79e648402cc7c1863aafa") {
    //     id
    //     name
    //     executor
    //     benefitor
    //     unlockTimestamp
    //     isExecuted
    //     ethersLocked
    //     tokensLocked {
    //       id
    //       amountLocked
    //     }
    //     collectiblesLocked {
    //       id
    //       collectibleId
    //       benefitor
    //     }
    //   }
    // }`;

    fetch(graphqlUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: SWITCHES }),
    })
      .then((res) => res.json())
      .then((res) => {
        const resSwitch = res.data.switch;
        console.log(resSwitch)
        this.createSwitchPage(resSwitch);
      });
  },

  fetchReceivedSwitches: function (_account) {
    const BENEFITOR_SWITCHES = `{
      switches(where: {benefitor: "${_account}"}) {
        id
        name
        unlockTimestamp
        benefitor
        executor
        isExecuted
        ethersLocked
        tokensLocked {
          id
          amountLocked
        }
        collectiblesLocked {
          id
          collectibleId
          benefitor
        }
      }
    }`;
    // const BENEFITOR_SWITCHES = `{
    //   switches(where: {benefitor: "0x9670565d943d1dce25e842e9666da047c55e1bcf"}) {
    //     id
    //     name
    //     unlockTimestamp
    //     benefitor
    //     executor
    //     isExecuted
    //     ethersLocked
    //     tokensLocked {
    //       id
    //       amountLocked
    //     }
    //     collectiblesLocked {
    //       id
    //       collectibleId
    //       benefitor
    //     }
    //   }
    // }`;

    fetch(graphqlUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: BENEFITOR_SWITCHES }),
    })
      .then((res) => res.json())
      .then((res) => {
        let resData = res.data.switches
        console.log(resData)
        resData.map(el => {
          this.createReceivedSwitchesPage(el)
        })
        
      }); 

    const EXECUTOR_SWITCHES = `{
      switches(where: {executor: "${_account}"}) {
        id
        name
        unlockTimestamp
        benefitor
        executor
        isExecuted
        ethersLocked
        tokensLocked {
          id
          amountLocked
        }
        collectiblesLocked {
          id
          collectibleId
          benefitor
        }
      }
    }`
    // const EXECUTOR_SWITCHES = `{
    //   switches(where: {executor: "0xaaad7966ebe0663b8c9c6f683fb9c3e66e03467f"}) {
    //     id
    //     name
    //     unlockTimestamp
    //     benefitor
    //     executor
    //     isExecuted
    //     ethersLocked
    //     tokensLocked {
    //       id
    //       amountLocked
    //     }
    //     collectiblesLocked {
    //       id
    //       collectibleId
    //       benefitor
    //     }
    //   }
    // }`;
    fetch(graphqlUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: EXECUTOR_SWITCHES }),
    })
      .then((res) => res.json())
      .then((res) => {
        let resData = res.data.switches
        resData.map(el => {
          this.createReceivedSwitchesPage(el)
        })
      }); 
  },

  switchOverview: function() {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "none";
    const changeClass = (element) => element.forEach(el => el.classList.add("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"))
    const overview = document.getElementById("swOverview");
    overview.style.display = "block";
    const createDiv = document.getElementById("create");
    createDiv.style.display = "flex";
    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "flex";
    const executionDiv = document.getElementById('execution');
    executionDiv.classList.add("temporary-padding")
    executionDiv.style.display = "flex";
    const executionFooter = document.getElementById("executionFooter");
    executionFooter.style.display = "none";
    const overviewFooter = document.getElementById("overviewFooter");
    overviewFooter.style.display = "flex";
  },

  createSwitch: function() {
    let switchName = document.getElementById("name").value;
    let period = document.querySelector("#period").value; 
    let periodTime = document.getElementById("periodTime").value;
    let selectTokenETH = document.querySelector("#selectToken").value;
    let tokenAmountETH = document.getElementById("tokenAmount").value;
    let tokenAmountOther = document.querySelectorAll("input[name=otherToken]")
    let selectedTokenOtehr = document.querySelectorAll("[name=tokenOther]")
    let contractAddress = document.getElementById("contractAddress").value;
    let executorAddress = document.getElementById("executorAddress").value;
    let otherTokens=[];
    let tokenName=[];
    let amount=[];
    if(tokenAmountOther.length > 0) {
      tokenAmountOther.forEach((el, index) => {
        amount.push(window["amountOther" + index] = el.value); 
        })
        selectedTokenOtehr.forEach((elem, index) => {
          tokenName.push(window["tokenNameOther" + index] = elem.value)
        })
        tokenName.forEach((el, i) => {
          var obj = {};
          obj.tokenName = el;
          obj.tokenAmount = amount[i];
          otherTokens.push(obj);
        })
    }
    console.log(otherTokens)
    console.log(switchName,period,periodTime,selectTokenETH,tokenAmountETH,contractAddress,executorAddress )
  },

  openExternalWebsite: function (uri) {
    window.open(uri);
  },
  createReceivedSwitchesPage: function(_receivedSwitch) {
    const myReceivedSwitchData = document.getElementById("myReceivedSwitchData");

    const ethLocked = web3.fromWei(_receivedSwitch.ethersLocked);
    console.log(ethLocked);

    let receivedSwitchDiv = `
    <div class="received-switch">
      <h1 class="title">Title</h1>
      <div class="content">
        <div class="upper-content">
          <div class="received-assets">
            <p>ASSETS</p>
            <span></span>
            <span>${ethLocked}</span>
            <span></span>
          </div>
          <div class="received-total-value">
            <p>TOTAL VALUE</p>
            <span></span>
          </div>
          <div class="received-expires-in">
            <p>EXPIRES IN</p>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <hr />
      <div class="down-content">
        <div class="cont-wprp">
          <div class="right-content-title">Recipient</div>
          <div class="switch-address-wrap">
            <img class="switch-address-image" src="avatar1.png" />
            <span class="addresses">${_receivedSwitch.benefitor}</span>
          </div>
        </div>
        <div class="execute-button-received">
          <button class="button-primary">Execute</button>
        </div>
      </div>
    </div>
    `;
    const myReceivedSwitch = document.createRange().createContextualFragment(receivedSwitchDiv);
    myReceivedSwitchData.appendChild(myReceivedSwitch);
  },
  createSwitchPage: function(_switch) {
    const mySwitchData = document.getElementById("mySwitchData");

    // // ethLocked value is in WEI and needs to be converted to ETH
    const ethLocked = web3.fromWei(_switch.ethersLocked);
    console.log(ethLocked);

    let switchDiv = `
    <div class="switch">
    <h1 class="title">Title</h1>
    <div class="content">
      <div class="left-content">
        <div class="left-content-up">
          <div class="assets">
            <p>ASSETS</p>
            <span></span>
            <span>${ethLocked}</span>
            <span></span>
          </div>
          <div class="expires-in">
            <p>EXPIRES IN</p>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="total-value">
          <p>TOTAL VALUE</p>
          <span></span>
        </div>
      </div>
      <div class="right-content">
        <div class="executor">
          <div class="cont-wprp">
            <div class="right-content-title">Executor</div>
            <div class="switch-address-wrap">
              <img class="switch-address-image" src="avatar1.png" />
              <span class="addresses">${_switch.executor}</span>
            </div>
          </div>
        </div>
        <div class="benefitor">
          <div class="cont-wprp">
            <div class="right-content-title">Recipient</div>
            <div class="switch-address-wrap">
              <img class="switch-address-image" src="avatar1.png" />
              <span class="addresses">${_switch.benefitor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="switch-buttons">
      <div class="edit-delete-buttons">
        <button class="button-terciary">Edit</button>
        <button class="button-terciary">Delete</button>
      </div>
      <div class="execute-button">
        <button class="button-primary">Execute</button>
      </div>
    </div>
  </div>
    `;
    const mySwitch = document.createRange().createContextualFragment(switchDiv);
    mySwitchData.appendChild(mySwitch);
  },
  //helper functions
  openMySwitch: function() {
    let mySwitch = document.getElementById("tablinks-mySwitches");
    let receivedSwitch = document.getElementById("tablinks-receivedSwitches");
    mySwitch.classList.add("blue-undeline");
    receivedSwitch.classList.remove("blue-undeline");
    document.getElementById("myReceivedSwitchData").style.display="none";
    document.getElementById("mySwitchData").style.display="block"
  },
  receivedSwitches: function() {
    let mySwitch = document.getElementById("tablinks-mySwitches");
    let receivedSwitch = document.getElementById("tablinks-receivedSwitches");
    receivedSwitch.classList.add("blue-undeline");
    mySwitch.classList.remove("blue-undeline");
    document.getElementById("mySwitchData").style.display="none";
    document.getElementById("myReceivedSwitchData").style.display="block";
  },
  //
  showCreatePage: function () {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "none";
    const createDiv = document.getElementById("create");
    createDiv.style.display = "flex";
    const createFooter = document.getElementById("createFooter");
    createFooter.style.display = "flex";
    const assetsFooter = document.getElementById("assetsFooter");
    assetsFooter.style.display = "none";
    const assestsDiv = document.getElementById('assets');
    assestsDiv.style.display = "none";
  },

  reset: function () {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "block";
    const footer = document.getElementById("createFooter");
    footer.style.display = "none";
    const createDiv = document.getElementById("create");
    createDiv.style.display = "none";
    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "none";
    const executionDiv = document.getElementById('execution');
    executionDiv.style.display = "none";
    const removeElements = (element) => element.forEach(el => el.remove());
    removeElements( document.querySelectorAll(".new-asset"));
    const changeClass = (element) => element.forEach(el => el.classList.remove("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"))
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
    const executionDiv = document.getElementById('execution');
    executionDiv.style.display = "none";
  },

  showExecutionPage: function() {
    const assestsDiv = document.getElementById('assets');
    assestsDiv.style.display = "none";
    const executionDiv = document.getElementById('execution');
    executionDiv.style.display = "flex";
    executionDiv.classList.remove("temporary-padding")
    const assetsFooter = document.getElementById("assetsFooter");
    assetsFooter.style.display = "none";
    const executionFooter = document.getElementById("executionFooter");
    executionFooter.style.display = "flex";
    const overviewFooter = document.getElementById("overviewFooter");
    overviewFooter.style.display = "none";
    const createDiv = document.getElementById('create');
    createDiv.style.display = 'none';
    const overview = document.getElementById("swOverview");
    overview.style.display = "none";
    
    const changeClass = (element) => element.forEach(el => el.classList.remove("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"))
  },

  addAsset: function () {
    idNew = ++idNew;
    let addAsssetContent = `
    <div id="asset${idNew}" class="form-box new-asset">
    <div class="form-element-header">Select asset</div>
    <select name="tokenOther" id="selectToken${idNew}" class="select-element" style="width: 100%;">
      <option name="days">
         Ethereum(ETH)
      </option>
      <optgroup label="ERC20">
        <option>
          Binance Coin (BNB)
        </option>
        <option>
          Uniswap (UNI)
        </option>
        <option>
          Tether (USDT)
        </option>
      </optgroup>
      <option name="years">ERC721</option>
    </select>
    <div class="form-element-header">Amount</div>
    <div class="form-element-subheader">Set up the amount that will be locked
      and sent once the
      switch expires</div>
    <div style="display: flex; justify-content: space-between;">
      <input name="otherToken" type="number" style="width: 42%" id="tokenAmount${idNew}" min="0"/>
      <input style="width: 42%" id="tokenAmountCash${idNew}" disabled value=""/>
    </div>
    <div class="options-wrapper">
      <label class="container">
        <input type="radio" id="queter" class="option" name="gender" value="25%">
        <span class="checkmark">25%</span>
      </label>
      <label class="container">
        <input type="radio" id="half" class="option" name="gender" value="50%">
        <span class="checkmark">50%</span>
      </label>
      <label class="container">
        <input type="radio" id="tree-queters" class="option" name="gender" value="75%">
        <span class="checkmark">75%</span>
      </label>
      <label class="container">
        <input type="radio" id="full" class="option" name="gender" value="100%">
        <span class="checkmark">100%</span>
      </label>
    </div>
    <div class="asset-buttons">
      <button class="approve-asset-button">Approve</button>
      <button class="delete-assets-button" onClick="App.deleteAssets('asset${idNew}')">Delete</button>
      </div>
  </div>
    `;
    let target = document.querySelector(".add-new-asset");

    const myNewAsset = document
      .createRange()
      .createContextualFragment(addAsssetContent);
    target.appendChild(myNewAsset);
  },

  deleteAssets: function (id) {
    document.getElementById(id).remove();
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

  initWeb3: function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      // Request account access
      window.ethereum
        .enable()
        .then(function () {})
        .catch(function (e) {
          // User denied account access...
          console.error("User denied account access");
        });
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:8545"
      );
    }
    web3 = new Web3(App.web3Provider);
  },
};

window.addEventListener("load", function () {
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
