
import React from 'react';
import { PlayIcon, BugIcon } from './Icons';
import '../styles/SearchPanel.css'; // Reusing search panel styles for now or basic styles

interface DebugPanelProps {
    workspaceDir?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ workspaceDir }) => {

    const handleRun = () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', bubbles: true }));
    };

    const handleDebug = () => {
        // Ctrl+F5 logic or simple alert for now
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', ctrlKey: true, bubbles: true }));
    };

    return (
        <div className="search-panel">
            <div className="search-header">
                <h3>Run and Debug</h3>
            </div>

            {!workspaceDir ? (
                <div className="panel-placeholder">
                    <p>Open a folder to start debugging.</p>
                </div>
            ) : (
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button
                            onClick={handleRun}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <PlayIcon size={16} />
                            Run (F5)
                        </button>
                        <button
                            onClick={handleDebug}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: 'transparent',
                                border: '1px solid #555',
                                color: '#ccc',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <BugIcon size={16} />
                            Debug (Ctrl+F5)
                        </button>
                    </div>

                    <div style={{ color: '#888', fontSize: '12px' }}>
                        <p>Variables</p>
                        <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginTop: '4px' }}>
                            No variables
                        </div>
                    </div>
                    <div style={{ color: '#888', fontSize: '12px', marginTop: '16px' }}>
                        <p>Watch</p>
                        <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginTop: '4px' }}>
                            No watch expressions
                        </div>
                    </div>
                    <div style={{ color: '#888', fontSize: '12px', marginTop: '16px' }}>
                        <p>Call Stack</p>
                        <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginTop: '4px' }}>
                            No call stack
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
