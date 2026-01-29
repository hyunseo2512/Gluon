import { contextBridge, ipcRenderer } from 'electron';

console.log('✅ Preload script loaded');

/**
 * Electron API를 렌더러 프로세스에 안전하게 노출
 */
contextBridge.exposeInMainWorld('electron', {
  // 파일 시스템 작업
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
    createFile: (filePath: string, content?: string) =>
      ipcRenderer.invoke('fs:createFile', filePath, content),
    createDir: (dirPath: string) =>
      ipcRenderer.invoke('fs:createDir', dirPath),
    rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    exists: (pathToCheck: string) => ipcRenderer.invoke('fs:exists', pathToCheck),
    delete: (filePath: string) => ipcRenderer.invoke('fs:delete', filePath),
    copy: (source: string, destination: string) => ipcRenderer.invoke('fs:copy', source, destination),
  },

  // 다이얼로그
  dialog: {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    saveFile: () => ipcRenderer.invoke('dialog:saveFile'),
    showMessageBox: (options: any) => ipcRenderer.invoke('dialog:showMessageBox', options),
  },

  // 터미널 (탭 지원)
  terminal: {
    start: (terminalId: string, shellType?: string, cols?: number, rows?: number, cwd?: string) => ipcRenderer.invoke('terminal:start', terminalId, shellType, cols, rows, cwd),
    resize: (terminalId: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', terminalId, cols, rows),
    write: (terminalId: string, data: string) => ipcRenderer.send('terminal:write', terminalId, data),
    kill: (terminalId: string) => ipcRenderer.invoke('terminal:kill', terminalId),
    onData: (callback: (terminalId: string, data: string) => void) => {
      const listener = (_event: any, terminalId: string, data: string) => callback(terminalId, data);
      ipcRenderer.on('terminal:data', listener);
      return () => ipcRenderer.removeListener('terminal:data', listener);
    },
    onExit: (callback: (terminalId: string, code: number) => void) => {
      const listener = (_event: any, terminalId: string, code: number) => callback(terminalId, code);
      ipcRenderer.on('terminal:exit', listener);
      return () => ipcRenderer.removeListener('terminal:exit', listener);
    }
  },

  // 창 제어
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    create: () => ipcRenderer.invoke('window:create'),
  },

  // 줌 제어
  zoom: {
    setZoomLevel: (level: number) => require('electron').webFrame.setZoomLevel(level),
    getZoomLevel: () => require('electron').webFrame.getZoomLevel(),
    setZoomFactor: (factor: number) => require('electron').webFrame.setZoomFactor(factor),
    getZoomFactor: () => require('electron').webFrame.getZoomFactor(),
  },

  // Linter
  linter: {
    check: (filePath: string) => ipcRenderer.invoke('linter:check', filePath),
  },

  // 시스템 정보
  platform: process.platform,

  // 설정 저장소
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },

  // 앱 정보/경로
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },

  // 인증 이벤트
  auth: {
    onSuccess: (callback: (token: string) => void) => {
      const listener = (_event: any, { token }: any) => callback(token);
      ipcRenderer.on('auth:success', listener);
      return () => ipcRenderer.removeListener('auth:success', listener);
    },
    verify: (token: string, backendUrl: string) => ipcRenderer.invoke('auth:verify', token, backendUrl),
  },

  // 쉘 기능
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },

  // Git 기능
  git: {
    init: (workingDir: string) => ipcRenderer.invoke('git:init', workingDir),
    status: (workingDir: string) => ipcRenderer.invoke('git:status', workingDir),
    add: (workingDir: string, files: string[]) => ipcRenderer.invoke('git:add', workingDir, files),
    commit: (workingDir: string, message: string) => ipcRenderer.invoke('git:commit', workingDir, message),
    push: (workingDir: string) => ipcRenderer.invoke('git:push', workingDir),
    pull: (workingDir: string) => ipcRenderer.invoke('git:pull', workingDir),
    clone: (url: string, targetDir: string) => ipcRenderer.invoke('git:clone', url, targetDir),
    branch: (workingDir: string) => ipcRenderer.invoke('git:branch', workingDir),
    branchCreate: (workingDir: string, branchName: string) => ipcRenderer.invoke('git:branch-create', workingDir, branchName),
    checkout: (workingDir: string, branchName: string) => ipcRenderer.invoke('git:checkout', workingDir, branchName),
    diff: (workingDir: string, filePath: string) => ipcRenderer.invoke('git:diff', workingDir, filePath),
    log: (workingDir: string) => ipcRenderer.invoke('git:log', workingDir),
    show: (workingDir: string, filePath: string) => ipcRenderer.invoke('git:show', workingDir, filePath),
  },

  // Search functionality
  search: {
    text: (workingDir: string, query: string) => ipcRenderer.invoke('search:text', workingDir, query),
  },

  // Extensions functionality
  extensions: {
    install: (toolId: string, packageManager: 'npm' | 'pip') => ipcRenderer.invoke('extensions:install', toolId, packageManager),
    uninstall: (toolId: string, packageManager: 'npm' | 'pip') => ipcRenderer.invoke('extensions:uninstall', toolId, packageManager),
    check: (command: string) => ipcRenderer.invoke('extensions:check', command),
  },

  // SSH functionality
  ssh: {
    connect: (config: any) => ipcRenderer.invoke('ssh:connect', config),
    disconnect: () => ipcRenderer.invoke('ssh:disconnect'),
    startShell: (terminalId: string) => ipcRenderer.invoke('ssh:start-shell', terminalId),
    write: (data: string) => ipcRenderer.invoke('ssh:write', data),
    resize: (cols: number, rows: number) => ipcRenderer.invoke('ssh:resize', cols, rows),
  },

  // Chat Stream Proxy
  chat: {
    startStream: (streamId: string, url: string, body: any, headers: any) => ipcRenderer.invoke('chat:stream-start', streamId, url, body, headers),
    stopStream: (streamId: string) => ipcRenderer.invoke('chat:stream-stop', streamId),
    onData: (callback: (streamId: string, data: string) => void) => {
      const listener = (_event: any, streamId: string, data: string) => callback(streamId, data);
      ipcRenderer.on('chat:stream-data', listener);
      return () => ipcRenderer.removeListener('chat:stream-data', listener);
    },
    onEnd: (callback: (streamId: string) => void) => {
      const listener = (_event: any, streamId: string) => callback(streamId);
      ipcRenderer.on('chat:stream-end', listener);
      return () => ipcRenderer.removeListener('chat:stream-end', listener);
    },
    onError: (callback: (streamId: string, error: string) => void) => {
      const listener = (_event: any, streamId: string, error: string) => callback(streamId, error);
      ipcRenderer.on('chat:stream-error', listener);
      return () => ipcRenderer.removeListener('chat:stream-error', listener);
    }
  },

  python: {
    getVersion: () => ipcRenderer.invoke('python:get-version'),
    run: (script: string) => ipcRenderer.invoke('python:run', script),
  },
});

