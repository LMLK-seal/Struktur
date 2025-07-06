
export type NodeType = 'folder' | 'file';

export interface FileSystemNode {
  id: string;
  name: string;
  type: NodeType;
  children?: FileSystemNode[];
  isExpanded?: boolean;
}
