export interface FilesystemNameCodec {
  decode(name: string): string;
  encode(name: string): string;
}
