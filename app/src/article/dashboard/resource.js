angular.module('app').factory('Dashboard', function($pouchDbResource){
    return new $pouchDbResource('http://robin-db.iriscouch.com/dashboard');
});