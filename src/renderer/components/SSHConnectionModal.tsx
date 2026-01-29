import React, { useState } from 'react';
import '../styles/App.css'; // Assuming we can reuse some styles or add new ones

interface SSHConnectionModalProps {
    onConnect: (config: any) => void;
    onCancel: () => void;
}

export default function SSHConnectionModal({ onConnect, onCancel }: SSHConnectionModalProps) {
    const [host, setHost] = useState('');
    const [port, setPort] = useState('22');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [useKey, setUseKey] = useState(false);
    const [privateKeyPath, setPrivateKeyPath] = useState(''); // Just path string for now, backend will read it or we read it here

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConnect({
            host,
            port: parseInt(port),
            username,
            password: useKey ? undefined : password,
            privateKeyPath: useKey ? privateKeyPath : undefined // Backend needs to handle reading file if path provided
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px' }}>
                <h3>SSH Remote Connection</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    <div className="form-group">
                        <label>Host</label>
                        <input type="text" value={host} onChange={e => setHost(e.target.value)} required placeholder="192.168.1.1" className="input-field" />
                    </div>

                    <div className="form-group">
                        <label>Port</label>
                        <input type="number" value={port} onChange={e => setPort(e.target.value)} required className="input-field" />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="root" className="input-field" />
                    </div>

                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={useKey} onChange={e => setUseKey(e.target.checked)} /> Use Private Key
                        </label>
                    </div>

                    {useKey ? (
                        <div className="form-group">
                            <label>Private Key Path</label>
                            <input type="text" value={privateKeyPath} onChange={e => setPrivateKeyPath(e.target.value)} placeholder="/home/user/.ssh/id_rsa" className="input-field" />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
                        </div>
                    )}

                    <div className="modal-actions" style={{ marginTop: '10px' }}>
                        <button type="button" onClick={onCancel} className="modal-btn cancel">Cancel</button>
                        <button type="submit" className="modal-btn primary">Connect</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
