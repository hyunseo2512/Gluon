import { app } from 'electron';

// 개발 환경 여부 확인
const isDev = !app.isPackaged;

if (!isDev) {
    // 1. JS Console Logs Suppression
    console.log = () => { };
    console.info = () => { };
    console.warn = () => { };
    console.error = () => { };

    // 2. Process Stdout/Stderr Suppression (for native modules or direct writes)
    // @ts-ignore
    process.stdout.write = () => true;
    // @ts-ignore
    process.stderr.write = () => true;

    // 3. Chromium/Electron Native Log Suppression
    // These switches must be appended BEFORE app is ready, ideally at the very start.
    app.commandLine.appendSwitch('log-level', '3'); // 3 = FATAL only (effectively suppresses INFO/WARNING/ERROR)
    app.commandLine.appendSwitch('disable-logging');
}
