// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/ITimeBasedSwitch.sol";
import "./interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract TimeBasedSwitch is ITimeBasedSwitch, Ownable, ReentrancyGuard, IERC721Receiver, KeeperCompatibleInterface {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    /* Structs */
    struct NFT {
      uint id;              // Id of the specific collectible
      address tokenAddress; // Collectible's contract address
      address benefitor;    // Wallet to get specific collectible after execution of the switch
    }
    
    struct Switch {
        uint amount;                     // amount locked (in eth)
        uint unlockTimestamp;            // minimum block to unlock eth
        bytes32 switchName;              // name of the switch
        address executor;                // account allowed to try execute a switch
        address payable benefitor;       // account for eth to be transfered to
        bool isValid;                    // check validity of existing switch if exists
        address[] tokensLocked;          // addresses of all erc20 tokens locked in a switch, keys of the tokens mapping
        mapping(address => uint) tokens; // erc20 token address => amount locked
        NFT[] collectiblesLocked;        // list of addresses of all erc721 tokens locked in switch
    }
    
    /* Storage */
    address internal keeperRegistry;
    address[] internal scheduledSwitches;
    mapping(address => Switch) internal users; //store switch per user account

    /* Modifiers */
    
    /**
     * @notice Checks that the the account passed is a valid switch
     * @dev To be used in any situation where the function performs a check of existing/valid switches
     * @param account The account to check the validity of
     */ 
    modifier onlyValid(address account) {
      require(users[account].isValid && users[account].amount > 0, "Not a valid account query");
      _;
    }
    
    /**
     * @notice Checks that the the function is being called only by the involved parties
     * @dev To be used in any situation where the function performs a privledged action to the switch
     * @param account The account to check the owner of
     */ 
    modifier onlyAllowed(address account) {
      require(users[account].benefitor == msg.sender || users[account].executor == msg.sender || account == msg.sender, "You do not have rights to check on this switch!");
      _;
    }
    
    /**
     * @notice Checks that the the function is being called only by the executor of the switch
     * @dev To be used in any situation where the function performs a privledged action to the switch
     * @param account The account to check the owner of
     */ 
    modifier onlyExecutorsOrOwner(address account) {
      require(users[account].executor == msg.sender || (users[msg.sender].isValid && msg.sender == account), "You do not have rights to execute this switch!");
      _;
    }
    
    /**
     * @notice Checks that a specified amount matches the msg.value sent
     * @dev To be used in any situation where we check that user is sending exact amount specified
     * @param amount The amount to be checked
     */ 
    modifier checkAmount(uint amount) {
      require(msg.value == amount, "Must send exact amount");
      _;
    }
    
    /**
     * @notice Checks that a specified time parameter is set to minimum 1 day
     * @dev To be used in any situation where we check that user is setting unlock time minimum 1 day a head
     * @param time The time to be checked
     */ 
    modifier checkTime(uint time) {
      require(time >= block.timestamp + 86400, "One day is minimum time for switch"); //86400 seconds = 1 day
      _;
    }
    
    /** 
     * @notice Checks that a switch doesnt exist or isnt valid
     * @dev To be used in any situation where we want to make sure that a switch is not set for this account or is invalidated like when creating new switch
     */ 
    modifier doesntExist() {
      require(!users[msg.sender].isValid && users[msg.sender].amount == 0, "Switch for this account already exist");
      _;
    }
    
    
    /* Functions */
    
    /// @notice Constructor function which establishes two payout addresses for fees and fee amount
    constructor(address _keeperRegistry)
    public
    {
      keeperRegistry = _keeperRegistry;
    }
    
    /// @notice The fallback function for the contract
    /// @dev Will simply accept any unexpected eth, but no data
    receive() 
    payable 
    external 
    {
      emit EtherReceived(msg.sender, msg.value);
    }
    
    /// @inheritdoc ITimeBasedSwitch
    function createSwitch(bytes32 _switchName, uint _time, uint _amount, address _executor, address payable _benefitor)
    public
    payable
    override
    doesntExist
    checkAmount(_amount)
    checkTime(_time)
    {
        require(msg.sender != _benefitor,'creator can not be one of the benefitors');
        
        users[msg.sender].switchName = _switchName;
        users[msg.sender].unlockTimestamp = _time;
        users[msg.sender].executor = _executor;
        users[msg.sender].benefitor = _benefitor;
        users[msg.sender].amount = _amount;
        users[msg.sender].isValid = true;

        if (_executor == keeperRegistry) {
          scheduledSwitches.push(msg.sender);
        }
        
        emit SwitchCreated(
          _switchName,
          users[msg.sender].unlockTimestamp,
          _executor,
          _benefitor,
          _amount
        );
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function lockToken(address _tokenAddress, uint256 _amount) 
    public
    override
    onlyValid(msg.sender) 
    {
        require(_tokenAddress != address(0), "lockToken: Invalid token address");
        require(_amount > 0, "lockToken: Amount must be greater than 0");

        uint256 tokenAmount = users[msg.sender].tokens[_tokenAddress];

        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);

        if(tokenAmount == 0) {
            users[msg.sender].tokensLocked.push(_tokenAddress);
        }

        users[msg.sender].tokens[_tokenAddress] = tokenAmount.add(_amount);

        emit TokenLocked(msg.sender, _tokenAddress, _amount);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function lockCollectible(address _tokenAddress, uint256 _tokenId) 
    public
    override
    onlyValid(msg.sender) 
    {
        require(_tokenAddress != address(0), "lockCollectible: Invalid token address");

        ERC721(_tokenAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        emit CollectibleLocked(msg.sender, _tokenAddress, _tokenId, users[msg.sender].benefitor);
    }
    
    
    /// @inheritdoc IERC721Receiver
    /// @notice the ERC721 contract address is always the message sender.
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) 
    external 
    override 
    returns(bytes4) 
    {
        users[from].collectiblesLocked.push(NFT(tokenId, msg.sender, users[from].benefitor));
        return 0x150b7a02;
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function terminateSwitchEarly()
    public
    payable
    override
    onlyValid(msg.sender)
    nonReentrant
    {
      uint remains = users[msg.sender].amount;
      users[msg.sender].amount = 0;
      users[msg.sender].isValid = false;
      
      (bool success, ) = msg.sender.call{value: remains}("");
      require(success, 'transfer failed');
      
      for(uint i = 0; i < users[msg.sender].tokensLocked.length; i++) {
        address tokenToWithdraw = users[msg.sender].tokensLocked[i];
        withdrawToken(tokenToWithdraw, users[msg.sender].tokens[tokenToWithdraw], msg.sender);
      }
      
      uint collectiblesLength = users[msg.sender].collectiblesLocked.length;
      for(uint i = 0; i < collectiblesLength; i++) {
        NFT storage currentCollectible = users[msg.sender].collectiblesLocked[i];
        withdrawCollectible(currentCollectible.tokenAddress, currentCollectible.id, msg.sender);
      }
      
      if (users[msg.sender].executor == keeperRegistry) {
          deleteScheduledSwitch(msg.sender);
      }
      delete users[msg.sender];
      emit SwitchTerminated(msg.sender);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function tryExecuteSwitch(address account)
    public
    payable
    override
    onlyValid(account)
    onlyExecutorsOrOwner(account)
    nonReentrant
    {
      require(block.timestamp >= users[account].unlockTimestamp,'this switch has not expired yet');
      
      uint amount = users[account].amount;
      users[account].amount = 0;
      users[account].isValid = false;
      
      (bool success, ) = users[account].benefitor.call{value: amount}("");
      require(success, 'transfer failed');
      
      for(uint i = 0; i < users[account].tokensLocked.length; i++) {
        address tokenToWithdraw = users[account].tokensLocked[i];
        withdrawToken(tokenToWithdraw, users[account].tokens[tokenToWithdraw], users[account].benefitor);
      }
      
      uint collectiblesLength = users[account].collectiblesLocked.length;
      for(uint i = 0; i < collectiblesLength; i++) {
        NFT storage currentCollectible = users[account].collectiblesLocked[i];
        withdrawCollectible(currentCollectible.tokenAddress, currentCollectible.id, currentCollectible.benefitor);
      }
      
      emit SwitchTriggered(account); 
      delete users[account];
      emit SwitchTerminated(account);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function updateSwitchAmount()
    public
    payable
    override
    onlyValid(msg.sender)
    {
      require(msg.value > 0 , 'must send some amount');
      
      users[msg.sender].amount = users[msg.sender].amount.add(msg.value);
      
      emit AmountUpdated(msg.value);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function updateSwitchUnlockTime(uint _unlockTimestamp)
    public
    payable
    override
    onlyValid(msg.sender)
    checkTime(_unlockTimestamp)
    {
      users[msg.sender].unlockTimestamp = _unlockTimestamp;
      emit UnlockTimeUpdated(_unlockTimestamp);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function updateSwitchExecutor(address _executor)
    public
    payable
    override
    onlyValid(msg.sender)
    {
      if (_executor == keeperRegistry) {
          scheduledSwitches.push(msg.sender);
      }

      if (users[msg.sender].executor == keeperRegistry && _executor != keeperRegistry) {
          deleteScheduledSwitch(msg.sender);
      }

      users[msg.sender].executor = _executor;
      emit ExecutorUpdated(_executor);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function updateSwitchBenefitor(address payable _benefitor)
    public
    payable
    override
    onlyValid(msg.sender)
    {
      users[msg.sender].benefitor = _benefitor;
      emit BenefitorUpdated(_benefitor);
    }
    
    
    /// @inheritdoc ITimeBasedSwitch
    function getSwitchInfo(address _switchOwner)
    public
    view
    override
    onlyValid(_switchOwner)
    onlyAllowed(_switchOwner)
    returns
    (bytes32, uint, uint, address, address, bool)
    {
      return (
        users[_switchOwner].switchName,
        users[_switchOwner].amount,
        users[_switchOwner].unlockTimestamp,
        users[_switchOwner].executor,
        users[_switchOwner].benefitor,
        users[_switchOwner].isValid
      );
    }


    /// @inheritdoc KeeperCompatibleInterface
    function checkUpkeep(bytes calldata checkData)
    public
    view
    override
    returns(bool upkeepNeeded, bytes memory performData)
    {
        uint i = 0;
        uint length = scheduledSwitches.length;
        bool isExpired = false;
        address currentSwitch = address(0);
        
        while(i < length && !isExpired) {
            currentSwitch = scheduledSwitches[i];
            isExpired = block.timestamp >= users[currentSwitch].unlockTimestamp;
            i++;
        }
        
        upkeepNeeded = isExpired;
        performData = abi.encodePacked(currentSwitch);
    }


    /// @inheritdoc KeeperCompatibleInterface
    function performUpkeep(bytes calldata performData)
    public
    override
    {
      require(msg.sender == keeperRegistry);

      address account = bytesToAddress(performData);

      deleteScheduledSwitch(account);
      tryExecuteSwitch(account);
    }


    /**
     * @notice Updates Keeper Registry Contract Address
     * @notice Only Administrator can call
     *
     * @param _keeperRegistry - new Keeper Registry Contract Address
     *
     * No return, reverts on error
     */
    function setKeeperRegistry(address _keeperRegistry)
    public
    onlyOwner
    {
      keeperRegistry = _keeperRegistry;
      emit KeeperRegistryUpdated(_keeperRegistry);
    }
    
    
    /**
     * @notice Function to withdraw amount of given ERC20 token
     * 
     * @param _tokenAddress - address of ERC20 token
     * @param _amount - amount to withdraw
     * @param _receiver - address of wallet to receive tokens
     * 
     * No return, reverts on error
     */ 
    function withdrawToken(address _tokenAddress, uint256 _amount, address _receiver) 
    private
    {
        require(_tokenAddress != address(0), "withdrawToken: Invalid token address");
        require(_amount > 0, "withdrawToken: Amount must be greater than 0");
        require(_receiver != address(0), "withdrawToken: Invalid receiver address");

        users[msg.sender].tokens[_tokenAddress] = users[msg.sender].tokens[_tokenAddress].sub(_amount);

        IERC20(_tokenAddress).safeTransfer(_receiver, _amount);
    }
    
    
    /**
     * @notice Function to withdraw ERC721 collectible
     * 
     * @param _tokenAddress - address of ERC721 token
     * @param _tokenId - id of colletible
     * @param _receiver - address of wallet to receive collectible
     * 
     * No return, reverts on error
     */ 
    function withdrawCollectible(address _tokenAddress, uint256 _tokenId, address _receiver) 
    private
    {
        require(_tokenAddress != address(0), "withdrawCollectible: Invalid token address");
        require(_receiver != address(0), "withdrawCollectible: Invalid receiver address");

        ERC721(_tokenAddress).safeTransferFrom(address(this), _receiver, _tokenId);
    }


    /**
     * @notice Function to delete address from Bot Scheduled Switches array
     *
     * @param user - address of switch to delete
     *
     * No return, reverts on error
     */
    function deleteScheduledSwitch(address user) 
    private 
    {
        uint length = scheduledSwitches.length;
        
        for (uint i = 0; i < length; i++) {
            if (scheduledSwitches[i] == user) {
                scheduledSwitches[i] = scheduledSwitches[length - 1];
                scheduledSwitches.pop();
                return;
            }
        }
    }


    /**
     * @notice Function to convert Ethereum address from bytes format to address format
     *
     * @param inputBytes - bytes to convert
     *
     * @param outputAddress - converted address
     */
    function bytesToAddress(bytes memory inputBytes)
    private
    pure
    returns(address outputAddress)
    {
        uint256 bytesLength = inputBytes.length;
        assembly {
            outputAddress := mload(add(inputBytes, bytesLength))
        }
    }
}
