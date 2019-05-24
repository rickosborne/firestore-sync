import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class SnakeCodec implements FilesystemNameCodec {
  public decode(name: string): string {
    return name.replace(/_[0-9a-fA-F]{1,4}_/g, (all) => String.fromCharCode(parseInt(all.substr(1), 16)));
  }

  public encode(name: string): string {
    return name.replace(/[^-a-zA-Z0-9]+/g, (c) => {
      let replacement = '';
      for (let i = 0; i < c.length; i++) {
        replacement += '_' + c.charCodeAt(i).toString(16) + '_';
      }
      return replacement;
    });
  }
}
