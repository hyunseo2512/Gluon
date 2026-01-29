import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const execAsync = promisify(exec);

export interface LintResult {
    line: number;
    column: number;
    type: 'error' | 'warning' | 'info';
    message: string;
    symbol: string;
    messageId: string;
}

export class LinterService {
    private ruffPath: string;

    constructor() {
        // Detect Ruff Path
        const isDev = !app.isPackaged;
        if (isDev) {
            // In dev, run from project root -> resources/python/bin/ruff
            this.ruffPath = path.join(process.cwd(), 'resources/python/bin/ruff');
        } else {
            // In prod
            this.ruffPath = path.join(app.getAppPath(), 'resources/python/bin/ruff');
        }
    }

    /**
     * Check Python file using Ruff (Embedded)
     */
    async checkPython(filePath: string): Promise<LintResult[]> {
        // Debug logging to specific file - Initialize FIRST
        const logFile = '/tmp/gluon_linter.log';
        const log = (msg: string) => {
            try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
        };

        log(`[Check] Request for: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            log(`[Check] File not found: ${filePath}`);
            return [];
        }

        if (!fs.existsSync(this.ruffPath)) {
            log(`Ruff binary not found at: ${this.ruffPath}`);
            return [];
        }

        try {
            // Ruff check --output-format=json
            const command = `"${this.ruffPath}" check --output-format=json "${filePath}"`;
            log(`Executing: ${command}`);

            const { stdout } = await execAsync(command);
            log(`Success stdout len: ${stdout.length}`);
            return this.parseRuffOutput(stdout);

        } catch (error: any) {
            // Ruff exits with 1 if violations found
            if (error.stdout) {
                log(`Exit 1 (Violations) stdout len: ${error.stdout.length}`);
                return this.parseRuffOutput(error.stdout);
            }
            log(`Error: ${error.message}`);
            // If stderr exists
            if (error.stderr) log(`Stderr: ${error.stderr}`);

            console.error('Ruff check failed:', error);
            return [];
        }
    }

    private parseRuffOutput(stdout: string): LintResult[] {
        try {
            if (!stdout || stdout.trim().length === 0) return [];
            const results = JSON.parse(stdout);

            if (!Array.isArray(results)) return [];

            return results.map((msg: any) => ({
                line: msg.location.row,
                column: msg.location.column,
                type: 'error', // Ruff doesn't clearly distinguish warnings in JSON unless configured?
                message: msg.message,
                symbol: msg.code,
                messageId: msg.code
            }));
        } catch (e) {
            console.warn('Failed to parse ruff output:', e);
            return [];
        }
    }
}

export const linterService = new LinterService();
