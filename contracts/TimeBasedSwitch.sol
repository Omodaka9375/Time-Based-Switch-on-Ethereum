pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice This contract is used to creater, store, execute or delay a transaction trigger based on block.number aproximation
contract TimeBasedSwitch is ReentrancyGuard {
    using SafeERC20 for IERC20;
    /* Structs */
    struct NFT {
      uint id;
      address tokenAddress;
      address benefitor;
    }
    struct Switch {
        uint amount; //amount locked (in eth)
        uint unlockTimestamp; //minimum block to unlock eth
        string switchName; //name of the switch (taken from UI, maybe we don't need to store this info on-chain)
        bool isValid; //check validity of existing switch if exists
        address payable[] benefitors; //accounts for funds to be transfered to
        address[] tokensLocked; // list of addresses of all erc20 tokens locked in switch
        mapping(address => bool) executors; //accounts allowed to try execute a switch
        mapping(address => uint) benefitorShares; // address => percentageShare in Basis Points
        mapping(address => uint) tokens; // erc20 token address => amount locked
        NFT[] collectiblesLocked; // list of addresses of all erc721 tokens locked in switch
    }
    /* Storage */
    mapping(address => Switch) private users; //store switch per user account
    /* Events */
    event SwitchCreated(uint unlockTimestamp);
    event SwitchTriggered(address account);
    event SwitchTerminated(address account);
    event SwitchUpdated(bytes32 message);
    event EtherReceived(address sender, uint amount);
    /* Modifiers */
    /// @notice Checks that the the account passed is a valid switch
    /// @dev To be used in any situation where the function performs a check of existing/valid switches
    /// @param account The account to check the validity of
    modifier onlyValid(address account) {
      require(users[account].isValid && users[account].amount > 0, 'not a valid account query');
      _;
    }
    /// @notice Checks that the the function is being called only by the involved parties
    /// @dev To be used in any situation where the function performs a privledged action to the switch
    /// @param account The account to check the owner of
    modifier onlyAllowed(address account) {
      require(users[account].benefitorShares[msg.sender] > 0 || users[account].executors[msg.sender] || account == msg.sender, "you do not have rights to check on this switch!");
      _;
    }
    /// @notice Checks that the the function is being called only by the executor of the switch
    /// @dev To be used in any situation where the function performs a privledged action to the switch
    /// @param account The account to check the owner of
    modifier onlyExecutorsOrOwner(address account) {
      require(users[account].executors[msg.sender] || (users[msg.sender].isValid && msg.sender == account), 'you do not have rights to execute this switch!');
      _;
    }
    /// @notice Checks that a specified amount matches the msg.value sent
    /// @dev To be used in any situation where we check that user is sending exact amount specified
    /// @param amount The amount to be checked
    modifier checkAmount(uint amount) {
      require(msg.value == amount, 'must send exact amount');
      _;
    }
    /// @notice Checks that a specified time parameter is set to minimum 1 day
    /// @dev To be used in any situation where we check that user is setting unlock time minimum 1 day a head
    /// @param time The time to be checked
    modifier checkTime(uint time) {
      require(time >= 86400, 'one day is minimum time for switch'); //86400 seconds = 1 day
      _;
    }
    /// @notice Checks that a switch doesnt exist or isnt valid
    /// @dev To be used in any situation where we want to make sure that a switch is not set for this account or is invalidated like when creating new switch
    modifier doesntExist() {
      require(!users[msg.sender].isValid && users[msg.sender].amount == 0, 'switch for this account already exist');
      _;
    }
    /* Functions */
    /// @notice Constructor function which establishes two payout addresses for fees and fee amount
    constructor()
    public
    {}
    /// @notice The fallback function for the contract
    /// @dev Will simply accept any unexpected eth, but no data
    receive() payable external {
      emit EtherReceived(msg.sender, msg.value);
    }
    /// @notice Function that creates a switch struct and stores it to users map object
    /// @dev This function works if the switch for this account doesn't exist, is not valid, if the amount is not correct or if time parameter is less then minimum of 1 day
    /// @param _time The time parameter sets the number of blocks for the lock expiration in seconds
    ///param _amount The amount to lock
    /// @param _executors The executors of the switch
    /// @param _benefitors The benefitors of the switch
    /// @param _benefitorsShares The percentage share (in Basis Points) of each benefitor in portfolio
    function createSwitch(uint _time, uint _amount, address[] memory _executors, address payable[] memory _benefitors, uint16[] memory _benefitorsShares)
    doesntExist
    checkAmount(_amount)
    checkTime(_time)
    public
    payable
    {
        users[msg.sender].unlockTimestamp = block.timestamp + _time;
        for (uint i = 0; i < _executors.length; i++) {
          users[msg.sender].executors[_executors[i]] = true;
        }
        setSwitchBenefitors(_benefitors, _benefitorsShares);
        users[msg.sender].amount = _amount;
        users[msg.sender].isValid = true;
        emit SwitchCreated(users[msg.sender].unlockTimestamp);
    }
    /// @notice Function that if triggered after lock expires executes the switch
    /// @dev This function allows only executors or the switch creator to access it 
    /// @param account The account mapped to the switch
    function tryExecuteSwitch(address account)
    onlyValid(account)
    onlyExecutorsOrOwner(account)
    public
    payable
    {
      require(block.timestamp >= users[account].unlockTimestamp,'this switch has not expired, yet');
      uint amount = users[account].amount;
      users[account].amount = 0;
      users[account].isValid = false;
      // (bool success, ) = users[account].benefitor.call.value(amount)("");
      // require(success, 'transfer failed');
      emit SwitchTriggered(account); 
      delete users[account];
      emit SwitchTerminated(account);
    }

    // 
    function lockToken(address _tokenAddress, uint256 _amount) public {
        require(_tokenAddress != address(0), "lockToken: Invalid token address");
        require(_amount > 0, "lockToken: Amount must be greater than 0");

        if(users[msg.sender].tokens[_tokenAddress] == 0) {
            users[msg.sender].tokensLocked.push(_tokenAddress);
        }

        users[msg.sender].tokens[_tokenAddress] += _amount;
        
        IERC20(_tokenAddress).safeTransfer(address(this), _amount);

        emit SwitchUpdated("Token locked");
    }

    function lockCollectible(address _tokenAddress, uint256 _tokenId, address _benefitor) public {
        require(_tokenAddress != address(0), "lockCollectible: Invalid token address");
        require(users[msg.sender].benefitorShares[msg.sender] > 0, "lockCollectible: Invalid benefitor");

        ERC721(_tokenAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        users[msg.sender].collectiblesLocked.push(NFT(_tokenId, _tokenAddress, _benefitor));

        emit SwitchUpdated("Collectible locked");
    }
    /// @notice Function to withdraw amount of given ERC20 token
    /// @param _tokenAddress - address of ERC20 token
    /// @param _amount - amount to withdraw
    /// @param _receiver - address of wallet to receive tokens
    /// No return, reverts on error
    function withdrawToken(address _tokenAddress, uint256 _amount, address _receiver) public nonReentrant {
        require(_tokenAddress != address(0), "withdrawToken: Invalid token address");
        require(_amount > 0, "withdrawToken: Amount must be greater than 0");
        require(_receiver != address(0), "withdrawToken: Invalid receiver address");

        IERC20(_tokenAddress).safeTransfer(_receiver, _amount);
    }
    /// @notice Function to withdraw ERC721 collectible
    /// @param _tokenAddress - address of ERC721 token
    /// @param _tokenId - id of colletible
    /// @param _receiver - address of wallet to receive collectible
    /// No return, reverts on error
    function withdrawCollectible(address _tokenAddress, uint256 _tokenId, address _receiver) public nonReentrant {
        require(_tokenAddress != address(0), "withdrawCollectible: Invalid token address");
        require(_receiver != address(0), "withdrawCollectible: Invalid receiver address");

        ERC721(_tokenAddress).safeTransferFrom(address(this), _receiver, _tokenId);
    }

    /// @notice Function to approve transfering of ERC20 token by TimeBasedSwitch contract to benefitor
    /// @param _tokenAddress - address of ERC20 token
    /// @param _amount - amount to approve
    /// No return, reverts on error
    function approveToken(address _tokenAddress, uint256 _amount) public {
        require(_tokenAddress != address(0), "approveToken: Invalid token address");
        require(_amount > 0, "approveToken: Amount must be greater than 0");

        IERC20(_tokenAddress).safeIncreaseAllowance(address(this), _amount);
    }

    /// @notice Function to approve transfering of particular ERC721 token by TimeBasedSwitch contract to benefitor
    /// @param _tokenAddress - address of ERC721 token
    /// @param _tokenId - id of colletible
    /// No return, reverts on error
    function approveCollectible(address _tokenAddress, uint256 _tokenId) public {
        require(_tokenAddress != address(0), "approveCollectible: Invalid token address");

        ERC721(_tokenAddress).approve(address(this), _tokenId);
    }

    /// @notice Function that returns Switch struct of given _switchOwner address 
    /// @dev This function is allowed only for executors, befitors or switch creator 
    /// @param _switchOwner The account mapped to the switch
    /// @return Returns Switch struct
    function getSwitchInfo(address _switchOwner)
    onlyValid(_switchOwner)
    onlyAllowed(_switchOwner)
    public
    view
    returns
    (uint, uint, bool)
    {
      Switch memory _switch = users[_switchOwner];
      return (
        _switch.amount,
        _switch.unlockTimestamp,
        _switch.isValid
      );
    }

    /// @notice Function that tries to terminate switch before the unlock block  
    /// @dev This function is allowed only for switch creator. Funds are returned to the owner before destroying switch
    function terminateSwitchEarly()
    onlyValid(msg.sender)
    public
    payable
    {
      uint remains = users[msg.sender].amount;
      (bool success, ) = msg.sender.call.value(remains)("");
      require(success, 'transfer failed');
      users[msg.sender].amount = 0;
      users[msg.sender].isValid = false;
      delete users[msg.sender];
      emit SwitchTerminated(msg.sender);
    }
    /// @notice Function that tries to update switch locked amount 
    /// @dev This function is allowed only for switch creator. Funds are only added on top and can't be deduced from original amount.
    function updateSwitchAmount()
    onlyValid(msg.sender)
    public
    payable
    {
      require(msg.value > 0 , 'must send some amount');
      users[msg.sender].amount += msg.value;
      emit SwitchUpdated("Amount updated");
    }
    /// @notice Function that directly sets unlockTimestamp parameter as new unlock time
    /// @dev This function is allowed only for switch owner and it requires time parameter to be minimum 1 day 
    /// @param _unlockTimestamp New unlock time
    function updateSwitchUnlockTime(uint _unlockTimestamp)
    onlyValid(msg.sender)
    checkTime(_unlockTimestamp)
    public
    payable
    {
      users[msg.sender].unlockTimestamp = _unlockTimestamp;
      emit SwitchUpdated("Unlock time updated");
    }
    /// @notice Function that tries to set new switch executors address
    /// @dev This function is allowed only for switch owner
    /// @param _executor New executor address
    function addSwitchExecutor(address _executor)
    onlyValid(msg.sender)
    public
    payable
    {
      users[msg.sender].executors[_executor] = true;
      emit SwitchUpdated("Executor added");
    }

    /// @notice Function that tries to remove switch executor
    /// @dev This function is allowed only for switch owner
    /// @param _executor Executor address
    function removeSwitchExecutor(address _executor) 
    onlyValid(msg.sender)
    public
    {
      delete users[msg.sender].executors[_executor];
      emit SwitchUpdated("Executor removed");
    }
    /// @notice Function that tries to update switch benefitors address
    /// @dev This function is allowed only for switch owner
    /// @param _benefitors Benefitor addresses
    /// @param _percentageSharesInBasisPoints Percentage share of siwtch portfolio, in Basis Points
    function setSwitchBenefitors(address payable[] memory _benefitors, uint16[] memory _percentageSharesInBasisPoints)
    onlyValid(msg.sender)
    public
    payable
    {
      require(_benefitors.length == _percentageSharesInBasisPoints.length, "setSwitchBenefitors: arrays mismatch");
      uint16 basisPoints = 0;
      uint loopLength = _benefitors.length;

      for(uint i = 0; i < loopLength; i++) {
        require(msg.sender != _benefitors[i],'creator can not be one of the benefitors');
        users[msg.sender].benefitorShares[_benefitors[i]] = _percentageSharesInBasisPoints[i];
        basisPoints += _percentageSharesInBasisPoints[i];
      }
    
      require(basisPoints == 10000, "setSwitchBenefitor: Summary of percentage shares must be 100%");
      users[msg.sender].benefitors = _benefitors;
      emit SwitchUpdated("Benefitors updated");
    }
    /// @notice Function that tries to remove switch benefitor
    /// @dev This function is allowed only for switch owner
    /// @param _benefitor Address of benefitor to remove
    function removeSwitchBenefitor(address _benefitor)
    onlyValid(msg.sender)
    public
    {
      require(users[msg.sender].benefitorShares[_benefitor] > 0, "removeSwitchBenefitor: Invalid benefitor");

      uint benefitorsLength = users[msg.sender].benefitors.length;
      // need to split percentege share of leaving benefitor to rest of benefitors
      uint updatedShareForBenefitors = users[msg.sender].benefitorShares[_benefitor] / (benefitorsLength - 1);
      int index = -1;

      for(uint i = 0; i < benefitorsLength; i++) {
        address currentBenefitor = users[msg.sender].benefitors[i];
        if (currentBenefitor == _benefitor) {
          delete users[msg.sender].benefitorShares[_benefitor];
          index = int(i);
        } else {
          users[msg.sender].benefitorShares[currentBenefitor] += updatedShareForBenefitors;
        }
      }

      // Move the last element into the place to delete
      users[msg.sender].benefitors[uint(index)] = users[msg.sender].benefitors[benefitorsLength - 1];
      // Remove the last element
      users[msg.sender].benefitors.pop();

      emit SwitchUpdated("Benefitor removed");
    }
}