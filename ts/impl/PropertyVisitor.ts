import {identify} from "../base/Identified";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
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
      identify(readProperty, writeProperty),
      readProperty,
      writeProperty,
      config,
    );
  }

  public applyHasEffect(): boolean {
    return this.getPropertyVisitors().find((pv) => pv.applyHasEffect()) != null;
  }

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): () => Promise<OpStatus> {
    return this.buildGenericApply(this.config.logSkips, action, doAction, effects, logAction);
  }

  public getPropertyVisitors(): PropertyVisitor[] {
    if (this.propertyVisitors == null) {
      const readProperties = this.readItem.getReadableProperties();
      const writeProperties = this.writeItem.getWritableProperties();
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
