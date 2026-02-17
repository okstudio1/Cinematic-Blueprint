#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const htmlPath = path.join(__dirname, 'cinematic-blueprint.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const configString = JSON.stringify(firebaseConfig, null, 12);

const pattern = /const firebaseConfig = \{[\s\S]*?\};/;
const replacement = `const firebaseConfig = ${configString};`;

html = html.replace(pattern, replacement);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Firebase config injected from environment variables');
