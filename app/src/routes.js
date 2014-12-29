angular.module('app').config(function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise('/dashboard');

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
                    templateUrl: 'src/nav/view.html'
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
            url: 'dashboard',
            parent: 'article',
            templateUrl: 'src/article/dashboard/view.html',
            controller: 'DashboardCtrl'
        });

});