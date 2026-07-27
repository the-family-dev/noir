module.exports = {
  apps: [
    {
      name: "noir",
      script: "dist/server/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      cwd: __dirname,
    },
  ],
};
