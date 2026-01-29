export { };

declare global {
    interface Window {
        electron: {
            python: {
                getVersion: () => Promise<string>;
                run: (script: string) => Promise<{ success: boolean; output: string; error?: string }>;
            };

            // Existing API definitions (partial)
            ipcRenderer: {
                sendMessage(channel: string, args: unknown[]): void;
                on(channel: string, func: (...args: unknown[]) => void): (() => void) | undefined;
                once(channel: string, func: (...args: unknown[]) => void): void;
                invoke(channel: string, ...args: unknown[]): Promise<any>;
            };
            store: {
                get: (key: string) => Promise<any>;
                set: (key: string, value: any) => Promise<void>;
            };
            dialog: {
                openDirectory: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
                openFile: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
                saveFile: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
                showMessageBox: (options: any) => Promise<{ success: boolean; response: number }>;
            };
            fs: {
                readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
                writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
                readDir: (path: string) => Promise<{ success: boolean; files?: { name: string; path: string; isDirectory: boolean }[]; error?: string }>;
                createFile: (path: string, content?: string) => Promise<{ success: boolean; error?: string }>;
                createDir: (path: string) => Promise<{ success: boolean; error?: string }>;
                rename: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
                delete: (path: string) => Promise<{ success: boolean; error?: string }>;
                copy: (source: string, destination: string) => Promise<{ success: boolean; error?: string }>;
                exists: (path: string) => Promise<{ success: boolean; exists: boolean }>;
            };
            ssh: any; // Type as needed
            git: any; // Type as needed
            shell: {
                openExternal: (url: string) => Promise<void>;
            };
            terminal: any; // Type as needed
        };
    }
}
