
import type { FileSystemNode } from '../types';

declare const JSZip: any;

const addNodeToZip = (node: FileSystemNode, zipFolder: any) => {
  if (node.type === 'folder') {
    const newFolder = zipFolder.folder(node.name);
    if (node.children) {
      for (const child of node.children) {
        addNodeToZip(child, newFolder);
      }
    }
  } else {
    zipFolder.file(node.name, ''); // Create an empty file
  }
};

export const createZipFromStructure = async (rootNode: FileSystemNode): Promise<void> => {
  if (typeof JSZip === 'undefined') {
    alert('JSZip library not found. Please check your internet connection and try again.');
    return;
  }
  const zip = new JSZip();
  
  // We assume the rootNode is the main folder to be created
  const rootFolder = zip.folder(rootNode.name);
  if (rootNode.children) {
      for (const child of rootNode.children) {
        addNodeToZip(child, rootFolder);
      }
  }

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${rootNode.name}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Failed to generate zip file:', error);
    alert('An error occurred while creating the zip file.');
  }
};
