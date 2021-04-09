// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";
import SlimSelect from 'slim-select';
import ercTokens from "../ercTokens";
import abi from '../abis/tbs.abi.json';
import erc20abi from '../abis/erc20.abi.json';
import erc721abi from '../abis/erc721abi.json';

// import TimeBasedSwitch_artifacts from '../../build/contracts/TimeBasedSwitch.json'
// import TimeBasedSwitch_artifacts from "web3";

const timeBaseSwitchAddress = `0x0e179683C05b430487e88ca0baa6080Ac00fc03D`; // kovan network
const graphqlUri = "https://api.thegraph.com/subgraphs/name/andrejrakic/time-based-switch";
const keeperRegistry = `0xAaaD7966EBE0663b8C9C6f683FB9c3e66E03467F`;
const dolarTokensValue = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum%2C%20binancecoin%2C%20uniswap%2C%20chainlink%2C%20aave%2C%20tether%2C%20dai%2C%20usd-coin%2C%20havven%2C%20sushi%2C%20enjincoin%2C%20celsius-degree-token%2C%20maker%2C%20compound-coin%2C%20matic-network%2C%20uma%2C%200x&order=market_cap_desc&per_page=100&page=1&sparkline=false";//not functional api

var TimeBasedSwitch;

var accounts;
let firstPerodInput;
let autoManualFirst;
let account;
let idNew = 0;
let tokensData;
let dolar_val;
let dolar_val_eth;
let editSwitchId;
let editSwitchName; 
let editSwitchBenefitor;
let editSwitchExecutor;



