export interface AIProvider {
  available(): boolean;
  describeImage(imageBuffer: Buffer, context: string): Promise<string>;
  rewriteLinkText(current: string, context: string): Promise<string>;
}
