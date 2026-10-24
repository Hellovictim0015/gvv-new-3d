const { execSync } = require('child_process');
execSync('npx next start -p 3090', { stdio: 'inherit' });
