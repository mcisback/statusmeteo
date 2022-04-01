module.exports = {
    dev: {
        host: 'localhost',
        appUrl: 'http://localhost:8082',
        apiEndpointUrl: 'http://localhost:8082/api',
        apiEndpoint: '/api',
        domain: 'domain.com',
        port: 8082,
        publicDir: '/frontend',
        databaseUrl: 'mongodb://localhost:27017/statusmeteo',
        uploadDir: '/tmp/uploads/',
        secretKey: '',
        SENDGRID_API_KEY: '',
        IMGBB_API_KEY: '',
        IMGBB_API_URL: 'https://api.imgbb.com/1/upload'
    },
    prod: {
        host: 'localhost',
        appUrl: 'https://domain.com',
        apiEndpointUrl: 'https://domain.com/api',
        apiEndpoint: '/api',
        domain: 'domain.com',
        port: 8082,
        publicDir: '/frontend',
        databaseUrl: 'mongodb://localhost:27017/statusmeteo',
        uploadDir: '/tmp/uploads/',
        secretKey: '',
        SENDGRID_API_KEY: '',
        IMGBB_API_KEY: '',
        IMGBB_API_URL: 'https://api.imgbb.com/1/upload'
    }
}
