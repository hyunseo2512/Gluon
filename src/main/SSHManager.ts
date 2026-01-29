import { Client, ClientChannel } from 'ssh2';

interface SSHConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
}

export class SSHManager {
    private client: Client;
    private stream: ClientChannel | null = null;
    private config: SSHConfig | null = null;

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
}
