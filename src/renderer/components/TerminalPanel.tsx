import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { TerminalIcon, PlusCircleIcon, XIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ErrorIcon, WarningIcon } from './Icons';
import '@xterm/xterm/css/xterm.css';
import '../styles/TerminalPanel.css';

interface TerminalPanelProps {
  onClose?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  cwd?: string;
  diagnostics?: { errors: number; warnings: number; markers?: any[] };
}

interface BaseTab {
  id: string;
  name: string;
  type: 'terminal' | 'problems';
}

interface TerminalTab extends BaseTab {
  type: 'terminal';
  shellType: string;
  term: Terminal;
  fitAddon: FitAddon;
  webglAddon?: WebglAddon;
  clipboardAddon: ClipboardAddon;
  ref: HTMLDivElement | null;
}

interface ProblemsTab extends BaseTab {
  type: 'problems';
}

type Tab = TerminalTab | ProblemsTab;

const SHELL_TYPES = [
  { value: 'default', label: 'Terminal' },
  { value: 'bash', label: 'Bash' },
  { value: 'zsh', label: 'Zsh' },
  { value: 'sh', label: 'Sh' },
];

function TerminalPanel({ onClose, onMaximize, isMaximized, cwd, diagnostics = { errors: 0, warnings: 0, markers: [] } }: TerminalPanelProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 전역 터미널 이벤트 리스너 설정
  useEffect(() => {
    if (!window.electron?.terminal) return;

    const cleanup1 = window.electron.terminal.onData((terminalId: string, data: string) => {
      const tab = tabs.find(t => t.id === terminalId) as TerminalTab;
      if (tab && tab.type === 'terminal') {
        tab.term.write(data);
      }
    });

    const cleanup2 = window.electron.terminal.onExit((terminalId: string, code: number) => {
      console.log(`Terminal ${terminalId} exited with code ${code}`);
      // 탭 제거
      handleCloseTab(terminalId);
    });

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [tabs]);

  // Handle external run commands and Problems tab
  useEffect(() => {
    const handleRunCommand = (e: CustomEvent<any>) => {
      const detail = e.detail;
      // Support legacy string format or new object format
      const command = typeof detail === 'string' ? detail : detail.command;
      const file = typeof detail === 'string' ? null : detail.file;

      if (!command) return;

      // Check if SPECIFIC file has errors (if file context is known)
      if (file && diagnostics.markers) {
        // Normalize paths for comparison (simple inclusion check usually works for absolute paths)
        // marker.resource.path might be a URI (file://...) or just path.
        const fileHasErrors = diagnostics.markers.some(m => {
          if (m.severity !== 8) return false; // 8 is MarkerSeverity.Error
          // Compare paths loosely to handle file:// prefix diffs
          return m.resource.path.includes(file) || file.includes(m.resource.path);
        });

        if (fileHasErrors) {
          // Block and show problems
          const existing = tabs.find(t => t.type === 'problems');
          if (existing) {
            setActiveTabId(existing.id);
          } else {
            const newTab: ProblemsTab = {
              id: `problems-${Date.now()}`,
              name: 'Problems',
              type: 'problems'
            };
            setTabs(prev => [...prev, newTab]);
            setActiveTabId(newTab.id);
          }
          return;
        }
      }
      // Note: If no file context (generic command), we allow running even if there are errors elsewhere.

      // 1. Determine Target Tab
      let targetTabId = activeTabId;

      if (file) {
        const runTabId = `run-${file}`;
        const existingTab = tabs.find(t => t.id === runTabId) as TerminalTab;

        if (existingTab && existingTab.type === 'terminal') {
          targetTabId = runTabId;
          setActiveTabId(runTabId);
          // Send Ctrl+C to ensure clean prompt, then wait slightly before sending command
          // This prevents "double echo" issues where command is printed before prompt is ready
          window.electron.terminal.write(runTabId, '\u0003'); // Ctrl+C
          setTimeout(() => {
            window.electron.terminal.write(runTabId, command + '\r');
            existingTab.term.focus(); // Focus after command
          }, 100);
        } else {
          handleAddTab('default', runTabId, command);
        }
      } else {
        if (activeTabId) {
          const tab = tabs.find(t => t.id === activeTabId) as TerminalTab;
          if (tab && tab.type === 'terminal') {
            window.electron.terminal.write(activeTabId, command + '\r');
            tab.term.focus();
          } else {
            handleAddTab('default', undefined, command);
          }
        } else {
          handleAddTab('default', undefined, command);
        }
      }
    };

    const handleOpenProblems = () => {
      // Check if Problems tab exists
      const existing = tabs.find(t => t.type === 'problems');
      if (existing) {
        setActiveTabId(existing.id);
      } else {
        // Create new Problems tab
        const newTab: ProblemsTab = {
          id: `problems-${Date.now()}`,
          name: 'Problems',
          type: 'problems'
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    };

    const handleSwitchTabEvent = (e: CustomEvent<{ direction: 'prev' | 'next' }>) => {
      if (tabs.length <= 1) return;
      const currentIndex = tabs.findIndex(t => t.id === activeTabId);
      let nextIndex: number;
      if (e.detail.direction === 'prev') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }
      setActiveTabId(tabs[nextIndex].id);
    };

    const handleCloseTabEvent = () => {
      if (activeTabId) {
        handleCloseTab(activeTabId);
      }
    };

    const handleFocusEvent = () => {
      if (activeTabId) {
        const tab = tabs.find(t => t.id === activeTabId);
        if (tab && tab.type === 'terminal') {
          (tab as TerminalTab).term.focus();
        }
      }
    };

    window.addEventListener('gluon:run-command', handleRunCommand as EventListener);
    window.addEventListener('gluon:open-problems', handleOpenProblems as EventListener);
    window.addEventListener('terminal-switch-tab', handleSwitchTabEvent as EventListener);
    window.addEventListener('terminal-close-tab', handleCloseTabEvent);
    window.addEventListener('terminal-focus', handleFocusEvent);

    return () => {
      window.removeEventListener('gluon:run-command', handleRunCommand as EventListener);
      window.removeEventListener('gluon:open-problems', handleOpenProblems as EventListener);
      window.removeEventListener('terminal-switch-tab', handleSwitchTabEvent as EventListener);
      window.removeEventListener('terminal-close-tab', handleCloseTabEvent);
      window.removeEventListener('terminal-focus', handleFocusEvent);
    };
  }, [activeTabId, tabs, diagnostics]);

  // Fit helper - fits active tab and synchronizes with backend
  // Fit helper - fits active tab and synchronizes with backend
  const fitTerminal = () => {
    if (!activeTabId || !containerRef.current) return;
    const tab = tabs.find(t => t.id === activeTabId) as TerminalTab;
    if (!tab || tab.type !== 'terminal' || !tab.fitAddon) return;

    try {
      // Force layout reflow
      const _ = containerRef.current.offsetHeight;

      // 1. Measure and update frontend dimensions
      tab.fitAddon.fit();

      // Double check fit after a microtask
      setTimeout(() => {
        if (!tab.fitAddon) return;
        tab.fitAddon.fit();
        const { cols, rows } = tab.term;
        if (cols > 0 && rows > 0) {
          window.electron?.terminal?.resize(tab.id, cols, rows);
        }
      }, 0);

      // 2. Sync with backend if dimensions are valid (Immediate)
      const { cols, rows } = tab.term;
      if (cols > 0 && rows > 0) {
        window.electron?.terminal?.resize(tab.id, cols, rows);
      }
    } catch (e) {
      console.warn('Fit error:', e);
    }
  };

  // ResizeObserver for Auto Fit
  useEffect(() => {
    if (!containerRef.current) return;

    // Debounce to prevent PTY flood
    let timeout: any;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fitTerminal();
      }, 30);
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [activeTabId, tabs]); // Re-bind if tabs change

  // Maximize 시 강제 리사이즈 (배치 변경 타이밍 이슈 해결을 위한 다중 트리거)
  useEffect(() => {
    if (activeTabId) {
      // Immediate
      fitTerminal();

      // delayed checks for layout settlement/animation
      const t1 = setTimeout(fitTerminal, 50);
      const t2 = setTimeout(fitTerminal, 200);
      const t3 = setTimeout(fitTerminal, 500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isMaximized, activeTabId]);

  // 새 터미널 탭 추가
  const handleAddTab = async (shellType: string = 'default', customId?: string, initialCommand?: string) => {
    const tabId = customId || `terminal-${Date.now()}`;
    const shellLabel = SHELL_TYPES.find(s => s.value === shellType)?.label || 'Default';

    try {
      // xterm 인스턴스 생성
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'monospace',
        cursorStyle: 'bar',
        allowProposedApi: true,
        allowTransparency: true,
        theme: {
          background: '#00000000', // Transparent for glume theme
          foreground: '#e0e0e0', // Bright Text
          cursor: '#29b6f6',     // Cyan Cursor
          cursorAccent: '#090b10',
          selectionBackground: 'rgba(41, 182, 246, 0.3)',
          black: '#090b10',
          red: '#f07178',
          green: '#c3e88d',
          yellow: '#ffcb6b',
          blue: '#82aaff',
          magenta: '#c792ea',
          cyan: '#89ddff',
          white: '#d0d0d0',
          brightBlack: '#546e7a',
          brightRed: '#f07178',
          brightGreen: '#c3e88d',
          brightYellow: '#ffcb6b',
          brightBlue: '#82aaff',
          brightMagenta: '#c792ea',
          brightCyan: '#89ddff',
          brightWhite: '#ffffff',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      // Clipboard Addon
      const clipboardAddon = new ClipboardAddon();
      term.loadAddon(clipboardAddon);

      // Escape → 에디터로 포커스 이동
      term.attachCustomKeyEventHandler((e) => {
        if (e.type === 'keydown' && e.key === 'Escape') {
          const editor = document.querySelector('.monaco-editor textarea') as HTMLElement;
          if (editor) editor.focus();
          return false; // xterm에 이벤트 전달 안 함
        }
        return true;
      });

      // WebGL Addon for performance
      let webglAddon: WebglAddon | undefined;
      try {
        webglAddon = new WebglAddon();
        webglAddon.onContextLoss(() => {
          webglAddon?.dispose();
        });
        term.loadAddon(webglAddon);
      } catch (e) {
        console.warn('WebGL Addon failed to load, falling back to canvas', e);
      }

      // 새 탭 추가
      const newTab: TerminalTab = {
        id: tabId,
        name: customId ? `Run: ${customId.replace('run-', '').split('/').pop()}` : shellLabel,
        type: 'terminal',
        shellType,
        term,
        fitAddon,
        webglAddon,
        clipboardAddon,
        ref: null,
      };

      setTabs(prev => {
        // Prevent duplicates if using customId
        if (prev.some(t => t.id === tabId)) return prev;
        return [...prev, newTab];
      });
      setActiveTabId(tabId);

      // DOM이 렌더링된 후 터미널 초기화
      setTimeout(async () => {
        const terminalElement = document.getElementById(`terminal-content-${tabId}`);
        if (terminalElement && !term.element) {
          term.open(terminalElement);
          fitAddon.fit();
          term.focus();

          // 리사이즈 이벤트 처리
          term.onResize((size) => {
            window.electron.terminal.resize(tabId, size.cols, size.rows);
          });

          // 초기 사이즈로 터미널 시작
          const result = await window.electron.terminal.start(tabId, shellType, term.cols, term.rows, cwd);
          if (!result.success) {
            console.error('Failed to start terminal:', result.error);
            term.writeln(`Failed to start terminal: ${result.error}`);
          }

          // Initial Command Execution
          if (initialCommand) {
            // Wait for shell to fully initialize to prevent raw echo at the top
            setTimeout(() => {
              window.electron.terminal.write(tabId, initialCommand + '\r');
            }, 800);
          }

          // 입력 이벤트 연결 - Run 탭이어도 입력은 허용 (디버깅/상호작용)
          term.onData((data) => {
            window.electron.terminal.write(tabId, data);
          });
        }
      }, 100);

    } catch (error) {
      console.error('Failed to create terminal tab:', error);
    }


  };

  // Mount 시 탭이 하나도 없으면 기본 터미널 생성 (최초 실행 시 빈 화면 방지)
  useEffect(() => {
    // Check inside a timeout to ensure state is settled, though empty dependency array means run once on mount.
    // However, tabs state is initial state [] on mount.
    // Need to strictly check if we want this behavior every time panel opens.
    // User request: "Gluon 터미널 최초 토글시 빈 터미널 나오는데 터미널 하나 있는 상태로 띄우기"
    if (tabs.length === 0) {
      handleAddTab('default');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ... (handleRunCommand logic moved to useEffect) ...
  // But wait, useEffect above duplicates logic.
  // I should remove the separate handleRunCommand useEffect if I merged it.
  // Or keep it simple.

  // 탭 닫기
  const handleCloseTab = (tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);

      // 활성 탭이 닫히면 다른 탭으로 전환
      if (activeTabId === tabId && filtered.length > 0) {
        const nextTab = filtered[filtered.length - 1];
        setActiveTabId(nextTab.id);
        // 남은 터미널에 포커스 유지
        if (nextTab.type === 'terminal') {
          setTimeout(() => (nextTab as TerminalTab).term.focus(), 50);
        }
      } else if (filtered.length === 0) {
        setActiveTabId(null);
      }

      // 터미널 정리 (terminal type only)
      const tab = prev.find(t => t.id === tabId);
      if (tab && tab.type === 'terminal') {
        tab.term.dispose();
        window.electron.terminal.kill(tabId);
      }

      return filtered;
    });
  };

  const handleSwitchTab = (tabId: string) => {
    setActiveTabId(tabId);
    // 터미널에 포커스 (terminal only)
    setTimeout(() => {
      const tab = tabs.find(t => t.id === tabId);
      if (tab && tab.type === 'terminal') {
        tab.fitAddon.fit();
        tab.term.focus();
      }
    }, 50);
  };

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, show: boolean } | null>(null);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, show: true });
  };

  const handleCopy = () => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.type === 'terminal') {
      const selection = tab.term.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
    setContextMenu(null);
  };

  const handlePaste = async () => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.type === 'terminal') {
      try {
        const text = await navigator.clipboard.readText();
        tab.term.paste(text);
      } catch (err) {
        console.error('Failed to read clipboard:', err);
      }
    }
    setContextMenu(null);
  };

  const handleClear = () => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.type === 'terminal') {
      tab.term.clear();
      window.electron.terminal.write(tab.id, '\x0c');
    }
    setContextMenu(null);
  };

  // Scroll State
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll state
  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 1); // 1px tolerance
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2); // 2px tolerance
    }
  };

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    // Initial check
    setTimeout(checkScroll, 100);

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(checkScroll));
    resizeObserver.observe(el);

    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [tabs, isMaximized]); // Re-check on tabs or maximize change

  // Scroll Helpers
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const amount = 200;
      tabsContainerRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`terminal-panel ${isMaximized ? 'maximized' : ''}`} ref={containerRef}>
      {/* Header */}
      <div className="terminal-header">
        <div className="terminal-tabs-container" style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div
            ref={tabsContainerRef}
            className="terminal-tabs"
            style={{ paddingRight: '4px' }}
          >
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`terminal-tab ${tab.id === activeTabId ? 'active' : ''}`}
                onClick={() => { setActiveTabId(tab.id); setTimeout(fitTerminal, 0); }}
                onMouseUp={(e) => { if (e.button === 1) handleCloseTab(tab.id); }}
                data-tooltip={tab.type === 'problems' ? 'Problems' : tab.name}
                data-tooltip-pos="top"
              >
                {tab.type === 'problems' ? (
                  <ErrorIcon size={12} className="tab-icon" style={{ color: '#f07178' }} />
                ) : (
                  <TerminalIcon size={12} className="tab-icon" />
                )}
                <span className="tab-name">{tab.name}</span>
                <button
                  className="close-tab-btn"
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* ... Navigation Buttons ... */}
          {/* ... New Tab Buttons ... */}

          <div className="tab-nav-group" style={{ display: 'flex', marginRight: '8px' }}>
            {/* ... */}
            <button
              className="tab-nav-btn"
              onClick={() => {
                if (!activeTabId) return;
                const idx = tabs.findIndex(t => t.id === activeTabId);
                if (idx > 0) handleSwitchTab(tabs[idx - 1].id);
              }}
              title="Previous Terminal"
            >
              <ChevronLeftIcon size={12} />
            </button>
            <button
              className="tab-nav-btn"
              onClick={() => {
                if (!activeTabId) return;
                const idx = tabs.findIndex(t => t.id === activeTabId);
                if (idx < tabs.length - 1) handleSwitchTab(tabs[idx + 1].id);
              }}
              title="Next Terminal"
            >
              <ChevronRightIcon size={12} />
            </button>
          </div>

          <button
            className="new-tab-btn"
            onClick={() => handleAddTab('default')}
            data-tooltip="New Terminal"
            data-tooltip-pos="top"
            style={{ borderRadius: '4px', width: '28px' }}
          >
            <PlusCircleIcon size={14} />
          </button>

        </div>
        {/* Actions */}
        <div className="terminal-actions">
          {/* ... */}
          {onMaximize && (
            <button className="action-btn" onClick={onMaximize} title={isMaximized ? "Restore" : "Maximize"}>
              {isMaximized ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
            </button>
          )}
          {onClose && (
            <button className="action-btn close-btn" onClick={onClose} title="Close Panel">
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content or Problems Content */}
      <div className="terminal-body" onContextMenu={handleContextMenu}>
        {tabs.map(tab => (
          tab.type === 'terminal' ? (
            <div
              key={tab.id}
              id={`terminal-content-${tab.id}`}
              className="terminal-instance"
              style={{
                display: tab.id === activeTabId ? 'block' : 'none',
                height: '100%',
                width: '100%'
              }}
            />
          ) : (
            <div
              key={tab.id}
              className="problems-view"
              style={{
                display: tab.id === activeTabId ? 'flex' : 'none',
                height: '100%',
                width: '100%',
                flexDirection: 'column',
                padding: '16px',
                overflowY: 'auto',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ErrorIcon size={16} color="#f07178" />
                <span style={{ fontWeight: 'bold' }}>{diagnostics.errors} Errors</span>
                <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 8px' }} />
                <WarningIcon size={16} color="#ffcb6b" />
                <span style={{ fontWeight: 'bold' }}>{diagnostics.warnings} Warnings</span>
              </div>
              {/* Placeholder for list */}
              <div className="problems-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diagnostics.markers && diagnostics.markers.length > 0 ? (
                  diagnostics.markers.map((marker, idx) => (
                    <div
                      key={idx}
                      className="problem-item"
                      style={{
                        background: 'var(--bg-secondary)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        borderLeft: `3px solid ${marker.severity === 8 ? '#f07178' : '#ffcb6b'}`, // 8 is Error in Monaco
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>
                          {marker.resource?.path ? (marker.resource.path.split('/').pop() || marker.resource.path) : 'Unknown File'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Ln {marker.startLineNumber}, Col {marker.startColumn}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                        {marker.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '4px' }}>
                    <p>No problems detected in open files.</p>
                  </div>
                )}
              </div>
            </div>
          )
        ))}

        {tabs.length === 0 && (
          <div className="terminal-empty">
            <p>No terminals open</p>
            <button onClick={() => handleAddTab('default')}>Open Terminal</button>
          </div>
        )}
      </div>
      {/* Context Menu */}
      {contextMenu && contextMenu.show && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="context-menu-item" onClick={handleCopy}>Copy</div>
          <div className="context-menu-item" onClick={handlePaste}>Paste</div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleClear}>Clear</div>
        </div>
      )}
    </div >
  );
}

export default TerminalPanel;
