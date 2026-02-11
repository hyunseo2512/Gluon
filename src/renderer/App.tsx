import { useState, useEffect, useRef } from 'react';
import { KeyBinding, DEFAULT_SHORTCUTS } from './types/shortcuts';
import { OpenFile } from './types/file';
import Sidebar from './components/Sidebar';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import TerminalPanel from './components/TerminalPanel';
import AIPanel from './components/AIPanel';
import SettingsPanel from './components/SettingsPanel';

import GitPanel from './components/GitPanel';
import SearchPanel from './components/SearchPanel';
import DebugPanel from './components/DebugPanel';
import Resizer from './components/Resizer';
import {
  SearchIcon, GitIcon, SettingsIcon, ZoomInIcon, PlusIcon, MinusIcon, ActivityIcon,
  SidebarLeftIcon, LayoutBottomIcon, SidebarRightIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GithubIcon,
  ErrorIcon,
  WarningIcon,
  BugIcon,
  PlayIcon,
  HomeIcon,
  UpdateIcon
} from './components/Icons';
import gluonLogo from '/icons/gluon-512.svg';
import './styles/App.css';
import SSHConnectionModal from './components/SSHConnectionModal';
import WelcomeScreen from './components/WelcomeScreen';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import InAppFileBrowser, { FileBrowserMode } from './components/InAppFileBrowser';

/**
 * Gluon 메인 애플리케이션 컴포넌트 - VS Code 스타일 레이아웃
 */
// OpenFile interface moved to types/file.ts

// LoginModal import removed

