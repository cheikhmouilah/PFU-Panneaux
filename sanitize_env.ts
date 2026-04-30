import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

function sanitizeEnv() {
    if (!fs.existsSync(envPath)) {
        console.log('.env file not found.');
        return;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    const keysSeen = new Set();

    // Preserve the order but only keep the LATEST value for each key if duplicated (or first, but usually latest in my case)
    // Actually, common practice is first one wins in dotenv, so let's keep the first one but if I want to OVERRIDE, I should be careful.

    // I want to ensure my new values are the ones used.
    const overrides = {
        'DB_USER': 'postgres',
        'DB_HOST': '127.0.0.1',
        'DB_NAME': 'postgis',
        'DB_PASSWORD': 'postgresql',
        'DB_PORT': '5432',
        'JWT_SECRET': 'geosignal_secret_key_2025'
    };

    const keysToOverride = new Set(Object.keys(overrides));

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            newLines.push(line);
            continue;
        }

        const [key] = trimmed.split('=');
        if (keysToOverride.has(key)) {
            // Drop it, we'll add it at the end or replace it
            continue;
        }
        newLines.push(line);
    }

    // Add our consistent values
    newLines.push('\n# Configuration Automatique Antigravity');
    for (const [key, value] of Object.entries(overrides)) {
        newLines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('.env sanitized and updated with correct values.');
}

sanitizeEnv();
