module.exports = {
  apps: [{
    name: 'nev-import-server',
    script: './scripts/nev-import-server.js',
    cwd: '/Users/imodteam/projects/imod-portal',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3200,
      OPENCLAW_GATEWAY_URL: 'http://localhost:3030',
      OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || '',
      DATABASE_URL: process.env.DATABASE_URL || ''
    },
    error_file: '/Users/imodteam/.openclaw/logs/nev-import-server-error.log',
    out_file: '/Users/imodteam/.openclaw/logs/nev-import-server-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
