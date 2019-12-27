module.exports = {
    dev: {
        host: 'localhost',
        appUrl: 'http://localhost:8082',
        apiEndpointUrl: 'http://localhost:8082/api',
        apiEndpoint: '/api',
        domain: 'statusmeteo.marcocaggiano.com',
        port: 8082,
        publicDir: '/frontend',
        databaseUrl: 'mongodb://localhost:27017/statusmeteo',
        secretKey: '5641FE19EA34D6A575CFCAA44D6F93458D7408F3C15DF313326E316FD1AD1522BA71B24DC1D088007CB04C79A1E6F7EE8E4C18555360E14230BE32FF700803D3',
        SENDGRID_API_KEY: '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',
        IMGBB_API_KEY: '98a5b2182e7572c82c466ee98a93a121',
        IMGBB_API_URL: 'https://api.imgbb.com/1/upload'
    },
    prod: {
        host: 'localhost',
        appUrl: 'https://statusmeteo.marcocaggiano.com',
        apiEndpointUrl: 'https://statusmeteo.marcocaggiano.com/api',
        apiEndpoint: '/api',
        domain: 'statusmeteo.marcocaggiano.com',
        port: 8082,
        publicDir: '/frontend',
        databaseUrl: 'mongodb://localhost:27017/statusmeteo',
        secretKey: '8641FE19EA34D6A575CFCAA44D6F93458D7408F3C15DF313326E316FD1AD1522BA71B24DC1D088007CB04C79A1E6F7EE8E4C18555360E14230BE32FF700803D3',
        SENDGRID_API_KEY: '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',
        IMGBB_API_KEY: '98a5b2182e7572c82c466ee98a93a121',
        IMGBB_API_URL: 'https://api.imgbb.com/1/upload'
    }
}