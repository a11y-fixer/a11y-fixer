export interface AIProvider {
  available(): boolean;
  describeImage(imageBuffer: Buffer, context: string): Promise<string>;
  /** Alt text from context alone, when no image pixels are available. */
  suggestAltText(context: string): Promise<string>;
  rewriteLinkText(current: string, context: string): Promise<string>;
}
