angular.module('app').factory('Dashboard', function($pouchDbResource, config){
    return new $pouchDbResource(config.backend.endpoint + config.backend.resource);
});