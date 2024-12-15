export interface MarkdownNode {
  type: string;
  value?: string;
  depth?: number;
  ordered?: boolean;
  children?: MarkdownNode[];
  url?: string;
  title?: string;
  alt?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}
