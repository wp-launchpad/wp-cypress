const fs = require('fs');
const path = require('path');

const sleep = require('./utils/sleep');
const { wpcli } = require('./utils/exec');
const run = require('./utils/run');

const configureWordPress = async (configFilePath, logFile) => {
  const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

  await run(
    async () => wpcli('plugin activate wp-cypress', logFile),
    'Activating WP Cypress plugin',
    'WP Cypress plugin Activated',
    logFile,
  );

  // Below is generally bad practice, but in this case we need
  // them to be blocking and run syncronously to work.

  // eslint-disable-next-line no-restricted-syntax
  for (const pluginPath of config.plugins) {
    const pluginName = path.basename(pluginPath);
    // eslint-disable-next-line no-await-in-loop
    await run(
      async () => wpcli(`plugin activate ${pluginName}`, logFile),
      `Activating ${pluginName} plugin`,
      `${pluginName} plugin activated`,
      logFile,
    );
  }

  if (config.themes.length > 0) {
    const themeName = path.basename(config.themes[0]);
    await run(
      async () => wpcli(`plugin activate ${themeName}`, logFile),
      `Activating ${themeName} plugin`,
      `${themeName} plugin activated`,
      logFile,
    );
  }

  await run(
    async () => wpcli('seed Init', logFile),
    'Seeding Database',
    'Database Seeded',
    logFile,
  );
};

module.exports = configureWordPress;
