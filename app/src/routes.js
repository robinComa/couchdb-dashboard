angular.module('app').config(function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise('/dashboard/');

    $stateProvider
        .state('app', {
            abstract: true,
            url: '/',
            views: {
                header: {
                    templateUrl: 'src/header/view.html',
                    controller: 'HeaderCtrl'
                },
                nav: {
                    templateUrl: 'src/nav/view.html',
                    controller: 'NavCtrl'
                },
                aside: {
                    templateUrl: 'src/aside/view.html'
                }
            },
            resolve: {
                i18n: function($translatePartialLoader, $translate){
                    $translatePartialLoader.addPart('common');
                    $translatePartialLoader.addPart('header');
                    $translatePartialLoader.addPart('nav');
                    $translatePartialLoader.addPart('dashboard');
                    $translatePartialLoader.addPart('aside');
                    return $translate.refresh();
                }
            }
        })
        .state('article', {
            abstract: true,
            parent: 'app',
            views: {
                '@': {
                    template: '<div ui-view></div>'
                }
            }
        })
        .state('dashboard', {
            url: 'dashboard/{id}',
            parent: 'article',
            templateUrl: 'src/article/dashboard/view.html',
            controller: 'DashboardCtrl',
            resolve: {
                dashboard: function(Dashboard, $stateParams){
                    var dashboard;
                    if($stateParams.id){
                        return Dashboard.get($stateParams.id);
                    }else{
                        return new Dashboard();
                    }
                },
                formActive: function($stateParams){
                    return !$stateParams.id;
                }
            }
        });

});