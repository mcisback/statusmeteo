module.exports = {
    apps : [{
      name: 'StatusMeteo',
      script: 'server.js',
  
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      args: '',
      instances: 1,
      autorestart: true,
      watch: true,
      ignore_watch: ['uploads/'],
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'dev'
      },
      env_production: {
        NODE_ENV: 'prod'
      }
    }],
  
    deploy : {
      production : {
        user : 'web',
        host : 'localhost',
        ref  : 'origin/master',
        repo : 'git@github.com:mcisback/statusmeteo.git',
        path : '/home/web/web/webapps/jsstatusmeteo',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  };