angular.module('appLogin', [
    'directive.g+signin',
    'angular-loading-bar'
]).provider('Login', function(){

    this.type = 'google';

    var User = function(id, email, name, picture, link){
        this.id = id;
        this.name = name;
        this.picture = picture;
        this.link = link;
        this.getId = function(){
            return id;
        };
        this.getEmail = function(){
            return email;
        };
        this.getName = function(){
            return name || email;
        };
        this.getPicture = function(){
            return picture;
        };
        this.getLink = function(){
            return link;
        };
    };

    var logout;

    this.$get = function($rootScope, $q, cfpLoadingBar){
        var deferred = $q.defer();

        cfpLoadingBar.start();

        if(this.type === 'google'){

            $rootScope.$on('event:google-plus-signin-success', function (event,authResult) {
                gapi.auth.setToken(authResult);
                gapi.client.load('oauth2', 'v2', function() {
                    var request = gapi.client.oauth2.userinfo.get();
                    request.execute(function(obj){
                        logout = gapi.auth.signOut;
                        cfpLoadingBar.complete();
                        deferred.resolve(new User(obj.id, obj.email, obj.name, obj.picture, obj.link));
                    });
                });
            });
            $rootScope.$on('event:google-plus-signin-failure', function (event,authResult) {
                deferred.notify(authResult);
            });
        }

        return {
            getUser: function(){
                return deferred.promise;
            },
            logout: function(){
                return logout();
            }
        }
    };

});
angular.module('pouchdb', []).config(function(){

}).run(function(){

});

