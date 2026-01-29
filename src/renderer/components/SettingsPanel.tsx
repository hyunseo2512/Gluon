import { useState, useEffect } from 'react';
import { XIcon, SettingsIcon } from './Icons';
import { KeyBinding, DEFAULT_SHORTCUTS } from '../types/shortcuts';
import { EditorSettings, DEFAULT_EDITOR_SETTINGS } from '../types/settings';
import '../styles/SettingsPanel.css';

interface SettingsPanelProps {
  onClose: () => void;
}

type SettingsTab = 'editor' | 'extensions' | 'github' | 'eden' | 'shortcuts';

interface Extension {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  installed: boolean;
}

const AVAILABLE_EXTENSIONS: Extension[] = [
  {
    id: 'prettier',
    name: 'Prettier',
    description: 'Code formatter using prettier',
    enabled: false,
    installed: false,
  },
  {
    id: 'eslint',
    name: 'ESLint',
    description: 'JavaScript linter',
    enabled: false,
    installed: false,
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python language support',
    enabled: false,
    installed: false,
  },
  {
    id: 'rust',
    name: 'Rust',
    description: 'Rust language support',
    enabled: false,
    installed: false,
  },
];

function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('editor');
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);
  const [githubSettings, setGithubSettings] = useState({
    username: '',
    token: ''
  });
  const [edenSettings, setEdenSettings] = useState({
    serverUrl: 'https://quark.panthera-karat.ts.net:8000'
  });
  const [extensions, setExtensions] = useState<Extension[]>(AVAILABLE_EXTENSIONS);
  const [shortcuts, setShortcuts] = useState<KeyBinding[]>(DEFAULT_SHORTCUTS);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // 저장된 설정 불러오기
    const loadSettings = async () => {
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
    };
    loadSettings();
  }, []);

  // Save editor settings whenever they change
  useEffect(() => {
    window.electron.store.set('editor_settings', editorSettings);
  }, [editorSettings]);

  // Save extension settings whenever they change
  useEffect(() => {
    window.electron.store.set('extensions', extensions);
  }, [extensions]);

  const handleEditorSettingChange = (key: keyof EditorSettings, value: any) => {
    setEditorSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const handleExtensionInstall = (id: string) => {
    setExtensions((prevExtensions) =>
      prevExtensions.map((ext) =>
        ext.id === id ? { ...ext, installed: !ext.installed, enabled: !ext.installed ? true : ext.enabled } : ext
      )
    );
  };

  const handleExtensionToggle = (id: string) => {
    setExtensions((prevExtensions) =>
      prevExtensions.map((ext) =>
        ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
      )
    );
  };

  useEffect(() => {
    window.electron.store.set('key_bindings', shortcuts);
  }, [shortcuts]);

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
            className={`settings-tab ${activeTab === 'extensions' ? 'active' : ''}`}
            onClick={() => setActiveTab('extensions')}
          >
            Extensions
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
            Quark AI
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
              <div className="shortcuts-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="setting-item" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <span className="setting-label">{shortcut.description}</span>
                    </div>
                    <div
                      className={`shortcut-key ${editingId === shortcut.id ? 'editing' : ''}`}
                      onClick={() => setEditingId(shortcut.id)}
                      onKeyDown={(e) => editingId === shortcut.id && handleKeyDown(e, shortcut.id)}
                      tabIndex={0}
                      style={{
                        padding: '4px 12px',
                        background: editingId === shortcut.id ? '#0e639c' : '#3c3c3c',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        minWidth: '80px',
                        textAlign: 'center',
                        color: 'white',
                        border: editingId === shortcut.id ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      {editingId === shortcut.id ? 'Press keys...' : shortcut.currentKey}
                    </div>
                    {shortcut.currentKey !== shortcut.defaultKey && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShortcuts(prev => prev.map(s => s.id === shortcut.id ? { ...s, currentKey: s.defaultKey } : s));
                        }}
                        style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: '#cccccc', cursor: 'pointer' }}
                        title="Reset to default"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'eden' && (
            <div className="settings-section">
              <h3>Quark AI Configuration</h3>
              <div className="setting-item">
                <label>
                  <span className="setting-label">Quark Server URL</span>
                  <span className="setting-description">Address of your Quark AI server (e.g., http://192.168.0.5:8000)</span>
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
                      // URL 정제 (Origin만 추출)
                      const urlObj = new URL(urlToSave);
                      urlToSave = urlObj.origin;
                      // 상태 업데이트 (UI에도 반영)
                      setEdenSettings({ ...edenSettings, serverUrl: urlToSave });
                    } catch (e) {
                      // 파싱 실패 시 기본 로직 (끝 슬래시 제거, http 추가)
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
                  <span className="setting-description">Paste the token from the browser login screen here</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste your token here..."
                  onChange={async (e) => {
                    // 입력 즉시 임시 저장 (State 불필요)
                    // 실제로는 버튼 누를 때 처리하는게 좋지만, 간단하게 구현
                    // 여기서는 state를 안 만들었으므로 input ref나 로컬 변수 필요하지만
                    // 간단히 value를 직접 다루거나, 아래 버튼 로직에서 prompt를 띄우는게 나을 수도 있음.
                    // 하지만 UX상 input이 좋음.
                  }}
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
                      // 1. 토큰 저장
                      await window.electron.store.set('token', token);
                      // 2. AuthStore 갱신 요청
                      const { useAuthStore } = await import('../store/authStore');
                      await useAuthStore.getState().checkAuth();

                      const currentUser = useAuthStore.getState().user;

                      if (currentUser) {
                        alert(`✅ Login Successful! Welcome, ${currentUser.full_name || currentUser.email}`);
                        onClose();
                      } else {
                        // 토큰은 저장됐지만 유저 로드 실패
                        const state = useAuthStore.getState();
                        const serverUrl = state.backendUrl || 'Unknown URL';
                        const errorMsg = state.authError || 'Unknown Network Error';

                        alert(`⚠️ Login Failed!\n\nError Details: ${errorMsg}\n\nServer URL: ${serverUrl}\n\nPlease verify:\n1. The server is running (port 8000)\n2. The URL in settings is correct`);
                      }
                    } catch (error: any) {
                      console.error(error);
                      alert(`❌ System Error: ${error.message}`);
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

              {/* Font Size */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Font Size</span>
                  <span className="setting-description">Controls the font size in pixels</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="30"
                  value={editorSettings.fontSize}
                  onChange={(e) => handleEditorSettingChange('fontSize', parseInt(e.target.value))}
                />
              </div>

              {/* Tab Size */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Tab Size</span>
                  <span className="setting-description">The number of spaces a tab is equal to</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={editorSettings.tabSize}
                  onChange={(e) => handleEditorSettingChange('tabSize', parseInt(e.target.value))}
                />
              </div>

              {/* Insert Spaces */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Insert Spaces</span>
                  <span className="setting-description">Insert spaces when pressing Tab</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.insertSpaces}
                  onChange={(e) => handleEditorSettingChange('insertSpaces', e.target.checked)}
                />
              </div>

              {/* Word Wrap */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Word Wrap</span>
                  <span className="setting-description">Controls how lines should wrap</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.wordWrap}
                  onChange={(e) => handleEditorSettingChange('wordWrap', e.target.checked)}
                />
              </div>

              {/* Minimap */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Minimap</span>
                  <span className="setting-description">Controls whether the minimap is shown</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.minimap}
                  onChange={(e) => handleEditorSettingChange('minimap', e.target.checked)}
                />
              </div>

              {/* Line Numbers */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Line Numbers</span>
                  <span className="setting-description">Controls the display of line numbers</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.lineNumbers}
                  onChange={(e) => handleEditorSettingChange('lineNumbers', e.target.checked)}
                />
              </div>

              {/* Theme */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Theme</span>
                  <span className="setting-description">Color theme for the editor</span>
                </label>
                <select
                  value={editorSettings.theme}
                  onChange={(e) => handleEditorSettingChange('theme', e.target.value)}
                >
                  <option value="vs-dark">Dark</option>
                  <option value="vs-light">Light</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>

              {/* Format On Save */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Format On Save</span>
                  <span className="setting-description">Format the file automatically when saving</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorSettings.formatOnSave}
                  onChange={(e) => handleEditorSettingChange('formatOnSave', e.target.checked)}
                />
              </div>

              {/* Default Formatter */}
              <div className="setting-item">
                <label>
                  <span className="setting-label">Default Formatter</span>
                  <span className="setting-description">Formatter to use</span>
                </label>
                <select
                  value={editorSettings.defaultFormatter}
                  onChange={(e) => handleEditorSettingChange('defaultFormatter', e.target.value)}
                >
                  <option value="default">Monaco Built-in (Default)</option>
                  <option value="prettier">Prettier (if available)</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'extensions' && (
            <div className="settings-section">
              <h3>Extensions</h3>

              <div className="extensions-list">
                {extensions.map((ext) => (
                  <div key={ext.id} className="extension-item">
                    <div className="extension-info">
                      <h4>{ext.name}</h4>
                      <p>{ext.description}</p>
                    </div>
                    <div className="extension-actions">
                      {ext.installed ? (
                        <>
                          <label className="extension-toggle">
                            <input
                              type="checkbox"
                              checked={ext.enabled}
                              onChange={() => handleExtensionToggle(ext.id)}
                            />
                            <span>Enabled</span>
                          </label>
                          <button
                            className="extension-button uninstall"
                            onClick={() => handleExtensionInstall(ext.id)}
                          >
                            Uninstall
                          </button>
                        </>
                      ) : (
                        <button
                          className="extension-button install"
                          onClick={() => handleExtensionInstall(ext.id)}
                        >
                          Install
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="settings-section">
              <h3>GitHub Integration</h3>
              <div className="setting-item">
                <label>
                  <span className="setting-label">Username</span>
                  <span className="setting-description">Your GitHub username</span>
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
                  <span className="setting-description">Token with 'repo' scope</span>
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
