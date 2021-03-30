// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";
import SlimSelect from 'slim-select'

import TimeBasedSwitch_artifacts from '../../build/contracts/TimeBasedSwitch.json'
// import TimeBasedSwitch_artifacts from "web3";
var TimeBasedSwitch = contract(TimeBasedSwitch_artifacts);

var accounts;
let firstPerodInput;
let autoManualFirst;
let account;
let idNew = 0;
let tokensData;//test
let dolar_val;//test
let dolar_val_eth;//test
const keeperRegistry = `0xAaaD7966EBE0663b8C9C6f683FB9c3e66E03467F`;


const dolarTokensValue = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum%2C%20binancecoin%2C%20uniswap%2C%20chainlink%2C%20aave%2C%20tether%2C%20dai%2C%20usd-coin%2C%20havven%2C%20sushi%2C%20enjincoin%2C%20celsius-degree-token%2C%20maker%2C%20compound-coin%2C%20matic-network%2C%20uma%2C%200x&order=market_cap_desc&per_page=100&page=1&sparkline=false";//not functional api
const graphqlUri =
  "https://api.thegraph.com/subgraphs/name/andrejrakic/time-based-switch";

window.App = {
  start: function () {
    var self = this;
    TimeBasedSwitch.setProvider(web3.currentProvider);
    this.connectMetamask();
    document.getElementById("myReceivedSwitchData").style.display="none";
    
    new SlimSelect({
      select: '#selectToken',
      data: [
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://cryptoicons.org/api/icon/eth/200" /> <span class="tok">Ethereum(ETH)</span></span>', text: 'Ethereum(ETH)', value: 'eth'},
      ]
    });
    firstPerodInput = new SlimSelect({
      select: '#period',
      showSearch: false,
    });
    
    autoManualFirst = new SlimSelect({
      select: '#autoManual',
      showSearch: false,
    });
  },

  getDolarValueOfTokens: async function() {
    await fetch(dolarTokensValue)
    .then((response) => response.json())
    .then((response) => {
     dolar_val_eth = response[0].current_price;
     dolar_val = response[1].current_price;
     tokensData = response.map(item =>  {
        return {
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          price: item.current_price,
          image: item.image
        }
     });
      // console.log('success!', tokensData);
    }).catch((err) =>{
      console.warn('Something went wrong.', err)
    });  
  },
  //

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
  //   const SWITCHES =`{switches(where: {id: "0x9670565d943d1dce25e842e9666da047c55e1bcf"}) {
  //     id
  //     name
  //     unlockTimestamp
  //     benefitor
  //     executor
  //     isExecuted
  //     ethersLocked
  //     tokensLocked {
  //       tokenAddress
  //       amountLocked
  //     }
  //     collectiblesLocked {
  //       id
  //       collectibleId
  //       benefitor
  //     }
  //   }
  // }`
    fetch(graphqlUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: SWITCHES }),
    })
      .then((res) => res.json())
      .then((res) => {
        const resSwitch = res.data.switches;
        console.log("RES",resSwitch)
        resSwitch.map(el=> {
          this.createSwitchPage(el);
        })
      });
      this.getDolarValueOfTokens();
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
        console.log(resData)
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
    document.getElementById("name").disabled = true;
    document.getElementById("period").disabled = true;
    let dropdowns= document.querySelectorAll(".ss-single-selected");
    dropdowns.forEach(el => el.style.pointerEvents="none")
    document.getElementById("periodTime").disabled = true;
    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "flex";
    document.getElementById("tokenAmount").disabled = true;
    let valuesOfOtherTokens = document.querySelectorAll("input[name=otherToken]")
    valuesOfOtherTokens.forEach(el => el.style.pointerEvents="none")
    document.getElementById("queter").disabled = true;
    document.getElementById("half").disabled = true;
    document.getElementById("tree-queters").disabled = true;
    document.getElementById("full").disabled = true;
    if (document.getElementById("contractAddressNFT") && document.getElementById("nftId")) {
      document.getElementById("contractAddressNFT").disabled = true;
      document.getElementById("nftId").disabled = true;
    }
    document.getElementById("assetButton").style.pointerEvents="none";
    if (document.querySelectorAll(".delete-assets-button")) {
     let deleteAssetButons = document.querySelectorAll(".delete-assets-button");
     deleteAssetButons.forEach(el => {
      el.style.pointerEvents="none"
    })
    }
    const executionDiv = document.getElementById('execution');
    executionDiv.classList.add("temporary-padding")
    executionDiv.style.display = "flex";
    document.getElementById("contractAddress").disabled = true;
    document.getElementById("autoManual").disabled = true;
    document.getElementById("executorAddress").disabled = true;
    const executionFooter = document.getElementById("executionFooter");
    executionFooter.style.display = "none";
    const overviewFooter = document.getElementById("overviewFooter");
    overviewFooter.style.display = "flex";
  },

  //started--not usable
  singleSwitchOverviev: function() {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "none";
    const changeClass = (element) => element.forEach(el => el.classList.add("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"))
    const overview = document.getElementById("editOverview");
    overview.style.display = "block";
    const createDiv = document.getElementById("create");
    createDiv.style.display = "flex";
    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "flex";
    const executionDiv = document.getElementById('execution');
    executionDiv.classList.add("temporary-padding")
    executionDiv.style.display = "flex";
    // const executionFooter = document.getElementById("executionFooter");
    // executionFooter.style.display = "none";
    const overviewFooter = document.getElementById("editSwicthFooter");
    overviewFooter.style.display = "flex";
  },