angular.module('pouchdb').provider('$pouchDbResource', function(){

    var options = {
        ajax: {
            cache: true
        }
    };

    this.settings = {
        debug: false
    };

    this.$get = function($q, cfpLoadingBar) {

        if(this.settings.debug){
            PouchDB.debug.enable('*');
        }else{
            PouchDB.debug.disable();
        }

        return function(resource){

            var db = new PouchDB(resource, options);

            var Resource = function(){
                this.$save = function () {
                    cfpLoadingBar.start();
                    var deferred = $q.defer();
                    this._id = this._id || new Date().toISOString();
                    db.put(this, function (err, doc) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(doc);
                        }
                        cfpLoadingBar.complete();
                    });
                    return deferred.promise;
                };

                this.$remove = function(){
                    cfpLoadingBar.start();
                    var deferred = $q.defer();
                    db.remove(this, function(err, doc){
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(doc);
                        }
                        cfpLoadingBar.complete();
                    });
                    return deferred.promise;
                };
                this.$delete = this.$remove;
            };

            var toResource = function(doc){
                return angular.extend(new Resource(), doc);
            };

            var toResources = function(doc){
                return doc.rows.map(function (row) {
                    return toResource(row.doc || row);
                });
            };

            var defaultParams = {include_docs: true, descending: true};

            Resource.get = function(_id, params){
                cfpLoadingBar.start();
                var deferred = $q.defer();
                db.get(_id, angular.extend(defaultParams, params), function (err, doc) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(toResource(doc));
                        cfpLoadingBar.complete();
                    }
                });
                return deferred.promise;
            };
            Resource.query = function(params, fn){
                cfpLoadingBar.start();
                var deferred = $q.defer();
                db.query(fn || function(doc){
                    emit(doc._id, doc)
                }, angular.extend(defaultParams, params), function (err, doc) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(toResources(doc));
                    }
                    cfpLoadingBar.complete();
                });
                return deferred.promise;
            };
            return Resource;
        }
    };

});
angular.module('appNgModel', []).directive('ngModelFn', function(){
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

}).run(function(){


});
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
angular.module('app').controller('HeaderCtrl', function($rootScope, $scope, Login){

    $scope.logout = function(){
        Login.logout();
        $rootScope.user = null;
    }

});
angular.module('app').controller('NavCtrl', function($rootScope, $scope, Dashboard, Login){

    Login.getUser().then(function(user){
        $rootScope.user = user;
        $scope.myDashboards = $scope.dashboards.filter(function(dashboard){
            return $rootScope.user && dashboard.value.author.id === $rootScope.user.id;
        });
    });

    Dashboard.query({
        include_docs: false
    }, function(doc){
        emit(doc._id, {
            title: doc.title,
            author: doc.author
        });
    }).then(function(dashboards){
        $scope.dashboards = dashboards;
    });

});
angular.module('app').directive('appAnalyse', function($pouchDbResource){

    var adapter = {
        toTable: function(results){
            return results;
        },
        toGoogleChart: function(type, results){
            var chartObject = {
                type: type,
                data: {
                    cols: [
                        {id: "t", label: "Key", type: "string"},
                        {id: "s", label: "Value", type: "number"}
                    ],
                    rows: []
                }
            };
            angular.forEach(results, function(value){
                chartObject.data.rows.push({c: [
                    {v: value.key},
                    {v: value.value},
                ]});
            });
            return chartObject;
        }
    };

    var transformResults = function(type, results){
        switch (type){
            case 'TABLE':
                return adapter.toTable(results);
            case 'PIE':
                return adapter.toGoogleChart('PieChart', results);
            case 'BAR':
                return adapter.toGoogleChart('BarChart', results);
            case 'COLUMN':
                return adapter.toGoogleChart('ColumnChart', results);
            case 'LINE':
                return adapter.toGoogleChart('LineChart', results);
            default:
                return results;
        }
    };

    return {
        replace: true,
        templateUrl: 'src/article/dashboard/analyse.html',
        scope: {
            analyse: '=appAnalyse'
        },
        link: function(scope){

            var setResults = function(results){
                scope.error = false;
                scope.results = results;
                scope.pieResults =  transformResults('PIE', results);
                scope.barResults =  transformResults('BAR', results);
                scope.columnResults =  transformResults('COLUMN', results);
                scope.lineResults =  transformResults('LINE', results);
            };

            scope.$watch(function(){
                return scope.analyse;
            }, function(val){
                setResults(null);
                if(val){
                    var fn = eval('(' + scope.analyse.map + ')');
                    if(scope.analyse.reduce){
                        fn = {
                            map: fn,
                            reduce: eval('(' + scope.analyse.reduce + ')')
                        }
                    }
                    var resource = new $pouchDbResource(scope.analyse.endpoint);
                    resource.query({
                        limit: 50,
                        skip: 0,
                        include_docs: !scope.analyse.reduce,
                        group: !(!scope.analyse.reduce)
                    }, fn).then(function(results){
                        setResults(results);
                    }, function(error){
                        scope.error = error.message;
                    });
                }
            });
        }
    };

});
angular.module('app').directive('appAnalyseForm', function(Dashboard){

    return {
        replace: true,
        templateUrl: 'src/article/dashboard/form.html',
        scope: {
            analyse: '=appAnalyseForm',
            formActive: '=appAnalyseFormActive',
            formSubmit: '=appAnalyseFormSubmit'
        },
        link: function(scope){

            Dashboard.query({
                group: true
            }, {
                map: function(doc) {
                    doc.analyses.map(function(a){
                        emit(a.endpoint);
                    });
                },
                reduce: function(key, value){
                    return value.length;
                }
            }).then(function(endPoints){
                scope.endPoints = endPoints;
            });

            scope.toggleActive = function(){
                scope.formActive = !scope.formActive;
                scope.analyseToshow = null;
                scope.analyse = null;
            };

            scope.show = function(){
                if(scope.form.$valid){
                    scope.analyseToshow = angular.copy(scope.analyse);
                }
            };

            scope.submit = function(){
                if(scope.form.$valid){
                    scope.formSubmit(scope.analyse);
                    scope.toggleActive();
                }
            };

        }
    };

});
angular.module('app').factory('Dashboard', function($pouchDbResource){
    return new $pouchDbResource('http://robin-db.iriscouch.com/dashboard');
});
angular.module('app').controller('DashboardCtrl', function($rootScope, $scope, dashboard, formActive, $state){

    $scope.dashboard = dashboard;

    $scope.isOwner = !dashboard.author || $rootScope.user && dashboard.author.id === $rootScope.user.id;

    if(!$scope.dashboard.title){
        $scope.dashboard.title = 'My Dashboard Title';
    }
    if(!$scope.dashboard.analyses){
        $scope.dashboard.analyses = [];
    }

    $scope.$watch(function(){
        return $scope.dashboard;
    }, function(val, oldVal){
        if(val._rev === oldVal._rev && !angular.equals(val, oldVal)){
            $scope.hasChange = true;
        }
    }, true);

    $scope.formActive = formActive;

    $scope.saveDashboard = function(){
        $scope.dashboard.$save().then(function(data){
            $scope.dashboard._rev = data.rev;
            $scope.hasChange = false;
        });
    };

    $scope.deleteDashboard = function(){
        $scope.dashboard.$delete().then(function(){
            $state.go('dashboard', {id: null});
        });
    };

    $scope.formAnalyseSubmit = function(analyse){
        var index = analyse.$index;
        delete analyse.$index;
        if (index > -1) {
            $scope.dashboard.analyses[index] = analyse;
        }else{
            $scope.dashboard.analyses.push(analyse);
        }
    };

    $scope.updateAnalyse = function(analyse, $index){
        $scope.analyse = angular.copy(analyse);
        $scope.analyse.$index = $index;
        $scope.formActive = true;
    };

    $scope.deleteAnalyse = function(index){
        $scope.dashboard.analyses.splice(index, 1);
    };

});