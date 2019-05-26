import {identify} from "../base/Identified";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {TransactionOp} from "./TransactionOp";
import {Visitor} from "./Visitor";

export class PropertyVisitor extends Visitor<PropertyLike, WritablePropertyLike> {
  private propertyVisitors?: PropertyVisitor[];

  constructor(
    config: FirestoreSyncProfileOperationAdapter,
    private readonly readProperty: PropertyLike,
    private readonly writeProperty: WritablePropertyLike,
  ) {
    super(identify(readProperty, writeProperty), identify(readProperty, writeProperty), config);
  }

  public applyHasEffect(): boolean {
    return this.getPropertyVisitors().find((pv) => pv.applyHasEffect()) != null;
  }

  public getPropertyVisitors(): PropertyVisitor[] {
    if (this.propertyVisitors == null) {
      const readProperties = this.readProperty.getReadableProperties();
      const writeProperties = this.writeProperty.getWritableProperties();
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
      this.readProperty,
      this.writeProperty,
      this.config.createValues,
      this.config.updateValues,
      this.config.deleteValues,
    );
  }
}
