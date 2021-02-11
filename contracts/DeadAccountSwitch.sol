pragma solidity 0.5.16;
/// @notice This contract is used to creater, store, execute or delay a transaction trigger based on block.number aproximation
contract DeadAccountSwitch {
    /* Structs */
    struct Switch {
        uint amount; //amount locked (in eth)
        uint unlockTimestamp; //minimum block to unlock eth
        uint cooldown; //lockout time in seconds
        address executor; //account allowed to try execute a switch
        address payable benefitor; //account for eth to be transfered to
        bool isValid; //check validity of existing switch if exists
    }
    /* Storage */
    address private owner; //only owner can initiate fee payout 
    mapping(address => Switch) private users; //store switch per user account
    /* Events */
    event SwitchCreated(uint unlockTimestamp);
    event SwitchTriggered(address account);
    event TimerKicked(uint newUnlockTimestamp);
    event SwitchTerminated(address account);
    event SwitchUpdated(bytes32 message);
    /* Modifiers */
    /// @notice Checks that the the function is being called by the owner of the contract
    /// @dev  To be used in any situation where the function performs a privledged action to the contract
    modifier onlyOwner() {
      require(msg.sender == owner, 'Not owner account');
      _;
    }
    /// @notice Checks that the the account passed is a valid switch
    /// @dev To be used in any situation where the function performs a check of existing/valid switches
    /// @param account The account to check the validity of
    modifier onlyValid(address account) {
      require(users[account].isValid && users[account].amount > 0, 'Not a valid account');
      _;
    }
    /// @notice Checks that the the function is being called only by the involved parties
    /// @dev To be used in any situation where the function performs a privledged action to the switch
    /// @param account The account to check the owner of
    modifier onlyAllowed(address account) {
      require(users[account].benefitor == msg.sender || users[account].executor == msg.sender || account == msg.sender, "You do not have rights to check on this switch!");
      _;
    }
    /// @notice Checks that the the function is being called only by the executor of the switch
    /// @dev To be used in any situation where the function performs a privledged action to the switch
    /// @param account The account to check the owner of
    modifier onlyExecutors(address account) {
      require(users[account].executor == msg.sender, 'You do not have rights to execute this switch!');
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
    /// @notice Constructor function which establishes the contract owner, two payout addresses for fees and fee amount
    /// @dev Ownership should be managed through Open-Zeppelin's Ownable.sol which this contract uses.
    constructor()
    public
    {
      owner = msg.sender;
    }
    /// @notice The fallback function for the contract
    /// @dev Will simply accept any unexpected eth, but no data
    function() payable external {
      require(msg.data.length == 0);
    }
    /// @notice Function that creates a switch struct and stores it to users map object
    /// @dev This function works if the switch for this account doesn't exist, is not valid, if the amount is not correct or if time parameter is less then minimum of 1 day
    /// @param _time The time parameter sets the number of blocks for the lock expiration in seconds
    /// @param _amount The amount to lock
    /// @param _executor The executor of the switch
    /// @param _benefitor The benefitor of the switch
    function createSwitch(uint _time, uint _amount, address _executor, address payable _benefitor)
    doesntExist
    checkAmount(_amount)
    checkTime(_time)
    public
    payable
    {
        require(msg.sender != _benefitor,'creator can not be one of the benefitors');
        users[msg.sender].unlockTimestamp = block.timestamp + _time;
        users[msg.sender].cooldown = _time;
        users[msg.sender].executor = _executor;
        users[msg.sender].benefitor = _benefitor;
        users[msg.sender].amount = _amount;
        users[msg.sender].isValid = true;
        emit SwitchCreated(users[msg.sender].unlockTimestamp);
    }
    /// @notice Function that if triggered before lock expires - kicks the timer in the future, otherwise it executes the switch 
    /// @dev This function allows only executors to access it 
    /// @param account The account mapped to the switch
    function tryExecuteSwitch(address account)
    onlyValid(account)
    onlyExecutors(account)
    public
    payable
    {
        if (block.timestamp >= users[account].unlockTimestamp){
            uint amount = users[account].amount;
            users[account].amount = 0;
            users[account].isValid = false;
            (bool success, ) = users[account].benefitor.call.value(amount)("");
            require(success, 'transfer failed');
            emit SwitchTriggered(account); 
            delete users[account];
            emit SwitchTerminated(account);
        } else {
            users[account].unlockTimestamp = block.timestamp + users[account].cooldown;
            emit TimerKicked(users[account].unlockTimestamp);
        }
    }
    /// @notice Function that tries to fetch unlock time for an account 
    /// @dev This function is allowed only for executors, befitors or switch creator 
    /// @param account The account mapped to the switch
    /// @return Returns unlock block for the switch
    function getUnlockTime(address account)
    onlyValid(account)
    onlyAllowed(account)
    public
    view
    returns
    (uint)
    {
      return (users[account].unlockTimestamp);
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
    /// @notice Function that tries to update switch unlock block parameter. New unlock period will set in after next kick.
    /// @dev This function is allowed only for switch owner and it requires time parameter to be minimum 1 day 
    /// @param cooldown New cooldown value
    function updateSwitchUnlockTime(uint cooldown)
    onlyValid(msg.sender)
    checkTime(cooldown)
    public
    payable
    {
      users[msg.sender].cooldown = cooldown;
      emit SwitchUpdated("Cooldown updated");
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