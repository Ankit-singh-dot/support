import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(backendDir, '.env') });

async function run() {
  try {
    console.log('[Test Harness] Running backend test suite against configured database...');
    execSync('node --test tests/api.test.js', {
      cwd: backendDir,
      stdio: 'inherit',
      env: process.env,
    });
    console.log('[Test Harness] All tests passed successfully!');
  } catch (err) {
    console.error('[Test Harness] Test failure or error:', err.message);
    process.exitCode = 1;
  }
}

run();
