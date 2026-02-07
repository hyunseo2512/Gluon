import { useState, useEffect } from 'react';
import { XIcon, SettingsIcon } from './Icons';
import { KeyBinding, DEFAULT_SHORTCUTS } from '../types/shortcuts';
import { EditorSettings, DEFAULT_EDITOR_SETTINGS } from '../types/settings';
import '../styles/SettingsPanel.css';

interface SettingsPanelProps {
  onClose: () => void;
  onOpenSettingsJson?: (filePath: string) => void;
}

type SettingsTab = 'editor' | 'github' | 'eden' | 'shortcuts';

function SettingsPanel({ onClose, onOpenSettingsJson }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('editor');
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);
  const [githubSettings, setGithubSettings] = useState({
    username: '',
    token: ''
  });
  const [edenSettings, setEdenSettings] = useState({
    serverUrl: 'https://quark.panthera-karat.ts.net:8000'
  });
  const [shortcuts, setShortcuts] = useState<KeyBinding[]>(DEFAULT_SHORTCUTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      // settings.json에서 에디터 설정 읽기
      try {
        const result = await window.electron.settings.read();
        if (result.success && result.data) {
          const jsonSettings = result.data as Record<string, unknown>;
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
      } catch (e) {
        console.error('Failed to load settings.json:', e);
      }

      const user = await window.electron.store.get('github_username');
      const token = await window.electron.store.get('github_token');
      const serverUrl = await window.electron.store.get('eden_server_url');
      const savedShortcuts = await window.electron.store.get('key_bindings');

      setGithubSettings({
        username: user.success && user.value ? String(user.value) : '',
        token: token.success && token.value ? String(token.value) : ''
      });

      if (serverUrl.success && serverUrl.value) {
        setEdenSettings({ serverUrl: String(serverUrl.value) });
      }

      if (savedShortcuts.success && Array.isArray(savedShortcuts.value)) {
        const merged = DEFAULT_SHORTCUTS.map(def => {
          const saved = (savedShortcuts.value as KeyBinding[]).find((s: KeyBinding) => s.id === def.id);
          return saved ? { ...def, currentKey: saved.currentKey } : def;
        });
        setShortcuts(merged);
      }

      // 초기 로딩 완료 - 이제 저장 허용
      setIsInitialLoad(false);
    };
    loadSettings();
  }, []);

  // settings.json에 저장 (초기 로딩 시 건너뛰기)
  useEffect(() => {
    if (isInitialLoad) return; // 초기 로딩 시 저장 안함

    const jsonSettings = {
      'editor.fontSize': editorSettings.fontSize,
      'editor.fontFamily': editorSettings.fontFamily,
      'editor.fontLigatures': editorSettings.fontLigatures,
      'editor.tabSize': editorSettings.tabSize,
      'editor.insertSpaces': editorSettings.insertSpaces,
      'editor.wordWrap': editorSettings.wordWrap,
      'editor.minimap': editorSettings.minimap,
      'editor.lineNumbers': editorSettings.lineNumbers,
      'editor.theme': editorSettings.theme,
      'editor.formatOnSave': editorSettings.formatOnSave,
      'editor.defaultFormatter': editorSettings.defaultFormatter,
    };
    window.electron.settings.write(jsonSettings);
  }, [editorSettings, isInitialLoad]);

  useEffect(() => {
    window.electron.store.set('key_bindings', shortcuts);
  }, [shortcuts]);

  const handleEditorSettingChange = (key: keyof EditorSettings, value: any) => {
    setEditorSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

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

    setShortcuts(prev => prev.map(s => s.id === id ? { ...s, currentKey: combo } : s));
    setEditingId(null);
  };

  const handleGithubSave = async () => {
    await window.electron.store.set('github_username', githubSettings.username);
    await window.electron.store.set('github_token', githubSettings.token);
    alert('GitHub 설정이 저장되었습니다.');
  };

  return (
    <div className="settings-panel" onClick={onClose}>
      <div className="settings-panel-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon size={16} />
            <h2>Settings</h2>
          </div>
          <button className="settings-close" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
          <button
            className={`settings-tab ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            GitHub
          </button>
          <button
            className={`settings-tab ${activeTab === 'eden' ? 'active' : ''}`}
            onClick={() => setActiveTab('eden')}
          >
            Quark
          </button>
          <button
            className={`settings-tab ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            Key Bindings
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="settings-content">
          {activeTab === 'shortcuts' && (
            <div className="settings-section">
              <h3>Key Bindings</h3>
              <div className="shortcuts-list">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="shortcut-item">
                    <div className="shortcut-description">
                      <span className="setting-label">{shortcut.description}</span>
                    </div>
                    <div
                      className={`shortcut-key ${editingId === shortcut.id ? 'editing' : ''}`}
                      onClick={() => setEditingId(shortcut.id)}
                      onKeyDown={(e) => editingId === shortcut.id && handleKeyDown(e, shortcut.id)}
                      tabIndex={0}
                    >
                      {editingId === shortcut.id ? 'Press keys...' : shortcut.currentKey}
                    </div>
                    {shortcut.currentKey !== shortcut.defaultKey && (
                      <button
                        className="shortcut-reset-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShortcuts(prev => prev.map(s => s.id === shortcut.id ? { ...s, currentKey: s.defaultKey } : s));
                        }}
                        title="Reset to default"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="shortcut-reset-all-btn"
                  onClick={() => {
                    setShortcuts(DEFAULT_SHORTCUTS.map(s => ({ ...s })));
                  }}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  Reset All to Defaults
                </button>
              </div>
            </div>
          )}

          {activeTab === 'eden' && (
            <div className="settings-section">
              <h3>Quark Configuration</h3>
              <div className="setting-item">
                <label>
                  <span className="setting-label">Quark Server URL</span>
                </label>
                <input
                  type="text"
                  value={edenSettings.serverUrl}
                  onChange={(e) => setEdenSettings({ ...edenSettings, serverUrl: e.target.value })}
                  placeholder="https://api.eden.ai"
                />
              </div>
              <div className="setting-actions">
                <button
                  className="save-button"
                  onClick={async () => {
                    let urlToSave = edenSettings.serverUrl;
                    try {
                      const urlObj = new URL(urlToSave);
                      urlToSave = urlObj.origin;
                      setEdenSettings({ ...edenSettings, serverUrl: urlToSave });
                    } catch (e) {
                      urlToSave = urlToSave.replace(/\/$/, '');
                      if (!urlToSave.startsWith('http')) {
                        urlToSave = `https://${urlToSave}`;
                      }
                    }

                    await window.electron.store.set('eden_server_url', urlToSave);
                    alert(`Eden Server URL saved: ${urlToSave}`);
                  }}
                >
                  Save Configuration
                </button>
              </div>

              <div className="setting-divider" style={{ margin: '20px 0', borderBottom: '1px solid #3c3c3c' }}></div>

              <h3>Manual Authentication</h3>
              <div className="setting-item">
                <label>
                  <span className="setting-label">Auth Token</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste your token here..."
                  onChange={async (e) => { }}
                  id="manual-token-input"
                />
              </div>
              <div className="setting-actions">
                <button
                  className="save-button"
                  onClick={async () => {
                    const input = document.getElementById('manual-token-input') as HTMLInputElement;
                    const token = input.value.trim();

                    if (!token) {
                      alert('Please enter a valid token.');
                      return;
                    }

                    try {
                      await window.electron.store.set('token', token);
                      const { useAuthStore } = await import('../store/authStore');
                      await useAuthStore.getState().checkAuth();

                      const currentUser = useAuthStore.getState().user;

                      if (currentUser) {
                        alert(`Login Successful! Welcome, ${currentUser.full_name || currentUser.email}`);
                        onClose();
                      } else {
                        const state = useAuthStore.getState();
                        const serverUrl = state.backendUrl || 'Unknown URL';
                        const errorMsg = state.authError || 'Unknown Network Error';

                        alert(`Login Failed!\n\nError Details: ${errorMsg}\n\nServer URL: ${serverUrl}\n\nPlease verify:\n1. The server is running (port 8000)\n2. The URL in settings is correct`);
                      }
                    } catch (error: any) {
                      console.error(error);
                      alert(`System Error: ${error.message}`);
                    }
                  }}
                >
                  Login with Token
                </button>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="settings-section">
              <h3>Editor Settings</h3>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Font Size</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="30"
                  value={editorSettings.fontSize}
                  onChange={(e) => handleEditorSettingChange('fontSize', parseInt(e.target.value))}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Tab Size</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={editorSettings.tabSize}
                  onChange={(e) => handleEditorSettingChange('tabSize', parseInt(e.target.value))}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Insert Spaces</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.insertSpaces}
                  onChange={(e) => handleEditorSettingChange('insertSpaces', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Word Wrap</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.wordWrap}
                  onChange={(e) => handleEditorSettingChange('wordWrap', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Minimap</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.minimap}
                  onChange={(e) => handleEditorSettingChange('minimap', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Line Numbers</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.lineNumbers}
                  onChange={(e) => handleEditorSettingChange('lineNumbers', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Theme</span>
                </label>
                <select
                  value={editorSettings.theme}
                  onChange={(e) => handleEditorSettingChange('theme', e.target.value)}
                >
                  <option value="gluon">Gluon</option>
                </select>
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Format On Save</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.formatOnSave}
                  onChange={(e) => handleEditorSettingChange('formatOnSave', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <label>
                  <span className="setting-label">Default Formatter</span>
                </label>
                <select
                  value={editorSettings.defaultFormatter}
                  onChange={(e) => handleEditorSettingChange('defaultFormatter', e.target.value)}
                >
                  <option value="none">None</option>
                </select>
              </div>

              {/* Divider */}
              <div className="setting-divider" style={{ margin: '20px 0', borderBottom: '1px solid var(--border-color)' }}></div>

              {/* Open Settings JSON Button */}
              <div className="setting-item" style={{ justifyContent: 'flex-start' }}>
                <button
                  className="save-button"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                  onClick={async () => {
                    if (onOpenSettingsJson) {
                      const settingsPath = await window.electron.settings.getPath();
                      onOpenSettingsJson(settingsPath);
                      onClose();
                    }
                  }}
                >
                  Open Settings (JSON)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="settings-section">
              <h3>GitHub Integration</h3>
              <div className="setting-item">
                <label>
                  <span className="setting-label">Username</span>
                </label>
                <input
                  type="text"
                  value={githubSettings.username || ''}
                  onChange={(e) => setGithubSettings({ ...githubSettings, username: e.target.value })}
                  placeholder="GitHub Username"
                />
              </div>
              <div className="setting-item">
                <label>
                  <span className="setting-label">Personal Access Token</span>
                </label>
                <input
                  type="password"
                  value={githubSettings.token || ''}
                  onChange={(e) => setGithubSettings({ ...githubSettings, token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="input-password"
                />
              </div>
              <div className="setting-actions">
                <button className="save-button" onClick={handleGithubSave}>Save Configuration</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}

export default SettingsPanel;
