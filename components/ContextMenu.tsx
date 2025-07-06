
import React from 'react';
import type { FileSystemNode, NodeType } from '../types';
import { FolderIcon, FileIcon, EditIcon, TrashIcon, PlusIcon } from './icons';

interface ContextMenuProps {
  x: number;
  y: number;
  node: FileSystemNode;
  onAddNode: (type: NodeType) => void;
  onRenameNode: () => void;
  onDeleteNode: () => void;
  isRoot: boolean;
}

const MenuItem: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-blue-600 rounded-md transition-colors ${className}`}
    >
        {children}
    </button>
);

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, node, onAddNode, onRenameNode, onDeleteNode, isRoot }) => {
    const style = {
        top: `${y}px`,
        left: `${x}px`,
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    return (
        <div
            style={style}
            onClick={handleClick}
            className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-2 z-50 w-52 animate-fade-in-fast"
        >
            <div className="flex flex-col space-y-1">
                {node.type === 'folder' && (
                    <>
                        <MenuItem onClick={() => onAddNode('folder')}>
                            <FolderIcon className="w-4 h-4" />
                            <PlusIcon className="w-3 h-3 -ml-4 -mt-2" />
                            <span>New Folder</span>
                        </MenuItem>
                        <MenuItem onClick={() => onAddNode('file')}>
                            <FileIcon className="w-4 h-4" />
                            <PlusIcon className="w-3 h-3 -ml-4 -mt-2" />
                            <span>New File</span>
                        </MenuItem>
                        <hr className="border-gray-700 my-1" />
                    </>
                )}
                <MenuItem onClick={onRenameNode}>
                    <EditIcon className="w-4 h-4" />
                    <span>Rename</span>
                </MenuItem>
                {!isRoot && (
                    <MenuItem onClick={onDeleteNode} className="text-red-400 hover:!bg-red-600/80 hover:!text-white">
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                    </MenuItem>
                )}
            </div>
        </div>
    );
};
