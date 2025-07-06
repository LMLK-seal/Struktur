import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FileSystemNode, NodeType } from './types';
import { DirectoryNode } from './components/DirectoryNode';
import { createZipFromStructure } from './services/zipService';
import { DownloadIcon, CoffeeIcon, UploadIcon, SaveIcon } from './components/icons';
import { ContextMenu } from './components/ContextMenu';


const LOCAL_STORAGE_KEY = 'struktur-tree';

export type PendingAction = { type: 'add', parentId: string, nodeType: NodeType } | { type: 'rename', nodeId: string };


// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  confirmButtonClassName?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmButtonText = 'Confirm',
  confirmButtonClassName = 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md m-4 p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="text-gray-300 mb-6">{message}</div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
          >
            Cancel
          </button>          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${confirmButtonClassName}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};


type ConfirmationState = {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    confirmButtonText?: string;
    confirmButtonClassName?: string;
} | null;

/**
 * A robust, recursive function to modify the tree structure.
 * It's a pure function that returns a new tree object if any changes were made.
 * It handles modifications (like renaming), additions, and deletions (by returning null).
 * @param node The current node to process.
 * @param logic The function to apply to each node. It can return a modified node, the original node, or null to delete it.
 * @returns The modified node, the original node, or null.
 */
const modifyTree = (node: FileSystemNode, logic: (n: FileSystemNode) => FileSystemNode | null): FileSystemNode | null => {
    let childrenChanged = false;
    let newChildren: FileSystemNode[] = [];

    if (node.children) {
        newChildren = node.children
            .map(child => modifyTree(child, logic))
            .filter((child): child is FileSystemNode => child !== null);
        
        childrenChanged = newChildren.length !== node.children.length || newChildren.some((child, index) => child !== node.children[index]);
    }
    
    const nodeToProcess = childrenChanged ? { ...node, children: newChildren } : node;

    return logic(nodeToProcess);
};


