import {identify} from "../base/Identified";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {PropertyLike} from "./PropertyLike";
import {Visitor} from "./Visitor";

export class PropertyVisitor extends Visitor<PropertyLike> {
  constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
    private readonly readProperty: PropertyLike | undefined,
    private readonly writeProperty: PropertyLike | undefined,
  ) {
    super(
      'value',
      config.createValues,
      config.updateValues,
      config.deleteValues,
      config.logSkips,
      config.logger,
      identify(readProperty, writeProperty),
    );
  }

  public async getPropertyVisitors(): Promise<PropertyVisitor[]> {
    const readProperties = this.readProperty == null ? [] : await this.readProperty.getProperties();
    const writeProperties = this.writeProperty == null ? [] : await this.writeProperty.getProperties();
    return this.merge(readProperties, writeProperties, (r, w) => new PropertyVisitor(this.config, r, w));
  }
}
