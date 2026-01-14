
'use client';

import * as React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { fileTree, type FileNode } from '@/lib/file-tree';
import { fileContents } from '@/lib/file-contents';
import { Folder, File, ChevronRight, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const FileTree = ({
  node,
  level = 0,
  path = '',
  onFileClick,
}: {
  node: FileNode;
  level?: number;
  path?: string;
  onFileClick: (path: string) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(level < 1);
  const currentPath = path ? `${path}/${node.name}` : node.name;

  if (node.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted">
            <ChevronRight
              className={cn(
                'h-4 w-4 transform transition-transform',
                isOpen && 'rotate-90'
              )}
            />
            <Folder className="h-4 w-4 text-primary" />
            <span className="font-medium">{node.name}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className="pl-6"
            style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
          >
            {node.children.map((child) => (
              <FileTree
                key={child.name}
                node={child}
                level={level + 1}
                path={currentPath}
                onFileClick={onFileClick}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <button
      className="w-full text-left flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted"
      onClick={() => onFileClick(currentPath)}
    >
      <span style={{ paddingLeft: `${level * 1.5}rem` }} />
      <File className="h-4 w-4 text-muted-foreground" />
      <span>{node.name}</span>
    </button>
  );
};

export default function FileNavigator() {
  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    setIsDialogOpen(true);
  };

  const content = selectedFile
    ? (fileContents as Record<string, string>)[selectedFile]
    : '';

  return (
    <>
      <div className="p-4 rounded-lg bg-muted/50 border max-h-96 overflow-y-auto text-sm">
        {fileTree.map((node) => (
          <FileTree key={node.name} node={node} onFileClick={handleFileClick} />
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {selectedFile}
            </DialogTitle>
            <DialogDescription>
              Viewing the content of {selectedFile}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full w-full rounded-md border p-4 font-code text-sm">
            <pre>
              <code>{content}</code>
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
