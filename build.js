#!/usr/bin/env node

/**
 * Builds the deployable site into dist/.
 *
 * Only the files listed in SITE_FILES are copied, so the published site is not
 * the whole repository. The Firebase config is injected into the dist copy;
 * the tracked source keeps its placeholder and is never modified.
 */

const fs = require('fs');
const path = require('path');

// .env is a local-development convenience; CI supplies these variables through
// the build environment, where dotenv may not be installed.
try {
    require('dotenv').config({ quiet: true });
} catch {
    // No dotenv available: fall back to the ambient environment.
}

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Everything that should be publicly served, and nothing else.
const SITE_FILES = [
    'cinematic-blueprint.html',
    'integration-guide.html',
    'mcp-docs.html',
    'logo.png'
];

const REQUIRED_ENV = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID'
];

function buildFirebaseConfig() {
    const missing = REQUIRED_ENV.filter(name => !process.env[name]);
    if (missing.length) {
        console.error('Missing required environment variables:');
        for (const name of missing) console.error(`  - ${name}`);
        console.error('\nSet them in .env or in the Netlify build environment.');
        console.error('Refusing to build a site with an incomplete Firebase config.');
        process.exit(1);
    }

    return {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };
}

function main() {
    const firebaseConfig = buildFirebaseConfig();

    fs.rmSync(DIST, { recursive: true, force: true });
    fs.mkdirSync(DIST, { recursive: true });

    for (const name of SITE_FILES) {
        const src = path.join(ROOT, name);
        if (!fs.existsSync(src)) {
            console.error(`Missing site file: ${name}`);
            process.exit(1);
        }
        fs.copyFileSync(src, path.join(DIST, name));
    }

    const target = path.join(DIST, 'cinematic-blueprint.html');
    let html = fs.readFileSync(target, 'utf8');

    const pattern = /const firebaseConfig = \{[\s\S]*?\};/;
    if (!pattern.test(html)) {
        console.error('Could not find the firebaseConfig block to replace.');
        process.exit(1);
    }

    const configString = JSON.stringify(firebaseConfig, null, 12);
    html = html.replace(pattern, `const firebaseConfig = ${configString};`);

    // The placeholder also appears in the hasCloudConfig() guard, which is meant
    // to stay, so only the config block itself is checked.
    const injected = html.match(pattern);
    if (!injected || injected[0].includes('FIREBASE_API_KEY_PLACEHOLDER')) {
        console.error('Firebase config was not substituted.');
        process.exit(1);
    }

    fs.writeFileSync(target, html, 'utf8');

    console.log(`Built ${SITE_FILES.length} files into dist/`);
    console.log('Firebase config injected from environment variables');
}

main();
