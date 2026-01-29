try {
    console.log('Attempting to require ssh2...');
    const { Client } = require('ssh2');
    const conn = new Client();
    console.log('ssh2 loaded successfully');
    process.exit(0);
} catch (e) {
    console.error('Failed to load ssh2:', e);
    process.exit(1);
}
