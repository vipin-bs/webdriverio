// setup-local-packages.js
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Setting up local WebdriverIO packages...');

// Run npm install to install the local packages
try {
    console.log('Installing local packages...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('Local packages installed successfully!');
} catch (error) {
    console.error('Error installing local packages:', error);
    process.exit(1);
}

// Verify that we're using the local packages
const packageJsonPath = join(__dirname, 'node_modules', '@wdio', 'browserstack-service', 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`Using @wdio/browserstack-service version: ${packageJson.version}`);
    
    // Check if the build directory exists
    const buildDirPath = join(__dirname, 'node_modules', '@wdio', 'browserstack-service', 'build');
    if (fs.existsSync(buildDirPath)) {
        console.log('Build directory exists in the local package.');
        
        // Check the testorchestration handler
        const handlerPath = join(buildDirPath, 'testorchestration', 'testorcherstrationhandler.js');
        if (fs.existsSync(handlerPath)) {
            console.log('Test orchestration handler found in the local package.');
        } else {
            console.error('Test orchestration handler not found in the local package.');
        }
    } else {
        console.error('Build directory does not exist in the local package.');
    }
} else {
    console.error('BrowserStack service package.json not found. Local packages may not be installed correctly.');
}

console.log('Setup complete!');
