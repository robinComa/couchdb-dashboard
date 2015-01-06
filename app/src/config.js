angular.module('app').constant('config', {

    auth: {
        type: 'google',
        app_id: 631974897480
    },
    backend: {
        endpoint: 'https://dashboard-couchdb.iriscouch.com/',
        auth: {
            login: 'dashboard-couchdb',
            password: 'P@$$w0rd'
        },
        resource: 'dashboard'
    }

});