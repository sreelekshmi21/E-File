module.exports = {
    apps: [
        {
            name: 'e-file-backend',
            script: 'server.js',
            cwd: 'C:\\Users\\ftadmin\\e-filing\\e-file\\backend',
            env: {
                NODE_ENV: 'production'
            },
            // Restart on failure
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'C:\\Users\\ftadmin\\e-filing\\e-file\\logs\\backend-error.log',
            out_file: 'C:\\Users\\ftadmin\\e-filing\\e-file\\logs\\backend-out.log',
            merge_logs: true
        },
        {
            name: 'e-file-frontend',
            script: 'npx',
            args: 'serve -s dist -l 5173',
            cwd: 'C:\\Users\\ftadmin\\e-filing\\e-file\\frontend',
            env: {
                NODE_ENV: 'production'
            },
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'C:\\Users\\ftadmin\\e-filing\\e-file\\logs\\frontend-error.log',
            out_file: 'C:\\Users\\ftadmin\\e-filing\\e-file\\logs\\frontend-out.log',
            merge_logs: true
        }
    ]
};
