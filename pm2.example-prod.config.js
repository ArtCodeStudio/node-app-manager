/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: "prod:@artcodestudio/node-app-manager",
      script: "yarn run start:prod",
      instances: 1,
      env: {},
    },
  ],
};
