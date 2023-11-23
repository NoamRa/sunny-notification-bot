/**
 * pm2 ecosystem configuration
 * https://pm2.keymetrics.io/docs/usage/application-declaration/
 */
module.exports = {
  apps: [
    {
      name: "sunny-notification-bot",
      script: "npm run start:unattended",
    },
  ],
};
