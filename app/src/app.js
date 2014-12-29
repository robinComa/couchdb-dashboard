angular.module('app', [
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
    'appLogin',
    'pascalprecht.translate',
    'infinite-scroll',
    'angular-loading-bar',
    'pouchdb'
]).config(function($translateProvider, $pouchDbResourceProvider){

    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'i18n/{lang}/{part}.json'
    });
    $translateProvider.preferredLanguage('en');

    $translateProvider.cloakClassName('hidden');

    $pouchDbResourceProvider.settings.dbNamespace = 'http://robin-db.iriscouch.com/';
    $pouchDbResourceProvider.settings.debug = false;

}).run(function($translatePartialLoader, $translate, $rootScope, Login){

    Login.getUser().then(function(user){
        $rootScope.user = user;
    });
});

angular.module('app').directive('ngModelFn', function(){
    return {
        require: 'ngModel',
        scope:{
            bindModel:'=ngModel'
        },
        link: function(scope, elem, attr, ctrl){
            scope.$watch(function(){
                return scope.bindModel;
            }, function(val){
                try{
                    ctrl.$setValidity('parse', !val || typeof eval('(' + val + ')') === 'function');
                }catch(err){
                    ctrl.$setValidity('parse', false);
                }
            });
        }
    }
});