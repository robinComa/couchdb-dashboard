angular.module('app', [
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
    'ui.sortable',
    'pascalprecht.translate',
    'infinite-scroll',
    'angular-loading-bar',
    'pouchdb',
    'googlechart',
    'appLogin',
    'appNgModel',
    'appMapReduceFn',
]).config(function($translateProvider, $pouchDbResourceProvider, LoginProvider, config){

    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'i18n/{lang}/{part}.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.cloakClassName('hidden');

    $pouchDbResourceProvider.settings.debug = false;

    LoginProvider.config = config.auth;

}).run(function(){


});