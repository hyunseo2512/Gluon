import { Client, ClientChannel, SFTPWrapper } from 'ssh2';

interface SSHConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
}

interface FileInfo {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modifiedTime: number;
}

export class SSHManager {
    private client: Client;
    private stream: ClientChannel | null = null;
    private sftp: SFTPWrapper | null = null;
    private config: SSHConfig | null = null;
    private currentRemotePath: string = '/';

    constructor() {
        this.client = new Client();
    }

    connect(config: SSHConfig): Promise<void> {
        this.config = config;
        return new Promise((resolve, reject) => {
            this.client.on('ready', () => {
                console.log('SSH Connection Ready');
                resolve();
            }).on('error', (err) => {
                console.error('SSH Connection Error:', err);
                reject(err);
            }).on('end', () => {
                console.log('SSH Connection Ended');
                this.stream = null;
                this.sftp = null;
            });

            this.client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.privateKey
            });
        });
    }

    disconnect() {
        if (this.stream) {
            this.stream.close();
            this.stream = null;
        }
        if (this.sftp) {
            this.sftp.end();
            this.sftp = null;
        }
        this.client.end();
    }

    startShell(onData: (data: string) => void, onExit: () => void): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.shell((err, stream) => {
                if (err) return reject(err);

                this.stream = stream;

                stream.on('close', () => {
                    console.log('Stream :: close');
                    this.stream = null;
                    onExit();
                }).on('data', (data: any) => {
                    onData(data.toString());
                });

                resolve();
            });
        });
    }

    write(data: string) {
        if (this.stream) {
            this.stream.write(data);
        }
    }

    resize(cols: number, rows: number) {
        if (this.stream) {
            this.stream.setWindow(rows, cols, 0, 0);
        }
    }

    // ========== SFTP Methods ==========

    startSftp(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.sftp((err, sftp) => {
                if (err) return reject(err);
                this.sftp = sftp;
                console.log('SFTP session started');
                resolve();
            });
        });
    }

    async listDirectory(remotePath: string): Promise<FileInfo[]> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            this.sftp!.readdir(remotePath, (err, list) => {
                if (err) return reject(err);

                const files: FileInfo[] = list.map(item => ({
                    name: item.filename,
                    path: `${remotePath}/${item.filename}`.replace(/\/+/g, '/'),
                    isDirectory: item.attrs.isDirectory(),
                    size: item.attrs.size,
                    modifiedTime: item.attrs.mtime * 1000
                }));

                // Sort: directories first, then alphabetically
                files.sort((a, b) => {
                    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
                    return a.name.localeCompare(b.name);
                });

                this.currentRemotePath = remotePath;
                resolve(files);
            });
        });
    }

    async readFile(remotePath: string): Promise<string> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            const readStream = this.sftp!.createReadStream(remotePath);

            readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
            readStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            readStream.on('error', reject);
        });
    }

    async writeFile(remotePath: string, content: string): Promise<void> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            const writeStream = this.sftp!.createWriteStream(remotePath);
            writeStream.on('close', () => resolve());
            writeStream.on('error', reject);
            writeStream.end(content, 'utf8');
        });
    }

    async deleteFile(remotePath: string): Promise<void> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            this.sftp!.unlink(remotePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    async deleteDirectory(remotePath: string): Promise<void> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            this.sftp!.rmdir(remotePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    async createDirectory(remotePath: string): Promise<void> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            this.sftp!.mkdir(remotePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    async stat(remotePath: string): Promise<{ isDirectory: boolean; size: number }> {
        if (!this.sftp) throw new Error('SFTP not initialized');

        return new Promise((resolve, reject) => {
            this.sftp!.stat(remotePath, (err, stats) => {
                if (err) return reject(err);
                resolve({
                    isDirectory: stats.isDirectory(),
                    size: stats.size
                });
            });
        });
    }

    getCurrentPath(): string {
        return this.currentRemotePath;
    }

    isConnected(): boolean {
        return this.client !== null && this.sftp !== null;
    }
}
