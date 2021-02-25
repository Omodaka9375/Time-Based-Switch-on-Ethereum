pragma solidity ^0.6.0;

interface ITimeBasedSwitch {
    /* Events */
    event SwitchCreated(uint unlockTimestamp);
    event SwitchTriggered(address indexed account);
    event SwitchTerminated(address indexed account);
    event SwitchUpdated(bytes32 message);
    event EtherReceived(address indexed sender, uint amount);

    /**
     * @notice Function that creates a switch struct and stores it to users map object
     *
     * @dev This function works if the switch for this account doesn't exist, is not valid, if the amount is not correct or if time parameter is less then minimum of 1 day
     *
     * @param _switchName Human-readable name of the switch
     * @param _time The time parameter sets the number of blocks for the lock expiration in seconds
     * @param _amount The amount to lock
     * @param _executor The executor of the switch
     * @param _benefitor The benefitor of the switch
     *
     * No return, reverts on error
     */
    function createSwitch(bytes32 _switchName, uint _time, uint _amount, address _executor, address payable _benefitor) external payable;

    /**
     * @notice Function to lock erc20 token into switch
     *
     * @param _tokenAddress - Address of erc20 token
     * @param _amount - Amount of token to lock
     *
     * No return, reverts on error
     */
    function lockToken(address _tokenAddress, uint256 _amount) external;

    /**
     * @notice Function to lock erc721 token into switch
     *
     * @param _tokenAddress - Address of erc721 token
     * @param _tokenId - Id of token to lock
     *
     * No return, reverts on error
     */
    function lockCollectible(address _tokenAddress, uint256 _tokenId) external;

     /**
      * @notice Function that tries to terminate switch before the unlock block
      *
      * @dev This function is allowed only for switch creator. Funds are returned to the owner before destroying switch
      *
      * No return, reverts on error
      */
    function terminateSwitchEarly() external payable;

     /**
      * @notice Function that if triggered after lock expires executes the switch
      *
      * @dev This function allows only executors or the switch creator to access it
      *
      * @param account The account mapped to the switch
      *
      * No return, reverts on error
      */
    function tryExecuteSwitch(address account) external payable;

    /**
     * @notice Function that tries to update switch locked amount
     *
     * @dev This function is allowed only for switch creator. Funds are only added on top and can't be deduced from original amount.
     *
     * No return, reverts on error
     */
    function updateSwitchAmount() external payable;

    /**
     * @notice Function that directly sets unlockTimestamp parameter as new unlock time
     *
     * @dev This function is allowed only for switch owner and it requires time parameter to be minimum 1 day
     *
     * @param _unlockTimestamp New unlock time
     *
     * No return, reverts on error
     */
    function updateSwitchUnlockTime(uint _unlockTimestamp) external payable;

    /**
     * @notice Function that tries to update switch executors address
     *
     * @dev This function is allowed only for switch owner
     *
     * @param _executor New executor address
     *
     * No return, reverts on error
     */
    function updateSwitchExecutor(address _executor) external payable;

    /**
     * @notice Function that tries to update switch benefitors address
     *
     * @dev This function is allowed only for switch owner
     *
     * @param _benefitor New benefitor address
     *
     * No return, reverts on error
     */
    function updateSwitchBenefitor(address payable _benefitor) external payable;

    /**
     * @notice Function that returns Switch struct of given _switchOwner address
     *
     * @dev This function is allowed only for executors, befitors or switch creator
     *
     * @param _switchOwner The account mapped to the switch
     *
     * @return Returns Switch struct
     */
    function getSwitchInfo(address _switchOwner) external view returns (bytes32, uint, uint, address, address, bool);
}