/**
 * TypeScript 타입 정의를 위한 전역 인터페이스
 */
declare global {
  interface Window {
    electron: {
      fs: {
        readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
        readDir: (dirPath: string) => Promise<{ success: boolean; files?: any[]; error?: string }>;
        createFile: (filePath: string, content?: string) => Promise<{ success: boolean; error?: string }>;
        createDir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
        rename: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
        exists: (pathToCheck: string) => Promise<{ success: boolean; exists?: boolean; error?: string }>;
        delete: (filePath: string) => Promise<{ success: boolean; error?: string }>;
        copy: (source: string, destination: string) => Promise<{ success: boolean; error?: string }>;
      };
      dialog: {
        openDirectory: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
        openFile: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
        saveFile: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
        showMessageBox: (options: any) => Promise<{ success: boolean; response?: number; error?: string }>;
      };
      terminal: {
        start: (terminalId: string, shellType?: string, cols?: number, rows?: number, cwd?: string) => Promise<{ success: boolean; terminalId?: string; error?: string }>;
        resize: (terminalId: string, cols: number, rows: number) => Promise<{ success: boolean; error?: string }>;
        write: (terminalId: string, data: string) => void;
        kill: (terminalId: string) => Promise<{ success: boolean; error?: string }>;
        onData: (callback: (terminalId: string, data: string) => void) => () => void;
        onExit: (callback: (terminalId: string, code: number) => void) => () => void;
      };
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        create: () => Promise<void>;
      };
      zoom: {
        setZoomLevel: (level: number) => void;
        getZoomLevel: () => number;
        setZoomFactor: (factor: number) => void;
        getZoomFactor: () => number;
      };
      platform: string;
      app: {
        getPath: (name: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      };
      store: {
        get: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>;
        set: (key: string, value: any) => Promise<{ success: boolean; error?: string }>;
        delete: (key: string) => Promise<{ success: boolean; error?: string }>;
      };
      auth: {
        onSuccess: (callback: (token: string) => void) => () => void;
        verify: (token: string, backendUrl: string) => Promise<{ success: boolean; user?: any; error?: string; status?: number }>;
      };
      shell: {
        openExternal: (url: string) => Promise<void>;
      };
      git: {
        init: (workingDir: string) => Promise<{ success: boolean; isRepo?: boolean; error?: string }>;
        status: (workingDir: string) => Promise<{ success: boolean; status?: any; error?: string }>;
        add: (workingDir: string, files: string[]) => Promise<{ success: boolean; error?: string }>;
        commit: (workingDir: string, message: string) => Promise<{ success: boolean; error?: string }>;
        push: (workingDir: string) => Promise<{ success: boolean; result?: any; error?: string }>;
        pull: (workingDir: string) => Promise<{ success: boolean; result?: any; error?: string }>;
        clone: (url: string, targetDir: string) => Promise<{ success: boolean; error?: string }>;
        branch: (workingDir: string) => Promise<{ success: boolean; branches?: any; error?: string }>;
        branchCreate: (workingDir: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
        checkout: (workingDir: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
        diff: (workingDir: string, filePath: string) => Promise<{ success: boolean; original?: string; error?: string }>;
        log: (workingDir: string) => Promise<{ success: boolean; log?: any; error?: string }>;
        show: (workingDir: string, filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      };
      search: {
        text: (workingDir: string, query: string) => Promise<{ success: boolean; results?: Array<{ file: string; isDirectory: boolean; name: string }>; error?: string }>;
      };
      extensions: {
        install: (toolId: string, packageManager: 'npm' | 'pip') => Promise<{ success: boolean; output?: string; error?: string }>;
        uninstall: (toolId: string, packageManager: 'npm' | 'pip') => Promise<{ success: boolean; output?: string; error?: string }>;
        check: (command: string) => Promise<{ success: boolean; installed: boolean; version?: string }>;
      };
      ssh: {
        connect: (config: any) => Promise<{ success: boolean; error?: string }>;
        disconnect: () => Promise<{ success: boolean; error?: string }>;
        startShell: (terminalId: string) => Promise<{ success: boolean; error?: string }>;
        write: (data: string) => void;
        resize: (cols: number, rows: number) => void;
      };
      chat: {
        startStream: (streamId: string, url: string, body: any, headers: any) => Promise<{ success: boolean; error?: string }>;
        stopStream: (streamId: string) => Promise<{ success: boolean }>;
        onData: (callback: (streamId: string, data: string) => void) => () => void;
        onEnd: (callback: (streamId: string) => void) => () => void;
        onError: (callback: (streamId: string, error: string) => void) => () => void;
      };
    };
  }
}
