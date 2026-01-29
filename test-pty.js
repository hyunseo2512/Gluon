try {
    console.log('Attempting to require node-pty...');
    const pty = require('node-pty');
    console.log('node-pty loaded successfully');
    process.exit(0);
} catch (e) {
    console.error('Failed to load node-pty:', e);
    process.exit(1);
}
