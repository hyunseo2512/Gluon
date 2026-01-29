import React from 'react';
import '../styles/WelcomeScreen.css';
import { FolderPlusIcon, GitIcon, ActivityIcon, UserIcon, XIcon } from './Icons';

interface WelcomeScreenProps {
    onOpenProject: () => void;
    onCloneRepo: () => void;
    onConnectSSH: () => void;
    onLogin: () => void;
    recents?: string[];
    onOpenRecent?: (path: string) => void;
    onRemoveRecent?: (path: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onOpenProject,
    onCloneRepo,
    onConnectSSH,
    onLogin,
    recents = [],
    onOpenRecent,
    onRemoveRecent
}) => {
    return (
        <div className="welcome-screen">
            <div className="welcome-content">
                <div className="welcome-logo">
                    <h1>Gluon</h1>
                    <span className="welcome-version">Pro • v1.0.0</span>
                </div>

                <div className="welcome-actions">

                    <button className="welcome-action-card" onClick={onOpenProject}>
                        <div className="action-icon">
                            <FolderPlusIcon size={24} />
                        </div>
                        <div className="action-text">
                            <h3>Open Project</h3>
                            <p>Open an existing folder or project</p>
                        </div>
                    </button>

                    <button className="welcome-action-card" onClick={onCloneRepo}>
                        <div className="action-icon">
                            <GitIcon size={24} />
                        </div>
                        <div className="action-text">
                            <h3>Clone Repository</h3>
                            <p>Clone a project from Git</p>
                        </div>
                    </button>

                    <button className="welcome-action-card" onClick={onConnectSSH}>
                        <div className="action-icon">
                            <ActivityIcon size={24} />
                        </div>
                        <div className="action-text">
                            <h3>Connect via SSH</h3>
                            <p>Connect to a remote server</p>
                        </div>
                    </button>
                </div>

                <div className="recent-projects">
                    <h3>Recent Projects</h3>
                    <div className="recent-list">
                        {recents.length === 0 ? (
                            <p className="no-recent">No recent projects</p>
                        ) : (
                            recents.slice(0, 3).map((path, index) => (
                                <div
                                    key={index}
                                    className="recent-item"
                                    onClick={() => onOpenRecent && onOpenRecent(path)}
                                    title={path}
                                >
                                    <span className="recent-name">{path.split('/').pop()}</span>
                                    <button
                                        className="recent-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveRecent && onRemoveRecent(path);
                                        }}
                                        title="Remove from history"
                                    >
                                        <XIcon size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
