import * as punycode from 'punycode';
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class PunycodeCodec implements FilesystemNameCodec {
  public decode(name: string): string {
    return punycode.decode(name);
  }

  public encode(name: string): string {
    return punycode.encode(name);
  }
}