//

  createSwitch: function() {
    let switchName = document.getElementById("name").value;
    let period = document.querySelector("#period").value; 
    let periodTime = document.getElementById("periodTime").value;
    let selectTokenETH = document.querySelector("#selectToken").value;
    let tokenAmountETH = document.getElementById("tokenAmount").value;
    let tokenAmountOther = document.querySelectorAll("input[name=otherToken]")
    let selectedTokenOtehr = document.querySelectorAll("select[name=tokenOther]")
    let contractAddress = document.getElementById("contractAddress").value;
    let executorAddress;
    if(document.getElementById("autoManual").value == "Manually"){
      executorAddress = document.getElementById("executorAddress").value;
    } else {
      executorAddress = keeperRegistry;
    }
     
    let contractAddressNFT;
    let NFTID
    if (document.getElementById("contractAddressNFT") && document.getElementById("nftId")) {
      contractAddressNFT = document.getElementById("contractAddressNFT").value || "";
      NFTID = document.getElementById("nftId").value || "";
    } else {
      contractAddressNFT = "";
      NFTID = "";
    }
    let timeoutPeriod;
    const today = new Date(Date.now());
    if(period == "days") {
      timeoutPeriod = periodTime 
    } else if (period == "months") {
      console.log(periodTime)
       const oneDay = 24 * 60 * 60 * 1000;
       const secondDate = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth()+Number(periodTime)));
       const diffDays = Math.round(Math.abs((today - secondDate) / oneDay));
       timeoutPeriod = diffDays
       console.log(today)
       console.log(secondDate)
    } else if (period == "years"){
       const oneDay = 24 * 60 * 60 * 1000;
       const secondDateOfYear = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth()+Number(periodTime*12)));
       const diffDaysOfYear = Math.round(Math.abs((today - secondDateOfYear) / oneDay));
       timeoutPeriod = diffDaysOfYear
       console.log(today)
       console.log(secondDateOfYear)
    }

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
        let value = "ERC-721";
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
    console.log("switchName:",switchName,"period:",period,"periodTime:",periodTime,"selectTokenETH:",selectTokenETH,"tokenAmountETH:",tokenAmountETH,"contractAddress:",contractAddress,"executorAddress:",executorAddress,"contractAddressNFT:",contractAddressNFT,"NFTID:",NFTID, "timeoutPeriod", timeoutPeriod )
  },
  timeExecutionLeft: function () {
    let period = document.querySelector("#period").value; 
    let periodTime = document.getElementById("periodTime").value;
    let date;
    function addMonths(date, months) {
      date.setMonth(date.getMonth() + months);
      return date;
    }
    if (period == "days") {
     date = new Date(Date.now() + periodTime * 24 * 60 * 60 * 1000)
     document.getElementById("date").innerHTML= date.toString().slice(3,15)
     document.getElementById("time").innerHTML= date.toString().slice(16,21)
    } else if (period == "months") {
      date = addMonths(new Date(), Number(periodTime))
      document.getElementById("date").innerHTML= date.toString().slice(3,15)
      document.getElementById("time").innerHTML= date.toString().slice(16,21)
    } else if (period == "years") {
      date = new Date(new Date().setFullYear(new Date().getFullYear() + Number(periodTime)))
      document.getElementById("date").innerHTML= date.toString().slice(3,15)
      document.getElementById("time").innerHTML= date.toString().slice(16,21)
    }
  },
  changePeriod: function() {
      let date = new Date(Date.now());
      document.getElementById("periodTime").value = ""
      document.getElementById("date").innerHTML= date.toString().slice(3,15)
      document.getElementById("time").innerHTML= date.toString().slice(16,21)
  },
  openExternalWebsite: function (uri) {
    window.open(uri);
  },
  createReceivedSwitchesPage: function(_receivedSwitch) {
    const myReceivedSwitchData = document.getElementById("myReceivedSwitchData");

    const expiresIn = new Date((_receivedSwitch.unlockTimestamp)*1000).toString().slice(3,15)

    const ethLocked = web3.fromWei(_receivedSwitch.ethersLocked);
    console.log(ethLocked);

    let receivedSwitchDiv = `
    <div class="received-switch">
      <h1 class="title">${_receivedSwitch.name}</h1>
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
            <span>${ethLocked}$</span>
          </div>
          <div class="received-expires-in">
            <p>EXPIRES IN</p>
            <span></span>
            <span>${expiresIn}</span>
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

    const expiresIn = new Date((_switch.unlockTimestamp)*1000).toString().slice(3,15)

    let switchDiv = `
    <div class="switch">
    <h1 class="title">${_switch.name}</h1>
    <div class="content">
      <div class="left-content">
        <div class="left-content-up">
          <div class="assets" style="display:flex; flex-direction:column;">
            <p>ASSETS</p>
            <span></span>
            <span>${ethLocked}ETH</span>
            <span>${ethLocked}$</span>
          </div>
          <div class="expires-in">
            <p>EXPIRES IN</p>
            <span></span>
            <span>${expiresIn}</span>
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
        <button class="button-terciary" onClick="App.singleSwitchOverviev()">Edit</button>
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
    let date = new Date(Date.now());
      document.getElementById("periodTime").value = ""
      document.getElementById("date").innerHTML= date.toString().slice(3,15)
      document.getElementById("time").innerHTML= date.toString().slice(16,21)
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
    document.getElementById("name").value = "";
    firstPerodInput.destroy();
    firstPerodInput = new SlimSelect({
      select: '#period',
      showSearch: false,
    })
    firstPerodInput.set("days");

    document.getElementById("periodTime").value = "";
    const removeElements = (element) => element.forEach(el => el.remove());
    removeElements( document.querySelectorAll(".new-asset"));
    const changeClass = (element) => element.forEach(el => el.classList.remove("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"));
    document.getElementById("tokenAmount").value = "";
    document.getElementById("tokenAmountCash").value = "0.00$";
    document.getElementById("contractAddress").value = "";
    autoManualFirst.destroy();
    autoManualFirst = new SlimSelect({
      select: "#autoManual",
      showSearch: false,
    });
    autoManualFirst.set("Automatically");
    document.getElementById("executorAddress").value = "";
    
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
    changeClass( document.querySelectorAll(".central-wrapper"));

    document.getElementById("name").disabled = false;
    document.getElementById("period").disabled = false;
    let dropdowns= document.querySelectorAll(".ss-single-selected");
    dropdowns.forEach(el => el.style.pointerEvents="auto")
    document.getElementById("periodTime").disabled = false;
    document.getElementById("tokenAmount").disabled = false;
    let valuesOfOtherTokens = document.querySelectorAll("input[name=otherToken]")
    valuesOfOtherTokens.forEach(el => el.style.pointerEvents="auto")
    document.getElementById("queter").disabled = false;
    document.getElementById("half").disabled = false;
    document.getElementById("tree-queters").disabled = false;
    document.getElementById("full").disabled = false;
    if (document.getElementById("contractAddressNFT") && document.getElementById("nftId")) {
      document.getElementById("contractAddressNFT").disabled = false;
      document.getElementById("nftId").disabled = false;
    }
    document.getElementById("assetButton").style.pointerEvents="auto";
    if (document.querySelectorAll(".delete-assets-button")) {
     let deleteAssetButons = document.querySelectorAll(".delete-assets-button");
     deleteAssetButons.forEach(el => {
      el.style.pointerEvents="auto"
    })
    }
    document.getElementById("contractAddress").disabled = false;
    document.getElementById("autoManual").disabled = false;
    document.getElementById("executorAddress").disabled = false;
    
  },

  addAsset: function (prop) {
    idNew = ++idNew;
    let addAsssetContent = `
    <div id="asset${idNew}" class="form-box new-asset">
    <div class="form-element-header">Select asset</div>
    <select name="tokenOther" id="selectToken${idNew}" class="select-element-tokens" style="width: 100%;" onchange="App.selectChange(${idNew})">
  
    </select>
    <div id="test${idNew}">
    <div id="${idNew}">
    <div class="form-element-header">Amount</div>
    <div class="form-element-subheader">Set up the amount that will be locked
      and sent once the
      switch expires</div>
    <div style="display: flex; justify-content: space-between;">
      <input name="otherToken" class="only-positive" type="number" style="width: 42%" id="tokenAmount${idNew}" min="0" onkeyup="App.inputTokenValue(${idNew})"/>
      <input style="width: 42%" id="tokenAmountCash${idNew}" disabled value="0.00$"/>
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
    </div>
    </div>
    <div class="asset-buttons">
      <button class="approve-asset-button">Approve</button>
      <button class="delete-assets-button" onClick="App.deleteAssets('asset${idNew}')">Delete</button>
      </div>
  </div>
    `;

    let target = document.querySelector(".add-new-asset");

    const myNewAsset = document.createRange().createContextualFragment(addAsssetContent);
    target.appendChild(myNewAsset);
    new SlimSelect({
      select: document.querySelector(`#selectToken${idNew}`),
      data: [
       { label: 'ERC20',
        options: [
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png?1547034615" /> <span class="tok">Binance Coin (BNB)</span></span>', text: 'Binance Coin (BNB)', value: 'bnb'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1600306604" /> <span class="tok">Uniswap (UNI)</span></span>', text: 'Uniswap (UNI)', value: 'uni'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707" /> <span class="tok">Tether (USDT)</span></span>', text: 'Tether (USDT)', value: 'usdt'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389" /> <span class="tok">USD Coin (USDC)</span></span>', text: 'USD Coin (USDC)', value: 'usdc'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/12645/large/AAVE.png?1601374110" /> <span class="tok">Aave (AAVE)</span></span>', text: 'Aave (AAVE)', value: 'aave'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/9956/large/dai-multi-collateral-mcd.png?1574218774" /> <span class="tok">Dai Stablecoin (DAI)</span></span>', text: 'Dai Stablecoin (DAI)', value: 'dai'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/3406/large/SNX.png?1598631139" /> <span class="tok">Synthetix Network Token (SNX)</span></span>', text: 'Synthetix Network Token (SNX)', value: 'snx'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/1102/large/enjin-coin-logo.png?1547035078" /> <span class="tok">Enjin Coin (ENJ)</span></span>', text: 'Enjin Coin (ENJ)', value: 'enj'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png?1606986688" /> <span class="tok">Sushi Token (SUSHI)</span></span>', text: 'Sushi Token (SUSHI)', value: 'sushi'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/4713/large/matic___polygon.jpg?1612939050" /> <span class="tok">Polygon (MATIC)</span></span>', text: 'Polygon (MATIC)', value: 'matic'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png?1585191826" /> <span class="tok">Maker (MKR)</span></span>', text: 'Maker (MKR)', value: 'mkr'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/3263/large/CEL_logo.png?1609598753" /> <span class="tok">Celsius Network (CEL)</span></span>', text: 'Celsius Network (CEL)', value: 'cel'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/10951/large/UMA.png?1586307916" /> <span class="tok">UMA Token (UMA)</span></span>', text: 'UMA Token (UMA)', value: 'uma'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/863/large/0x.png?1547034672" /> <span class="tok">0x Protocol Token (ZRX)</span></span>', text: '0x Protocol Token (ZRX)', value: 'zrx'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/3570/large/cropped-compoundcoin.png?1547038419" /> <span class="tok">Compound Coin (COMP)</span></span>', text: 'Compound Coin (COMP)', value: 'comp'},
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1547034700" /> <span class="tok">ChainLink (LINK)</span></span>', text: 'ChainLink (LINK)', value: 'link'}
        ]
      },
      {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="../app/assets/NFT_Icon.png" /> <span class="tok">NFT (ERC-721)</span></span>', text: 'ERC-721', value: 'ERC-721'}
      ]
    });
  },
  inputTokenValue: function(id) {
    let dolarVal = dolar_val
    let valInput = document.getElementById("tokenAmount"+id).value;
    document.getElementById("tokenAmountCash"+id).value = (Number(valInput*dolarVal)).toFixed(2)+" $";
   },
  inputETHValue: function() {
    let dolarVal = dolar_val_eth
    let valInput = document.getElementById("tokenAmount").value;
    document.getElementById("tokenAmountCash").value = (Number(valInput*dolarVal)).toFixed(2)+" $";
  }, 
  selectChange: function(id, x) {
    let valSelect = document.getElementById("selectToken"+id).value;
    let erc721Content = `
    <div id="${id}">
    <div class="form-element-header">Address & ID</div>
    <div class="form-element-subheader">Please provide contract addreess and ID of NFT tocken you want to lock</div>
    <div>
      <input name="conAddress" type="text" style="width: 94%" id="contractAddressNFT" value="" placeholder="Contract address"/>
      <input name="nftIdName" type="text" style="width: 94%"  id="nftId"  value="" placeholder="NFT ID"/>
    </div>
    </div>
    `;
    let ercTokenContent = `
    <div id="${id}">
    <div class="form-element-header">Amount</div>
    <div class="form-element-subheader">Set up the amount that will be locked
      and sent once the
      switch expires</div>
    <div style="display: flex; justify-content: space-between;">
      <input name="otherToken" class="only-positive" type="number" style="width: 42%" id="tokenAmount${idNew}" min="0" onkeyup="App.inputTokenValue(${idNew})"/>
      <input style="width: 42%" id="tokenAmountCash${idNew}" disabled value="0$"/>
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
    </div>
    `
    const testTarget = document.querySelector(`#test${id}`);
    const nftAsset = document.createRange().createContextualFragment(erc721Content);
    const ercToken = document.createRange().createContextualFragment(ercTokenContent);
    if(valSelect == "ERC-721") {
      document.getElementById(id).remove()
      testTarget.appendChild(nftAsset)
    } else {
      document.getElementById(id).remove()
      testTarget.appendChild(ercToken)
    }
    tokensData.map(item => {
      if (valSelect == item.symbol){
       return  dolar_val = item.price
    }
    })
  },
  deleteAssets: function (id) {
    document.getElementById(id).remove();
  },
  autoManuallInput: function() {
    let val = document.getElementById("autoManual").value;
    if(val == "Automatically") {
      document.getElementById("executorAddress").style.display="none"
    } else {
      document.getElementById("executorAddress").style.display="block"
    }

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
