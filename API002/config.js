// create and export config vars

// create general container for all envs
var environments = {};
// create staging environment object (default env)
environments.staging = {

    'httpPort' : 3000,
    'httpsPort' : 3030,
    'envName' : 'staging'

};

environments.production = {

    //443 for https
    'httpPort' : 80,
    'httpsPort' : 443,
    'envName' : 'production'

};

// determine which env was passed at command line start
var currentEnvironment = 
    typeof(process.env.NODE_ENV) == 'string' ? 
        process.env.NODE_ENV.toLowerCase() :
        '';
 
// check if valid env was passed, or default to staging
var environmentToExport = 
    typeof(environments[currentEnvironment]) == 'object' ?
    environments[currentEnvironment] :
    environments.staging;

// now actually export the required module
module.exports = environmentToExport;




