angular.module('app', [
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
    'ui.sortable',
    'appLogin',
    'appNgModel',
    'pascalprecht.translate',
    'infinite-scroll',
    'angular-loading-bar',
    'pouchdb',
    'googlechart'
]).config(function($translateProvider, $pouchDbResourceProvider){

    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'i18n/{lang}/{part}.json'
    });
    $translateProvider.preferredLanguage('en');

    $translateProvider.cloakClassName('hidden');

    $pouchDbResourceProvider.settings.debug = false;

}).run(function($translatePartialLoader, $translate, $rootScope, Login){

    Login.getUser().then(function(user){
        $rootScope.user = user;
    });
});