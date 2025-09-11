let config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    //
    // BrowserStack Credentials
    // ====================
    user: 'vipik_ufasnc',
    key: 'KxuhKDwCFHG3cGYNEfmt',
    //
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './test/**/*.js'
    ],
    // specs:['./test/testA.js','./test/testB.js','./test/testC.js'],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    maxInstances: 10,
    capabilities: [{
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'bstack:options': {
            os: 'Windows',
            osVersion: '11',
            browserVersion: 'latest',
            local: false,
            networkLogs: true
        }
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

        services : [
        ['browserstack', {
            testObservability: true,
            testObservabilityOptions: {
                user: 'vipik_ufasnc',
                key: 'KxuhKDwCFHG3cGYNEfmt',
                projectName: "Test Orchestration Example",
                buildName: "WebdriverIO Test Run",
                buildTag: ['wdio']
            },
            browserstackLocal: false,
            testOrchestrationOptions: {
                runSmartSelection: {
                    enabled: true,
                    mode: 'relevantFirst',
                    source: ["/Users/vipinkumaryadav/Documents/browserstack-python-sdk"]
        }
    }
        }]
    ],
    
    // Direct connection to BrowserStack
    // This bypasses the test orchestration issue with the BrowserStack service
    hostname: 'hub.browserstack.com',
    
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
};

// // If orchestration is enabled, configure BrowserStack service for orchestration
// if (config.testOrchestration && config.testOrchestration.enabled) {
//     // Remove direct hostname so service can manage connections
//     delete config.hostname;

//     config.services = [
//         ['browserstack', {
//             testObservability: true,
//             testObservabilityOptions: {
//                 user: config.user,
//                 key: config.key,
//                 projectName: "Test Orchestration Example",
//                 buildName: "WebdriverIO Test Run",
//                 buildTag: ['wdio']
//             },
//             browserstackLocal: false,
//             testOrchestrationOptions: {
//                 runSmartSelection: {
//                     enabled: true,
//                     mode: 'relevantFirst'
//         }
//     }
//         }]
//     ];
// }

export { config };