window.App = {
  start: async function () {
    var self = this;
    // TimeBasedSwitch.setProvider(web3.currentProvider);
    // this.connectMetamask();
    App.initWeb3();
    document.getElementById("myReceivedSwitchData").style.display="none";

    TimeBasedSwitch = web3.eth.contract(abi).at(timeBaseSwitchAddress);
    
    new SlimSelect({
      select: '#selectToken',
      data: [
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880" /> <span class="tok">Ethereum(ETH)</span></span>', text: 'Ethereum(ETH)', value: 'eth'},
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
    let periodTime = document.getElementById('periodTime');
    periodTime.onkeydown = function(e) {
        if(!((e.keyCode > 95 && e.keyCode < 106)
          || (e.keyCode > 47 && e.keyCode < 58) 
          || e.keyCode == 8)) {
            return false;
        }
    }
    let tokenAmount = document.getElementById('tokenAmount');
    tokenAmount.onkeydown = function(e) {
        if(!((e.keyCode > 95 && e.keyCode < 106)
          || (e.keyCode > 47 && e.keyCode < 58) 
          || e.keyCode == 8 || e.keyCode == 110)) {
            return false;
        }
    }
    const burger = document.querySelector('.burger i');
    const nav = document.querySelector('.nav');
  
    function toggleNav() {
        burger.classList.toggle('fa-bars');
        burger.classList.toggle('fa-times');
        nav.classList.toggle('nav-active');
    }
  
    burger.addEventListener('click', function() {
        toggleNav();
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
    }).catch((err) =>{
      console.warn('Something went wrong.', err)
    });  
  },
  onOverlay: function() {
  document.getElementById("overlay").style.display = "flex";
  },
  offOverlay: function() {
  document.getElementById("overlay").style.display = "none";
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
        App.offOverlay();
        App.fetchMySwitches(account);
        App.fetchReceivedSwitches(account);
        gtag('event', 'connect_metamask', {
           'event_category' : 'conect_metamask',
              'event_label' : 'connect_metamask'
             });
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
      switches(where: {id: "${_account}"}) {
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
    }`;

    fetch(graphqlUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: SWITCHES }),
    })
      .then((res) => res.json())
      .then((res) => {
        const resSwitch = res.data.switches;

        resSwitch.map(el=> {
          this.createSwitchPage(el);
        })
        if(resSwitch.length > 0) {
          document.getElementById("numOfActiveSwitches").innerHTML = `You currently have ${resSwitch.length} active switches`
        } else {
           document.getElementById("numOfActiveSwitches").innerHTML = "You currently have no active switches"
        }
      });
      // this.getDolarValueOfTokens();
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

    fetch(graphqlUri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: BENEFITOR_SWITCHES }),
    })
      .then((res) => res.json())
      .then((res) => {
        let resData = res.data.switches;
        
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
    const createTextUpHeader = document.getElementById("createTextUpHeader");
    createTextUpHeader.innerHTML= "01";
    const createContentTitle = document.getElementById("createContentTitle");
    createContentTitle.innerHTML= "Basic Information";
    document.getElementById("name").disabled = true;
    document.getElementById("period").disabled = true;
    let dropdowns= document.querySelectorAll(".ss-single-selected");
    dropdowns.forEach(el => el.style.pointerEvents="none")
    document.getElementById("periodTime").disabled = true;

    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "flex";
    const assetsTextUpHeader = document.getElementById("assetsTextUpHeader");
    assetsTextUpHeader.innerHTML = "02";
    document.getElementById("tokenAmount").disabled = true;
    let valuesOfOtherTokens = document.querySelectorAll("input[name=otherToken]");
    valuesOfOtherTokens.forEach(el => el.style.pointerEvents="none");
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
    executionDiv.classList.add("temporary-padding");
    executionDiv.style.display = "flex";
    const executionTextUpHeader = document.getElementById("executionTextUpHeader");
    executionTextUpHeader.innerHTML = "03";
    document.getElementById("contractAddress").disabled = true;
    document.getElementById("autoManual").disabled = true;
    document.getElementById("executorAddress").disabled = true;
    const executionFooter = document.getElementById("executionFooter");
    executionFooter.style.display = "none";
    const overviewFooter = document.getElementById("overviewFooter");
    overviewFooter.style.display = "flex";
  },
  queterDefineAmount: function() {
    let balance;
    let dolarVal = dolar_val_eth
    let valInput = document.getElementById("tokenAmount");
    web3.eth.getBalance(account, function (err, result) {
      balance = web3.fromWei(result.toString(), "ether").substring(0, 4);
        valInput.value = (balance/4).toFixed(6);
         document.getElementById("tokenAmountCash").value = (Number(valInput.value*dolarVal)).toFixed(2)+" $"
        });      
  },
  halfDefineAmount: function() {
    let balance;
    let dolarVal = dolar_val_eth
    let valInput = document.getElementById("tokenAmount");
    web3.eth.getBalance(account, function (err, result) {
      balance = web3.fromWei(result.toString(), "ether").substring(0, 4);
        valInput.value = (balance/2).toFixed(6);
         document.getElementById("tokenAmountCash").value = (Number(valInput.value*dolarVal)).toFixed(2)+" $"
        });      
  },
  treequetersDefineAmount: function() {
    let balance;
    let dolarVal = dolar_val_eth
    let valInput = document.getElementById("tokenAmount");
    web3.eth.getBalance(account, function (err, result) {
      balance = web3.fromWei(result.toString(), "ether").substring(0, 4);
        valInput.value = (balance*3/4).toFixed(6);
         document.getElementById("tokenAmountCash").value = (Number(valInput.value*dolarVal)).toFixed(2)+" $"
        });      
  },
  fullDefineAmount: function() {
    let balance;
    let dolarVal = dolar_val_eth
    let valInput = document.getElementById("tokenAmount");
    web3.eth.getBalance(account, function (err, result) {
      balance = web3.fromWei(result.toString(), "ether").substring(0, 4);
        valInput.value = (balance);
         document.getElementById("tokenAmountCash").value = (Number(valInput.value*dolarVal)).toFixed(2)+" $"
        });      
  },
  
  singleSwitchEdit: function(id, name, benef, execut, timePer) {
    
    const editName = web3.toAscii(name)
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "none";
    const changeClass = (element) => element.forEach(el => el.classList.add("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"))
    const overview = document.getElementById("editOverview");
    overview.style.display = "block";

    const switchNameView = document.getElementById("editSwitchName");
    switchNameView.innerHTML= editName;

    const createDiv = document.getElementById("create");
    createDiv.style.display = "flex";
    const createTextUpHeader = document.getElementById("createTextUpHeader");
    createTextUpHeader.innerHTML= "01";
    const createContentTitle = document.getElementById("createContentTitle");
    createContentTitle.innerHTML= "Basic Information";
    let switchEditName = document.getElementById("name")
    switchEditName.value = editName
    
    const date1 = new Date(Date.now());
    const date2 = new Date((timePer*1000));
    const diffTime = date2 - date1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if(diffDays < 0) {
      document.getElementById("timeText").innerHTML= "Your timeout expired on";
      document.getElementById("date").innerHTML= date2.toString().slice(3,15);
      document.getElementById("time").innerHTML= date2.toString().slice(16,21);
    } else {
      document.getElementById("timeText").innerHTML= "Your timeout will expire on";
      document.getElementById("date").innerHTML= date2.toString().slice(3,15);
      document.getElementById("time").innerHTML= date2.toString().slice(16,21);
    }

    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "flex";
    const assetsTextUpHeader = document.getElementById("assetsTextUpHeader");
    assetsTextUpHeader.innerHTML = "02"

    const executionDiv = document.getElementById('execution');
    
    const executionTextUpHeader = document.getElementById("executionTextUpHeader");
    executionTextUpHeader.innerHTML = "03"
    const contractAddressBenefitor = document.getElementById("contractAddress");
    contractAddressBenefitor.value = benef;
    const executorAddress = document.getElementById("executorAddress");
    if(execut == keeperRegistry){
    autoManualFirst.destroy();
    autoManualFirst = new SlimSelect({
      select: "#autoManual",
      showSearch: false,
    });
    autoManualFirst.set("Automatically");
    executorAddress.value = keeperRegistry;
     } else {
        autoManualFirst.destroy();
        autoManualFirst = new SlimSelect({
          select: "#autoManual",
          showSearch: false,
        });
        autoManualFirst.set("Manually");
        executorAddress.value = execut;
    }
    executionDiv.classList.add("temporary-padding")
    executionDiv.style.display = "flex";
    const overviewFooter = document.getElementById("editSwicthFooter");
    overviewFooter.style.display = "flex";

    editSwitchId = id;
    editSwitchName = name; 
    editSwitchBenefitor = benef;
    editSwitchExecutor = execut;
  },

  saveEditedSwitch: function() {  
    let newSwitchEditName;
    let switchEditName = document.getElementById("name").value;
    if (switchEditName !== editSwitchName) {
      newSwitchEditName = document.getElementById("name").value;
    } else {
      newSwitchEditName = ""
    }
    let period = document.querySelector("#period").value;
    let periodTime = document.getElementById("periodTime").value;
    let timeoutPeriod;
    
    if (periodTime !== ""){
    const today = new Date(Date.now());
    const oneDay = 24 * 60 * 60 * 1000;
    if(period == "days") {
      timeoutPeriod = periodTime 
    } else if (period == "months") {
       const secondDate = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth()+Number(periodTime)));
       const diffDays = Math.round(Math.abs((today - secondDate) / oneDay));
       timeoutPeriod = diffDays
    } else if (period == "years"){
       const secondDateOfYear = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth()+Number(periodTime*12)));
       const diffDaysOfYear = Math.round(Math.abs((today - secondDateOfYear) / oneDay));
       timeoutPeriod = diffDaysOfYear
     }
    }  else {
      timeoutPeriod = ""
      }
    let selectTokenETH = document.querySelector("#selectToken").value;
    let tokenAmountETH = document.getElementById("tokenAmount").value;
    let tokenAmountOther = document.querySelectorAll("input[name=otherToken]")
    let selectedTokenOtehr = document.querySelectorAll("select[name=tokenOther]")

    let contractAddressNFT;
    let NFTID;
    if (document.getElementById("contractAddressNFT") && document.getElementById("nftId")) {
      contractAddressNFT = document.getElementById("contractAddressNFT").value || "";
      NFTID = document.getElementById("nftId").value || "";
    } else {
      contractAddressNFT = "";
      NFTID = "";
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
          let obj = {};
          obj.tokenName = el;
          obj.tokenAmount = amount[i];
          otherTokens.push(obj);
        })
    }
    let newContractAddress;
    let contractAddress = document.getElementById("contractAddress").value;
    if (contractAddress !== editSwitchBenefitor) {
      newContractAddress = document.getElementById("contractAddress").value
    } else {
      newContractAddress = ""
    }
    let executorAddress;
    let newExecutorAddress;
    if(document.getElementById("autoManual").value == "Manually"){
      executorAddress = document.getElementById("executorAddress").value;
      if(executorAddress !== editSwitchExecutor){
        newExecutorAddress = document.getElementById("executorAddress").value;
      } else {
        newExecutorAddress = ""
      }
    } else {
      executorAddress = keeperRegistry;
    }
     

    console.log(otherTokens)
    console.log("switchId",editSwitchId,"switchName:",newSwitchEditName,"selectTokenETH:",selectTokenETH,"tokenAmountETH:",tokenAmountETH,"contractAddress:",newContractAddress,"executorAddress:",newExecutorAddress,"contractAddressNFT:",contractAddressNFT,"NFTID:",NFTID, "timeoutPeriod", timeoutPeriod );
  },
  discardEditSwitch: function() {
    const dashboardDiv = document.getElementById("dashboard");
    dashboardDiv.style.display = "block";
    const changeClass = (element) => element.forEach(el => el.classList.remove("overview-wrapper"));
    changeClass( document.querySelectorAll(".central-wrapper"));
    const overview = document.getElementById("editOverview");
    overview.style.display = "none";

    const createDiv = document.getElementById("create");
    createDiv.style.display = "none";
    const createTextUpHeader = document.getElementById("createTextUpHeader");
    createTextUpHeader.innerHTML= "CREATE NEW SWITCH";
    const createContentTitle = document.getElementById("createContentTitle");
    createContentTitle.innerHTML= "Define the basics";
    let switchEditName = document.getElementById("name")
    switchEditName.value = ""
    firstPerodInput.destroy();
    firstPerodInput = new SlimSelect({
      select: '#period',
      showSearch: false,
    })
    firstPerodInput.set("days");
    const assestsDiv = document.getElementById("assets");
    assestsDiv.style.display = "none";
    const assetsTextUpHeader = document.getElementById("assetsTextUpHeader");
    assetsTextUpHeader.innerHTML = "CREATE NEW SWITCH"
    const removeElements = (element) => element.forEach(el => el.remove());
    removeElements( document.querySelectorAll(".new-asset"));
    document.getElementById("tokenAmount").value = "";
    document.getElementById("tokenAmountCash").value = "0.00$";

    const executionDiv = document.getElementById('execution');
    executionDiv.style.display = "none";
    const executionTextUpHeader = document.getElementById("executionTextUpHeader");
    executionTextUpHeader.innerHTML = "CREATE NEW SWITCH"
    executionDiv.classList.remove("temporary-padding");
    const contractAddressBenefitor = document.getElementById("contractAddress");
    contractAddressBenefitor.value = "";
    autoManualFirst.destroy();
    autoManualFirst = new SlimSelect({
      select: "#autoManual",
      showSearch: false,
    });
    autoManualFirst.set("Automatically");
    const overviewFooter = document.getElementById("editSwicthFooter");
    overviewFooter.style.display = "none";
  },
  createSwitch: async function() {
    let switchName = document.getElementById("name").value;
    let period = document.querySelector("#period").value; 
    let periodTime = document.getElementById("periodTime").value;
    let selectTokenETH = document.querySelector("#selectToken").value;
    let tokenAmountETH = document.getElementById("tokenAmount").value;
    let tokenAmountOther = document.querySelectorAll("input[name=otherToken]")
    let selectedTokenOtehr = document.querySelectorAll("select[name=tokenOther]")
    let contractAddress = document.getElementById("contractAddress").value;
    let executorAddress = document.getElementById("executorAddress").value;
    //if(document.getElementById("autoManual").value == "Manually"){
    // executorAddress = document.getElementById("executorAddress").value;
    //} else {
      //executorAddress = keeperRegistry;
    //}
     
    // let contractAddressNFT;
    // let NFTID;
    // if (document.getElementById("contractAddressNFT") && document.getElementById("nftId")) {
    //   contractAddressNFT = document.getElementById("contractAddressNFT").value || "";
    //   NFTID = document.getElementById("nftId").value || "";
    // } else {
    //   contractAddressNFT = "";
    //   NFTID = "";
    // }

    let nftTokens = [];
    let nftAddress = [];
    let nftID = [];
    let contractAddressNFT = document.querySelectorAll("input[name=conAddress]")
    let NFTID =  document.querySelectorAll("input[name=nftIdName]")
       if (contractAddressNFT.length > 0 && NFTID.length > 0) {
          contractAddressNFT.forEach(el => {
            nftAddress.push(el.value)
          });
          NFTID.forEach(el => {
            nftID.push(el.value)
          });

          nftAddress.forEach((el, i) => {
            let nftObj = {};
            nftObj.nftAddress = el;
            nftObj.nftId = nftID[i];
            nftTokens.push(nftObj);
          });
    }


    let timeoutPeriod;
    const today = new Date(Date.now());
    if(period == "days") {
      timeoutPeriod = periodTime 
    } else if (period == "months") {
       const oneDay = 24 * 60 * 60 * 1000;
       const secondDate = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth()+Number(periodTime)));
       const diffDays = Math.round(Math.abs((today - secondDate) / oneDay));
       timeoutPeriod = diffDays
    } else if (period == "years"){
       const oneDay = 24 * 60 * 60 * 1000;
       const secondDateOfYear = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth()+Number(periodTime*12)));
       const diffDaysOfYear = Math.round(Math.abs((today - secondDateOfYear) / oneDay));
       timeoutPeriod = diffDaysOfYear
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
          let obj = {};
          obj.tokenName = el;
          obj.tokenAmount = amount[i];
          otherTokens.push(obj);
        })
    }
    console.log(otherTokens, nftTokens)
    console.log("switchName:",switchName,"period:",period,"periodTime:",periodTime,"selectTokenETH:",selectTokenETH,"tokenAmountETH:",tokenAmountETH,"contractAddress:",contractAddress,"executorAddress:",executorAddress, "timeoutPeriod", timeoutPeriod )
    otherTokens.map(e => {
        if (e.tokenName == "link"){
          gtag('event', 'chainlink', {
           'event_category' : 'chainlink',
              'event_label' : 'chainlink'
         });
        }
    });
    if(contractAddressNFT !== "" && NFTID !== ""){
      gtag('event', 'nft', {
           'event_category' : 'nft',
              'event_label' : 'nft'
         });
    }
      gtag('event', 'create_switch', {
           'event_category' : 'create_switch',
              'event_label' : 'create_switch'
      });
    

    const day = 86400000;
    timeoutPeriod *= day;
    timeoutPeriod += Date.now();

    const _amount = web3.toWei(tokenAmountETH, 'ether');

    // BREAKS HERE
    this._createSwitch(switchName, timeoutPeriod, _amount, executorAddress, contractAddress);

    // AFTER SWITCH IS CREATED, TOKENS NEED TO BE LOCKED IN ASYNC WAY

    // otherTokens.forEach(token => {
    //   const currentToken = ercTokens.tokens.find(erc => erc.symbol == token.tokenName.toUpperCase());
    //   const amount = token.tokenAmount * Math.pow(10, currentToken.decimals);
    //   this._lockToken(currentToken.address, amount);
    // });

    // nftTokens.forEach(token => {
    //   this._lockCollectible(token.nftAddress, token.nftId);
    //   console.log(token.nftAddress, token.nftId);
    // })

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
     document.getElementById("timeText").innerHTML= "Your timeout will expire on";
     document.getElementById("date").innerHTML= date.toString().slice(3,15)
     document.getElementById("time").innerHTML= date.toString().slice(16,21)
    } else if (period == "months") {
      date = addMonths(new Date(), Number(periodTime))
      document.getElementById("timeText").innerHTML= "Your timeout will expire on";
      document.getElementById("date").innerHTML= date.toString().slice(3,15)
      document.getElementById("time").innerHTML= date.toString().slice(16,21)
    } else if (period == "years") {
      date = new Date(new Date().setFullYear(new Date().getFullYear() + Number(periodTime)))
      document.getElementById("timeText").innerHTML= "Your timeout will expire on";
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
    // console.log(ethLocked);
    const name = web3.toAscii(_receivedSwitch.name)
    let ethObj={amountLocked: ethLocked, symbol: "ETH" }
    let tokens = _receivedSwitch.tokensLocked;
    let tokensArray = [];
    if(tokens.length > 0) {
      tokens.map(item => {
      let obj={}
      ercTokens.tokens.map(el =>{
        if(item.tokenAddress == el.address) {
          obj.amountLocked = item.amountLocked;
          obj.symbol= el.symbol
          tokensArray.push(obj)
          console.log(tokensArray)
        }
      })
    })
   }
    tokensArray.unshift(ethObj)

    let receivedSwitchDiv = `
    <div class="received-switch">
      <h1 class="title">${name}</h1>
      <div class="content">
        <div class="upper-content">
          <div class="received-assets" style="display:flex; flex-direction:column;">
            <p>ASSETS</p>
            <div id="checkTokensRec${_receivedSwitch.id}" style="display:flex; flex-direction:row;"></div>
            <span id="tokenValueRec${Number(_receivedSwitch.id)}">${ethLocked} ETH</span>
            <span id="valueInUsdRec${Number(_receivedSwitch.id)}">${(ethLocked * dolar_val_eth).toFixed(2)} $</span>
          </div>
          <div class="received-total-value" >
            <p>TOTAL VALUE</p>
            <span id="totalCoinsValue${_receivedSwitch.id}" class="totalCoinsValueClass">${(ethLocked * dolar_val_eth).toFixed(2)} $</span>
          </div>
          <div class="received-expires-in" style="display:flex; flex-direction:column;">
            <p>EXPIRES IN</p>
            <span id="timeLeftRec${_receivedSwitch.id}" class="timeBold"></span>
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
          <button class="button-primary" id="recivedSwitchExe" onClick="App._tryExecuteSwitch('${_receivedSwitch.id}')">Execute</button>
        </div>
      </div>
    </div>
    `;
    const myReceivedSwitch = document.createRange().createContextualFragment(receivedSwitchDiv);
    myReceivedSwitchData.appendChild(myReceivedSwitch);

    let checkboxOutput="";
    tokensArray.map((item, index) => {
      checkboxOutput +=`<label class="box-rec" ><input type="radio" onclick="App.checkValueRec(this,${item.symbol+_receivedSwitch.id},${_receivedSwitch.id})" id=${item.symbol+_receivedSwitch.id} class="radio-option-rec" name="${item.symbol}" value="${item.amountLocked}"><span class="radio-checkmark-rec" id="${'rec'+index}" onclick="App.changeClassRec(${'rec'+index})">${item.symbol}</span></label>`;
      document.getElementById(`checkTokensRec${_receivedSwitch.id}`).innerHTML=checkboxOutput;
    })
    document.querySelectorAll(".radio-checkmark-rec")[0].classList.add("active");
    let totalCoinsAmount;
    tokensArray.map(el => {
      tokensData.map(item => {
        if (el.symbol == item.symbol.toUpperCase()){
          totalCoinsAmount = el.amountLocked * item.price;
        }
      })
    })
    document.getElementById(`totalCoinsValue${_receivedSwitch.id}`).innerHTML= totalCoinsAmount.toFixed(2)+" $"

    const date1 = new Date(Date.now());
    const date2 = new Date((_receivedSwitch.unlockTimestamp*1000));
    const diffTime = date2 - date1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if(diffDays < 0) {
      document.getElementById(`timeLeftRec${_receivedSwitch.id}`).innerHTML= "0 days";
      document.getElementById("recivedSwitchExe").disabled = false;
    } else {
      document.getElementById(`timeLeftRec${_receivedSwitch.id}`).innerHTML= diffDays + " days";
      document.getElementById("recivedSwitchExe").disabled = true;
    }
  },
// helper function
 checkValueRec:function(target, id, recSwitchID) {
    tokensData.map(item => {
      if (id.name == item.symbol.toUpperCase()){
          dolar_val = item.price;
          let inDolars = dolar_val * target.value
          document.getElementById("tokenValueRec"+recSwitchID).innerHTML= target.value +" "+id.name;
          document.getElementById("valueInUsdRec"+recSwitchID).innerHTML= inDolars.toFixed(2)+" $";
        }
      })
        //  console.log(target.value, id.name, recSwitchID);
  },
  changeClassRec: function(id) {
      let elem = document.querySelectorAll(".radio-checkmark-rec")
        elem.forEach(el => {
          el.classList.remove("active");
          })
      document.getElementById(id.id).classList.add("active");
      // console.log(id.id, elem)
},
  createSwitchPage: function(_switch) {
    const mySwitchData = document.getElementById("mySwitchData");
    const expiresIn = new Date((_switch.unlockTimestamp)*1000).toString().slice(3,15)

    // // ethLocked value is in WEI and needs to be converted to ETH
    const ethLocked = web3.fromWei(_switch.ethersLocked);
    // console.log(ethLocked);
    let ethObj={amountLocked: ethLocked, symbol: "ETH" }
    const name = web3.toAscii(_switch.name)
    let tokens = _switch.tokensLocked;
    let tokensArray = [];
    // console.log("yyy",tokens)
    if(tokens.length > 0) {
      tokens.map(item => {
      let obj={}
      ercTokens.tokens.map(el =>{
        if(item.tokenAddress == el.address) {
          obj.amountLocked = item.amountLocked;
          obj.symbol= el.symbol
          tokensArray.push(obj)
          // console.log(tokensArray)
        }
      })
    })
   }
    tokensArray.unshift(ethObj);
    console.log("arr",tokensArray);

    let switch_id = _switch.id;
    let benefitor = _switch.benefitor;
    let executor = _switch.executor;
    let timeoutSwitchPeriod = _switch.unlockTimestamp;

    console.log(switch_id,benefitor,executor,timeoutSwitchPeriod,name);

   let switchDiv = `
    <div class="switch">
    <h1 class="title">${name}</h1>
    <div class="content">
      <div class="left-content">
        <div class="left-content-up">
          <div class="assets" style="display:flex; flex-direction:column;">
            <p>ASSETS</p>
            <div id="checkTokens${_switch.id}" style="display:flex; flex-direction:row;"></div>
            <span id="tokenValue${Number(_switch.id)}">${ethLocked} ETH</span>
            <span id="valueInUsd${Number(_switch.id)}">${(ethLocked * dolar_val_eth).toFixed(2)} $</span>
          </div>
          <div class="expires-in" style="display:flex; flex-direction:column;">
            <p>EXPIRES IN</p>
            <span id="timeLeft${_switch.id}" class="timeBold"></span>
            <span>${expiresIn}</span>
          </div>
        </div>
        <div class="total-value">
          <p>TOTAL VALUE</p>
          <span id="totalCoinsValue${_switch.id}" class="totalCoinsValueClass"></span>
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
        <button class="button-terciary" onClick="App.singleSwitchEdit('${switch_id}', '${_switch.name}', '${benefitor}', '${executor}', ${timeoutSwitchPeriod})">Edit</button>
        <button class="button-terciary" onClick="App.deleteSwitch()">Delete</button>
      </div>
      <div class="execute-button">
        <button class="button-primary" id="mySwichExe" onClick="App._tryExecuteSwitch('${switch_id}')">Execute</button>
      </div>
    </div>
   </div>
    `;
    const mySwitch = document.createRange().createContextualFragment(switchDiv);
    mySwitchData.appendChild(mySwitch);

    let checkboxOutput="";
    tokensArray.map((item, index) => {
      checkboxOutput +=`<label class="box" ><input type="radio" onclick="App.checkValue(this,${item.symbol+_switch.id},${_switch.id})" id=${item.symbol+_switch.id} class="radio-option" name="${item.symbol}" value="${item.amountLocked}"><span class="radio-checkmark" id="${index+_switch.id}" onclick="App.changeClass('${index+_switch.id}')">${item.symbol}</span></label>`;
      document.getElementById(`checkTokens${_switch.id}`).innerHTML=checkboxOutput;
    })
    document.querySelectorAll(".radio-checkmark")[0].classList.add("active");
    let totalCoinsAmount;
    tokensArray.map(el => {
      tokensData.map(item => {
        if (el.symbol == item.symbol.toUpperCase()){
          totalCoinsAmount = el.amountLocked * item.price;
        }
      })
    })
    document.getElementById(`totalCoinsValue${_switch.id}`).innerHTML= totalCoinsAmount.toFixed(2)+" $"

    const date1 = new Date(Date.now());
    const date2 = new Date((_switch.unlockTimestamp*1000));
    const diffTime = date2 - date1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if(diffDays < 0) {
      document.getElementById(`timeLeft${_switch.id}`).innerHTML = "0 days"
      document.getElementById("mySwichExe").disabled = false;
    } else {
      document.getElementById(`timeLeft${_switch.id}`).innerHTML = diffDays + " days"
      document.getElementById("mySwichExe").disabled = true;
    }
  
  },
  //helper functions
  checkValue:function(target, id, switchID) {
    tokensData.map(item => {
      if (id.name == item.symbol.toUpperCase()){
          dolar_val = item.price;
          let inDolars = dolar_val * target.value
          document.getElementById("tokenValue"+switchID).innerHTML= target.value +" "+id.name
          document.getElementById("valueInUsd"+switchID).innerHTML= inDolars.toFixed(2)+" $"
      }
     })
    //  console.log(target.value, id.name, switchID);
  },
  changeClass: function(id) {
    let elem = document.querySelectorAll(".radio-checkmark")
     elem.forEach(el => {
    el.classList.remove("active");
    })
     document.getElementById(id).classList.add("active");
     // console.log(id, document.getElementById(id))
 },
 
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
    const createTextUpHeader = document.getElementById("createTextUpHeader");
    createTextUpHeader.innerHTML= "CREATE NEW SWITCH";
    const createContentTitle = document.getElementById("createContentTitle");
    createContentTitle.innerHTML= "Define the basics";
    const assetsTextUpHeader = document.getElementById("assetsTextUpHeader");
    assetsTextUpHeader.innerHTML = "CREATE NEW SWITCH";
    const executionTextUpHeader = document.getElementById("executionTextUpHeader");
    executionTextUpHeader.innerHTML = "CREATE NEW SWITCH";
    
  },

  addAsset: function (prop) {
    idNew = ++idNew;
    dolar_val = tokensData[1].price;
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
      <input name="otherToken" class="only-positive" type="number" style="width: 42%" id="tokenAmount${idNew}" min="0" oninput="App.inputTokenValue(${idNew})"/>
      <input style="width: 42%" id="tokenAmountCash${idNew}" disabled value="0.00$"/>
    </div>
    </div>
    </div>
    <div class="asset-buttons">
      <button class="approve-asset-button" onClick="App.approve(${idNew})">Approve</button>
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
        {innerHTML: '<span style="display:flex; flex-direction:row;"><img height="20" width="20" src="https://assets.coingecko.com/coins/images/10775/large/COMP.png?1592625425" /> <span class="tok">Compound Coin (COMP)</span></span>', text: 'Compound Coin (COMP)', value: 'comp'},
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
  selectChange: function(id) {
    let valSelect = document.getElementById("selectToken"+id).value;
    let erc721Content = `
    <div id="${id}">
    <div class="form-element-header">Address & ID</div>
    <div class="form-element-subheader">Please provide contract addreess and ID of NFT tocken you want to lock</div>
    <div>
      <input name="conAddress" type="text" style="width: 94%" id="contractAddressNFT${idNew}" value="" placeholder="Contract address"/>
      <input name="nftIdName" type="text" style="width: 94%"  id="nftId${idNew}"  value="" placeholder="NFT ID"/>
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
      <input name="otherToken" class="only-positive" type="number" style="width: 42%" id="tokenAmount${idNew}" min="0" oninput="App.inputTokenValue(${idNew})"/>
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
  approve: function (id) {
    const valSelect = document.getElementById("selectToken"+id).value;

    if(valSelect == "ERC-721") {
      const _tokenAddress = document.getElementById('contractAddressNFT'+id).value;
      const _tokenId = document.getElementById('nftId'+id).value;

      this._approveERC721(_tokenAddress, timeBaseSwitchAddress, _tokenId);
    } else {
      const selectedToken = ercTokens.tokens.find(token => token.symbol == valSelect.toUpperCase());
      const _tokenAddress = selectedToken.address;
      const inputAmount = document.getElementById("tokenAmount"+id).value;
      const _decimals = selectedToken.decimals;
      const _amount = inputAmount * Math.pow(10, _decimals);

      this._approveERC20(_tokenAddress, timeBaseSwitchAddress, _amount);
    }
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
  deleteSwitch: function () {
    gtag('event', 'delete_switch', {
      'event_category' : 'delete_switch',
      'event_label' : 'delete_switch'
    });
    this._terminateSwitchEarly();
  },

  _createSwitch: function (_switchName, _time, _amount, _executor, _benefitor) {
    const _name = web3.fromAscii(_switchName);
    TimeBasedSwitch.createSwitch(_name, _time, _amount, _executor, _benefitor, { from: account, value: _amount }, function(err, txHash) {
      if(!err) console.log(txHash);
    })
  },

  _lockCollectible: function (_tokenAddress, _tokenId) {
    TimeBasedSwitch.lockCollectible(_tokenAddress, _tokenId, { from: account, value: 0 }, function(err, txHash) {
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

  _approveERC20: function(_tokenAddress, _spender, _amount) {
    const token = web3.eth.contract(erc20abi).at(_tokenAddress);
    token.approve(_spender, _amount, { from: account }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

  _approveERC721: function(_tokenAddress, _spender, _tokenId) {
    const collectible = web3.eth.contract(erc721abi).at(_tokenAddress);
    collectible.approve(_spender, _tokenId, { from: account }, function(err, txHash) {
      if(!err) return txHash;
    })
  },

initWeb3: function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      App.onOverlay();
      // Request account access
      window.ethereum
        .enable()
        .then(function () {
          App.connectMetamask()
          })
        .catch(function (e) {
          // User denied account access...
          App.offOverlay();
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
  // App.initWeb3();
  App.getDolarValueOfTokens();
  App.start();
});
