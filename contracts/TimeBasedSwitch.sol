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
    struct Switch {
        uint amount; //amount locked (in eth)
        uint unlockTimestamp; //minimum block to unlock eth
        bytes32 switchName; // name of the switch
        address executor; //account allowed to try execute a switch
        address payable benefitor; //account for eth to be transfered to
        bool isValid; //check validity of existing switch if exists
        address[] tokensLocked; // addresses of all erc20 tokens locked in a switch, keys of the tokens mapping
        address[] collectiblesLocked; // addresses of all erc721 tokens locked in a switch, keys of the collectibles mapping
        mapping(address => uint) tokens; // erc20 token address => amount locked
        mapping(address => uint[]) collectibles; // erc721 address => array of tokenIds locked
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
      require(users[account].benefitor == msg.sender || users[account].executor == msg.sender || account == msg.sender, "you do not have rights to check on this switch!");
      _;
    }
    /// @notice Checks that the the function is being called only by the executor of the switch
    /// @dev To be used in any situation where the function performs a privledged action to the switch
    /// @param account The account to check the owner of
    modifier onlyExecutorsOrOwner(address account) {
      require(users[account].executor == msg.sender || (users[msg.sender].isValid && msg.sender == account), 'you do not have rights to execute this switch!');
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
      require(time >= block.timestamp + 86400, 'one day is minimum time for switch'); //86400 seconds = 1 day
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
    /// @param _switchName Human-readable name of the switch
    /// @param _time The time parameter sets the number of blocks for the lock expiration in seconds
    /// @param _amount The amount to lock
    /// @param _executor The executor of the switch
    /// @param _benefitor The benefitor of the switch
    function createSwitch(bytes32 _switchName, uint _time, uint _amount, address _executor, address payable _benefitor)
    doesntExist
    checkAmount(_amount)
    checkTime(_time)
    public
    payable
    {
        require(msg.sender != _benefitor,'creator can not be one of the benefitors');
        users[msg.sender].switchName = _switchName;
        users[msg.sender].unlockTimestamp = block.timestamp + _time;
        users[msg.sender].executor = _executor;
        users[msg.sender].benefitor = _benefitor;
        users[msg.sender].amount = _amount;
        users[msg.sender].isValid = true;
        emit SwitchCreated(users[msg.sender].unlockTimestamp);
    }
    /// @notice Function to lock erc20 token into switch
    /// @param _tokenAddress - Address of erc20 token
    /// @param _amount - Amount of token to lock
    /// No return, reverts on error
    function lockToken(address _tokenAddress, uint256 _amount) public {
        require(_tokenAddress != address(0), "lockToken: Invalid token address");
        require(_amount > 0, "lockToken: Amount must be greater than 0");

        IERC20(_tokenAddress).safeTransfer(address(this), _amount);

        if(users[msg.sender].tokens[_tokenAddress] == 0) {
            users[msg.sender].tokensLocked.push(_tokenAddress);
        }

        users[msg.sender].tokens[_tokenAddress] += _amount;

        emit SwitchUpdated("Token locked");
    }
    /// @notice Function to lock erc721 token into switch
    /// @param _tokenAddress - Address of erc721 token
    /// @param _tokenId - Id of token to lock
    /// No return, reverts on error
    function lockCollectible(address _tokenAddress, uint256 _tokenId) public {
        require(_tokenAddress != address(0), "lockCollectible: Invalid token address");

        ERC721(_tokenAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        if(users[msg.sender].collectibles[_tokenAddress].length == 0) {
            users[msg.sender].collectiblesLocked.push(_tokenAddress);
        }

        users[msg.sender].collectibles[_tokenAddress].push(_tokenId);

        emit SwitchUpdated("Collectible locked");
    }
    /// @notice Function that if triggered after lock expires executes the switch
    /// @dev This function allows only executors or the switch creator to access it 
    /// @param account The account mapped to the switch
    function tryExecuteSwitch(address account)
    onlyValid(account)
    onlyExecutorsOrOwner(account)
    public
    payable
    nonReentrant
    {
      require(block.timestamp >= users[account].unlockTimestamp,'this switch has not expired, yet');
      uint amount = users[account].amount;
      users[account].amount = 0;
      users[account].isValid = false;
      (bool success, ) = users[account].benefitor.call.value(amount)("");
      require(success, 'transfer failed');
      for(uint i = 0; i < users[account].tokensLocked.length; i++) {
        address tokenToWithdraw = users[account].tokensLocked[i];
        withdrawToken(tokenToWithdraw, users[account].tokens[tokenToWithdraw], users[account].benefitor);
      }
      for(uint i = 0; i < users[account].collectiblesLocked.length; i++) {
        address collectibleToWithdraw = users[account].collectiblesLocked[i];
        for(uint j = 0; j < users[account].collectibles[collectibleToWithdraw].length; j++) {
          withdrawCollectible(collectibleToWithdraw, users[account].collectibles[collectibleToWithdraw][j], users[account].benefitor);
        }
      }
      emit SwitchTriggered(account); 
      delete users[account];
      emit SwitchTerminated(account);
    }
    /// @notice Function to withdraw amount of given ERC20 token
    /// @param _tokenAddress - address of ERC20 token
    /// @param _amount - amount to withdraw
    /// @param _receiver - address of wallet to receive tokens
    /// No return, reverts on error
    function withdrawToken(address _tokenAddress, uint256 _amount, address _receiver) 
    public 
    nonReentrant 
    {
        require(users[msg.sender].isValid || msg.sender == address(this), "withdrawToken: Only switch owner or contract itself can call");
        require(_tokenAddress != address(0), "withdrawToken: Invalid token address");
        require(_amount > 0, "withdrawToken: Amount must be greater than 0");
        require(_receiver != address(0), "withdrawToken: Invalid receiver address");

        users[msg.sender].tokens[_tokenAddress] -= _amount;

        IERC20(_tokenAddress).safeTransfer(_receiver, _amount);
    }
    /// @notice Function to withdraw ERC721 collectible
    /// @param _tokenAddress - address of ERC721 token
    /// @param _tokenId - id of colletible
    /// @param _receiver - address of wallet to receive collectible
    /// No return, reverts on error
    function withdrawCollectible(address _tokenAddress, uint256 _tokenId, address _receiver) 
    public 
    nonReentrant 
    {
        require(users[msg.sender].isValid || msg.sender == address(this), "withdrawCollectible: Only switch owner or contract itself can call");
        require(_tokenAddress != address(0), "withdrawCollectible: Invalid token address");
        require(_receiver != address(0), "withdrawCollectible: Invalid receiver address");

        int index = -1;
        uint[] storage collectibleIds = users[msg.sender].collectibles[_tokenAddress];
        uint collectibleIdsLength = collectibleIds.length;

        for(uint i = 0; i < collectibleIds.length; i++) {
          if(collectibleIds[i] == _tokenId) {
            index = int(i);
          }
        }

        // Move the last element into the place to delete
        collectibleIds[uint(index)] = collectibleIds[collectibleIdsLength - 1];
        // Remove the last element
        collectibleIds.pop();

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
    (bytes32, uint, uint, address, address, bool)
    {
      Switch memory _switch = users[_switchOwner];
      return (
        _switch.switchName,
        _switch.amount,
        _switch.unlockTimestamp,
        _switch.executor,
        _switch.benefitor,
        _switch.isValid
      );
    }

    /// @notice Function that tries to terminate switch before the unlock block  
    /// @dev This function is allowed only for switch creator. Funds are returned to the owner before destroying switch
    function terminateSwitchEarly()
    onlyValid(msg.sender)
    public
    payable
    nonReentrant
    {
      uint remains = users[msg.sender].amount;
      users[msg.sender].amount = 0;
      users[msg.sender].isValid = false;
      (bool success, ) = msg.sender.call.value(remains)("");
      require(success, 'transfer failed');
      for(uint i = 0; i < users[account].tokensLocked.length; i++) {
        address tokenToWithdraw = users[account].tokensLocked[i];
        withdrawToken(tokenToWithdraw, users[account].tokens[tokenToWithdraw], users[account].benefitor);
      }
      for(uint i = 0; i < users[account].collectiblesLocked.length; i++) {
        address collectibleToWithdraw = users[account].collectiblesLocked[i];
        for(uint j = 0; j < users[account].collectibles[collectibleToWithdraw].length; j++) {
          withdrawCollectible(collectibleToWithdraw, users[account].collectibles[collectibleToWithdraw][j], users[account].benefitor);
        }
      }
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
    /// @notice Function that tries to update switch executors address
    /// @dev This function is allowed only for switch owner
    /// @param _executor New executor address
    function updateSwitchExecutor(address _executor)
    onlyValid(msg.sender)
    public
    payable
    {
      users[msg.sender].executor = _executor;
      emit SwitchUpdated("Executor updated");
    }
    /// @notice Function that tries to update switch benefitors address
    /// @dev This function is allowed only for switch owner
    /// @param _benefitor New benefitor address
    function updateSwitchBenefitor(address payable _benefitor)
    onlyValid(msg.sender)
    public
    payable
    {
      users[msg.sender].benefitor = _benefitor;
      emit SwitchUpdated("Benefitor updated");
    }
}