// Container for all the environments
const environments = {
    staging : {
        httpPort : 6000,
        httpsPort : 6001,
        envName : 'staging',
        dataStore : 'fs', // @TODO future integration with DB
        hashingSecret : 'thisIsASecret',
        currencyFormat : 'USD',
        stripeKey : 'sk_test_9FeaFnAEpCaYPtJRzD6mJfZS',
        mailgunKey : '6f1b9cddc44b7fd250a3cad8fd46e5bc-6b60e603-3dffc1ef',
        mailgunDomain : 'sandboxe7ee676a241d48e08af43fc5f4b8f0ad.mailgun.org',
        fromEmail : 'noreply@uncleralphspizzia.com' // fake test adrress
    },
    production : {
        httpPort : 7000,
        httpsPort : 7001,
        envName : 'production',
        dataStore : 'fs', // @TODO future integration with DB
        hashingSecret : 'thisIsASecret',
        currencyFormat : 'USD',
        stripeKey : '<productionKey>', // @TODO update accordingly
        mailgunKey : '<productionKey>', // @TODO update accordingly
        mailgunDomain : '<productionDomain>', // @TODO update accordingly
        fromEmail : '<productionEmail>' // @TODO update accordingly
    }
};

// Determine which environment was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check tghat the current environment is one of the environments abovem if not, default to staging
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = envToExport;