const App: React.FC = () => {
    const [tree, setTree] = useState<FileSystemNode | null>(() => {
        try {
            const savedTree = localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedTree ? JSON.parse(savedTree) : null;
        } catch (error) {
            console.error("Failed to parse tree from localStorage", error);
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileSystemNode } | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
    const loadInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            if (tree) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
            } else {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } catch (error) {
            console.error("Failed to save tree to localStorage", error);
        }
    }, [tree]);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        const handleContextMenuClose = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('[data-context-menu-trigger]')) {
                setContextMenu(null);
            }
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('contextmenu', handleContextMenuClose);

        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('contextmenu', handleContextMenuClose);
        };
    }, []);

    const handleCreateRoot = () => {
        setTree({
            id: 'root',
            name: 'my-project',
            type: 'folder',
            children: [],
            isExpanded: true,
        });
    };
    
    const handleNewProject = () => {
        setConfirmation({
            isOpen: true,
            title: 'Start a New Project?',
            message: 'This will clear your current directory structure. This action cannot be undone. Are you sure you wish to proceed?',
            onConfirm: () => setTree(null),
            confirmButtonText: 'Yes, start new project',
            confirmButtonClassName: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        });
    };
    
    const handleSaveProject = () => {
        if (!tree) return;
        try {
            const jsonString = JSON.stringify(tree, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = `${tree.name}-struktur.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        } catch (error) {
            console.error('Failed to save project:', error);
            alert('An error occurred while saving the project file.');
        }
    };

    const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not a string");
                const loadedTree = JSON.parse(text);
                
                if (loadedTree.id && loadedTree.name && loadedTree.type) {
                    setConfirmation({
                        isOpen: true,
                        title: 'Load Project?',
                        message: 'This will replace your current directory structure and cannot be undone. Are you sure?',
                        onConfirm: () => setTree(loadedTree),
                        confirmButtonText: 'Yes, load project',
                        confirmButtonClassName: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    });
                } else {
                    alert("Invalid project file format.");
                }
            } catch (error) {
                console.error("Failed to load or parse project file:", error);
                alert("Failed to load project file. It may be corrupted or in the wrong format.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const updateTree = (logic: (n: FileSystemNode) => FileSystemNode | null) => {
        setTree(currentTree => {
            if (!currentTree) return null;
            const newTree = modifyTree(currentTree, logic);
            return newTree;
        });
    };

    const handleAddNode = useCallback((parentId: string, name: string, type: NodeType) => {
        const newNodeData: FileSystemNode = {
            id: `${parentId}-${Date.now()}-${Math.random()}`,
            name,
            type,
            children: type === 'folder' ? [] : undefined,
            isExpanded: type === 'folder' ? true : undefined,
        };

        const logic = (node: FileSystemNode): FileSystemNode => {
            if (node.id === parentId && node.type === 'folder') {
                return { ...node, children: [...(node.children || []), newNodeData], isExpanded: true };
            }
            return node;
        };
        
        updateTree(logic);

    }, []);

    const handleDeleteNode = useCallback((nodeId: string) => {
        if (nodeId === 'root') return;
        const logic = (node: FileSystemNode): FileSystemNode | null => {
            return node.id === nodeId ? null : node;
        };
        updateTree(logic);
    }, []);

    const handleDeleteNodeRequest = (nodeId: string, nodeName: string) => {
        if (nodeId === 'root') return;
        setConfirmation({
            isOpen: true,
            title: `Delete "${nodeName}"?`,
            message: (
                <>
                    Are you sure you want to delete <strong className="font-semibold text-white">{nodeName}</strong>? 
                    <br />
                    This action cannot be undone.
                </>
            ),
            onConfirm: () => handleDeleteNode(nodeId),
            confirmButtonText: 'Delete',
            confirmButtonClassName: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        });
    };

    const handleRenameNode = useCallback((nodeId: string, newName: string) => {
        const logic = (node: FileSystemNode): FileSystemNode => {
            if (node.id === nodeId) {
                return { ...node, name: newName };
            }
            return node;
        };
        updateTree(logic);
    }, []);

    const handleToggleExpand = useCallback((nodeId: string) => {
        const logic = (node: FileSystemNode): FileSystemNode => {
            if (node.id === nodeId && node.type === 'folder') {
                return { ...node, isExpanded: !node.isExpanded };
            }
            return node;
        };
        updateTree(logic);
    }, []);
    
    const setAllExpanded = (isExpanded: boolean) => {
        if (!tree) return;
        const recursiveSet = (node: FileSystemNode): FileSystemNode => {
            let newNode = { ...node };
            if (newNode.type === 'folder') {
                newNode.isExpanded = isExpanded;
                if (newNode.children) {
                    newNode.children = newNode.children.map(recursiveSet);
                }
            }
            return newNode;
        };
        setTree(recursiveSet(tree));
    };
    
    const handleContextMenu = (event: React.MouseEvent, node: FileSystemNode) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            node,
        });
    };

    const handleDownload = async () => {
        if (!tree) return;
        setIsLoading(true);
        try {
            await createZipFromStructure(tree);
        } catch (error) {
            console.error(error);
            alert("Failed to create zip file.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <input type="file" ref={loadInputRef} onChange={handleLoadProject} accept=".json" className="hidden" />
                <header className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Struktur
                        </h1>
                        <p className="text-gray-400 mt-1">Visual Directory Generator</p>
                    </div>
                     <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        {tree && (
                             <>
                                <button onClick={handleNewProject} className="px-3 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 rounded-lg transition-colors">New Project</button>
                                <button
                                    onClick={handleDownload}
                                    disabled={isLoading}
                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    <span>{isLoading ? 'Zipping...' : 'Download .zip'}</span>
                                </button>
                             </>
                        )}
                    </div>
                </header>

                {tree && (
                    <div className="flex justify-end items-center mb-4 space-x-2">
                        <button onClick={() => loadInputRef.current?.click()} className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                            <UploadIcon className="w-4 h-4"/> <span>Load</span>
                        </button>
                        <button onClick={handleSaveProject} className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                            <SaveIcon className="w-4 h-4" /> <span>Save</span>
                        </button>
                        
                        <div className="w-px h-5 bg-gray-600"></div>

                        <button onClick={() => setAllExpanded(true)} className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Expand All</button>
                        <button onClick={() => setAllExpanded(false)} className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Collapse All</button>
                    </div>
                )}
                
                <main className="bg-gray-800/50 rounded-lg shadow-2xl shadow-black/20 p-4 sm:p-6 min-h-[60vh]">
                    {tree ? (
                        <div className="overflow-auto h-full">
                           <DirectoryNode 
                                node={tree} 
                                depth={0}
                                onAddNode={handleAddNode}
                                onDeleteNodeRequest={handleDeleteNodeRequest}
                                onRenameNode={handleRenameNode}
                                onToggleExpand={handleToggleExpand}
                                onContextMenu={handleContextMenu}
                                pendingAction={pendingAction}
                                onClearPendingAction={() => setPendingAction(null)}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-10">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-300">Start building your project structure</h2>
                            <p className="max-w-md mb-8">Click the button below to create a root folder, or load an existing project file.</p>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleCreateRoot}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
                                >
                                    Create Root Folder
                                </button>
                                 <button onClick={() => loadInputRef.current?.click()} className="px-6 py-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold">
                                    Load Project
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="text-center mt-8 text-gray-500 text-sm space-y-4">
                    <p>Built with React, Tailwind CSS, and JSZip.</p>
                    <a 
                        href="https://buymeacoffee.com/Yaniv1" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-colors duration-200 shadow-md"
                    >
                        <CoffeeIcon className="w-5 h-5" />
                        <span>Buy me a coffee</span>
                    </a>
                </footer>
            </div>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    node={contextMenu.node}
                    isRoot={contextMenu.node.id === 'root'}
                    onAddNode={(type) => setPendingAction({ type: 'add', parentId: contextMenu.node.id, nodeType: type })}
                    onRenameNode={() => setPendingAction({ type: 'rename', nodeId: contextMenu.node.id })}
                    onDeleteNode={() => handleDeleteNodeRequest(contextMenu.node.id, contextMenu.node.name)}
                />
            )}
            {confirmation?.isOpen && (
                 <ConfirmationModal
                    isOpen={confirmation.isOpen}
                    onClose={() => setConfirmation(null)}
                    onConfirm={confirmation.onConfirm}
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmButtonText={confirmation.confirmButtonText}
                    confirmButtonClassName={confirmation.confirmButtonClassName}
                />
            )}
        </div>
    );
};

export default App;