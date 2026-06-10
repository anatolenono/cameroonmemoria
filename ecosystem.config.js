module.exports = {
  apps: [
    {
      name: 'cameroonmemoria',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',

      // Environment
      env: {
        NODE_ENV: 'production',
      },

      // Crash handling
      kill_timeout: 5000,        // Force kill after 5s if SIGTERM ignored
      wait_ready: false,         // Don't wait for readiness signal (pnpm start starts sync)
      listen_timeout: 3000,      // Timeout for listening event

      // Restart behavior
      restart_delay: 4000,       // Wait 4s between restart attempts
      max_restarts: 10,          // Max restart attempts in 1min
      min_uptime: '10s',         // Min uptime to count as successful start
      autorestart: true,         // Auto restart on crash

      // Logging
      output: '~/.pm2/logs/cameroonmemoria-out.log',
      error: '~/.pm2/logs/cameroonmemoria-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown
      shutdown_with_message: true,

      // Watch mode (optional - disable in production)
      // watch: false,
      // ignore_watch: ['node_modules', '.next', '.env.local'],
    },
  ],
};
