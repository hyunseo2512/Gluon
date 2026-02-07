import { useState, useEffect, useRef } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import '../styles/CodeEditor.css';
import { getIconForFile, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import MarkdownPreview from './MarkdownPreview';
import { gluonQuantumTheme } from '../themes/gluonQuantum';
import { gluonCarbonTheme } from '../themes/gluonCarbon';
import { gluonMarkdownTheme } from '../themes/gluonMarkdown';
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es';

// Initialize Monaco Globally (Theme & Compiler Options)
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

loader.init().then((monaco) => {
  // Initialize Emmet for HTML, CSS, JSX
  emmetHTML(monaco);
  emmetCSS(monaco);
  emmetJSX(monaco);
  // Compiler Options
  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    useDefineForClassFields: true,
    lib: ['es2020', 'dom', 'dom.iterable'],
    module: monaco.languages.typescript.ModuleKind.ESNext,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    jsxFragmentFactory: 'React.Fragment',
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);

  // Define Theme Globally
  // 1. Gluon Quantum (Python/SF Style)
  monaco.editor.defineTheme('gluon-quantum', gluonQuantumTheme);

  // 2. Gluon Carbon (C/C++ Style)
  monaco.editor.defineTheme('gluon-carbon', gluonCarbonTheme);

  // 3. Gluon Markdown (Markdown Specific)
  monaco.editor.defineTheme('gluon-markdown', gluonMarkdownTheme);

  // 4. Gluon Classic (VS Dark + Gluon Background)
  monaco.editor.defineTheme('gluon-classic', {
    base: 'vs-dark',
    inherit: true,
    rules: [], // Inherit standard VS Dark highlighting
    colors: gluonQuantumTheme.colors // Use same Deep Space background
  });
});


interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
  // Diff Mode optional props
  isDiff?: boolean;
  originalContent?: string;
  modifiedContent?: string;
}

// Prettier Imports (Dynamic import to avoid bundling issues if possible, but static for now)
import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserHtml from 'prettier/plugins/html';
import * as parserCss from 'prettier/plugins/postcss';
import * as parserTs from 'prettier/plugins/typescript';

interface CodeEditorProps {
  openFiles: OpenFile[];
  activeFileIndex: number;
  onFileSelect: (index: number) => void;
  onContentChange: (content: string) => void;
  onCloseTab: (index: number) => void;
  onCloseOthers?: (index: number) => void;
  onCloseToRight?: (index: number) => void;
  onCloseAll?: () => void;
  onSave: (index?: number) => void;
  onReorderTabs?: (fromIndex: number, toIndex: number) => void;
  onDiagnosticsChange?: (errors: number, warnings: number, markers: any[]) => void;
  settings?: any;
  workspaceDir?: string;
}

// 바이너리 파일 확장자 목록
const BINARY_EXTENSIONS = new Set([
  'pyc', 'pyd', 'pyo', 'class', 'jar', 'war', 'ear',
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'o', 'a',
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'tiff', 'tif',
  'mp3', 'mp4', 'avi', 'mov', 'mkv', 'wav', 'flac', 'ogg', 'webm',
  'zip', 'gz', 'tar', 'bz2', 'xz', '7z', 'rar',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'sqlite', 'db', 'mdb',
  'wasm',
]);

const isBinaryFile = (filePath: string, content?: string): boolean => {
  // 1. 확장자 기반 체크
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext && BINARY_EXTENSIONS.has(ext)) return true;
  // 2. 내용 기반 체크: null 바이트 또는 제어 문자 포함 여부 (첫 8KB)
  if (content) {
    const sample = content.slice(0, 8192);
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      if (code === 0) return true; // null byte
      // 탭(9), 줄바꿈(10), 캐리지리턴(13) 제외한 제어 문자
      if (code < 8 || (code > 13 && code < 32 && code !== 27)) return true;
    }
  }
  return false;
};

/**
 * 코드 에디터 컴포넌트 (Monaco Editor) - 여러 파일 탭 지원
 */
