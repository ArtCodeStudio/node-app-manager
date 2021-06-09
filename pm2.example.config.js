/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: "dev:@artcodestudio/node-app-manager",
      script: "yarn run start",
      watch: ["package.json", ".pnp.js"],
      instances: 1,
      env: {},
    },
  ],
};
