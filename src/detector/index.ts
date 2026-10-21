export interface A11yViolation {
  id: string;
  wcagId: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  helpUrl: string;
  nodes: A11yNode[];
}

export interface A11yNode {
  html: string;
  target: string[];
  failureSummary: string;
  sourceFile?: string;
  sourceLine?: number;
  sourceColumn?: number;
}

export interface DetectorOptions {
  url?: string;
  html?: string;
  rules?: string[];
}

export interface Detector {
  scan(options: DetectorOptions): Promise<A11yViolation[]>;
}
