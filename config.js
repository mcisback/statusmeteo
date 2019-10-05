module.exports = {
    dev: {
        host: 'localhost',
        appUrl: 'http://localhost:8082',
        port: 8082,
        publicDir: '/frontend',
        databaseUrl: 'mongodb://localhost:27017/statusmeteo',
        secretKey: '5641FE19EA34D6A575CFCAA44D6F93458D7408F3C15DF313326E316FD1AD1522BA71B24DC1D088007CB04C79A1E6F7EE8E4C18555360E14230BE32FF700803D3'
    },
    prod: {
        host: 'localhost',
        appUrl: 'http://statusmeteo.marcocaggiano.com',
        port: 8082,
        publicDir: '/frontend',
        databaseUrl: 'mongodb://localhost:27017/statusmeteo',
        secretKey: '8641FE19EA34D6A575CFCAA44D6F93458D7408F3C15DF313326E316FD1AD1522BA71B24DC1D088007CB04C79A1E6F7EE8E4C18555360E14230BE32FF700803D3'
    }
}