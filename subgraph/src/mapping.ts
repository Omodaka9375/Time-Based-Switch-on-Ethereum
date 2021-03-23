import {
  TimeBasedSwitch,
  AmountUpdated,
  BenefitorUpdated,
  CollectibleLocked,
  EtherReceived,
  ExecutorUpdated,
  KeeperRegistryUpdated,
  OwnershipTransferred,
  SwitchCreated,
  SwitchTerminated,
  SwitchTriggered,
  TokenLocked,
  UnlockTimeUpdated
} from "../generated/TimeBasedSwitch/TimeBasedSwitch"
import { Token, Collectible, Switch } from "../generated/schema"

export function handleAmountUpdated(event: AmountUpdated): void {
  let switchEntity = Switch.load(event.transaction.from.toHex());

  switchEntity.ethersLocked = switchEntity.ethersLocked.plus(event.params.amount);

  switchEntity.save();
  // // Entities can be loaded from the store using a string ID; this ID
  // // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (entity == null) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.amount = event.params.amount

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // // Note: If a handler doesn't require existing field values, it is faster
  // // _not_ to load the entity from the store. Instead, create it fresh with
  // // `new Entity(...)`, set the fields that should be updated and save the
  // // entity back to the store. Fields that were not set or unset remain
  // // unchanged, allowing for partial updates to be applied.

  // // It is also possible to access smart contracts from mappings. For
  // // example, the contract that has emitted the event can be connected to
  // // with:
  // //
  // // let contract = Contract.bind(event.address)
  // //
  // // The following functions can then be called on this contract to access
  // // state variables and other data:
  // //
  // // - contract.checkUpkeep(...)
  // // - contract.getSwitchInfo(...)
  // // - contract.onERC721Received(...)
  // // - contract.owner(...)
}

export function handleBenefitorUpdated(event: BenefitorUpdated): void {
  let switchEntity = Switch.load(event.transaction.from.toHex());

  switchEntity.benefitor = event.params.benefitor;

  switchEntity.save();
}

export function handleCollectibleLocked(event: CollectibleLocked): void {
  let switchEntity = Switch.load(event.params.account.toHex());

  let collectibleEntity = new Collectible(event.params.tokenAddress.toHex());
  collectibleEntity.collectibleId = event.params.tokenId;
  collectibleEntity.benefitor = event.params.benefitor;

  collectibleEntity.save();

  switchEntity.collectiblesLocked = switchEntity.collectiblesLocked.concat([collectibleEntity.id]);

  switchEntity.save();
}

export function handleEtherReceived(event: EtherReceived): void {}

export function handleExecutorUpdated(event: ExecutorUpdated): void {
  let switchEntity = Switch.load(event.transaction.from.toHex());

  switchEntity.executor = event.params.executor;

  switchEntity.save();
}

export function handleKeeperRegistryUpdated(
  event: KeeperRegistryUpdated
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSwitchCreated(event: SwitchCreated): void {
  let switchEntity = new Switch(event.transaction.from.toHex());

  switchEntity.name = event.params.switchName.toString();
  switchEntity.executor = event.params.executor;
  switchEntity.benefitor = event.params.benefitor;
  switchEntity.unlockTimestamp = event.params.unlockTimestamp;
  switchEntity.ethersLocked = event.params.amount;
  switchEntity.isExecuted = false;

  switchEntity.save();
}

export function handleSwitchTerminated(event: SwitchTerminated): void {
  let switchEntity = Switch.load(event.params.account.toHex());

  switchEntity.isExecuted = true;

  switchEntity.save();
}

export function handleSwitchTriggered(event: SwitchTriggered): void {
  let switchEntity = Switch.load(event.params.account.toHex());

  switchEntity.isExecuted = true;

  switchEntity.save();
}

export function handleTokenLocked(event: TokenLocked): void {
  let switchEntity = Switch.load(event.params.account.toHex());
}

export function handleUnlockTimeUpdated(event: UnlockTimeUpdated): void {
  let switchEntity = Switch.load(event.transaction.from.toHex());

  switchEntity.unlockTimestamp = event.params.unlockTimestamp;

  switchEntity.save();
}
