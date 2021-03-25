// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from "web3";
import SlimSelect from 'slim-select'
import abi from '../abis/tbs.abi.json';
import erc20abi from '../abis/erc20approve.abi.json';
import erc721abi from '../abis/erc721approve.abi.json';

const timeBaseSwitchAddress = `0x0e179683C05b430487e88ca0baa6080Ac00fc03D`; // kovan network
const graphqlUri = "https://api.thegraph.com/subgraphs/name/andrejrakic/time-based-switch";
const keeperRegistry = `0xAaaD7966EBE0663b8C9C6f683FB9c3e66E03467F`;

var TimeBasedSwitch;
var accounts;
let account;
let idNew = 0;
// let tokenSelected;

const day = 86400;
const month = 2629743;
const year = 31556926;


window.App = {
  start: function () {
    var self = this;
    // TimeBasedSwitch.setProvider(web3.currentProvider);
    this.connectMetamask();
    document.getElementById("myReceivedSwitchData").style.display="none";

    new SlimSelect({
      select: '#selectToken'
    });
    new SlimSelect({
      select: '#period',
      showSearch: false
    });
    new SlimSelect({
      select: '#autoManual',
      showSearch: false,
    });
  },

  onExecutorOptionChange: function() {
    const selectedMethod = document.getElementById("autoManual").value;
    const executorAddressInput = document.getElementById("executorAddress");
    const chainlinkBotBanner = document.getElementById("chainlinkBot");

    if (selectedMethod === "Manually") {
      executorAddressInput.value = "";
      executorAddressInput.style.display = "flex";
      chainlinkBotBanner.style.display = "none";
    } else {
      // automatically
      executorAddressInput.value = keeperRegistry;
      executorAddressInput.style.display = "none";
      chainlinkBotBanner.style.display = "flex";
    }
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
    let timestamp = (period === 'days') ? day * periodTime : ((period === 'months') ? month * periodTime : year * periodTime);
    timestamp += Date.now();
    let selectTokenETH = document.querySelector("#selectToken").value;
    let tokenAmountETH = document.getElementById("tokenAmount").value;
    let tokenAmountOther = document.querySelectorAll("input[name=otherToken]")
    let selectedTokenOtehr = document.querySelectorAll("select[name=tokenOther]")
    let contractAddress = document.getElementById("contractAddress").value;
    let executorAddress = document.getElementById("executorAddress").value;

    let contractAddressNFT = document.getElementById("contractAddressNFT") && document.getElementById("contractAddressNFT").value;
    let NFTID = document.getElementById("nftId") && document.getElementById("nftId").value;
    
    let otherTokens=[];
    let tokenName=[];
    let amount=[];
    if(tokenAmountOther.length > 0) {
      tokenAmountOther.forEach((el, index) => {
        amount.push(window["amountOther" + index] = el.value); 
        })
        selectedTokenOtehr.forEach((elem, index) => {
          tokenName.push(window["tokenNameOther" + index] = elem.value)
        });
        let value = "ERC721";
          tokenName = tokenName.filter(item => {
            return item !== value
        });
        tokenName.forEach((el, i) => {
          var obj = {};
          obj.tokenName = el;
          obj.tokenAmount = amount[i];
          otherTokens.push(obj);
        })
    }
    console.log(otherTokens)
    console.log("switchName:",switchName,"period:",period,"periodTime:",periodTime,"selectTokenETH:",selectTokenETH,"tokenAmountETH:",tokenAmountETH,"contractAddress:",contractAddress,"executorAddress:",executorAddress,"contractAddressNFT:",contractAddressNFT,"NFTID:",NFTID )

    const _amount = web3.toWei(tokenAmountETH, 'ether');
    const txHash = this._createSwitch(switchName, timestamp, _amount, executorAddress, contractAddress);
    console.log(txHash);
  },

  _createSwitch: function (_switchName, _time, _amount, _executor, _benefitor) {
    const _name = web3.fromAscii(_switchName);
    TimeBasedSwitch.createSwitch(_name, _time, _amount, _executor, _benefitor, { from: account, value: _amount }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _lockCollectible: function (_tokenAddress, _tokenId) {
    TimeBasedSwitch.lockCollectible(_tokenAddress, _tokenId, { from: account, value: 0}, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _lockToken: function (_tokenAddress, _amount) {
    TimeBasedSwitch.lockToken(_tokenAddress, _amount, { from: account, value: 0 }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _terminateSwitchEarly: function () {
    TimeBasedSwitch.terminateSwitchEarly({ from: account, value: 0 }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _tryExecuteSwitch: function (_account) {
    TimeBasedSwitch.tryExecuteSwitch(_account, { from: account, value: 0 }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _updateSwitchAmount: function (_amount) {
    TimeBasedSwitch.updateSwitchAmount({ from: account, value: _amount }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _updateSwitchUnlockTime: function (_timestamp) {
    TimeBasedSwitch.updateSwitchUnlockTime(_timestamp, { from: account, value: 0 }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _updateSwitchExecutor: function (_executor) {
    TimeBasedSwitch.updateSwitchExecutor(_executor, { from: account, value: 0 }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _updateSwitchBenefitor: function (_benefitor) {
    TimeBasedSwitch.updateSwitchBenefitor(_benefitor, { from: account, value: 0 }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _aprroveERC20: function(_tokenAddress, _spender, _amount) {
    const token = web3.eth.contract(erc20abi).at(_tokenAddress);
    token.approve(_spender, _amount, { from: account }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _aprroveERC721: function(_tokenAddress, _spender, _tokenId) {
    const collectible = web3.eth.contract(erc721abi).at(_tokenAddress);
    collectible.approve(_spender, _tokenId, { from: account }, function(err, txHash) {
      if(!err) return txHash;
    })
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
      <h1 class="title">${web3.toAscii(_receivedSwitch.name)}</h1>
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
    <h1 class="title">${web3.toAscii(_switch.name)}</h1>
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
        <button class="button-terciary" onClick="App._terminateSwitchEarly()">Delete</button>
      </div>
      <div class="execute-button">
        <button class="button-primary" onClick="App._tryExecuteSwitch(${_switch.id})">Execute</button>
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
    const executorAddress = document.getElementById("executorAddress");
    executorAddress.value = keeperRegistry;
    
    const changeClass = (element) => element.forEach(el => el.classList.remove("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"))
  },

  addAsset: function () {
    idNew = ++idNew;
    let addAsssetContent = `
    <div id="asset${idNew}" class="form-box new-asset">
    <div class="form-element-header">Select asset</div>
    <select name="tokenOther" id="selectToken${idNew}" class="select-element-tokens" style="width: 100%;">
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
      <input name="otherToken" class="only-positive" type="number" style="width: 42%" id="tokenAmount${idNew}" min="0"/>
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
  let erc721Content = `
    <div id="asset${idNew}" class="form-box new-asset">
    <div class="form-element-header">Select asset</div>
    <select name="tokenOther" id="selectToken${idNew}" class="select-element-tokens" style="width: 100%;">
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
      <option name="years" selected>ERC721</option>
    </select>
    <div class="form-element-header">Address & ID</div>
    <div class="form-element-subheader">Please provide contract addreess and ID of NFT tocken you want to lock</div>
    <div>
      <input name="conAddress" type="text" style="width: 94%" id="contractAddressNFT" value="" placeholder="Contract address"/>
      <input name="nftIdName" type="text" style="width: 94%"  id="nftId"  value="" placeholder="NFT ID"/>
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
    const nftAsset = document.createRange().createContextualFragment(erc721Content);
    new SlimSelect({
      select: document.querySelector(`#selectToken${idNew}`),
      onChange: (info) => {
        // tokenSelected = info.value
        if(info.value == "ERC721") {
          App.deleteAssets(`asset${idNew}`)
          target.appendChild(nftAsset)
          new SlimSelect({
            select: document.querySelector(`#selectToken${idNew}`)
          })
        } 
      }
    });
  },

  deleteAssets: function (id) {
    document.getElementById(id).remove();
  },

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

    if (web3.version.network !== '42') {
      alert('Please connect to the Kovan network');
    }

   TimeBasedSwitch = web3.eth.contract(abi).at(timeBaseSwitchAddress);
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
