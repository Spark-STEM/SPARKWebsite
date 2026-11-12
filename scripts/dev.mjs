import { spawn } from 'node:child_process';

const npmCli = process.env.npm_execpath;
if (!npmCli) {
    throw new Error('Run this script through `npm run dev`.');
}

function runNpm(args) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [npmCli, ...args], {
            stdio: 'inherit',
        });
        child.once('error', reject);
        child.once('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`npm ${args.join(' ')} exited with code ${code}.`));
        });
    });
}

await runNpm(['run', 'build']);

const children = [
    spawn(
        process.execPath,
        [
            'node_modules/wrangler/bin/wrangler.js',
            'pages',
            'dev',
            'build',
            '--ip',
            '127.0.0.1',
            '--port',
            '8788',
        ],
        { stdio: 'inherit' }
    ),
    spawn(
        process.execPath,
        [
            'node_modules/vite/bin/vite.js',
            'dev',
            '--host',
            '127.0.0.1',
            '--port',
            '5173',
            '--strictPort',
        ],
        { stdio: 'inherit' }
    ),
];

function stopChildren() {
    for (const child of children) {
        if (child.exitCode === null) child.kill();
    }
}

process.once('SIGINT', stopChildren);
process.once('SIGTERM', stopChildren);

for (const child of children) {
    child.once('error', (error) => {
        console.error(error);
        stopChildren();
        process.exitCode = 1;
    });
    child.once('exit', (code) => {
        if (code !== 0 && code !== null) process.exitCode = code;
        stopChildren();
    });
}