// 인증 상태 컴포넌트
const AuthStatus = () => {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Zustand store 구독
    import('./store/authStore').then(({ useAuthStore }) => {
      // 초기값 설정
      setUser(useAuthStore.getState().user);

      // 상태 변경 구독
      const unsubscribe = useAuthStore.subscribe((state) => {
        console.log('👤 User state updated:', state.user);
        setUser(state.user);
      });
      return () => unsubscribe();
    });
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={async () => {
          const { useAuthStore } = await import('./store/authStore');
          useAuthStore.getState().openLoginModal();
        }}
        className="header-icon-button"
        style={{
          background: 'none',
          border: 'none',
          color: '#cccccc',
          cursor: 'pointer',
          padding: '0',
          height: '32px',
          boxSizing: 'border-box',
          gap: '4px',
          paddingLeft: '4px',
          paddingRight: '0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#3c3c3c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 0
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div style={{ opacity: 0.5, display: 'flex', alignItems: 'center', paddingTop: '2px' }}>
          <ChevronDownIcon size={18} />
        </div>
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          cursor: 'pointer',
          height: '32px',
          boxSizing: 'border-box',
          gap: '4px', // 아이콘과 꺽쇠 사이 간격 증가
          paddingLeft: '4px',
          paddingRight: '0px' // 오른쪽 패딩 제거
        }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          // 역할 기반 색상 (네온 글로우)
          background: user.role === 'root' ? 'linear-gradient(135deg, #b957ce, #57b9ce)' : // Root -> 네온 퍼플 + 블루 그라데이션
            user.role === 'subscriber' ? '#2980b9' :
              '#8e44ad', // 사용자 -> 보라색
          boxShadow: user.role === 'root' ? '0 0 8px #b957ce' :
            user.role === 'subscriber' ? '0 0 6px #2980b9' :
              '0 0 6px #8e44ad',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Text Removed */}
        </div>
        <div style={{ opacity: 0.5, display: 'flex', alignItems: 'center', paddingTop: '2px' }}>
          <ChevronDownIcon size={18} />
        </div>
      </div>

      {isDropdownOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-name">{user.full_name || 'User'}</div>
            <div className="profile-email">{user.email}</div>
          </div>

          <button
            onClick={async () => {
              const { useAuthStore } = await import('./store/authStore');
              useAuthStore.getState().logout();
              setIsDropdownOpen(false);
            }}
            className="profile-dropdown-item"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

import { EditorSettings, DEFAULT_EDITOR_SETTINGS } from './types/settings';

// ... (existing imports)

import { GlobalTooltip } from './components/GlobalTooltip';
import { LoginScreen } from './components/LoginScreen';
import { useAuthStore } from './store/authStore';
import CommandPalette from './components/CommandPalette';
import { useCommandStore } from './store/commandStore'; // Added this import for useAuthStore
import { InterpreterSelector } from './components/InterpreterSelector';

import EditorPane from './components/EditorPane';

function App() {
  const isLoginModalOpen = useAuthStore((state) => state.isLoginModalOpen);
  const [sidebarView, setSidebarView] = useState<'explorer' | 'search' | 'git' | 'debug'>('explorer');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // Split View State
  const [editorSplitRatio, setEditorSplitRatio] = useState(0.5); // 0.5 = 50% split


  const [isSSHModalOpen, setIsSSHModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isInterpreterSelectorOpen, setIsInterpreterSelectorOpen] = useState(false);
  const [selectedInterpreter, setSelectedInterpreter] = useState<string | undefined>(undefined);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);

  // 설정 로드 함수 - settings.json에서 읽어옴
  const loadEditorSettings = async () => {
    try {
      const result = await window.electron.settings.read();
      if (result.success && result.data) {
        const jsonSettings = result.data as Record<string, unknown>;
        // JSON 키 형식 (editor.fontSize)을 EditorSettings 객체로 변환
        const settings: Partial<EditorSettings> = {};
        if (jsonSettings['editor.fontSize'] !== undefined) settings.fontSize = jsonSettings['editor.fontSize'] as number;
        if (jsonSettings['editor.fontFamily'] !== undefined) settings.fontFamily = jsonSettings['editor.fontFamily'] as string;
        if (jsonSettings['editor.fontLigatures'] !== undefined) settings.fontLigatures = jsonSettings['editor.fontLigatures'] as boolean;
        if (jsonSettings['editor.tabSize'] !== undefined) settings.tabSize = jsonSettings['editor.tabSize'] as number;
        if (jsonSettings['editor.insertSpaces'] !== undefined) settings.insertSpaces = jsonSettings['editor.insertSpaces'] as boolean;
        if (jsonSettings['editor.wordWrap'] !== undefined) settings.wordWrap = jsonSettings['editor.wordWrap'] as boolean;
        if (jsonSettings['editor.minimap'] !== undefined) settings.minimap = jsonSettings['editor.minimap'] as boolean;
        if (jsonSettings['editor.lineNumbers'] !== undefined) settings.lineNumbers = jsonSettings['editor.lineNumbers'] as boolean;
        if (jsonSettings['editor.formatOnSave'] !== undefined) settings.formatOnSave = jsonSettings['editor.formatOnSave'] as boolean;
        if (jsonSettings['editor.theme'] !== undefined) settings.theme = jsonSettings['editor.theme'] as string;
        if (jsonSettings['editor.defaultFormatter'] !== undefined) settings.defaultFormatter = jsonSettings['editor.defaultFormatter'] as string;
        setEditorSettings({ ...DEFAULT_EDITOR_SETTINGS, ...settings });
      }
    } catch (error) {
      console.error('Failed to load editor settings:', error);
    }
  };

  // 초기 설정 및 인증 확인
  useEffect(() => {
    // 동적 import로 순환 참조 방지 (필요 시) 또는 직접 import
    import('./store/authStore').then(({ useAuthStore }) => {
      useAuthStore.getState().checkAuth();
    });
    loadEditorSettings();
  }, []);

  // 여러 파일 관리 (Primary / Secondary Split View)
  const [primaryFiles, setPrimaryFiles] = useState<OpenFile[]>([]);
  const [primaryActiveIndex, setPrimaryActiveIndex] = useState<number>(-1);

  const [secondaryFiles, setSecondaryFiles] = useState<OpenFile[]>([]);
  const [secondaryActiveIndex, setSecondaryActiveIndex] = useState<number>(-1);

  const [activeGroup, setActiveGroup] = useState<'primary' | 'secondary'>('primary');
  const [isSplitView, setIsSplitView] = useState(false);

  // Helper to get current active file based on group
  const activeFileIndex = activeGroup === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
  const openFiles = activeGroup === 'primary' ? primaryFiles : secondaryFiles;
  const setOpenFiles = (files: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
    if (activeGroup === 'primary') {
      setPrimaryFiles(files);
    } else {
      setSecondaryFiles(files);
    }
  };
  const setActiveFileIndex = (index: number | ((prev: number) => number)) => {
    if (activeGroup === 'primary') {
      setPrimaryActiveIndex(index);
    } else {
      setSecondaryActiveIndex(index);
    }
  };

  const [workspaceDir, setWorkspaceDir] = useState<string | null>(null);

  // File System Refresh Trigger (Agent -> App -> FileExplorer)
  const [refreshKey, setRefreshKey] = useState(0);
  const handleForceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Reveal file in explorer
  const [revealFilePath, setRevealFilePath] = useState<string | null>(null);

  // Ctrl+L 4단계 사이클 추적: 열기 → 포커스 → 블러 → 닫기
  const aiPromptVisited = useRef(false);

  // Unsaved Modal State
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [unsavedFilesForModal, setUnsavedFilesForModal] = useState<OpenFile[]>([]);
  const unsavedChangesResolveRef = useRef<(value: boolean) => void>(() => { });

  // Diagnostics (Errors/Warnings)
  const [diagnostics, setDiagnostics] = useState<{ errors: number; warnings: number; markers: any[] }>({ errors: 0, warnings: 0, markers: [] });

  // Current Git Branch
  const [currentBranch, setCurrentBranch] = useState<string>('');

  // Clone Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneUrl, setCloneUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  // 인앱 파일 브라우저 상태
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  const [fileBrowserMode, setFileBrowserMode] = useState<FileBrowserMode>('selectFolder');
  const [fileBrowserRemote, setFileBrowserRemote] = useState(false);
  const [fileBrowserInitialPath, setFileBrowserInitialPath] = useState<string | undefined>(undefined);
  const fileBrowserResolveRef = useRef<(value: string | null) => void>(() => { });

  // 원격 워크스페이스 상태
  const [isRemoteWorkspace, setIsRemoteWorkspace] = useState(false);
  const [remoteUser, setRemoteUser] = useState('');

  // 인앱 알림 모달
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);

  // Promise 기반 인앱 파일 브라우저 호출 래퍼
  const showFileBrowser = (mode: FileBrowserMode, remote = false, initialPath?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      fileBrowserResolveRef.current = resolve;
      setFileBrowserMode(mode);
      setFileBrowserRemote(remote);
      setFileBrowserInitialPath(initialPath);
      setFileBrowserOpen(true);
    });
  };

  const handleFileBrowserSelect = (path: string) => {
    setFileBrowserOpen(false);
    fileBrowserResolveRef.current(path);
  };

  const handleFileBrowserCancel = () => {
    setFileBrowserOpen(false);
    fileBrowserResolveRef.current(null);
  };

  const handleCloneRepo = () => {
    setShowCloneModal(true);
  };

  const executeClone = async () => {
    if (!cloneUrl) {
      setAlertMessage('Please enter a repository URL');
      return;
    }

    try {
      const selectedPath = await showFileBrowser('selectFolder');
      if (!selectedPath) return;
      const dirResult = { path: selectedPath };

      setIsCloning(true);

      // 저장소 이름 추출 (예: https://github.com/user/repo.git -> repo)
      const repoName = cloneUrl.split('/').pop()?.replace('.git', '') || 'repository';
      const targetDir = `${dirResult.path}/${repoName}`;

      const result = await window.electron.git.clone(cloneUrl, targetDir);

      if (result.success) {
        setWorkspaceDir(targetDir);
        setPrimaryFiles([]);
        setPrimaryActiveIndex(-1);
        setSecondaryFiles([]);
        setSecondaryActiveIndex(-1);
        setIsSplitView(false);
        setActiveGroup('primary');
        setShowCloneModal(false);
        setCloneUrl('');
      } else {
        setAlertMessage(`Clone failed: ${result.error}`);
      }
    } catch (err: any) {
      setAlertMessage(`Error: ${err.message}`);
    } finally {
      setIsCloning(false);
    }
  };

  // Git 변경 파일 클릭 시 (Diff 보기)
  const handleGitFileClick = async (filePath: string) => {
    if (!workspaceDir) return;

    try {
      // 1. 원본 파일 내용 가져오기 (HEAD)
      const originalResult = await window.electron.git.show(workspaceDir, filePath);
      const originalContent = originalResult.success ? originalResult.content : '';

      // 2. 현재 작업 파일 내용 가져오기 (Local)
      const modifiedResult = await window.electron.fs.readFile(`${workspaceDir}/${filePath}`);
      const modifiedContent = modifiedResult.success ? modifiedResult.content : '';

      // 3. Diff Editor 열기
      const newFile: OpenFile = {
        path: filePath,
        content: modifiedContent || '',
        isDirty: false,
        isDiff: true,
        originalContent: originalContent || '',
        modifiedContent: modifiedContent || ''
      };

      // 이미 열려있는지 확인 (Diff 모드로)
      const existingIndex = openFiles.findIndex(f => f.path === filePath && f.isDiff);

      if (existingIndex !== -1) {
        // 이미 열려있으면 업데이트
        const updatedFiles = [...openFiles];
        updatedFiles[existingIndex] = newFile;
        setOpenFiles(updatedFiles);
        setActiveFileIndex(existingIndex);
      } else {
        // 새로 열기
        // Always open diff in primary group for now? Or active group?
        // Let's open in active group.
        if (activeGroup === 'primary') {
          setPrimaryFiles([...primaryFiles, newFile]);
          setPrimaryActiveIndex(primaryFiles.length);
        } else {
          setSecondaryFiles([...secondaryFiles, newFile]);
          setSecondaryActiveIndex(secondaryFiles.length);
        }
      }
    } catch (error) {
      console.error('Failed to open diff:', error);
      setAlertMessage('Failed to open diff view');
    }
  };

  // 메뉴 드롭다운 상태
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [runMenuOpen, setRunMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [forceShowWelcome, setForceShowWelcome] = useState(false);
  const [showCloseProjectModal, setShowCloseProjectModal] = useState(false);

  // 줌 메뉴 상태
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.1);
  const [shortcuts, setShortcuts] = useState<KeyBinding[]>(DEFAULT_SHORTCUTS);

  // 단축키 로드
  const loadShortcuts = async () => {
    const saved = await window.electron.store.get('key_bindings');
    if (saved.success && Array.isArray(saved.value)) {
      const merged = DEFAULT_SHORTCUTS.map(def => {
        const s = (saved.value as KeyBinding[]).find((k: KeyBinding) => k.id === def.id);
        return s ? { ...def, currentKey: s.currentKey } : def;
      });
      setShortcuts(merged);
    }
  };

  useEffect(() => {
    loadShortcuts();
  }, []);



  // 워크스페이스 존재 여부 감시 (3초마다) — 원격 모드에서는 스킵
  useEffect(() => {
    if (!workspaceDir || isRemoteWorkspace) return;

    const checkWorkspaceExists = async () => {
      try {
        const result = await window.electron.fs.exists(workspaceDir);
        if (result.success && !result.exists) {
          setAlertMessage(`프로젝트 디렉토리 '${workspaceDir}'를 찾을 수 없습니다.\n삭제되었거나 이동되었을 수 있습니다.`);
          setTimeout(() => window.location.reload(), 3000);
        }
      } catch (error) {
        console.error('Workspace check failed:', error);
      }
    };

    const interval = setInterval(checkWorkspaceExists, 3000);
    return () => clearInterval(interval);
  }, [workspaceDir, isRemoteWorkspace]);

  // 메뉴 외부 클릭 시 닫기
  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for top menu dropdowns
      if (fileMenuOpen || editMenuOpen || runMenuOpen || helpMenuOpen || viewMenuOpen) {
        if (!target.closest('.menu-dropdown')) {
          setFileMenuOpen(false);
          setEditMenuOpen(false);
          setRunMenuOpen(false);
          setHelpMenuOpen(false);
          setViewMenuOpen(false);
        }
      }

      // Check for zoom menu
      if (zoomMenuOpen) {
        if (!target.closest('.zoom-container')) {
          setZoomMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [fileMenuOpen, editMenuOpen, runMenuOpen, helpMenuOpen, viewMenuOpen, zoomMenuOpen]);

  // 크기 상태
  const [sidePanelWidth, setSidePanelWidth] = useState(300);
  const [aiPanelWidth, setAIPanelWidth] = useState(400);
  const [terminalHeight, setTerminalHeight] = useState(250);

  // 사이드바 토글 핸들러 (버튼과 단축키에서 공통 사용)
  const toggleSidebar = () => {
    console.log('🔄 사이드바 토글 실행');
    setIsSidePanelOpen((prev) => {
      console.log('사이드바 상태:', prev, '→', !prev);
      return !prev;
    });
  };

  // 반응형 처리: 창 크기가 작아지면 AI 패널 자동 닫기
  useEffect(() => {
    const handleResize = () => {
      // 1000px 미만이고 AI 패널이 열려있으면 닫기
      if (window.innerWidth < 1000 && isAIPanelOpen) {
        setIsAIPanelOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAIPanelOpen]);

  // Command Palette Logic
  const { actions: commandActions } = useCommandStore();

  useEffect(() => {
    // Global Keyboard Shortcuts for Command Palette
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P or F1 -> Command Mode
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === 'F1') {
        e.preventDefault();
        commandActions.openPalette('command');
      }
      // Ctrl+P -> File Mode
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        commandActions.openPalette('file');
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);

    // Register Core Commands
    commandActions.registerCommand({
      id: 'window.reload',
      title: 'Reload Window',
      handler: () => window.location.reload(),
      shortcut: 'Ctrl+R'
    });
    commandActions.registerCommand({
      id: 'settings.open',
      title: 'Open Settings',
      handler: () => setSettingsOpen(true),
      shortcut: 'Ctrl+,'
    });
    commandActions.registerCommand({
      id: 'sidebar.toggle',
      title: 'Toggle Sidebar',
      handler: () => toggleSidebar(),
      shortcut: 'Ctrl+B'
    });
    commandActions.registerCommand({
      id: 'terminal.toggle',
      title: 'Toggle Terminal',
      handler: () => setIsTerminalOpen(prev => !prev),
      shortcut: 'Ctrl+J'
    });
    commandActions.registerCommand({
      id: 'ai.toggle',
      title: 'Toggle AI Panel',
      handler: () => setIsAIPanelOpen(prev => !prev),
      shortcut: 'Ctrl+L'
    });
    commandActions.registerCommand({
      id: 'file.new',
      title: 'New File',
      handler: () => handleNewFile(),
      shortcut: 'Ctrl+N'
    });
    commandActions.registerCommand({
      id: 'file.save',
      title: 'Save File',
      handler: () => handleFileSave(activeFileIndex),
      shortcut: 'Ctrl+S'
    });

    commandActions.registerCommand({
      id: 'view.splitEditor',
      title: 'Split Editor',
      handler: () => {
        if (!isSplitView) {
          // Open current file in secondary group
          if (activeGroup === 'primary' && primaryActiveIndex !== -1) {
            const currentFile = primaryFiles[primaryActiveIndex];
            setSecondaryFiles([currentFile]);
            setSecondaryActiveIndex(0);
          }
          setIsSplitView(true);
          setActiveGroup('secondary');
        } else {
          // Already split, maybe focus next group?
          setActiveGroup(prev => prev === 'primary' ? 'secondary' : 'primary');
        }
      },
      shortcut: 'Ctrl+\\'
    });
    commandActions.registerCommand({
      id: 'view.toggleSplit',
      title: 'Toggle Split View',
      handler: () => setIsSplitView(prev => !prev),
      shortcut: 'Ctrl+Shift+\\'
    });

    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [activeFileIndex, openFiles, activeGroup, isSplitView, primaryFiles, secondaryFiles, primaryActiveIndex, secondaryActiveIndex]);

  // 파일 열기 핸들러 (탭 추가)
  const handleFileOpen = async (filePath: string) => {
    // 파일 열기 시 웰컴 스크린 강제 표시 해제
    setForceShowWelcome(false);

    if (!window.electron?.fs?.readFile) {
      console.error('❌ Electron fs API not available');
      return;
    }

    try {
      const result = isRemoteWorkspace
        ? await window.electron.sftp.read(filePath)
        : await window.electron.fs.readFile(filePath);

      if (result.success && result.content !== undefined) {
        const newFile: OpenFile = {
          path: filePath,
          content: result.content,
          isDirty: false
        };

        if (activeGroup === 'primary') {
          const existingIndex = primaryFiles.findIndex(f => f.path === filePath);
          if (existingIndex !== -1) {
            setPrimaryActiveIndex(existingIndex);
          } else {
            setPrimaryFiles([...primaryFiles, newFile]);
            setPrimaryActiveIndex(primaryFiles.length);
          }
        } else {
          const existingIndex = secondaryFiles.findIndex(f => f.path === filePath);
          if (existingIndex !== -1) {
            setSecondaryActiveIndex(existingIndex);
          } else {
            setSecondaryFiles([...secondaryFiles, newFile]);
            setSecondaryActiveIndex(secondaryFiles.length);
          }
        }

        console.log('✅ 파일 열기 성공:', filePath);
      } else {
        console.error('파일 읽기 실패:', result.error);
      }
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };



  // Helper for internal handlers
  const handleCloseTabInternal = async (index: number, group: 'primary' | 'secondary') => {
    // Logic duplicated from old handleCloseTab but explicit
    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const activeIdx = group === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
    const setIdx = group === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const fileToClose = files[index];
    if (!fileToClose) return;

    if (fileToClose.isDirty) {
      const proceed = await checkUnsavedChanges([fileToClose]);
      if (!proceed) return;
    }

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (activeIdx >= index) {
      setIdx(Math.max(0, Math.min(activeIdx - (activeIdx > index ? 1 : 0), newFiles.length - 1)));
    }
    if (newFiles.length === 0) setIdx(-1);
  };

  const handleFileSaveInternal = (index: number | undefined, group: 'primary' | 'secondary') => {
    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const activeIdx = group === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
    const targetIndex = index ?? activeIdx;

    if (targetIndex === -1) return;
    const file = files[targetIndex];
    if (file) {
      saveSingleFile(file).then(success => {
        if (success) {
          const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
          const newFiles = [...files];
          newFiles[targetIndex] = { ...file, isDirty: false };
          setFiles(newFiles);
        }
      });
    }
  };

  // 파일 저장 핸들러 (Legacy wrapper for commands)
  const handleFileSave = async (index: number = activeFileIndex) => {
    if (index === -1) {
      console.warn('저장할 파일이 선택되지 않았습니다');
      return;
    }

    const fileToSave = openFiles[index];
    if (!fileToSave) return;

    if (!window.electron?.fs?.writeFile) {
      console.error('Electron fs API not available');
      return;
    }

    try {
      let filePath = fileToSave.path;

      // untitled 파일이면 저장 다이얼로그 표시
      if (filePath.startsWith('untitled-')) {
        const savePath = await showFileBrowser('saveFile');
        if (!savePath) {
          return; // 사용자가 취소함
        }
        filePath = savePath;
      }

      const result = isRemoteWorkspace
        ? await window.electron.sftp.write(filePath, fileToSave.content)
        : await window.electron.fs.writeFile(filePath, fileToSave.content);

      if (result.success) {
        // isDirty 플래그 제거 및 경로 업데이트
        const updatedFiles = [...openFiles];
        updatedFiles[index] = {
          ...fileToSave,
          path: filePath, // 새 경로로 업데이트
          isDirty: false
        };
        setOpenFiles(updatedFiles);
        console.log('✅ 파일 저장 성공:', filePath);
      } else {
        console.error('❌ 파일 저장 실패:', result.error);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  // 모든 변경된 파일 저장 (Primary & Secondary)
  const handleSaveAll = async () => {
    let hasChanges = false;
    let newPrimaryFiles = [...primaryFiles];
    let newSecondaryFiles = [...secondaryFiles];

    // Primary Group
    for (let i = 0; i < newPrimaryFiles.length; i++) {
      if (newPrimaryFiles[i].isDirty) {
        const file = newPrimaryFiles[i];
        if (await saveSingleFile(file)) {
          newPrimaryFiles[i] = { ...file, isDirty: false };
          hasChanges = true;
        }
      }
    }
    // Secondary Group
    for (let i = 0; i < newSecondaryFiles.length; i++) {
      if (newSecondaryFiles[i].isDirty) {
        const file = newSecondaryFiles[i];
        if (await saveSingleFile(file)) {
          newSecondaryFiles[i] = { ...file, isDirty: false };
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      setPrimaryFiles(newPrimaryFiles);
      setSecondaryFiles(newSecondaryFiles);
      if (workspaceDir) handleForceRefresh();
    }
  };

  const saveSingleFile = async (file: OpenFile): Promise<boolean> => {
    try {
      let filePath = file.path;
      if (filePath.startsWith('untitled-')) {
        const savePath = await showFileBrowser('saveFile');
        if (!savePath) return false;
        filePath = savePath;
      }
      const writeFn = isRemoteWorkspace ? window.electron?.sftp?.write : window.electron?.fs?.writeFile;
      if (writeFn) {
        const res = await writeFn(filePath, file.content);
        if (res.success) {
          console.log('✅ Save All Success:', filePath);
          return true;
        } else {
          console.error('❌ Save All Failed:', res.error);
        }
      }
    } catch (err) {
      console.error('Error in saveSingleFile', err);
    }
    return false;
  };

  // 새 파일 생성 핸들러
  const handleNewFile = () => {
    if (fileMenuOpen) setFileMenuOpen(false);

    // untitled 이름 생성 (기존 파일들과 겹치지 않게)
    let counter = 1;
    while (openFiles.some(f => f.path === `untitled-${counter}`)) {
      counter++;
    }
    const untitledPath = `untitled-${counter}`;

    const newFile: OpenFile = {
      path: untitledPath,
      content: '',
      isDirty: true // 저장되지 않은 상태로 표시
    };

    const targetSetFiles = activeGroup === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const targetSetActiveIndex = activeGroup === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;
    const targetFiles = activeGroup === 'primary' ? primaryFiles : secondaryFiles;

    targetSetFiles([...targetFiles, newFile]);
    targetSetActiveIndex(targetFiles.length);
  };

  // 새 창 생성 핸들러
  const handleNewWindow = async () => {
    if (fileMenuOpen) setFileMenuOpen(false);
    if (!window.electron?.window?.create) {
      console.error('Window create API not available');
      return;
    }
    await window.electron.window.create();
  };







  // 파일 내용 변경 핸들러
  const handlePrimaryContentChange = (content: string) => {
    if (primaryActiveIndex === -1) return;
    const newFiles = [...primaryFiles];
    newFiles[primaryActiveIndex] = { ...newFiles[primaryActiveIndex], content, isDirty: true };
    setPrimaryFiles(newFiles);
  };

  const handleSecondaryContentChange = (content: string) => {
    if (secondaryActiveIndex === -1) return;
    const newFiles = [...secondaryFiles];
    newFiles[secondaryActiveIndex] = { ...newFiles[secondaryActiveIndex], content, isDirty: true };
    setSecondaryFiles(newFiles);
  };



  // 변경사항 확인 및 저장 여부 묻기
  const checkUnsavedChanges = async (filesToCheck: OpenFile[]): Promise<boolean> => {
    const dirtyFiles = filesToCheck.filter(f => f.isDirty);
    if (dirtyFiles.length === 0) return true;

    setUnsavedFilesForModal(dirtyFiles);
    setShowUnsavedModal(true);

    return new Promise<boolean>((resolve) => {
      unsavedChangesResolveRef.current = resolve;
    });
  };

  const handleUnsavedModalAction = async (action: 'save' | 'dontsave' | 'cancel') => {
    setShowUnsavedModal(false);

    if (action === 'save') {
      // Save all dirty files sequentially
      for (const file of unsavedFilesForModal) {
        // Find index in current openFiles to handle saving correctly
        const index = openFiles.findIndex(f => f.path === file.path);
        if (index !== -1) {
          await handleFileSave(index);
        }
      }
      unsavedChangesResolveRef.current(true);
    } else if (action === 'dontsave') {
      unsavedChangesResolveRef.current(true);
    } else {
      unsavedChangesResolveRef.current(false);
    }
  };

  // 탭 닫기
  const handleCloseTab = async (index: number) => {
    // Determine which group's files to operate on
    const currentFiles = activeGroup === 'primary' ? primaryFiles : secondaryFiles;
    const currentActiveIndex = activeGroup === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
    const setFiles = activeGroup === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const setActiveIndex = activeGroup === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const fileToClose = currentFiles[index];
    if (!fileToClose) return; // Should not happen, but for safety

    if (fileToClose.isDirty) {
      const proceed = await checkUnsavedChanges([fileToClose]);
      if (!proceed) return;
    }

    const newFiles = currentFiles.filter((_, i) => i !== index);
    setFiles(newFiles);

    // Adjust active index for the current group
    if (currentActiveIndex === index) {
      // If the active tab is closed, set active to the new last tab or -1 if no tabs left
      setActiveIndex(newFiles.length > 0 ? Math.min(index, newFiles.length - 1) : -1);
    } else if (currentActiveIndex > index) {
      // If a tab before the active tab is closed, shift active index left
      setActiveIndex(currentActiveIndex - 1);
    }
    // If a tab after the active tab is closed, active index remains the same
  };

  // 다른 탭 닫기
  // Internal close helpers
  const handleCloseOthersInternal = async (index: number, group: 'primary' | 'secondary') => {
    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const setActiveIndex = group === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const filesToClose = files.filter((_, i) => i !== index);
    const proceed = await checkUnsavedChanges(filesToClose);
    if (!proceed) return;

    const targetFile = files[index];
    setFiles([targetFile]);
    setActiveIndex(0);
  };

  const handleCloseToRightInternal = async (index: number, group: 'primary' | 'secondary') => {
    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const activeIndex = group === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
    const setActiveIndex = group === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const filesToClose = files.slice(index + 1);
    const proceed = await checkUnsavedChanges(filesToClose);
    if (!proceed) return;

    const newFiles = files.slice(0, index + 1);
    setFiles(newFiles);

    if (activeIndex > index) {
      setActiveIndex(index);
    }
  };

  const handleCloseAllInternal = async (group: 'primary' | 'secondary') => {
    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const setActiveIndex = group === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const proceed = await checkUnsavedChanges(files);
    if (!proceed) return;

    setFiles([]);
    setActiveIndex(-1);
  };

  // 파일 삭제 시 탭 닫기 핸들러 (강제 닫기)
  const handleFileDelete = (deletedPath: string) => {
    // 삭제된 파일 또는 폴더 하위 파일 찾기
    const filesToKeep = openFiles.filter(f =>
      f.path !== deletedPath && !f.path.startsWith(deletedPath + '/')
    );

    if (filesToKeep.length !== openFiles.length) {
      // 닫히는 파일이 있음
      let newActiveIndex = activeFileIndex;

      // 현재 활성 탭의 경로
      const currentActivePath = activeFileIndex >= 0 && activeFileIndex < openFiles.length
        ? openFiles[activeFileIndex].path
        : null;

      if (filesToKeep.length === 0) {
        newActiveIndex = -1;
      } else if (currentActivePath) {
        // 활성 탭이 살아남았는지 확인
        const newIndex = filesToKeep.findIndex(f => f.path === currentActivePath);
        if (newIndex !== -1) {
          newActiveIndex = newIndex;
        } else {
          // 활성 탭이 삭제됨 -> 마지막 탭 또는 적절한 위치
          newActiveIndex = Math.min(activeFileIndex, filesToKeep.length - 1);
        }
      } else {
        newActiveIndex = -1;
      }

      setOpenFiles(filesToKeep);
      setActiveFileIndex(newActiveIndex);
    }
  };

  const handleReorderTabsInternal = (fromIndex: number, toIndex: number, group: 'primary' | 'secondary') => {
    if (fromIndex === toIndex) return;

    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const activeIndex = group === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
    const setActiveIndex = group === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);

    // activeFileIndex 조정
    const currentActive = files[activeIndex];
    if (currentActive) {
      const newIndex = updatedFiles.findIndex(f => f.path === currentActive.path);
      setActiveIndex(newIndex);
    }
    setFiles(updatedFiles);
  };

  const handleMoveToOtherGroup = (group: 'primary' | 'secondary') => {
    const files = group === 'primary' ? primaryFiles : secondaryFiles;
    const setFiles = group === 'primary' ? setPrimaryFiles : setSecondaryFiles;
    const activeIndex = group === 'primary' ? primaryActiveIndex : secondaryActiveIndex;
    const setActiveIndex = group === 'primary' ? setPrimaryActiveIndex : setSecondaryActiveIndex;

    const targetFiles = group === 'primary' ? secondaryFiles : primaryFiles;
    const setTargetFiles = group === 'primary' ? setSecondaryFiles : setPrimaryFiles;
    const setTargetActiveIndex = group === 'primary' ? setSecondaryActiveIndex : setPrimaryActiveIndex;

    if (files.length === 0) return;

    const fileToMove = files[activeIndex];
    if (!fileToMove) return;

    // 1. Remove from source
    const newSourceFiles = files.filter((_, i) => i !== activeIndex);
    setFiles(newSourceFiles);

    // Adjust source active index
    if (activeIndex >= newSourceFiles.length) {
      setActiveIndex(Math.max(0, newSourceFiles.length - 1));
    }

    // 2. Add to target (append)
    // Avoid duplicates? The move implies it leaves source.
    // If it already exists in target (same path), we should probably just switch focus to it rather than adding duplicate.
    const existingIndex = targetFiles.findIndex(f => f.path === fileToMove.path);
    if (existingIndex !== -1) {
      setTargetActiveIndex(existingIndex);
    } else {
      const newTargetFiles = [...targetFiles, fileToMove];
      setTargetFiles(newTargetFiles);
      setTargetActiveIndex(newTargetFiles.length - 1);
    }

    // 3. Ensure split view is visible if moving from primary to secondary
    if (group === 'primary' && !isSplitView) {
      setIsSplitView(true);
      // Optional: set default ratio if not set? 
      if (editorSplitRatio < 0.1 || editorSplitRatio > 0.9) setEditorSplitRatio(0.5);
    }
  };


  // 단축키 핸들러
  // 줌 적용 헬퍼
  const BASE_ZOOM = 1.1; // Default 110% as new 100%
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = Number((BASE_ZOOM - (ZOOM_STEP * 4)).toFixed(1)); // 0.7
  const MAX_ZOOM = Number((BASE_ZOOM + (ZOOM_STEP * 4)).toFixed(1)); // 1.5

  const applyZoom = (newFactor: number) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(newFactor.toFixed(1))));
    if (window.electron?.zoom?.setZoomFactor) {
      window.electron.zoom.setZoomFactor(clamped);
      setZoomLevel(clamped);
    }
  };

  // 초기 줌 설정
  useEffect(() => {
    applyZoom(BASE_ZOOM);
  }, []);

  // 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');

      let key = e.key;
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return;

      if (key === ' ') key = 'Space';
      else if (key.length === 1) key = key.toUpperCase();

      const combo = [...modifiers, key].join('+');

      const binding = shortcuts.find(s => s.currentKey === combo);
      if (!binding) return;

      // 터미널 포커스 시 충돌하는 단축키 예외 처리 (Tmux Ctrl+B 등)
      const isTerminalFocused = document.activeElement?.className.includes('xterm-helper-textarea');
      if (isTerminalFocused) {
        // 사이드바 토글(Ctrl+B)은 터미널로 통과시킴
        if (binding.command === 'toggleSidebar') return;

        // 필요하다면 다른 충돌 키도 여기서 예외 처리 가능
      }

      // 앱 레벨에서 직접 처리하는 명령만 Monaco 이벤트 차단
      const appLevelCommands = new Set([
        'toggleSidebar', 'toggleTerminal', 'toggleAIPanel',
        'saveFile', 'saveAllFiles', 'zoomIn', 'zoomOut', 'zoomReset', 'revealInExplorer',
        'prevTab', 'nextTab', 'terminalPrevTab', 'terminalNextTab', 'closeTab',
        'newFile', 'openFile', 'openFolder', 'markdownPreview'
      ]);

      if (appLevelCommands.has(binding.command)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      // 나머지 (find, replace, commentLine 등)는 Monaco가 자체 처리

      switch (binding.command) {
        case 'toggleSidebar':
          setIsSidePanelOpen(prev => !prev);
          break;
        case 'toggleTerminal':
          setIsTerminalOpen(prev => {
            if (!prev) {
              // 열기 → 터미널 포커스
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('terminal-focus'));
              }, 100);
            } else {
              // 닫기 → 에디터 포커스
              setTimeout(() => {
                const editor = document.querySelector('.monaco-editor textarea') as HTMLElement;
                if (editor) editor.focus();
              }, 50);
            }
            return !prev;
          });
          break;
        case 'toggleAIPanel': {
          const promptEl = document.querySelector('.ai-input-field') as HTMLTextAreaElement | null;
          const isPromptFocused = promptEl && document.activeElement === promptEl;

          if (!isAIPanelOpen) {
            // 1단계: 패널 닫힘 → 열기
            setIsAIPanelOpen(true);
            aiPromptVisited.current = false;
          } else if (isAIPanelOpen && !isPromptFocused && !aiPromptVisited.current) {
            // 2단계: 패널 열림 + 프롬프트 미방문 → 포커스
            if (promptEl) {
              promptEl.focus();
              aiPromptVisited.current = true;
            } else {
              setIsAIPanelOpen(false);
              aiPromptVisited.current = false;
            }
          } else if (isAIPanelOpen && isPromptFocused) {
            // 3단계: 프롬프트 포커스 → 블러
            promptEl.blur();
          } else if (isAIPanelOpen && !isPromptFocused && aiPromptVisited.current) {
            // 4단계: 프롬프트 방문 후 블러 상태 → 닫기
            setIsAIPanelOpen(false);
            aiPromptVisited.current = false;
          }
          break;
        }
        case 'saveFile':
          handleFileSave();
          break;
        case 'saveAllFiles': {
          (async () => {
            for (let i = 0; i < openFiles.length; i++) {
              if (openFiles[i].isDirty) {
                await handleFileSave(i);
              }
            }
          })();
          break;
        }
        case 'newFile': {
          // Untitled 파일 번호 계산
          const untitledNums = openFiles
            .map(f => f.path.match(/^Untitled-(\d+)$/)?.[1])
            .filter(Boolean)
            .map(Number);
          const nextNum = untitledNums.length > 0 ? Math.max(...untitledNums) + 1 : 1;
          const untitledFile: OpenFile = {
            path: `Untitled-${nextNum}`,
            content: '',
            isDirty: false
          };
          setOpenFiles([...openFiles, untitledFile]);
          setActiveFileIndex(openFiles.length);
          break;
        }
        case 'openFile': {
          (async () => {
            try {
              const filePath = await showFileBrowser('selectFile');
              if (!filePath) return;
              // 이미 열려있으면 활성화
              const existingIdx = openFiles.findIndex(f => f.path === filePath);
              if (existingIdx !== -1) {
                setActiveFileIndex(existingIdx);
                return;
              }
              const readResult = await window.electron.fs.readFile(filePath);
              if (readResult.success && readResult.content !== undefined) {
                const newFile: OpenFile = {
                  path: filePath,
                  content: readResult.content,
                  isDirty: false
                };
                setOpenFiles(prev => [...prev, newFile]);
                setActiveFileIndex(openFiles.length);
              }
            } catch (err) {
              console.error('Open file failed:', err);
            }
          })();
          break;
        }
        case 'openFolder':
          handleOpenFolder();
          break;
        case 'markdownPreview':
          window.dispatchEvent(new CustomEvent('markdown-preview-toggle'));
          break;
        case 'zoomIn':
          applyZoom(zoomLevel + ZOOM_STEP);
          break;
        case 'zoomOut':
          applyZoom(zoomLevel - ZOOM_STEP);
          break;
        case 'zoomReset':
          applyZoom(BASE_ZOOM);
          break;
        case 'revealInExplorer': {
          // 에디터 포커스 해제
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setIsSidePanelOpen(true);
          setSidebarView('explorer');
          if (activeFileIndex >= 0 && openFiles[activeFileIndex]) {
            setRevealFilePath(openFiles[activeFileIndex].path);
          }
          break;
        }
        case 'prevTab':
          if (openFiles.length > 1) {
            setActiveFileIndex(prev => prev > 0 ? prev - 1 : openFiles.length - 1);
          }
          break;
        case 'nextTab':
          if (openFiles.length > 1) {
            setActiveFileIndex(prev => prev < openFiles.length - 1 ? prev + 1 : 0);
          }
          break;
        case 'terminalPrevTab':
          window.dispatchEvent(new CustomEvent('terminal-switch-tab', { detail: { direction: 'prev' } }));
          break;
        case 'terminalNextTab':
          window.dispatchEvent(new CustomEvent('terminal-switch-tab', { detail: { direction: 'next' } }));
          break;
        case 'closeTab':
          if (activeFileIndex >= 0 && openFiles[activeFileIndex]) {
            const file = openFiles[activeFileIndex];
            if (!file.isDirty) {
              const newFiles = openFiles.filter((_, i) => i !== activeFileIndex);
              setOpenFiles(newFiles);
              setActiveFileIndex(newFiles.length > 0 ? Math.min(activeFileIndex, newFiles.length - 1) : -1);
            } else {
              handleCloseTab(activeFileIndex);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [shortcuts, handleFileSave, zoomLevel, activeFileIndex, openFiles, isAIPanelOpen]);

  // Ctrl+W 탭 닫기 (main process에서 커스텀 이벤트로 전달)
  useEffect(() => {
    const handleCloseActiveTab = () => {
      // 터미널에 포커스가 있으면 터미널 탭 닫기
      const terminalContainer = document.querySelector('.terminal-container');
      if (terminalContainer && terminalContainer.contains(document.activeElement)) {
        window.dispatchEvent(new CustomEvent('terminal-close-tab'));
        return;
      }
      // 에디터 탭 닫기
      if (activeFileIndex >= 0 && openFiles[activeFileIndex]) {
        const file = openFiles[activeFileIndex];
        if (!file.isDirty) {
          const newFiles = openFiles.filter((_, i) => i !== activeFileIndex);
          setOpenFiles(newFiles);
          setActiveFileIndex(newFiles.length > 0 ? Math.min(activeFileIndex, newFiles.length - 1) : -1);
        } else {
          handleCloseTab(activeFileIndex);
        }
      }
    };
    window.addEventListener('close-active-tab', handleCloseActiveTab);
    return () => window.removeEventListener('close-active-tab', handleCloseActiveTab);
  }, [activeFileIndex, openFiles]);

  // 터미널 최대화 토글
  const handleToggleTerminalMaximize = () => {
    setTerminalHeight((prev) => {
      const maxHeight = window.innerHeight - 57; // Header(35) + Footer(22)
      const threshold = maxHeight * 0.8;

      if (prev > threshold) {
        return 250; // 복원
      }
      return maxHeight; // 정확한 최대 높이 설정
    });
  };

  // 파일 언어 감지
  const getFileLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      js: 'JavaScript',
      jsx: 'JavaScript React',
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      py: 'Python',
      rs: 'Rust',
      go: 'Go',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      h: 'C/C++ Header',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      md: 'Markdown',
      sh: 'Shell Script',
      bash: 'Bash',
    };
    return langMap[ext || ''] || 'Plain Text';
  };

  // 최근 프로젝트 목록
  const [recentProjects, setRecentProjects] = useState<string[]>([]);

  // 초기 설정 및 최근 프로젝트 로드
  useEffect(() => {
    const loadSettings = async () => {
      if (window.electron && window.electron.store) {
        // ... 기존 설정 로드 로직이 있다면 여기 통합 ...

        // 최근 프로젝트 로드
        const recentsResult = await window.electron.store.get('recents');
        if (recentsResult.success && Array.isArray(recentsResult.value)) {
          setRecentProjects(recentsResult.value);
        }
      }
    };
    loadSettings();
  }, []);

  // 최근 프로젝트 추가 헬퍼
  const addToRecents = async (path: string) => {
    const newRecents = [path, ...recentProjects.filter(p => p !== path)].slice(0, 10);
    setRecentProjects(newRecents);
    if (window.electron && window.electron.store) {
      await window.electron.store.set('recents', newRecents);
    }
  };

  // 현재 Git 브랜치 가져오기
  useEffect(() => {
    const fetchBranch = async () => {
      if (!workspaceDir) {
        setCurrentBranch('');
        return;
      }
      try {
        const result = await window.electron.git.status(workspaceDir);
        if (result.success && result.status?.current) {
          setCurrentBranch(result.status.current);
        } else {
          setCurrentBranch('');
        }
      } catch {
        setCurrentBranch('');
      }
    };
    fetchBranch();
  }, [workspaceDir]);

  // ... (shortcuts useEffect 등 다른 코드 유지)

  // 폴더 열기 핸들러
  const handleOpenFolder = async () => {
    try {
      const remoteInitialPath = isRemoteWorkspace
        ? (workspaceDir || (remoteUser ? `/home/${remoteUser}` : '/'))
        : undefined;
      const selectedPath = await showFileBrowser('selectFolder', isRemoteWorkspace, remoteInitialPath);
      if (selectedPath) {
        setWorkspaceDir(selectedPath);
        setIsSidePanelOpen(true);
        if (!isRemoteWorkspace) {
          addToRecents(selectedPath);
        }
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
    setFileMenuOpen(false);
  };

  // 최근 프로젝트 열기 핸들러
  const handleOpenRecent = (path: string) => {
    setWorkspaceDir(path);
    setIsSidePanelOpen(true);
    addToRecents(path); // 순서 갱신 (맨 위로)
  };

  // 최근 프로젝트 삭제 핸들러
  const handleRemoveRecent = async (path: string) => {
    // 이벤트 전파 방지를 위해 상위 컴포넌트에서 처리하거나, 여기서 처리 확인
    const newRecents = recentProjects.filter(p => p !== path);
    setRecentProjects(newRecents);
    if (window.electron && window.electron.store) {
      await window.electron.store.set('recents', newRecents);
    }
  };

  // Split Toggle Handler
  const handleToggleSplit = () => {
    setIsSplitView(prev => {
      const newState = !prev;
      if (newState) {
        // Splitting: Ensure secondary has content (duplicate current file)
        if (secondaryFiles.length === 0 && primaryFiles.length > 0) {
          const currentFile = primaryFiles[primaryActiveIndex];
          if (currentFile) {
            setSecondaryFiles([currentFile]);
            setSecondaryActiveIndex(0);
          }
        }
        setActiveGroup('secondary');
        // If split ratio is extreme, reset it
        if (editorSplitRatio < 0.1 || editorSplitRatio > 0.9) {
          setEditorSplitRatio(0.5);
        }
      } else {
        // Merging: Move files to primary
        const newPrimary = [...primaryFiles];
        secondaryFiles.forEach(f => {
          if (!newPrimary.find(pf => pf.path === f.path)) {
            newPrimary.push(f);
          }
        });
        setPrimaryFiles(newPrimary);
        setSecondaryFiles([]); // Clear secondary
        setActiveGroup('primary');
      }
      return newState;
    });
  };


  // 파일 열기 핸들러
  const handleOpenFileDialog = async () => {
    if (!window.electron?.dialog?.openFile) {
      console.error('Electron dialog API not available');
      return;
    }

    try {
      const result = await window.electron.dialog.openFile();

      if (result.success && result.path) {
        // 선택한 파일만 열기 (디렉토리는 워크스페이스로 설정하지 않음)
        await handleFileOpen(result.path);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
    setFileMenuOpen(false);
  };
  // 로그인 핸들러
  const handleLogin = async () => {
    try {
      const { useAuthStore } = await import('./store/authStore');
      useAuthStore.getState().login();
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  // SSH 연결 핸들러
  const handleSSHConnect = async (config: any) => {
    try {
      const result = await window.electron.ssh.connect(config);
      if (result.success) {
        // SFTP 세션 자동 시작
        const sftpResult = await window.electron.sftp.start();
        if (sftpResult.success) {
          console.log('SFTP session started');
        }
        setIsSSHModalOpen(false);
        setRemoteUser(config.username);

        // 원격 폴더 선택 브라우저 열기
        const remotePath = await showFileBrowser('selectFolder', true, `/home/${config.username}`);
        if (remotePath) {
          setIsRemoteWorkspace(true);
          setWorkspaceDir(remotePath);
          setIsSidePanelOpen(true);
          setOpenFiles([]);
          setActiveFileIndex(-1);
        }

        // 터미널 열기 (TerminalPanel이 마운트 시 자동으로 cd remoteCwd 실행)
        if (!isTerminalOpen) {
          setIsTerminalOpen(true);
        }
      } else {
        setAlertMessage(`SSH 연결 실패: ${result.error}`);
      }
    } catch (err: any) {
      setAlertMessage(`오류: ${err.message}`);
    }
  };




  // 프로젝트 닫기 핸들러
  const handleCloseProject = async () => {
    // 저장되지 않은 파일이 있으면 확인
    if (openFiles.some(f => f.isDirty)) {
      if (!await checkUnsavedChanges(openFiles)) return;
      doCloseProject();
    } else {
      // 저장할 게 없으면 모달로 확인
      setShowCloseProjectModal(true);
    }
  };

  // 실제 프로젝트 닫기 실행
  const doCloseProject = () => {
    setWorkspaceDir(null);
    setOpenFiles([]);
    setActiveFileIndex(-1);
    setDiagnostics({ errors: 0, warnings: 0, markers: [] });
    setSidebarView('explorer');
    setShowCloseProjectModal(false);
  };

  // Run Project Logic
  const handleRunProject = () => {
    if (activeFileIndex < 0 || !openFiles[activeFileIndex]) {
      setAlertMessage("실행할 파일이 없습니다. 파일을 먼저 열어주세요.");
      return;
    }
    const currentFile = openFiles[activeFileIndex];
    const ext = currentFile.path.split('.').pop()?.toLowerCase();

    let command = '';
    if (ext === 'py') {
      // Python - Unbuffered output recommended
      command = `python3 -u "${currentFile.path}"`;
    } else if (ext === 'js') {
      command = `node "${currentFile.path}"`;
    } else if (ext === 'sh') {
      command = `bash "${currentFile.path}"`;
    } else {
      command = `python3 "${currentFile.path}"`; // Fallback
      // Let's just try running it or alert.
      // User asked specifically for "Selected python file".
      // If not py, maybe alert.
      if (ext !== 'py') {
        // But user might want to run others.
        // I'll leave it as is for now but warn.
        console.warn("Running non-python file with default behavior might fail if not executable.");
        return;
      }
    }

    if (!isTerminalOpen) setIsTerminalOpen(true);

    // Give time for terminal to mount/wake up
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('gluon:run-command', {
        detail: { command, file: currentFile.path }
      }));
    }, 100);
  };

  // Debug Project Logic (Placeholder)
  const handleDebugProject = () => {
    // User asked if debug is project unit.
    // We can run python -m pdb for valid files.
    if (activeFileIndex < 0 || !openFiles[activeFileIndex]) return;
    const currentFile = openFiles[activeFileIndex];
    if (currentFile.path.endsWith('.py')) {
      if (!isTerminalOpen) setIsTerminalOpen(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('gluon:run-command', {
          detail: { command: `python3 -m pdb "${currentFile.path}"`, file: currentFile.path }
        }));
      }, 100);
    } else {
      setAlertMessage("현재 디버깅은 Python 파일(.py)만 지원합니다.");
    }
  };

  // Global Keyboard Shortcuts (F5)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // New Window: Ctrl+Shift+N
      if (e.ctrlKey && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        handleNewWindow();
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();

        if (!e.ctrlKey) {
          // F5: Run Without Debugging
          console.log('F5 Pressed: Run Without Debugging');
          const currentFile = openFiles[activeFileIndex];
          if (!currentFile || !currentFile.path) {
            console.warn('No active file');
            return;
          }

          // Auto-save before run
          if (currentFile.isDirty) {
            handleFileSave(activeFileIndex);
          }

          const ext = currentFile.path.split('.').pop()?.toLowerCase();
          let command = '';

          if (ext === 'py') {
            // Use selected python path or fallback to python3
            const pythonPath = selectedInterpreter || 'python3';
            command = `"${pythonPath}" -u "${currentFile.path}"`;
          } else if (ext === 'js') {
            command = `node "${currentFile.path}"`;
          } else if (ext === 'ts') {
            command = `ts-node "${currentFile.path}"`;
          } else {
            setAlertMessage(`Running .${ext} files is not supported yet.`);
            return;
          }

          if (command) {
            if (!isTerminalOpen) {
              setIsTerminalOpen(true);
            }

            // Dispatch event for TerminalPanel to handle UI + Process
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('gluon:run-command', {
                detail: { command, file: currentFile.path }
              }));
            }, isTerminalOpen ? 0 : 300); // Small delay if opening terminal for the first time
          }
        } else {
          // Ctrl+F5: Start Debugging (Coming Soon)
          console.log('Ctrl+F5 Pressed: Start Debugging (Not Implemented)');
          setAlertMessage('Interactive Debugging is coming soon!\nUse F5 to Run without Debugging.');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeFileIndex, openFiles, isTerminalOpen, workspaceDir, selectedInterpreter]);

  return (
    <div className="app">
      <CommandPalette onFileSelect={handleFileOpen} workspaceDir={workspaceDir} />
      <GlobalTooltip />
      {/* ... header ... */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-title">
            <img src={gluonLogo} alt="Gluon" className="app-logo" />
          </div>
          <div className="app-menu">
            <div className="menu-dropdown">
              <span
                className={`menu-item ${fileMenuOpen ? 'active' : ''}`}
                onClick={() => {
                  setFileMenuOpen(!fileMenuOpen);
                  setEditMenuOpen(false);
                  setRunMenuOpen(false);
                  setHelpMenuOpen(false);
                  setViewMenuOpen(false);
                }}
              >
                File
              </span>
              {fileMenuOpen && (
                <div className="dropdown-content">
                  <div className="dropdown-item" onClick={handleNewFile}>
                    <span style={{ flex: 1 }}>New File</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+N</span>
                  </div>
                  <div className="dropdown-item" onClick={handleNewWindow}>
                    <span style={{ flex: 1 }}>New Window</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+Shift+N</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => {
                    setFileMenuOpen(false);
                    handleOpenFileDialog();
                  }}>
                    <span style={{ flex: 1 }}>Open File</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+O</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setFileMenuOpen(false);
                    handleOpenFolder();
                  }}>
                    <span style={{ flex: 1 }}>Open Folder</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+Shift+O</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className={`dropdown-item ${openFiles.some(f => f.isDirty) ? '' : 'disabled'}`} onClick={() => {
                    setFileMenuOpen(false);
                    handleSaveAll();
                  }}>
                    <span style={{ flex: 1 }}>Save All</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+Shift+S</span>
                  </div>
                </div>
              )}
            </div>
            <div className="menu-dropdown">
              <span
                className={`menu-item ${editMenuOpen ? 'active' : ''}`}
                onClick={() => {
                  setEditMenuOpen(!editMenuOpen);
                  setFileMenuOpen(false);
                  setRunMenuOpen(false);
                  setHelpMenuOpen(false);
                  setViewMenuOpen(false);
                }}
              >
                Edit
              </span>
              {editMenuOpen && (
                <div className="dropdown-content">
                  <div className="dropdown-item" onClick={() => {
                    setEditMenuOpen(false);
                    window.dispatchEvent(new Event('gluon:undo'));
                  }}>
                    <RotateCcwIcon size={14} />
                    <span style={{ flex: 1 }}>Undo</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+Z</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setEditMenuOpen(false);
                    window.dispatchEvent(new Event('gluon:redo'));
                  }}>
                    <RotateCwIcon size={14} />
                    <span style={{ flex: 1 }}>Redo</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+Shift+Z</span>
                  </div>
                </div>
              )}
            </div>

            <div className="menu-dropdown">
              <span
                className={`menu-item ${viewMenuOpen ? 'active' : ''}`}
                onClick={() => {
                  setViewMenuOpen(!viewMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setRunMenuOpen(false);
                  setHelpMenuOpen(false);
                }}
              >
                View
              </span>
              {viewMenuOpen && (
                <div className="dropdown-content">
                  <div className="dropdown-item" onClick={() => {
                    setViewMenuOpen(false);
                    setSidebarView('search');
                    setIsSidePanelOpen(true);
                  }}>
                    <SearchIcon size={14} />
                    <span>Search</span>
                  </div>
                </div>
              )}
            </div>
            <div className="menu-dropdown">
              <span
                className={`menu-item ${runMenuOpen ? 'active' : ''}`}
                onClick={() => {
                  setRunMenuOpen(!runMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setHelpMenuOpen(false);
                  setViewMenuOpen(false);
                }}
              >
                Run
              </span>
              {runMenuOpen && (
                <div className="dropdown-content">
                  <div className="dropdown-item" onClick={() => {
                    setRunMenuOpen(false);
                    handleRunProject();
                  }}>
                    <PlayIcon size={14} />
                    <span style={{ flex: 1 }}>Run</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>F5</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setRunMenuOpen(false);
                    handleDebugProject();
                  }}>
                    <BugIcon size={14} />
                    <span style={{ flex: 1 }}>Debug</span>
                    <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>Ctrl+F5</span>
                  </div>
                </div>
              )}
            </div>
            <span
              className={`menu-item ${isTerminalOpen ? 'active' : ''}`}
              onClick={() => setIsTerminalOpen((prev) => !prev)}
            >
              Terminal
            </span>
            <div className="menu-dropdown">
              <span
                className={`menu-item ${helpMenuOpen ? 'active' : ''}`}
                onClick={() => {
                  setHelpMenuOpen(!helpMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setRunMenuOpen(false);
                  setViewMenuOpen(false);
                }}
              >
                Help
              </span>
              {helpMenuOpen && (
                <div className="dropdown-content">
                  <div className="dropdown-item" onClick={() => {
                    setHelpMenuOpen(false);
                    setForceShowWelcome(true);
                  }}>
                    <HomeIcon size={14} />
                    <span>Welcome</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setHelpMenuOpen(false);
                    setAlertMessage('You are using the latest version of Gluon (v1.0.0).');
                  }}>
                    <UpdateIcon size={14} />
                    <span>Check for Updates</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="header-drag-region"></div>
        <div className="header-right">
          <div className="layout-controls" style={{ display: 'flex', gap: '4px', marginRight: '10px' }}>
            <button
              className={`layout-button ${isSidePanelOpen ? 'active' : ''}`}
              onClick={toggleSidebar}
            >
              <SidebarLeftIcon size={16} />
            </button>
            <button
              className={`layout-button ${isTerminalOpen ? 'active' : ''}`}
              onClick={() => setIsTerminalOpen(prev => !prev)}
            >
              <LayoutBottomIcon size={16} />
            </button>
            <button
              className={`layout-button ${isAIPanelOpen ? 'active' : ''}`}
              onClick={() => setIsAIPanelOpen(prev => !prev)}
            >
              <SidebarRightIcon size={16} />
            </button>
          </div>
          <button
            className="settings-button"
            onClick={() => setSettingsOpen(!settingsOpen)}

          >
            <SettingsIcon size={18} />
          </button>
          <div className="window-controls">
            {/* 로그인 상태 표시 (Window Controls 왼쪽) */}
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '0px' }}>
              <AuthStatus />
            </div>
            <button
              className="window-button minimize"
              onClick={() => window.electron.window.minimize()}

            >
              _
            </button>
            <button
              className="window-button maximize"
              onClick={() => window.electron.window.maximize()}

            >
              □
            </button>
            <button
              className="window-button close"
              onClick={() => window.electron.window.close()}

            >
              ✕
            </button>
          </div>
        </div>
      </header >

      {/* Clone Modal */}
      {showCloneModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f1520 0%, #141a28 100%)',
            padding: '24px', borderRadius: '12px',
            width: '420px', border: '1px solid rgba(88, 166, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(88, 166, 255, 0.05)'
          }}>
            <h3 style={{
              marginTop: 0, marginBottom: '16px', color: '#e0e8f0',
              fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px'
            }}>Clone Repository</h3>
            <input
              type="text"
              placeholder="https://github.com/user/repo.git"
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', marginBottom: '18px',
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(88, 166, 255, 0.15)',
                color: '#e0e8f0', borderRadius: '8px', fontSize: '13px',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(88, 166, 255, 0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(88, 166, 255, 0.15)'}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCloneModal(false)}
                disabled={isCloning}
                style={{
                  padding: '8px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#a0a8b8',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeClone}
                disabled={isCloning}
                style={{
                  padding: '8px 16px', background: 'linear-gradient(135deg, #1a6dd4, #2b88e0)',
                  border: 'none', color: '#ffffff', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  opacity: isCloning ? 0.7 : 1, transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(26, 109, 212, 0.3)'
                }}
              >
                {isCloning ? 'Cloning...' : 'Clone'}
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* 메인 컨텐츠 영역 */}
      <div className="app-body">
        {/* 왼쪽 액티비티 바 */}
        <Sidebar
          activeView={sidebarView}
          onViewChange={setSidebarView}
          isSidePanelOpen={isSidePanelOpen}
          onToggleSidebar={toggleSidebar}
        />

        <div
          className="side-panel"
          style={{
            width: isSidePanelOpen ? `${sidePanelWidth}px` : '0px',
            minWidth: isSidePanelOpen ? '0px' : '0px',
            overflow: 'hidden',
            transition: 'width 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {sidebarView === 'explorer' && (
            workspaceDir ? (
              <FileExplorer
                workspaceDir={workspaceDir}
                isRemote={isRemoteWorkspace}
                onFileOpen={handleFileOpen}
                onCloseProject={handleCloseProject}
                refreshKey={refreshKey}
                onFileDelete={handleFileDelete}
                revealFilePath={revealFilePath}
                onRevealComplete={() => setRevealFilePath(null)}
              />
            ) : (
              <div className="panel-placeholder">
                <p>오픈된 폴더가 없습니다.</p>
              </div>
            )
          )}
          {sidebarView === 'search' && (
            workspaceDir ? (
              <SearchPanel workspaceDir={workspaceDir} onFileOpen={handleFileOpen} />
            ) : (
              <div className="panel-placeholder">
                <SearchIcon size={48} />
                <p>폴더를 열어주세요.</p>
              </div>
            )
          )}
          {sidebarView === 'git' && (
            isRemoteWorkspace ? (
              <div className="panel-placeholder">
                <p>원격 워크스페이스에서는 소스 제어를 사용할 수 없습니다.</p>
              </div>
            ) : workspaceDir ? (
              <GitPanel
                workspaceDir={workspaceDir}
                onFileClick={handleGitFileClick}
              />
            ) : (
              <div className="panel-placeholder">
                <p>Git 저장소가 아닙니다.</p>
              </div>
            )
          )}
          {sidebarView === 'debug' && (
            <DebugPanel workspaceDir={workspaceDir || undefined} />
          )}

        </div>

        {/* 리사이저 - 항상 표시 */}
        {isSidePanelOpen && (
          <Resizer
            direction="horizontal"
            onResize={(delta) => {
              setSidePanelWidth((prev) => {
                const newWidth = prev + delta;
                // 150px 이하로 줄어들면 사이드바 자동 접기
                if (newWidth < 150) {
                  setIsSidePanelOpen(false);
                  return prev;
                }
                return Math.max(200, Math.min(600, newWidth));
              });
            }}
          />
        )}

        {/* 중앙 에디터 영역 및 터미널 (수직 배치) */}
        <div className="main-content-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* 상단 뷰 (WelcomeScreen 또는 CodeEditor 또는 LoginScreen) */}
          <div style={{
            flex: 1,
            overflow: 'hidden',
            display: terminalHeight > window.innerHeight * 0.8 ? 'none' : 'flex',
            flexDirection: 'column'
          }}>
            {isLoginModalOpen ? (
              <LoginScreen />
            ) : (!workspaceDir && primaryFiles.length === 0 && secondaryFiles.length === 0 && !isSplitView) || forceShowWelcome ? (
              <WelcomeScreen
                onOpenProject={() => {
                  setForceShowWelcome(false);
                  handleOpenFolder();
                }}
                onCloneRepo={() => {
                  setForceShowWelcome(false);
                  handleCloneRepo();
                }}
                onConnectSSH={() => {
                  if (isRemoteWorkspace) {
                    setDisconnectConfirmOpen(true);
                  } else {
                    setForceShowWelcome(false);
                    setIsSSHModalOpen(true);
                  }
                }}
                isRemote={isRemoteWorkspace}
                remoteUser={remoteUser}
                onLogin={handleLogin}
                recents={recentProjects}
                onOpenRecent={handleOpenRecent}
                onRemoveRecent={handleRemoveRecent}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
                {/* Primary Editor Pane */}
                <div style={{ flex: isSplitView ? editorSplitRatio : 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <EditorPane
                    files={primaryFiles}
                    activeIndex={primaryActiveIndex}
                    onFileSelect={setPrimaryActiveIndex}
                    onContentChange={handlePrimaryContentChange}
                    onCloseTab={(idx) => handleCloseTabInternal(idx, 'primary')}
                    onCloseOthers={(idx) => handleCloseOthersInternal(idx, 'primary')}
                    onCloseToRight={(idx) => handleCloseToRightInternal(idx, 'primary')}
                    onCloseAll={() => handleCloseAllInternal('primary')}
                    onSave={(idx) => handleFileSaveInternal(idx, 'primary')}
                    onReorderTabs={(from, to) => handleReorderTabsInternal(from, to, 'primary')}
                    onMoveToOtherGroup={() => handleMoveToOtherGroup('primary')}
                    moveDirection="right"
                    settings={editorSettings}
                    onDiagnosticsChange={(errors, warnings, markers) => setDiagnostics({ errors, warnings, markers })}
                    workspaceDir={workspaceDir || undefined}
                    isActive={activeGroup === 'primary'}
                    onFocus={() => setActiveGroup('primary')}
                    isSplitView={isSplitView}
                    onToggleSplit={handleToggleSplit}
                  />
                </div>

                {isSplitView && (
                  <>
                    <Resizer
                      direction="horizontal"
                      onResize={(delta) => {
                        // Calculate new ratio based on pixel delta
                        // Assuming container width is roughly window width - sidebars?
                        // Or use ref to get container width.
                        // For simplicity, let's just nudge percentages.
                        // Delta is in pixels.
                        setEditorSplitRatio(prev => {
                          const containerWidth = window.innerWidth - (isSidePanelOpen ? sidePanelWidth : 0) - (isAIPanelOpen ? aiPanelWidth : 0);
                          const ratioDelta = delta / containerWidth;
                          return Math.max(0.1, Math.min(0.9, prev + ratioDelta));
                        });
                      }}
                    />
                    {/* Secondary Editor Pane */}
                    <div style={{ flex: 1 - editorSplitRatio, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <EditorPane
                        files={secondaryFiles}
                        activeIndex={secondaryActiveIndex}
                        onFileSelect={setSecondaryActiveIndex}
                        onContentChange={handleSecondaryContentChange}
                        onCloseTab={(idx) => handleCloseTabInternal(idx, 'secondary')}
                        onCloseOthers={(idx) => handleCloseOthersInternal(idx, 'secondary')}
                        onCloseToRight={(idx) => handleCloseToRightInternal(idx, 'secondary')}
                        onCloseAll={() => handleCloseAllInternal('secondary')}
                        onSave={(idx) => handleFileSaveInternal(idx, 'secondary')}
                        onReorderTabs={(from, to) => handleReorderTabsInternal(from, to, 'secondary')}
                        onMoveToOtherGroup={() => handleMoveToOtherGroup('secondary')}
                        moveDirection="left"
                        settings={editorSettings}
                        workspaceDir={workspaceDir || undefined}
                        isActive={activeGroup === 'secondary'}
                        onFocus={() => setActiveGroup('secondary')}
                        isSplitView={isSplitView}
                        onToggleSplit={handleToggleSplit}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 하단 터미널 - 글로벌 영역 (Ctrl+J로 토글) - display:none으로 숨기기 (세션 유지) */}
          <div style={{ display: isTerminalOpen ? 'contents' : 'none' }}>
            <Resizer
              direction="vertical"
              onResize={(delta) => {
                setTerminalHeight((prev) => {
                  const newHeight = prev - delta;
                  // 80px 미만이면 터미널 닫기 (토글)
                  if (newHeight < 80) {
                    setTimeout(() => {
                      setIsTerminalOpen(false);
                      setTerminalHeight(250); // 다음에 열 때 기본 크기로 복원
                    }, 0);
                    return 250;
                  }
                  // 최소 100px 유지
                  return Math.max(100, newHeight);
                });
              }}
            />
            <div
              className="terminal-container"
              style={{
                height: terminalHeight > window.innerHeight * 0.8 ? '100%' : `${terminalHeight}px`,
                flex: terminalHeight > window.innerHeight * 0.8 ? 1 : 'none',
                flexShrink: 0,
                minHeight: '100px'
              }}
            >
              <TerminalPanel
                onClose={() => setIsTerminalOpen(false)}
                onMaximize={handleToggleTerminalMaximize}
                isMaximized={terminalHeight > window.innerHeight * 0.8}
                cwd={isRemoteWorkspace ? undefined : (workspaceDir || undefined)}
                isRemote={isRemoteWorkspace}
                remoteCwd={isRemoteWorkspace && workspaceDir ? workspaceDir : undefined}
                diagnostics={diagnostics}
              />
            </div>
          </div>

        </div>

        {/* 오른쪽 AI 패널 (Ctrl+L로 토글) */}
        <div style={{ display: 'flex' }}>
          <div style={{
            width: isAIPanelOpen ? '4px' : '0px',
            overflow: 'hidden',
            transition: 'width 0.2s ease',
            opacity: isAIPanelOpen ? 1 : 0
          }}>
            <Resizer
              direction="horizontal"
              onResize={(delta) => {
                setAIPanelWidth((prev) => {
                  const newWidth = prev - delta;
                  if (newWidth < 250) {
                    setTimeout(() => setIsAIPanelOpen(false), 0);
                    return 300;
                  }
                  return Math.max(300, Math.min(800, newWidth));
                });
              }}
            />
          </div>

          <div
            className="ai-panel-container"
            style={{
              width: isAIPanelOpen ? `${aiPanelWidth}px` : '0px',
              minWidth: isAIPanelOpen ? '300px' : '0px'
            }}
          >
            <AIPanel
              onClose={() => setIsAIPanelOpen(false)}
              projectName={workspaceDir ? workspaceDir.split('/').pop() : undefined}
              workspacePath={workspaceDir || undefined}
              onFileSystemChange={handleForceRefresh}
              onCloseFile={handleFileDelete}
            />
          </div>
        </div>
      </div>

      {/* 하단 상태바 */}
      <footer className="app-footer">
        <div className="status-left">
          <div className="remote-button" onClick={() => isRemoteWorkspace ? setDisconnectConfirmOpen(true) : setIsSSHModalOpen(true)} data-tooltip={isRemoteWorkspace ? `Remote: ${remoteUser} (클릭으로 연결 해제)` : 'SSH Connection'} data-tooltip-pos="top">
            <ActivityIcon size={14} />
            {isRemoteWorkspace && <span style={{ marginLeft: '4px', fontSize: '11px' }}>Remote</span>}
          </div>



          {currentBranch && (
            <div className="status-item clickable">
              <GitIcon size={12} />
              <span>{currentBranch}</span>
            </div>
          )}

          <div
            className="status-item clickable"
            style={{ gap: '8px', marginLeft: '8px' }}
            data-tooltip="Errors & Warnings"
            data-tooltip-pos="top"
            onClick={() => {
              setIsTerminalOpen(true);
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('gluon:open-problems'));
              }, 50);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f07178' }}>
              <ErrorIcon size={14} />
              <span>{diagnostics.errors}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffcb6b' }}>
              <WarningIcon size={14} />
              <span>{diagnostics.warnings}</span>
            </div>
          </div>
        </div>
        <div className="status-right">
          <div className="status-item zoom-container">
            {zoomMenuOpen && (
              <div className="zoom-menu" onMouseLeave={() => setZoomMenuOpen(false)}>
                <button
                  className="zoom-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyZoom(zoomLevel - 0.1);
                  }}
                  data-tooltip="축소"
                  data-tooltip-pos="top"
                >
                  <MinusIcon size={14} />
                </button>

                <span className="zoom-value-text" style={{ minWidth: '35px', textAlign: 'center' }}>
                  {(() => {
                    const step = Math.round((zoomLevel - BASE_ZOOM) / ZOOM_STEP);
                    return step > 0 ? `+${step}` : `${step}`;
                  })()}
                </span>

                <button
                  className="zoom-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyZoom(zoomLevel + 0.1);
                  }}
                  data-tooltip="확대"
                  data-tooltip-pos="top"
                >
                  <PlusIcon size={14} />
                </button>

                <div className="zoom-divider"></div>

                <button
                  className="zoom-reset-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyZoom(1.0);
                  }}
                  data-tooltip="초기화"
                  data-tooltip-pos="top"
                >
                  Reset
                </button>
              </div>
            )}
            <div
              onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
              data-tooltip="화면 확대/축소"
              data-tooltip-pos="top"
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <ZoomInIcon size={14} />
            </div>
          </div>
          {activeFileIndex >= 0 && openFiles[activeFileIndex] && (
            <>
              <div className="status-item clickable">
                <span className="status-value">
                  {getFileLanguage(openFiles[activeFileIndex].path)}
                </span>
              </div>
              <div className="status-item clickable">
                <span className="status-value">UTF-8</span>
              </div>
              <div className="status-item clickable">
                <span className="status-value">LF</span>
              </div>
              <div className="status-item clickable">
                <span className="status-value">Spaces: 2</span>
              </div>
            </>
          )}

          {/* Python Interpreter Status */}
          <div
            className="status-item clickable"
            onClick={() => setIsInterpreterSelectorOpen(true)}
            data-tooltip="Select Python Interpreter"
            data-tooltip-pos="top"
          >
            <span className="status-value" style={{ color: '#F1D646' }}>
              {selectedInterpreter ? `Python ${selectedInterpreter.split('/').slice(-3).join('/')}` : 'Select Python'}
            </span>
          </div>


        </div>
      </footer>

      {
        settingsOpen && (
          <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
            <SettingsPanel
              onClose={() => {
                setSettingsOpen(false);
                loadShortcuts();
                loadEditorSettings();
              }}
              onOpenSettingsJson={async (filePath: string) => {
                // Read the settings.json file content
                const result = await window.electron.fs.readFile(filePath);
                if (result.success && result.content) {
                  // Add the file to openFiles
                  setOpenFiles((prev) => {
                    // Check if file is already open
                    const existingIndex = prev.findIndex((f) => f.path === filePath);
                    if (existingIndex >= 0) {
                      setActiveFileIndex(existingIndex);
                      return prev;
                    }
                    // Add new file
                    const newFiles: OpenFile[] = [...prev, { path: filePath, content: result.content as string, isDirty: false }];
                    setActiveFileIndex(newFiles.length - 1);
                    return newFiles;
                  });
                }
              }}
            />
          </div>
        )
      }



      {
        showUnsavedModal && (
          <UnsavedChangesModal
            files={unsavedFilesForModal}
            onAction={handleUnsavedModalAction}
          />
        )
      }

      {
        isSSHModalOpen && (
          <SSHConnectionModal
            onConnect={handleSSHConnect}
            onCancel={() => setIsSSHModalOpen(false)}
          />
        )
      }

      {/* 프로젝트 닫기 확인 모달 */}
      {showCloseProjectModal && (
        <div className="modal-overlay" onClick={() => setShowCloseProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>프로젝트 닫기</h3>
            <p>프로젝트를 닫으시겠습니까?</p>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="modal-btn cancel" onClick={() => setShowCloseProjectModal(false)}>취소</button>
              <button className="modal-btn primary" onClick={doCloseProject}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 연결 해제 확인 모달 */}
      {disconnectConfirmOpen && (
        <div className="modal-overlay" onClick={() => setDisconnectConfirmOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>SSH 연결 해제</h3>
            <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', color: '#a6adc8' }}>
              {remoteUser}@{workspaceDir} 연결을 해제하시겠습니까?
            </p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="modal-btn cancel" onClick={() => setDisconnectConfirmOpen(false)}>취소</button>
              <button className="modal-btn primary" style={{ background: '#f38ba8' }} onClick={() => {
                setDisconnectConfirmOpen(false);
                setIsRemoteWorkspace(false);
                setWorkspaceDir(null);
                setOpenFiles([]);
                setActiveFileIndex(-1);
                setDiagnostics({ errors: 0, warnings: 0, markers: [] });
                setRemoteUser('');
                setIsTerminalOpen(false);
                window.dispatchEvent(new Event('terminal-close-all'));
                window.electron.ssh.disconnect();
              }}>연결 해제</button>
            </div>
          </div>
        </div>
      )}

      {/* 인앱 알림 모달 */}
      {alertMessage && (
        <div className="modal-overlay" onClick={() => setAlertMessage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>{alertMessage}</p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="modal-btn primary" onClick={() => setAlertMessage(null)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 인앱 파일 브라우저 */}
      {fileBrowserOpen && (
        <InAppFileBrowser
          mode={fileBrowserMode}
          remote={fileBrowserRemote}
          initialPath={fileBrowserInitialPath}
          onSelect={handleFileBrowserSelect}
          onCancel={handleFileBrowserCancel}
        />
      )}
      {/* Login Modal removed */}

      <InterpreterSelector
        isOpen={isInterpreterSelectorOpen}
        onClose={() => setIsInterpreterSelectorOpen(false)}
        onSelect={(path) => {
          setSelectedInterpreter(path);
          // Optional: Save to store or notify user
          console.log('Selected interpreter:', path);
        }}
        currentPath={selectedInterpreter}
      />
    </div >
  );
}

export default App;
