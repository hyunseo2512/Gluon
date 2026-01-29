export interface KeyBinding {
    id: string;
    command: string;
    description: string;
    defaultKey: string;
    currentKey: string;
}

export const DEFAULT_SHORTCUTS: KeyBinding[] = [
    {
        id: 'sidebar.toggle',
        command: 'toggleSidebar',
        description: 'Toggle Side Panel',
        defaultKey: 'Ctrl+B',
        currentKey: 'Ctrl+B'
    },
    {
        id: 'terminal.toggle',
        command: 'toggleTerminal',
        description: 'Toggle Terminal',
        defaultKey: 'Ctrl+J',
        currentKey: 'Ctrl+J'
    },
    {
        id: 'ai.toggle',
        command: 'toggleAIPanel',
        description: 'Toggle AI Panel',
        defaultKey: 'Ctrl+L',
        currentKey: 'Ctrl+L'
    },
    {
        id: 'file.save',
        command: 'saveFile',
        description: 'Save File',
        defaultKey: 'Ctrl+S',
        currentKey: 'Ctrl+S'
    },
    {
        id: 'view.zoomIn',
        command: 'zoomIn',
        description: 'Zoom In',
        defaultKey: 'Ctrl+=',
        currentKey: 'Ctrl+='
    },
    {
        id: 'view.zoomOut',
        command: 'zoomOut',
        description: 'Zoom Out',
        defaultKey: 'Ctrl+-',
        currentKey: 'Ctrl+-'
    },
    {
        id: 'view.zoomReset',
        command: 'zoomReset',
        description: 'Reset Zoom',
        defaultKey: 'Ctrl+0',
        currentKey: 'Ctrl+0'
    }
];
