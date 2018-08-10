// Container for all the environments
const environments = {
    staging : {
        httpPort : 6000,
        httpsPort : 6001,
        envName : 'staging',
        dataStore : 'fs', // @TODO future integration with DB
        hashingSecret : 'thisIsASecret',
        currencyFormat: 'USD',
        maxChecks : 5,
    },
    production : {
        httpPort : 7000,
        httpsPort : 7001,
        envName : 'production',
        dataStore : 'fs', // @TODO future integration with DB
        hashingSecret : 'thisIsASecret',
        currencyFormat: 'USD',
        maxChecks : 5,
    }
};

// Determine which environment was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check tghat the current environment is one of the environments abovem if not, default to staging
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = envToExport;