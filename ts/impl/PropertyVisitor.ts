import {identify} from "../base/Identified";
import {PropertyApplyEffect, PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {FirestoreOnTypeMismatch} from "../config/FirestoreSyncConfig";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {OpAction, OpStatus, TransactionOp} from "./TransactionOp";
import {Visitor} from "./Visitor";

export class PropertyVisitor extends Visitor<PropertyLike, WritablePropertyLike> {
  private propertyVisitors?: PropertyVisitor[];

  constructor(
    config: FirestoreSyncProfileOperationAdapter,
    readProperty: PropertyLike,
    writeProperty: WritablePropertyLike,
  ) {
    super(
      identify(readProperty, writeProperty),
      readProperty != null ? readProperty.path : writeProperty != null ? writeProperty.path : '???',
      readProperty,
      writeProperty,
      config,
    );
  }

  public applyHasEffect(): boolean {
    const readEffect = this.writeItem.effectFrom(this.readItem);
    switch (readEffect) {
      case PropertyApplyEffect.NONE:
        return false;
      case PropertyApplyEffect.CREATE:
        return this.config.createValues;
      case PropertyApplyEffect.UPDATE:
        return this.config.updateValues;
      case PropertyApplyEffect.DELETE:
        return this.config.deleteValues;
      case PropertyApplyEffect.SKIP:
        return false;
      case PropertyApplyEffect.TYPE_MISMATCH:
        return this.config.onTypeMismatch === FirestoreOnTypeMismatch.FAIL;
      default:
        throw new Error(`Unexpected PropertyApplyEffect: ${readEffect}`);
    }
  }

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): () => Promise<OpStatus> {
    return this.buildGenericApply(this.config.logSkips, action, doAction, effects, logAction);
  }

  public getPropertyVisitors(): PropertyVisitor[] {
    if (this.propertyVisitors == null) {
      const readProperties = this.readItem.readableProperties;
      const writeProperties = this.writeItem.writableProperties;
      this.propertyVisitors = this.merge(
        readProperties,
        writeProperties,
        (prop) => prop.buildEmptyReadableProperty(),
        (prop) => prop.buildEmptyWritableProperty(),
        (r, w) => new PropertyVisitor(this.config, r, w),
      );
    }
    return this.propertyVisitors;
  }

  public async prepare(): Promise<TransactionOp> {
    return this.prepareGeneric(
      this.config.createValues,
      this.config.updateValues,
      this.config.deleteValues,
    );
  }
}
