import type { A11yNode } from '../detector/index.js';

export interface SourceLocation {
  file: string;
  line: number;
  column: number;
}

export interface SourceMapper {
  locate(node: A11yNode): Promise<SourceLocation | null>;
}
