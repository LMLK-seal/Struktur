import React, { useState, useRef, useEffect } from 'react';
import type { FileSystemNode, NodeType } from '../types';
import { FileIcon, FolderIcon, PlusIcon, TrashIcon, EditIcon, ChevronRightIcon } from './icons';
import type { PendingAction } from '../App';

interface DirectoryNodeProps {
  node: FileSystemNode;
  depth: number;
  onAddNode: (parentId: string, name: string, type: NodeType) => void;
  onDeleteNodeRequest: (nodeId: string, nodeName:string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onToggleExpand: (nodeId: string) => void;
  onContextMenu: (event: React.MouseEvent, node: FileSystemNode) => void;
  pendingAction: PendingAction | null;
  onClearPendingAction: () => void;
}

const ActionButton: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors duration-150"
    >
        {children}
    </button>
);

export const DirectoryNode: React.FC<DirectoryNodeProps> = ({ 
    node, 
    depth, 
    onAddNode, 
    onDeleteNodeRequest, 
    onRenameNode, 
    onToggleExpand,
    onContextMenu,
    pendingAction,
    onClearPendingAction
}) => {
    const [isAdding, setIsAdding] = useState<NodeType | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartRename = () => {
        setIsRenaming(true);
        setInputValue(node.name);
    };

    useEffect(() => {
        if (isAdding || isRenaming) {
            inputRef.current?.focus();
        }
    }, [isAdding, isRenaming]);
    
    useEffect(() => {
        if (!pendingAction) return;

        if (pendingAction.type === 'add' && pendingAction.parentId === node.id) {
            if (!node.isExpanded) onToggleExpand(node.id); // Ensure parent is expanded
            setIsAdding(pendingAction.nodeType);
            onClearPendingAction();
        } else if (pendingAction.type === 'rename' && pendingAction.nodeId === node.id) {
            handleStartRename();
            onClearPendingAction();
        }
    }, [pendingAction, node.id, node.isExpanded, onClearPendingAction, onToggleExpand]);

    const handleConfirm = () => {
        if (!inputValue.trim()) {
            setIsAdding(null);
            setIsRenaming(false);
            setInputValue('');
            return;
        }

        if (isAdding) {
            onAddNode(node.id, inputValue, isAdding);
        } else if (isRenaming) {
            onRenameNode(node.id, inputValue);
        }

        setIsAdding(null);
        setIsRenaming(false);
        setInputValue('');
    };

    const handleCancel = () => {
        setIsAdding(null);
        setIsRenaming(false);
        setInputValue('');
    }

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }

    const handleNodeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'F2' && !isRenaming && !isAdding) {
            e.preventDefault();
            handleStartRename();
        }
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleConfirm();
    };

    const inputForm = (
        <form onSubmit={handleFormSubmit} onBlur={handleConfirm} className="ml-2 flex-grow">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={isAdding === 'folder' ? 'New folder name...' : 'New file name...'}
                className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
            />
        </form>
    );

    return (
        <div onKeyDown={handleNodeKeyDown} tabIndex={-1} className="outline-none">
            <div 
                className="flex items-center space-x-2 my-1 group p-1 rounded-md hover:bg-gray-800/50" 
                style={{ paddingLeft: `${depth * 1.5}rem` }}
                onContextMenu={(e) => onContextMenu(e, node)}
                data-context-menu-trigger="true"
            >
                {node.type === 'folder' && (
                     <ChevronRightIcon 
                        className={`w-4 h-4 text-gray-500 flex-shrink-0 cursor-pointer transition-transform duration-150 ${node.isExpanded ? 'rotate-90' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
                    />
                )}
                {node.type === 'folder' 
                    ? <FolderIcon className={`w-5 h-5 text-blue-400 flex-shrink-0`} /> 
                    : <FileIcon className={`w-5 h-5 text-gray-400 flex-shrink-0 ${depth > 0 ? 'ml-6' : ''}`} />
                }
                {isRenaming ? (
                     inputForm
                ) : (
                    <span className="text-gray-300 truncate cursor-pointer flex-grow" onClick={() => node.type === 'folder' && onToggleExpand(node.id)}>{node.name}</span>
                )}
                
                {!isRenaming && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto">
                        {node.type === 'folder' && (
                             <ActionButton onClick={(e) => {e.stopPropagation(); setIsAdding('folder')}} title="Add Folder">
                                <FolderIcon className="w-4 h-4" />
                                <PlusIcon className="w-3 h-3 -ml-2 -mt-2"/>
                            </ActionButton>
                        )}
                         {node.type === 'folder' && (
                            <ActionButton onClick={(e) => {e.stopPropagation(); setIsAdding('file')}} title="Add File">
                                <FileIcon className="w-4 h-4" />
                                <PlusIcon className="w-3 h-3 -ml-2 -mt-2"/>
                            </ActionButton>
                        )}
                        <ActionButton onClick={(e) => {e.stopPropagation(); handleStartRename()}} title="Rename (F2)">
                            <EditIcon className="w-4 h-4" />
                        </ActionButton>
                        {depth > 0 && (
                            <ActionButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteNodeRequest(node.id, node.name);
                                }} 
                                title="Delete"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </ActionButton>
                        )}
                    </div>
                )}
            </div>

            {isAdding && <div style={{ paddingLeft: `${(depth + 1) * 1.5 + 1}rem` }}>{inputForm}</div>}
            
            {node.type === 'folder' && node.isExpanded && node.children && (
                 <>
                    {node.children.map(child => (
                        <DirectoryNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onAddNode={onAddNode}
                            onDeleteNodeRequest={onDeleteNodeRequest}
                            onRenameNode={onRenameNode}
                            onToggleExpand={onToggleExpand}
                            onContextMenu={onContextMenu}
                            pendingAction={pendingAction}
                            onClearPendingAction={onClearPendingAction}
                        />
                    ))}
                </>
            )}
        </div>
    );
};