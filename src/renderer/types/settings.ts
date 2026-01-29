export interface EditorSettings {
    fontSize: number;
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
    theme: string;
    formatOnSave: boolean;
    defaultFormatter: string;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: false,
    minimap: false,
    lineNumbers: true,
    theme: 'vs-dark',
    formatOnSave: false,
    defaultFormatter: 'default', // 'default' (Monaco), 'prettier', 'none'
};
