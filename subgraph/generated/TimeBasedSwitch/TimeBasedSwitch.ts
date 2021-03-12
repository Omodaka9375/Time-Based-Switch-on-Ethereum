// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AmountUpdated extends ethereum.Event {
  get params(): AmountUpdated__Params {
    return new AmountUpdated__Params(this);
  }
}

export class AmountUpdated__Params {
  _event: AmountUpdated;

  constructor(event: AmountUpdated) {
    this._event = event;
  }

  get amount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class BenefitorUpdated extends ethereum.Event {
  get params(): BenefitorUpdated__Params {
    return new BenefitorUpdated__Params(this);
  }
}

export class BenefitorUpdated__Params {
  _event: BenefitorUpdated;

  constructor(event: BenefitorUpdated) {
    this._event = event;
  }

  get benefitor(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class CollectibleLocked extends ethereum.Event {
  get params(): CollectibleLocked__Params {
    return new CollectibleLocked__Params(this);
  }
}

export class CollectibleLocked__Params {
  _event: CollectibleLocked;

  constructor(event: CollectibleLocked) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get tokenAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get benefitor(): Address {
    return this._event.parameters[3].value.toAddress();
  }
}

export class EtherReceived extends ethereum.Event {
  get params(): EtherReceived__Params {
    return new EtherReceived__Params(this);
  }
}

export class EtherReceived__Params {
  _event: EtherReceived;

  constructor(event: EtherReceived) {
    this._event = event;
  }

  get sender(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class ExecutorUpdated extends ethereum.Event {
  get params(): ExecutorUpdated__Params {
    return new ExecutorUpdated__Params(this);
  }
}

export class ExecutorUpdated__Params {
  _event: ExecutorUpdated;

  constructor(event: ExecutorUpdated) {
    this._event = event;
  }

  get executor(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class KeeperRegistryUpdated extends ethereum.Event {
  get params(): KeeperRegistryUpdated__Params {
    return new KeeperRegistryUpdated__Params(this);
  }
}

export class KeeperRegistryUpdated__Params {
  _event: KeeperRegistryUpdated;

  constructor(event: KeeperRegistryUpdated) {
    this._event = event;
  }

  get keeperRegistry(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class SwitchCreated extends ethereum.Event {
  get params(): SwitchCreated__Params {
    return new SwitchCreated__Params(this);
  }
}

export class SwitchCreated__Params {
  _event: SwitchCreated;

  constructor(event: SwitchCreated) {
    this._event = event;
  }

  get switchName(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get unlockTimestamp(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get executor(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get benefitor(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class SwitchTerminated extends ethereum.Event {
  get params(): SwitchTerminated__Params {
    return new SwitchTerminated__Params(this);
  }
}

export class SwitchTerminated__Params {
  _event: SwitchTerminated;

  constructor(event: SwitchTerminated) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class SwitchTriggered extends ethereum.Event {
  get params(): SwitchTriggered__Params {
    return new SwitchTriggered__Params(this);
  }
}

export class SwitchTriggered__Params {
  _event: SwitchTriggered;

  constructor(event: SwitchTriggered) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class TokenLocked extends ethereum.Event {
  get params(): TokenLocked__Params {
    return new TokenLocked__Params(this);
  }
}

export class TokenLocked__Params {
  _event: TokenLocked;

  constructor(event: TokenLocked) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get tokenAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class UnlockTimeUpdated extends ethereum.Event {
  get params(): UnlockTimeUpdated__Params {
    return new UnlockTimeUpdated__Params(this);
  }
}

export class UnlockTimeUpdated__Params {
  _event: UnlockTimeUpdated;

  constructor(event: UnlockTimeUpdated) {
    this._event = event;
  }

  get unlockTimestamp(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class TimeBasedSwitch__checkUpkeepResult {
  value0: boolean;
  value1: Bytes;

  constructor(value0: boolean, value1: Bytes) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromBoolean(this.value0));
    map.set("value1", ethereum.Value.fromBytes(this.value1));
    return map;
  }
}

export class TimeBasedSwitch__getSwitchInfoResult {
  value0: Bytes;
  value1: BigInt;
  value2: BigInt;
  value3: Address;
  value4: Address;
  value5: boolean;

  constructor(
    value0: Bytes,
    value1: BigInt,
    value2: BigInt,
    value3: Address,
    value4: Address,
    value5: boolean
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromFixedBytes(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromAddress(this.value3));
    map.set("value4", ethereum.Value.fromAddress(this.value4));
    map.set("value5", ethereum.Value.fromBoolean(this.value5));
    return map;
  }
}

export class TimeBasedSwitch extends ethereum.SmartContract {
  static bind(address: Address): TimeBasedSwitch {
    return new TimeBasedSwitch("TimeBasedSwitch", address);
  }

  checkUpkeep(checkData: Bytes): TimeBasedSwitch__checkUpkeepResult {
    let result = super.call("checkUpkeep", "checkUpkeep(bytes):(bool,bytes)", [
      ethereum.Value.fromBytes(checkData)
    ]);

    return new TimeBasedSwitch__checkUpkeepResult(
      result[0].toBoolean(),
      result[1].toBytes()
    );
  }

  try_checkUpkeep(
    checkData: Bytes
  ): ethereum.CallResult<TimeBasedSwitch__checkUpkeepResult> {
    let result = super.tryCall(
      "checkUpkeep",
      "checkUpkeep(bytes):(bool,bytes)",
      [ethereum.Value.fromBytes(checkData)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new TimeBasedSwitch__checkUpkeepResult(
        value[0].toBoolean(),
        value[1].toBytes()
      )
    );
  }

  getSwitchInfo(_switchOwner: Address): TimeBasedSwitch__getSwitchInfoResult {
    let result = super.call(
      "getSwitchInfo",
      "getSwitchInfo(address):(bytes32,uint256,uint256,address,address,bool)",
      [ethereum.Value.fromAddress(_switchOwner)]
    );

    return new TimeBasedSwitch__getSwitchInfoResult(
      result[0].toBytes(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toAddress(),
      result[4].toAddress(),
      result[5].toBoolean()
    );
  }

  try_getSwitchInfo(
    _switchOwner: Address
  ): ethereum.CallResult<TimeBasedSwitch__getSwitchInfoResult> {
    let result = super.tryCall(
      "getSwitchInfo",
      "getSwitchInfo(address):(bytes32,uint256,uint256,address,address,bool)",
      [ethereum.Value.fromAddress(_switchOwner)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new TimeBasedSwitch__getSwitchInfoResult(
        value[0].toBytes(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toAddress(),
        value[4].toAddress(),
        value[5].toBoolean()
      )
    );
  }

  onERC721Received(
    operator: Address,
    from: Address,
    tokenId: BigInt,
    data: Bytes
  ): Bytes {
    let result = super.call(
      "onERC721Received",
      "onERC721Received(address,address,uint256,bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(operator),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromBytes(data)
      ]
    );

    return result[0].toBytes();
  }

  try_onERC721Received(
    operator: Address,
    from: Address,
    tokenId: BigInt,
    data: Bytes
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "onERC721Received",
      "onERC721Received(address,address,uint256,bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(operator),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromBytes(data)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _keeperRegistry(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CheckUpkeepCall extends ethereum.Call {
  get inputs(): CheckUpkeepCall__Inputs {
    return new CheckUpkeepCall__Inputs(this);
  }

  get outputs(): CheckUpkeepCall__Outputs {
    return new CheckUpkeepCall__Outputs(this);
  }
}

export class CheckUpkeepCall__Inputs {
  _call: CheckUpkeepCall;

  constructor(call: CheckUpkeepCall) {
    this._call = call;
  }

  get checkData(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }
}

export class CheckUpkeepCall__Outputs {
  _call: CheckUpkeepCall;

  constructor(call: CheckUpkeepCall) {
    this._call = call;
  }

  get upkeepNeeded(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }

  get performData(): Bytes {
    return this._call.outputValues[1].value.toBytes();
  }
}

export class CreateSwitchCall extends ethereum.Call {
  get inputs(): CreateSwitchCall__Inputs {
    return new CreateSwitchCall__Inputs(this);
  }

  get outputs(): CreateSwitchCall__Outputs {
    return new CreateSwitchCall__Outputs(this);
  }
}

export class CreateSwitchCall__Inputs {
  _call: CreateSwitchCall;

  constructor(call: CreateSwitchCall) {
    this._call = call;
  }

  get _switchName(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _time(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _executor(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _benefitor(): Address {
    return this._call.inputValues[4].value.toAddress();
  }
}

export class CreateSwitchCall__Outputs {
  _call: CreateSwitchCall;

  constructor(call: CreateSwitchCall) {
    this._call = call;
  }
}

export class LockCollectibleCall extends ethereum.Call {
  get inputs(): LockCollectibleCall__Inputs {
    return new LockCollectibleCall__Inputs(this);
  }

  get outputs(): LockCollectibleCall__Outputs {
    return new LockCollectibleCall__Outputs(this);
  }
}

export class LockCollectibleCall__Inputs {
  _call: LockCollectibleCall;

  constructor(call: LockCollectibleCall) {
    this._call = call;
  }

  get _tokenAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _tokenId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class LockCollectibleCall__Outputs {
  _call: LockCollectibleCall;

  constructor(call: LockCollectibleCall) {
    this._call = call;
  }
}

export class LockTokenCall extends ethereum.Call {
  get inputs(): LockTokenCall__Inputs {
    return new LockTokenCall__Inputs(this);
  }

  get outputs(): LockTokenCall__Outputs {
    return new LockTokenCall__Outputs(this);
  }
}

export class LockTokenCall__Inputs {
  _call: LockTokenCall;

  constructor(call: LockTokenCall) {
    this._call = call;
  }

  get _tokenAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class LockTokenCall__Outputs {
  _call: LockTokenCall;

  constructor(call: LockTokenCall) {
    this._call = call;
  }
}

export class OnERC721ReceivedCall extends ethereum.Call {
  get inputs(): OnERC721ReceivedCall__Inputs {
    return new OnERC721ReceivedCall__Inputs(this);
  }

  get outputs(): OnERC721ReceivedCall__Outputs {
    return new OnERC721ReceivedCall__Outputs(this);
  }
}

export class OnERC721ReceivedCall__Inputs {
  _call: OnERC721ReceivedCall;

  constructor(call: OnERC721ReceivedCall) {
    this._call = call;
  }

  get operator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get from(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get data(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class OnERC721ReceivedCall__Outputs {
  _call: OnERC721ReceivedCall;

  constructor(call: OnERC721ReceivedCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class PerformUpkeepCall extends ethereum.Call {
  get inputs(): PerformUpkeepCall__Inputs {
    return new PerformUpkeepCall__Inputs(this);
  }

  get outputs(): PerformUpkeepCall__Outputs {
    return new PerformUpkeepCall__Outputs(this);
  }
}

export class PerformUpkeepCall__Inputs {
  _call: PerformUpkeepCall;

  constructor(call: PerformUpkeepCall) {
    this._call = call;
  }

  get performData(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }
}

export class PerformUpkeepCall__Outputs {
  _call: PerformUpkeepCall;

  constructor(call: PerformUpkeepCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class SetKeeperRegistryCall extends ethereum.Call {
  get inputs(): SetKeeperRegistryCall__Inputs {
    return new SetKeeperRegistryCall__Inputs(this);
  }

  get outputs(): SetKeeperRegistryCall__Outputs {
    return new SetKeeperRegistryCall__Outputs(this);
  }
}

export class SetKeeperRegistryCall__Inputs {
  _call: SetKeeperRegistryCall;

  constructor(call: SetKeeperRegistryCall) {
    this._call = call;
  }

  get _keeperRegistry(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetKeeperRegistryCall__Outputs {
  _call: SetKeeperRegistryCall;

  constructor(call: SetKeeperRegistryCall) {
    this._call = call;
  }
}

export class TerminateSwitchEarlyCall extends ethereum.Call {
  get inputs(): TerminateSwitchEarlyCall__Inputs {
    return new TerminateSwitchEarlyCall__Inputs(this);
  }

  get outputs(): TerminateSwitchEarlyCall__Outputs {
    return new TerminateSwitchEarlyCall__Outputs(this);
  }
}

export class TerminateSwitchEarlyCall__Inputs {
  _call: TerminateSwitchEarlyCall;

  constructor(call: TerminateSwitchEarlyCall) {
    this._call = call;
  }
}

export class TerminateSwitchEarlyCall__Outputs {
  _call: TerminateSwitchEarlyCall;

  constructor(call: TerminateSwitchEarlyCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class TryExecuteSwitchCall extends ethereum.Call {
  get inputs(): TryExecuteSwitchCall__Inputs {
    return new TryExecuteSwitchCall__Inputs(this);
  }

  get outputs(): TryExecuteSwitchCall__Outputs {
    return new TryExecuteSwitchCall__Outputs(this);
  }
}

export class TryExecuteSwitchCall__Inputs {
  _call: TryExecuteSwitchCall;

  constructor(call: TryExecuteSwitchCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TryExecuteSwitchCall__Outputs {
  _call: TryExecuteSwitchCall;

  constructor(call: TryExecuteSwitchCall) {
    this._call = call;
  }
}

export class UpdateSwitchAmountCall extends ethereum.Call {
  get inputs(): UpdateSwitchAmountCall__Inputs {
    return new UpdateSwitchAmountCall__Inputs(this);
  }

  get outputs(): UpdateSwitchAmountCall__Outputs {
    return new UpdateSwitchAmountCall__Outputs(this);
  }
}

export class UpdateSwitchAmountCall__Inputs {
  _call: UpdateSwitchAmountCall;

  constructor(call: UpdateSwitchAmountCall) {
    this._call = call;
  }
}

export class UpdateSwitchAmountCall__Outputs {
  _call: UpdateSwitchAmountCall;

  constructor(call: UpdateSwitchAmountCall) {
    this._call = call;
  }
}

export class UpdateSwitchBenefitorCall extends ethereum.Call {
  get inputs(): UpdateSwitchBenefitorCall__Inputs {
    return new UpdateSwitchBenefitorCall__Inputs(this);
  }

  get outputs(): UpdateSwitchBenefitorCall__Outputs {
    return new UpdateSwitchBenefitorCall__Outputs(this);
  }
}

export class UpdateSwitchBenefitorCall__Inputs {
  _call: UpdateSwitchBenefitorCall;

  constructor(call: UpdateSwitchBenefitorCall) {
    this._call = call;
  }

  get _benefitor(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class UpdateSwitchBenefitorCall__Outputs {
  _call: UpdateSwitchBenefitorCall;

  constructor(call: UpdateSwitchBenefitorCall) {
    this._call = call;
  }
}

export class UpdateSwitchExecutorCall extends ethereum.Call {
  get inputs(): UpdateSwitchExecutorCall__Inputs {
    return new UpdateSwitchExecutorCall__Inputs(this);
  }

  get outputs(): UpdateSwitchExecutorCall__Outputs {
    return new UpdateSwitchExecutorCall__Outputs(this);
  }
}

export class UpdateSwitchExecutorCall__Inputs {
  _call: UpdateSwitchExecutorCall;

  constructor(call: UpdateSwitchExecutorCall) {
    this._call = call;
  }

  get _executor(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class UpdateSwitchExecutorCall__Outputs {
  _call: UpdateSwitchExecutorCall;

  constructor(call: UpdateSwitchExecutorCall) {
    this._call = call;
  }
}

export class UpdateSwitchUnlockTimeCall extends ethereum.Call {
  get inputs(): UpdateSwitchUnlockTimeCall__Inputs {
    return new UpdateSwitchUnlockTimeCall__Inputs(this);
  }

  get outputs(): UpdateSwitchUnlockTimeCall__Outputs {
    return new UpdateSwitchUnlockTimeCall__Outputs(this);
  }
}

export class UpdateSwitchUnlockTimeCall__Inputs {
  _call: UpdateSwitchUnlockTimeCall;

  constructor(call: UpdateSwitchUnlockTimeCall) {
    this._call = call;
  }

  get _unlockTimestamp(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class UpdateSwitchUnlockTimeCall__Outputs {
  _call: UpdateSwitchUnlockTimeCall;

  constructor(call: UpdateSwitchUnlockTimeCall) {
    this._call = call;
  }
}
