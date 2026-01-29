import { useState, useEffect } from 'react';
import '../styles/FileExplorer.css';
import { FolderIcon, FolderOpenIcon, FilePlusIcon, FolderPlusIcon, getIconForFile, RotateCcwIcon, XIcon } from './Icons';

interface FileExplorerProps {
  workspaceDir: string | null;
  onFileOpen: (filePath: string) => void;
  onCloseProject?: () => void;
  refreshKey?: number;
  onFileDelete?: (path: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  isExpanded?: boolean;
  isLoaded?: boolean;
}

/**
 * 파일 탐색기 컴포넌트 - 실제 파일 시스템 연동
 */
function FileExplorer({ workspaceDir, onFileOpen, onCloseProject, refreshKey, onFileDelete }: FileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [lastSelectedPath, setLastSelectedPath] = useState<string | null>(null); // For range selection or context
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder' | null, parentPath: string | null }>({ type: null, parentPath: null });
  const [newItemName, setNewItemName] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<boolean>(false); // Just a flag now
  const [selectedIsDirectory, setSelectedIsDirectory] = useState(false);

  // Drag & Drop State
  const [dragSourcePath, setDragSourcePath] = useState<string | null>(null);
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);

  // Clipboard & Context Menu State
  const [clipboard, setClipboard] = useState<{ path: string; op: 'copy' | 'cut' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });

    // 우클릭 시 선택도 같이 되면 좋음 (단일 선택)
    if (!selectedPaths.has(node.path)) {
      setSelectedPaths(new Set([node.path]));
      setLastSelectedPath(node.path);
    }
  };

  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!workspaceDir) return;
    // node: null implies Workspace Root
    setContextMenu({ x: e.clientX, y: e.clientY, node: null });
    // Root click clears selection? Maybe yes.
    setSelectedPaths(new Set());
    setLastSelectedPath(null);
  };

  const handleCopy = () => {
    if (contextMenu && contextMenu.node) {
      setClipboard({ path: contextMenu.node.path, op: 'copy' });
      setContextMenu(null);
    }
  };

  const handleCut = () => {
    if (contextMenu && contextMenu.node) {
      setClipboard({ path: contextMenu.node.path, op: 'cut' });
      setContextMenu(null);
    }
  };

  // Helper: 트리 노드 삭제 (Optimistic Update)
  const removeNodeFromTree = (nodes: FileNode[], pathToRemove: string): FileNode[] => {
    return nodes
      .filter(n => n.path !== pathToRemove)
      .map(node => {
        if (node.children) {
          return { ...node, children: removeNodeFromTree(node.children, pathToRemove) };
        }
        return node;
      });
  };

  // 공통 Paste 로직
  const performPaste = async (destDir: string) => {
    if (!clipboard || !destDir) return;

    // Check Source Name
    const sourceName = clipboard.path.split('/').pop();
    if (!sourceName) return;

    const destPath = `${destDir}/${sourceName}`;

    // Loop check ? (Parent to Child)
    if (destDir.startsWith(clipboard.path)) {
      alert('Cannot paste into itself or subdirectory');
      return;
    }

    if (clipboard.path === destPath) {
      if (clipboard.op === 'cut') return;
      // Copy to same place -> allow handled by OS usually creating copy? 
      // or we block for now as per previous logic.
      return;
    }

    // Check Exists
    try {
      const exists = await window.electron.fs.exists(destPath);
      if (exists.success && exists.exists) {
        if (!confirm(`'${sourceName}' already exists. Overwrite?`)) return;
      }

      if (clipboard.op === 'cut') {
        const result = await window.electron.fs.rename(clipboard.path, destPath);
        if (result.success) {
          // Optimistic UI: Remove Source -> Add Target (Atomic Update)
          setFileTree(prev => {
            // 1. Remove Source
            const treeAfterRemove = removeNodeFromTree(prev, clipboard.path);

            // 2. Prepare New Item
            // Ensure we use info from the removed node if possible, or fallback
            // We can find it in 'prev' before removal if we really want strict type matching
            // But finding path in tree is cheap enough
            const sourceNode = findNode(prev, clipboard.path);

            const newItem: FileNode = {
              name: sourceName,
              path: destPath,
              isDirectory: sourceNode ? sourceNode.isDirectory : false,
              isExpanded: false,
              isLoaded: false,
              children: (sourceNode && sourceNode.isDirectory) ? [] : undefined
            };

            // If we have sourceNode children, we could assume they are moved too, 
            // but we'd need to update ALL their paths. 
            // Better to let them be lazy loaded or invalid.
            // If it was a directory, children paths are now invalid. 
            // So empty children is correct. User must expand to refresh.
            if (sourceNode && sourceNode.isDirectory) {
              // If we keep children, their paths are wrong!
              // So resetting children to [] (or undefined) is safer.
              newItem.children = [];
              newItem.isLoaded = false;
              newItem.isExpanded = false;
            }

            // 3. Add Target
            if (destDir === workspaceDir) {
              return [...treeAfterRemove, newItem].sort((a, b) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
              });
            } else {
              return insertNodeIntoTree(treeAfterRemove, destDir, newItem);
            }
          });

          setClipboard(null);
        } else {
          alert(`Move failed: ${result.error}`);
        }
      } else {
        // Copy
        const result = await window.electron.fs.copy(clipboard.path, destPath);
        if (result.success) {
          // Optimistic UI: Add Target
          // We don't know type easily unless we read source.
          // Let's try to find source node in tree.
          const sourceNode = findNode(fileTree, clipboard.path);
          const newItem: FileNode = {
            name: sourceName,
            path: destPath,
            isDirectory: sourceNode ? sourceNode.isDirectory : false,
            isExpanded: false,
            isLoaded: false,
            children: (sourceNode && sourceNode.isDirectory) ? [] : undefined
          };
          // Copying folder usually requires recursive copy. `fs.copy` does simple copy or recursive?
          // Assuming recursive. But UI won't show children unless we copy tree structure. 
          // For Copy, maybe just Insert Node is enough, children will be loaded on expand.

          if (destDir === workspaceDir) {
            setFileTree(prev => [...prev, newItem].sort((a, b) => {
              if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
              return a.isDirectory ? -1 : 1;
            }));
          } else {
            setFileTree(prev => insertNodeIntoTree(prev, destDir, newItem));
          }
        } else {
          alert(`Copy failed: ${result.error}`);
        }
      }

      // Background Refresh Consistency
      setTimeout(async () => {
        if (workspaceDir) await refreshDeep(workspaceDir);
        // Ensure destination expanded
        if (destDir !== workspaceDir) {
          await toggleDirectory(destDir, true);
        }
      }, 500);

    } catch (err) {
      console.error('Paste operation failed:', err);
    }
  };

  const handleRequestRename = () => {
    if (contextMenu && contextMenu.node) {
      setRenamingPath(contextMenu.node.path);
      setRenameValue(contextMenu.node.name);
      setContextMenu(null);
    }
  };

  const handleRequestDelete = () => {
    if (contextMenu && contextMenu.node) {
      setDeleteTarget(true); // Show confirmation (modal uses selectedPaths)
      setContextMenu(null);
    }
  };

  const handlePaste = async () => {
    if (!contextMenu || !clipboard) return;
    const targetNode = contextMenu.node;
    setContextMenu(null);

    // 타겟 폴더 결정 (타겟이 디렉토리면 그 안, 아니면 같은 폴더)
    let destDir: string;
    if (targetNode) {
      destDir = targetNode.isDirectory ? targetNode.path : targetNode.path.substring(0, targetNode.path.lastIndexOf('/'));
    } else {
      destDir = workspaceDir!;
    }

    await performPaste(destDir);
  };

  const handleKeyboardPaste = async () => {
    if (!clipboard) return;

    // Target: lastSelectedPath or workspaceDir
    let destDir: string;

    if (lastSelectedPath) {
      // If selected is directory, paste inside. If file, paste in parent.
      // Use findNode to be safe
      const node = findNode(fileTree, lastSelectedPath);
      if (node) {
        destDir = node.isDirectory ? node.path : node.path.substring(0, node.path.lastIndexOf('/'));
      } else {
        // Fallback
        destDir = lastSelectedPath.substring(0, lastSelectedPath.lastIndexOf('/'));
      }
    } else {
      destDir = workspaceDir!;
    }

    await performPaste(destDir);
  };

  useEffect(() => {
    if (workspaceDir) {
      loadDirectory(workspaceDir);
    } else {
      setFileTree([]);
    }
  }, [workspaceDir]);

  // 키보드 단축키 (F2: 이름 변경, Delete: 삭제, Ctrl+C/X/V: 복사/잘라내기/붙여넣기)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 중일 때는 무시 (input, textarea)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'F2' && selectedPaths.size === 1 && !renamingPath) {
        e.preventDefault();
        const path = Array.from(selectedPaths)[0];
        setRenamingPath(path);
        setRenameValue(path.split('/').pop() || '');
      } else if (e.key === 'Escape') {
        if (renamingPath) {
          setRenamingPath(null);
          setRenameValue('');
        }
        if (deleteTarget) {
          setDeleteTarget(false);
        }
      } else if (e.key === 'Delete' && selectedPaths.size > 0 && !renamingPath && !deleteTarget) {
        e.preventDefault();
        setDeleteTarget(true); // Show confirmation
      } else if (e.key === 'Enter' && deleteTarget) {
        e.preventDefault();
        handleDeleteConfirm();
      }

      // Copy / Cut / Paste
      if ((e.metaKey || e.ctrlKey) && !renamingPath) {
        if (e.key === 'c' || e.key === 'C') {
          // Copy
          if (selectedPaths.size > 0) {
            e.preventDefault();
            // Use last selected path or all? Logic supports single file copy for now
            if (lastSelectedPath) {
              setClipboard({ path: lastSelectedPath, op: 'copy' });
            }
          }
        } else if (e.key === 'x' || e.key === 'X') {
          // Cut
          if (selectedPaths.size > 0 && lastSelectedPath) {
            e.preventDefault();
            setClipboard({ path: lastSelectedPath, op: 'cut' });
          }
        } else if (e.key === 'v' || e.key === 'V') {
          // Paste
          e.preventDefault();
          handleKeyboardPaste();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPaths, renamingPath, deleteTarget, lastSelectedPath, clipboard]);

  // 파일 삭제 처리
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || selectedPaths.size === 0) return;

    try {
      const paths = Array.from(selectedPaths);
      let successCount = 0;
      let errors = [];

      for (const path of paths) {
        const result = await window.electron.fs.delete(path);
        if (result.success) {
          successCount++;
          if (onFileDelete) {
            onFileDelete(path);
          }
        } else {
          errors.push(result.error);
        }
      }

      if (successCount > 0 && workspaceDir) {
        // Find distinct parents and refresh them
        const parents = new Set<string>();
        for (const path of paths) {
          const parent = path.substring(0, path.lastIndexOf('/'));
          if (parent) parents.add(parent);
          else parents.add(workspaceDir);
        }

        for (const parent of parents) {
          await refreshNode(parent);
        }

        setSelectedPaths(new Set()); // 선택 해제
        setLastSelectedPath(null);
        setSelectedIsDirectory(false);
      }

      if (errors.length > 0) {
        alert(`삭제 실패 (${errors.length}건): ${errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setDeleteTarget(false);
    }
  };


  // Helper: 트리 노드 수동 삽입 (Optimistic Update)
  const insertNodeIntoTree = (nodes: FileNode[], parentPath: string, newNode: FileNode): FileNode[] => {
    // If parent is root (workspaceDir matches parentPath check outside or implicit)
    // Actually, we iterate.
    const containerPath = parentPath;

    // Check if we are inserting into this level (only if nodes are root level and parent is workspaceDir?)
    // This helper is recursive.

    return nodes.map(node => {
      if (node.path === containerPath) {
        // Found parent. Insert child.
        // If children undefined, init.
        const existingChildren = node.children || [];
        // Check duplicate
        if (existingChildren.some(c => c.path === newNode.path)) return node;

        // Sort
        const newChildren = [...existingChildren, newNode].sort((a, b) => {
          if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
          return a.isDirectory ? -1 : 1;
        });

        return { ...node, children: newChildren, isExpanded: true, isLoaded: true };
      } else if (node.children) {
        return { ...node, children: insertNodeIntoTree(node.children, containerPath, newNode) };
      }
      return node;
    });
  };

  // 파일/폴더 생성
  const handleCreateItem = async () => {
    if (!isCreating.type || !isCreating.parentPath || !newItemName.trim()) return;

    // Trim and Clean
    const name = newItemName.trim();
    const fullPath = `${isCreating.parentPath}/${name}`;

    try {
      if (isCreating.type === 'file') {
        await window.electron.fs.createFile(fullPath, '');
      } else {
        await window.electron.fs.createDir(fullPath);
      }

      // Optimistic UI Update: 즉시 트리에 반영
      const newNode: FileNode = {
        name: name,
        path: fullPath,
        isDirectory: isCreating.type === 'folder',
        isExpanded: false,
        isLoaded: false,
        children: isCreating.type === 'folder' ? [] : undefined
      };

      if (isCreating.parentPath === workspaceDir) {
        // Root insertion
        setFileTree(prev => {
          if (prev.some(n => n.path === fullPath)) return prev;
          const newTree = [...prev, newNode].sort((a, b) => {
            if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
            return a.isDirectory ? -1 : 1;
          });
          return newTree;
        });
      } else {
        // Subdirectory insertion
        setFileTree(prev => insertNodeIntoTree(prev, isCreating.parentPath!, newNode));
      }

      // 생성된 파일이면 자동으로 열기
      if (isCreating.type === 'file') {
        onFileOpen(fullPath);
      }

      // Background Refresh (Consistency Check)
      setTimeout(async () => {
        // Deep Refresh to ensure Git status etc. are synced
        if (workspaceDir) await refreshDeep(workspaceDir);
      }, 500);

    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create item');
    } finally {
      setIsCreating({ type: null, parentPath: null });
      setNewItemName('');
    }
  };

  // ... (processFileList skipped) ...

  // ... (refreshDeep skipped) ...

  // UI Part Update
  <button
    className="action-btn"
    onClick={() => refreshDeep(workspaceDir!)}
    title="새로고침 (전체)"
  >
    <RotateCcwIcon size={14} />
  </button>

  // Helper: Find node by path
  const findNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper: 파일 목록 가공 (정렬 및 필터링)
  const processFileList = (files: any[]): FileNode[] => {
    const filteredFiles = files.filter((file: any) => file.name !== '.git');
    const sortedFiles = filteredFiles.sort((a: any, b: any) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });
    return sortedFiles.map((file: any) => ({
      name: file.name,
      path: file.path,
      isDirectory: file.isDirectory,
      isExpanded: false,
      isLoaded: false,
      children: file.isDirectory ? [] : undefined,
    }));
  };

  // Helper: Deep refresh preserving expansion state
  // Finds all expanded directories in the current tree, re-reads them, and rebuilds the tree.
  const refreshDeep = async (rootPath: string) => {
    if (!window.electron?.fs?.readDir) return;

    // 1. Collect all expanded paths from current tree
    const expandedPaths = new Set<string>();

    const collectExpanded = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.isDirectory && node.isExpanded) {
          expandedPaths.add(node.path);
          if (node.children) {
            collectExpanded(node.children);
          }
        }
      }
    };
    collectExpanded(fileTree);

    // 2. Recursive build function that fetches fresh data
    const buildTree = async (currentPath: string): Promise<FileNode[]> => {
      try {
        const result = await window.electron.fs.readDir(currentPath);
        if (!result.success || !result.files) return [];

        const processedNodes = processFileList(result.files);

        // For each directory node, if it was expanded, recursively load children
        const promisedNodes = await Promise.all(processedNodes.map(async (node) => {
          if (node.isDirectory && expandedPaths.has(node.path)) {
            const children = await buildTree(node.path);
            return {
              ...node,
              isExpanded: true,
              isLoaded: true,
              children: children
            };
          }
          return node;
        }));

        return promisedNodes;
      } catch (err) {
        console.error(`Error refreshing ${currentPath}:`, err);
        return [];
      }
    };

    console.log('Starting Deep Refresh from:', rootPath, 'Expanded:', Array.from(expandedPaths));

    // 3. Rebuild from root
    const newTree = await buildTree(rootPath);
    setFileTree(newTree);
  };


  // 특정 노드 새로고침 (확장 상태 유지)
  const refreshNode = async (path: string) => {
    if (!window.electron?.fs?.readDir) return;

    // Normalize paths by removing trailing slashes for comparison
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const normalizedWorkspace = workspaceDir && (workspaceDir.endsWith('/') && workspaceDir.length > 1 ? workspaceDir.slice(0, -1) : workspaceDir);

    console.log(`Refreshing node: ${path} (Normalized: ${normalizedPath}, Workspace: ${normalizedWorkspace})`);

    try {
      const result = await window.electron.fs.readDir(path);
      if (!result.success || !result.files) return;

      const newNodes = processFileList(result.files);

      setFileTree(prevTree => {
        // Root update
        if (normalizedPath === normalizedWorkspace) {
          console.log('Refreshing ROOT');
          return newNodes.map(newNode => {
            const oldNode = prevTree.find(n => n.path === newNode.path);
            if (oldNode && oldNode.isDirectory) {
              // Preserve state
              return {
                ...newNode,
                isExpanded: oldNode.isExpanded,
                isLoaded: oldNode.isLoaded,
                children: oldNode.children
              };
            }
            return newNode;
          });
        }

        // Helper to recursively update children
        const updateChildren = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            // Check against normalized path just in case, though node.path usually is clean
            if (node.path === path || (node.path.endsWith('/') ? node.path.slice(0, -1) : node.path) === normalizedPath) {
              console.log(`Found node to refresh: ${node.path}`);
              const mergedChildren = newNodes.map(newNode => {
                const oldChild = node.children?.find(c => c.path === newNode.path);
                if (oldChild && oldChild.isDirectory) {
                  return {
                    ...newNode,
                    isExpanded: oldChild.isExpanded,
                    isLoaded: oldChild.isLoaded,
                    children: oldChild.children
                  };
                }
                return newNode;
              });

              return { ...node, children: mergedChildren, isLoaded: true };
            } else if (node.children) {
              return { ...node, children: updateChildren(node.children) };
            }
            return node;
          });
        };

        return updateChildren(prevTree);
      });
    } catch (error) {
      console.error(`Failed to refresh node ${path}:`, error);
    }
  };

  // 디렉토리 로드 (실제 파일 시스템)
  const loadDirectory = async (dirPath: string) => {
    if (!window.electron?.fs?.readDir) {
      console.error('Electron fs API not available');
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electron.fs.readDir(dirPath);

      if (result.success && result.files) {
        setFileTree(processFileList(result.files));
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 디렉토리 하위 항목 로드
  const loadSubDirectory = async (node: FileNode) => {
    if (!window.electron?.fs?.readDir || !node.isDirectory) return;

    try {
      const result = await window.electron.fs.readDir(node.path);

      if (result.success && result.files) {
        // .git 디렉토리 제외 및 정렬
        const filteredFiles = result.files.filter((file: any) => file.name !== '.git');

        const sortedFiles = filteredFiles.sort((a: any, b: any) => {
          if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
          }
          return a.isDirectory ? -1 : 1;
        });

        const children: FileNode[] = sortedFiles.map((file: any) => ({
          name: file.name,
          path: file.path,
          isDirectory: file.isDirectory,
          isExpanded: false,
          isLoaded: false,
          children: file.isDirectory ? [] : undefined,
        }));

        return children;
      }
    } catch (error) {
      console.error('Failed to load subdirectory:', error);
    }
    return [];
  };

  // 디렉토리 토글
  const toggleDirectory = async (path: string, forceState?: boolean) => {
    const updateTree = async (nodes: FileNode[]): Promise<FileNode[]> => {
      const updated = [];

      for (const node of nodes) {
        if (node.path === path && node.isDirectory) {
          // 디렉토리를 펼칠 때, 아직 로드하지 않았으면 로드
          if (!node.isExpanded && !node.isLoaded) {
            const children = await loadSubDirectory(node);
            updated.push({
              ...node,
              isExpanded: true,
              isLoaded: true,
              children,
            });
          } else {
            // 이미 로드했으면 토글만 (forceState가 있으면 그 값으로, 없으면 반전)
            const nextExpanded = forceState !== undefined ? forceState : !node.isExpanded;
            // 만약 강제로 닫으려는데 이미 닫혀있거나, 열려는데 이미 열려있으면 그대로
            if (node.isExpanded === nextExpanded) {
              updated.push(node);
            } else {
              updated.push({ ...node, isExpanded: nextExpanded });
            }
          }
        } else if (node.children) {
          // 재귀적으로 자식 노드 업데이트
          const updatedChildren = await updateTree(node.children);
          updated.push({ ...node, children: updatedChildren });
        } else {
          updated.push(node);
        }
      }

      return updated;
    };

    const updatedTree = await updateTree(fileTree);
    setFileTree(updatedTree);
  };

  // 파일 클릭
  const handleFileClick = async (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent clearing selection if we click creating actions

    let newSelection = new Set(selectedPaths);

    if (e.metaKey || e.ctrlKey) {
      // Toggle selection
      if (newSelection.has(node.path)) {
        newSelection.delete(node.path);
      } else {
        newSelection.add(node.path);
      }
      setLastSelectedPath(node.path);
    } else if (e.shiftKey && lastSelectedPath) {
      // Simple range selection (naive implementation, just selects between two if possible, 
      // but finding range in tree is hard without linear list. 
      // For now, Shift behaves like Ctrl or just adds? 
      // Plan said "Implement Multi-selection (Ctrl/Cmd + Click)". 
      // Let's stick to simple adding or just single select for Shift if not implementing range lookup.
      // Actually, users expect Shift to range select. Creating linear list from tree is expensive on every click.
      // Let's treat Shift same as Ctrl for now or just single select extended.
      // Fallback: Just single select for now to avoid complexity, or add to selection.
      newSelection.add(node.path);
      setLastSelectedPath(node.path);
    } else {
      // Single selection
      newSelection = new Set([node.path]);
      setLastSelectedPath(node.path);
    }

    setSelectedPaths(newSelection);
    setSelectedIsDirectory(node.isDirectory);

    if (node.isDirectory) {
      // Only toggle directory if it's a single click (no modifiers) or explicit toggle intent?
      // VS Code toggles folder on click regardless of selection state mostly, but usually separate icon.
      // Here clicking name toggles.
      // If multi-selecting, maybe don't toggle expansion to avoid jumping?
      // Let's toggle only if single selection to be safe.
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
        await toggleDirectory(node.path);
      }
    } else {
      // Open file only on single click without modifiers? or always?
      // Usually only single selection opens file.
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
        onFileOpen(node.path);
      }
    }
  };

  // 이름 변경 완료
  const handleRenameComplete = async () => {
    if (!renamingPath || !renameValue.trim()) {
      setRenamingPath(null);
      return;
    }

    const oldPath = renamingPath;
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = `${parentPath}/${renameValue.trim()}`;

    if (oldPath === newPath) {
      setRenamingPath(null);
      return;
    }

    try {
      const result = await window.electron.fs.rename(oldPath, newPath);
      if (result.success) {
        // 디렉토리 새로고침 (부모)
        await refreshNode(parentPath);

        setSelectedPaths(new Set([newPath]));
        setLastSelectedPath(newPath);
      } else {
        alert(`이름 변경 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to rename:', error);
    } finally {
      setRenamingPath(null);
      setRenameValue('');
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.stopPropagation();
    setDragSourcePath(path);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', path);
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow dropping on directories
    if (!node.isDirectory) return;

    // Prevent dropping into itself or children
    if (dragSourcePath && (node.path === dragSourcePath || node.path.startsWith(dragSourcePath + '/'))) {
      return;
    }

    setDropTargetPath(node.path);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetPath(null);

    const sourcePath = dragSourcePath;
    if (!sourcePath || !targetNode.isDirectory) return;

    // Double check validity
    if (sourcePath === targetNode.path || targetNode.path.startsWith(sourcePath + '/')) return;

    const fileName = sourcePath.split('/').pop();
    const newPath = `${targetNode.path}/${fileName}`;

    if (sourcePath === newPath) return; // Same location

    try {
      const result = await window.electron.fs.rename(sourcePath, newPath);
      if (result.success) {
        // 디렉토리 새로고침
        await loadDirectory(workspaceDir!);
        setSelectedPaths(new Set([newPath]));
        setLastSelectedPath(newPath);
      } else {
        alert(`이동 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to move item:', error);
    } finally {
      setDragSourcePath(null);
    }
  };

  // 파일 트리 렌더링
  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`file-item ${selectedPaths.has(node.path) ? 'selected' : ''} ${dropTargetPath === node.path ? 'drop-target' : ''}`}
          style={{
            paddingLeft: `${depth * 12 + 8}px`,
            opacity: (dragSourcePath === node.path || (clipboard?.op === 'cut' && clipboard.path === node.path)) ? 0.5 : 1
          }}
          onClick={(e) => handleFileClick(node, e)}
          draggable
          onDragStart={(e) => handleDragStart(e, node.path)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={(e) => {
            e.preventDefault();
            if (dropTargetPath === node.path) setDropTargetPath(null);
          }}
          onDrop={(e) => handleDrop(e, node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          <span className="file-icon">
            {node.isDirectory ? ((node.isExpanded || dropTargetPath === node.path) ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />) : getIconForFile(node.name, 16)}
          </span>
          {renamingPath === node.path ? (
            <input
              type="text"
              className="file-rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameComplete}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameComplete();
                } else if (e.key === 'Escape') {
                  setRenamingPath(null);
                  setRenameValue('');
                }
              }}
              autoFocus
            />
          ) : (
            <span className="file-name">{node.name}</span>
          )}
        </div>
        {node.isDirectory && node.isExpanded && node.children && (
          <div className="file-children">
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-explorer">


      <div className="explorer-content">
        {!workspaceDir ? (
          <div className="empty-workspace">
            <p>열린 폴더가 없습니다</p>
          </div>
        ) : isLoading ? (
          <div className="loading-state">
            <p>로딩 중...</p>
          </div>
        ) : (
          <>
            <div className={`file-tree-header ${selectedPaths.size === 0 && !contextMenu ? 'root-selected' : ''}`}>
              <div className="workspace-name" style={{ color: selectedPaths.size === 0 && !contextMenu ? 'var(--accent-blue)' : 'inherit' }}>
                {workspaceDir.split('/').pop()}
              </div>
              <div className="file-actions">
                <button
                  className="action-btn"
                  onClick={() => {
                    let parentPath = workspaceDir;
                    if (lastSelectedPath) {
                      const node = findNode(fileTree, lastSelectedPath);
                      if (node) {
                        parentPath = node.isDirectory ? node.path : node.path.substring(0, node.path.lastIndexOf('/'));
                      } else {
                        // Fallback if node not found but path exists (unlikely in tree)
                        parentPath = lastSelectedPath.substring(0, lastSelectedPath.lastIndexOf('/'));
                      }
                    }
                    setIsCreating({ type: 'file', parentPath });
                    setNewItemName('');
                  }}
                  title="새 파일"
                >
                  <FilePlusIcon size={16} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => {
                    let parentPath = workspaceDir;
                    if (lastSelectedPath) {
                      const node = findNode(fileTree, lastSelectedPath);
                      if (node) {
                        parentPath = node.isDirectory ? node.path : node.path.substring(0, node.path.lastIndexOf('/'));
                      } else {
                        parentPath = lastSelectedPath.substring(0, lastSelectedPath.lastIndexOf('/'));
                      }
                    }
                    setIsCreating({ type: 'folder', parentPath });
                    setNewItemName('');
                  }}
                  title="새 폴더"
                >
                  <FolderPlusIcon size={16} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => refreshNode(workspaceDir!)}
                  title="새로고침"
                >
                  <RotateCcwIcon size={14} />
                </button>
                {onCloseProject && (
                  <button
                    className="action-btn"
                    onClick={onCloseProject}
                    title="프로젝트 닫기"
                    style={{ marginLeft: '4px' }}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            </div>

            {isCreating.type && (
              <div className="new-item-input">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newItemName.trim()) {
                      await handleCreateItem();
                    } else if (e.key === 'Escape') {
                      setIsCreating({ type: null, parentPath: null });
                      setNewItemName('');
                    }
                  }}
                  placeholder={isCreating.type === 'file' ? '새 파일 이름...' : '새 폴더 이름...'}
                  autoFocus
                />
              </div>
            )}

            <div
              className="file-tree"
              onContextMenu={handleBackgroundContextMenu}
              onClick={(e) => {
                // 배경 클릭 시 선택 해제 -> 결과적으로 Root 선택 효과
                // 자식 요소(파일 아이템)에서 stopPropagation()을 하므로 여기 도달하면 배경임이 보장됨(거의)
                setSelectedPaths(new Set());
                setLastSelectedPath(null);
              }}
              style={{ minHeight: '100%' }} // Ensure full height for background click
            >
              {renderFileTree(fileTree)}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>삭제 확인</h3>
            <p>정말로 선택한 {selectedPaths.size}개의 항목을 삭제하시겠습니까?</p>
            <div className="modal-target-list" style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Array.from(selectedPaths).map(path => (
                <p key={path} className="modal-target-path" style={{ margin: 0 }}>{path.split('/').pop()}</p>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setDeleteTarget(false)} className="modal-btn cancel">취소</button>
              <button onClick={handleDeleteConfirm} className="modal-btn delete">삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            backgroundColor: '#252526',
            border: '1px solid #454545',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            borderRadius: '4px',
            padding: '4px 0',
            minWidth: '160px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.node && (
            <>
              <div className="context-menu-item" onClick={() => {
                const parentPath = contextMenu.node!.isDirectory ? contextMenu.node!.path : contextMenu.node!.path.substring(0, contextMenu.node!.path.lastIndexOf('/'));
                setIsCreating({ type: 'file', parentPath });
                setNewItemName('');
                setContextMenu(null);
                // Expand if directory
                if (contextMenu.node!.isDirectory) toggleDirectory(contextMenu.node!.path, true);
              }} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: '#cccccc' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#094771'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                New File
              </div>
              <div className="context-menu-item" onClick={() => {
                const parentPath = contextMenu.node!.isDirectory ? contextMenu.node!.path : contextMenu.node!.path.substring(0, contextMenu.node!.path.lastIndexOf('/'));
                setIsCreating({ type: 'folder', parentPath });
                setNewItemName('');
                setContextMenu(null);
                // Expand if directory
                if (contextMenu.node!.isDirectory) toggleDirectory(contextMenu.node!.path, true);
              }} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: '#cccccc' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#094771'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                New Folder
              </div>
              <div style={{ height: '1px', backgroundColor: '#454545', margin: '4px 0' }}></div>
              <div className="context-menu-item" onClick={handleCopy} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: '#cccccc' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#094771'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Copy
              </div>
              <div className="context-menu-item" onClick={handleCut} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: '#cccccc' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#094771'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Cut
              </div>
            </>
          )}

          <div className="context-menu-item" onClick={handlePaste} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: clipboard ? '#cccccc' : '#666', pointerEvents: clipboard ? 'auto' : 'none' }} onMouseEnter={(e) => clipboard && (e.currentTarget.style.backgroundColor = '#094771')} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            Paste
          </div>

          {contextMenu.node && (
            <>
              <div style={{ height: '1px', backgroundColor: '#454545', margin: '4px 0' }}></div>
              <div className="context-menu-item" onClick={handleRequestRename} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: '#cccccc' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#094771'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Rename (F2)
              </div>
              <div className="context-menu-item" onClick={handleRequestDelete} style={{ padding: '6px 16px', cursor: 'pointer', fontSize: '13px', color: '#cccccc' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#094771'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Delete
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FileExplorer;