function CodeEditor({
  openFiles,
  activeFileIndex,
  onFileSelect,
  onContentChange,
  onCloseTab,
  onCloseOthers,
  onCloseToRight,
  onCloseAll,
  onSave,
  onReorderTabs,
  onDiagnosticsChange,
  settings,
  workspaceDir
}: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [forceOpenBinary, setForceOpenBinary] = useState<Set<string>>(new Set());
  const [markdownPreview, setMarkdownPreview] = useState(false);

  const activeFile = activeFileIndex >= 0 ? openFiles[activeFileIndex] : null;
  const isBinary = activeFile ? isBinaryFile(activeFile.path, activeFile.content) && !forceOpenBinary.has(activeFile.path) : false;
  const isMarkdown = language === 'markdown';
  const [fileErrors, setFileErrors] = useState<{ [path: string]: number }>({});
  const monaco = useMonaco();

  // Markdown Preview Toggle via custom event
  useEffect(() => {
    const handleToggle = () => setMarkdownPreview(prev => !prev);
    window.addEventListener('markdown-preview-toggle', handleToggle);
    return () => window.removeEventListener('markdown-preview-toggle', handleToggle);
  }, []);

  // Listen to Monaco Markers (Errors)
  useEffect(() => {
    if (!monaco) return;

    const updateMarkers = () => {
      const allMarkers = monaco.editor.getModelMarkers({});
      const newErrors: { [path: string]: number } = {};
      let totalErrors = 0;
      let totalWarnings = 0;

      allMarkers.forEach(marker => {
        const path = marker.resource.path;

        if (marker.severity === monaco.MarkerSeverity.Error) {
          newErrors[path] = (newErrors[path] || 0) + 1;
          totalErrors++;
        } else if (marker.severity === monaco.MarkerSeverity.Warning) {
          totalWarnings++;
        }
      });

      setFileErrors(newErrors);
      if (onDiagnosticsChange) {
        onDiagnosticsChange(totalErrors, totalWarnings, allMarkers);
      }
    };

    const disposable = monaco.editor.onDidChangeMarkers(() => {
      updateMarkers();
    });

    // Check periodically or on mount effectively
    // Monaco markers might take time to compute.
    const interval = setInterval(updateMarkers, 1000); // Polling as fallback/supplement

    return () => {
      disposable.dispose();
      clearInterval(interval);
    };
  }, [monaco, onDiagnosticsChange]);

  // 파일 확장자로 언어 감지
  useEffect(() => {
    if (!activeFile) return;

    const ext = activeFile.path.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      h: 'cpp',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      sh: 'shell',
      bash: 'shell',
    };

    setLanguage(langMap[ext || ''] || 'plaintext');
  }, [activeFile?.path]);

  // Syntax Check (Python/C/C++ Linter)
  useEffect(() => {
    if (!monaco || !activeFile) return;

    // 지원되는 언어만 린터 호출
    const supportedLanguages = ['python', 'c', 'cpp'];
    if (!supportedLanguages.includes(language)) return;

    const checkSyntax = async () => {
      try {
        const issues = await window.electron.linter.check(activeFile.path);

        // Map to Monaco markers
        const markers = issues.map((issue: any) => ({
          startLineNumber: issue.line,
          startColumn: issue.column === 0 ? 1 : issue.column,
          endLineNumber: issue.line,
          endColumn: 1000, // Highlight whole line
          message: `${issue.message} (${issue.messageId})`,
          severity: issue.type === 'error' || issue.type === 'fatal'
            ? monaco.MarkerSeverity.Error
            : issue.type === 'warning'
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Info,
          source: language === 'python' ? 'ruff' : 'gcc'
        }));

        // Find the correct model
        const model = monaco.editor.getModels().find(m => m.uri.path === activeFile.path || m.uri.fsPath === activeFile.path) || monaco.editor.getModels()[0];
        if (model) {
          const source = language === 'python' ? 'ruff' : 'gcc';
          monaco.editor.setModelMarkers(model, source, markers);
        } else {
          console.warn('Monaco model not found for:', activeFile.path);
        }
      } catch (e) {
        console.error('Lint check failed:', e);
      }
    };

    const timer = setTimeout(checkSyntax, 1000); // Debounce 1s
    return () => clearTimeout(timer);
  }, [activeFile?.content, activeFile?.path, activeFile?.isDirty, language, monaco]);

  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Ctrl+S로 저장 (Format On Save 지원) + ESC로 에디터 포커스
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();

        // Format On Save
        if (settings?.formatOnSave && editorInstance) {
          try {
            // 트리거 포맷팅 액션
            await editorInstance.getAction('editor.action.formatDocument').run();
          } catch (err) {
            console.error('Format failed:', err);
          }
        }

        // 잠시 대기 후 저장 (포맷팅 반영 위해)
        setTimeout(() => {
          onSave();
        }, 50);
      }

      // ESC → 에디터 포커스
      if (e.key === 'Escape' && editorInstance) {
        editorInstance.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, settings, editorInstance]);

  // Undo/Redo Event Listeners (from App Menu)
  useEffect(() => {
    if (!editorInstance) return;

    const handleUndo = () => {
      editorInstance.trigger('source', 'undo', null);
      editorInstance.focus();
    };

    const handleRedo = () => {
      editorInstance.trigger('source', 'redo', null);
      editorInstance.focus();
    };

    window.addEventListener('gluon:undo', handleUndo);
    window.addEventListener('gluon:redo', handleRedo);

    return () => {
      window.removeEventListener('gluon:undo', handleUndo);
      window.removeEventListener('gluon:redo', handleRedo);
    };
  }, [editorInstance]);

  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (tabsRef.current && activeFileIndex >= 0) {
      const tabElements = tabsRef.current.children;
      if (tabElements[activeFileIndex]) {
        tabElements[activeFileIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeFileIndex, openFiles]);

  const handleTabNav = (direction: 'prev' | 'next') => {
    if (openFiles.length <= 1) return;

    let newIndex = activeFileIndex;
    if (direction === 'prev') {
      newIndex = activeFileIndex > 0 ? activeFileIndex - 1 : activeFileIndex;
    } else {
      newIndex = activeFileIndex < openFiles.length - 1 ? activeFileIndex + 1 : activeFileIndex;
    }

    if (newIndex !== activeFileIndex) {
      onFileSelect(newIndex);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    onContentChange(value || '');
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const handleTabClose = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onCloseTab(index);
  };

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  return (
    <div className="code-editor">
      {/* 에디터 탭들 - 파일이 있을 때만 표시 */}
      {openFiles.length > 0 && (
        <div className="editor-tabs-wrapper" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', minHeight: '35px' }}>
          <div className="editor-tabs" ref={tabsRef} style={{ flex: 1, borderBottom: 'none', scrollbarWidth: 'none' }}>
            {openFiles.map((file, index) => (
              <div
                key={file.path}
                className={`editor-tab ${index === activeFileIndex ? 'active' : ''} ${file.isDiff ? 'diff-tab' : ''} ${index === dragOverIndex ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('tabIndex', index.toString());
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIndex !== index) {
                    setDragOverIndex(index);
                  }
                }}
                onDragLeave={() => { }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverIndex(null);
                  const fromIndex = parseInt(e.dataTransfer.getData('tabIndex'), 10);
                  if (!isNaN(fromIndex) && onReorderTabs) {
                    onReorderTabs(fromIndex, index);
                  }
                }}
                onClick={() => onFileSelect(index)}
                onContextMenu={(e) => handleContextMenu(e, index)}
              >
                <span className="tab-icon">{getIconForFile(file.path, 14)}</span>
                <span className="tab-name">
                  {getFileName(file.path)}
                  {file.isDiff && ' (Diff)'}
                  {file.isDirty && <span className="tab-dirty">●</span>}
                  {fileErrors[file.path] > 0 && (
                    <span className="tab-error-badge" title={`${fileErrors[file.path]} Errors`}>
                      {fileErrors[file.path]}
                    </span>
                  )}
                </span>
                <button
                  className="tab-close"
                  onClick={(e) => handleTabClose(e, index)}
                  title="닫기"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Scroll Buttons - Always Visible */}
          <div className="tab-scroll-controls">
            <button
              className="tab-nav-btn"
              onClick={() => handleTabNav('prev')}
              title="Previous Tab"
              disabled={activeFileIndex <= 0}
              style={{ opacity: activeFileIndex <= 0 ? 0.3 : 1, cursor: activeFileIndex <= 0 ? 'default' : 'pointer' }}
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              className="tab-nav-btn"
              onClick={() => handleTabNav('next')}
              title="Next Tab"
              disabled={activeFileIndex >= openFiles.length - 1}
              style={{ opacity: activeFileIndex >= openFiles.length - 1 ? 0.3 : 1, cursor: activeFileIndex >= openFiles.length - 1 ? 'default' : 'pointer' }}
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              onCloseTab(contextMenu.index);
              setContextMenu(null);
            }}
          >
            Close
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              onCloseOthers?.(contextMenu.index);
              setContextMenu(null);
            }}
          >
            Close Others
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              onCloseToRight?.(contextMenu.index);
              setContextMenu(null);
            }}
          >
            Close to the Right
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              onCloseAll?.();
              setContextMenu(null);
            }}
          >
            Close All
          </div>
          <div className="context-menu-separator"></div>
          <div
            className="context-menu-item"
            onClick={() => {
              onSave(contextMenu.index);
              setContextMenu(null);
            }}
          >
            Save
          </div>
        </div>
      )}

      {/* Monaco Editor or Diff Editor */}
      {activeFile ? (
        <div className="editor-container">
          {/* File Path Breadcrumb */}
          {workspaceDir && activeFile.path && (() => {
            const relativePath = activeFile.path.startsWith(workspaceDir)
              ? activeFile.path.slice(workspaceDir.length + 1)
              : activeFile.path;
            const segments = relativePath.split('/');
            const fileName = segments.pop() || '';
            const FileIcon = getIconForFile(fileName);

            return (
              <div className="file-breadcrumb">
                {segments.length > 0 && (
                  <span>{segments.join(' > ')} &gt; </span>
                )}
                {FileIcon}
                <span style={{ marginLeft: 4 }}>{fileName}</span>
              </div>
            );
          })()}
          {isBinary ? (
            <div className="binary-file-warning">
              <div className="binary-warning-card">
                <div className="binary-warning-icon">
                  {getIconForFile(activeFile!.path, 48)}
                </div>
                <div className="binary-warning-ext">
                  .{activeFile!.path.split('.').pop()?.toUpperCase()}
                </div>
                <p className="binary-file-message">
                  This file is binary or uses an unsupported encoding.<br />
                  Opening it may display unreadable content.
                </p>
                <button
                  className="binary-open-anyway"
                  onClick={() => {
                    setForceOpenBinary(prev => new Set(prev).add(activeFile!.path));
                  }}
                >
                  Open Anyway
                </button>
              </div>
            </div>
          ) : activeFile.isDiff ? (
            <DiffEditor
              height="100%"
              language={language}
              original={activeFile.originalContent}
              modified={activeFile.modifiedContent}
              theme={language === 'markdown' ? 'gluon-markdown' : language === 'python' ? 'gluon-quantum' : (language === 'c' || language === 'cpp') ? 'gluon-carbon' : 'gluon-classic'}
              options={{
                renderSideBySide: true,
                fontSize: settings?.fontSize ?? 14,
                fontFamily: "'Fira Code', 'Consolas', monospace",
                minimap: { enabled: settings?.minimap ?? false },
                fixedOverflowWidgets: true,
                scrollBeyondLastLine: false,
                renderOverviewRuler: false,
                overviewRulerBorder: false,
                readOnly: true,
                automaticLayout: true,
                mouseWheelZoom: true
              }}
            />
          ) : (isMarkdown && markdownPreview) ? (
            <MarkdownPreview
              content={activeFile.content}
              fileName={activeFile.path.split('/').pop()}
            />
          ) : (
            <Editor
              height="100%"
              path={activeFile.path}
              language={language}
              onMount={(editor) => {
                setEditorInstance(editor);
                if (monaco) {
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
                    () => editor.trigger('source', 'editor.action.copyLinesUpAction', null)
                  );
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
                    () => editor.trigger('source', 'editor.action.copyLinesDownAction', null)
                  );
                }
              }}
              value={activeFile.content}
              onChange={handleEditorChange}
              theme={language === 'markdown' ? 'gluon-markdown' : language === 'python' ? 'gluon-quantum' : (language === 'c' || language === 'cpp') ? 'gluon-carbon' : 'gluon-classic'}
              beforeMount={(monaco) => {
                const configurePrettier = (lang: string, parser: string, plugins: any[]) => {
                  monaco.languages.registerDocumentFormattingEditProvider(lang, {
                    async provideDocumentFormattingEdits(model, _options, _token) {
                      const text = model.getValue();
                      try {
                        const formatted = await prettier.format(text, {
                          parser,
                          plugins,
                          singleQuote: true,
                          tabWidth: 2,
                        });
                        return [
                          {
                            range: model.getFullModelRange(),
                            text: formatted,
                          },
                        ];
                      } catch (err) {
                        console.error('Prettier format error:', err);
                        return [];
                      }
                    },
                  });
                };

                configurePrettier('javascript', 'babel', [parserBabel, parserEstree]);
                configurePrettier('typescript', 'typescript', [parserTs, parserEstree]);
                configurePrettier('html', 'html', [parserHtml]);
                configurePrettier('css', 'css', [parserCss]);
                configurePrettier('json', 'json', [parserBabel, parserEstree]);
              }}
              options={{
                fontSize: settings?.fontSize ?? 14,
                fontFamily: settings?.fontFamily ?? "'Fira Code', 'Consolas', monospace",
                fontLigatures: settings?.fontLigatures ?? true,
                minimap: { enabled: settings?.minimap ?? false },
                lineNumbers: settings?.lineNumbers ? 'on' : 'off',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: settings?.tabSize ?? 2,
                insertSpaces: settings?.insertSpaces ?? true,
                wordWrap: settings?.wordWrap ? 'on' : 'off',
                mouseWheelZoom: true,
              }}
            />
          )}
        </div>
      ) : (
        <div className="editor-empty-state">
          {/* Logo */}
          <div className="empty-logo">
            <span className="logo-text">Gluon</span>
            <span className="logo-edition">Pro Edition</span>
          </div>

          {/* Shortcut */}
          <div className="empty-shortcuts" style={{ pointerEvents: 'none' }}>
            <div className="shortcut-item">
              <span className="shortcut-label">Code with Agent</span>
              <span className="shortcut-key">Ctrl + L</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CodeEditor;
