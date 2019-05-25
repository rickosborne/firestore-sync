import {identify} from "../base/Identified";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {Visitor} from "./Visitor";

export class PropertyVisitor extends Visitor<PropertyLike, WritablePropertyLike> {
  constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
    private readonly readProperty: PropertyLike,
    private readonly writeProperty: WritablePropertyLike,
  ) {
    super(config.logger, identify(readProperty, writeProperty));
  }

  public async commit(): Promise<void> {
    const readExists = await this.readProperty.exists;
    const writeExists = await this.writeProperty.exists;
    if (readExists && writeExists) {
      return await this.commitUpdate();
    } else if (readExists) {
      return await this.commitCreate();
    } else if (writeExists) {
      return await this.commitDelete();
    } else {
      throw new Error(`Unexpected: both read and write properties were empty for "${this.id}"`);
    }
  }

  private async commitCreate(): Promise<void> {
    if (!this.config.createValues) {
      if (this.config.logSkips) {
        this.logger(this.constructor.name, 'commit', `Skip property create: ${this.id}`);
      }
    } else {
      if (this.config.logCreates) {
        this.logger(this.constructor.name, 'commit', `Create property: ${this.id}`);
      }
      return await this.writeProperty.updateFrom(this.readProperty);
    }
  }

  private async commitDelete(): Promise<void> {
    if (!this.config.deleteValues) {
      if (this.config.logSkips) {
        this.logger(this.constructor.name, 'commit', `Skip property delete: ${this.id}`);
      }
    } else {
      if (this.config.logDeletes) {
        this.logger(this.constructor.name, 'commit', `Property delete: ${this.id}`);
      }
      return await this.writeProperty.updateFrom(this.readProperty);
    }
  }

  private async commitUpdate() {
    if (!this.config.updateValues) {
      if (this.config.logSkips) {
        this.logger(this.constructor.name, 'commit', `Skip property update: ${this.id}`);
      }
    } else if (!await this.readProperty.matches(this.writeProperty)) {
      if (this.config.logUpdates) {
        this.logger(this.constructor.name, 'commit', `Update property: ${this.id}`);
      }
      return await this.writeProperty.updateFrom(this.readProperty);
    }
  }

  public async getPropertyVisitors(): Promise<PropertyVisitor[]> {
    const readProperties = await this.readProperty.getReadableProperties();
    const writeProperties = await this.writeProperty.getWritableProperties();
    return this.merge(
      readProperties,
      writeProperties,
      (prop) => prop.buildEmptyReadableProperty(),
      (prop) => prop.buildEmptyWritableProperty(),
      (r, w) => new PropertyVisitor(this.config, r, w),
    );
  }
}
