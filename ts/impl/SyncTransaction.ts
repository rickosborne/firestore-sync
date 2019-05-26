import {TransactionOp} from "./TransactionOp";

export class SyncTransaction {
  private readonly ops: TransactionOp[] = [];

  public add(op: TransactionOp): void {
    this.ops.push(op);
  }

  public async apply(): Promise<void> {
    return;
  }
}
