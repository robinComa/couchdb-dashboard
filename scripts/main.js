angular.module('appLogin', [
    'directive.g+signin',
    'angular-loading-bar'
]).directive('appLoginFrame', function(Login){
    return {
        scope : {},
        restrict: 'A',
        templateUrl: 'src/commons/app-login/view.html',
        link: function(scope){
            scope.config = Login.config;
        }
    }
}).provider('Login', function(){

    this.config = {
        type: 'google',
        app_id: 00000000
    };

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

        if(this.config.type === 'google'){

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
            } ,
            config: this.config
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

        return function(resource, auth){

            var db = new PouchDB(resource, options);

            if(auth){
                db.login(auth.login, auth.password).then(function () {

                });
            }

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
angular.module('appMapReduceFn', []).directive('appMapReduceFn', function(){
    return {
        require: 'ngModel',
        scope:{
            bindModel:'=ngModel'
        },
        transclude: true,
        replace: true,
        templateUrl: 'src/commons/app-map-fn/view.html',
        link: function(scope, elem, attr, ctrl){

            var computeRestriction = function(restrictions){
                return restrictions.map(function(restriction){
                    return 'doc.' + restriction.key + '.match(/' + restriction.value + '/)[0]';
                }).join(' && ');
            };

            var computeFn = function(mapFn){
                var head = 'function(doc){';
                var footer = '}';
                var bodies = [];
                if(mapFn.restrictions.length > 0){
                    bodies.push('if(' + computeRestriction(mapFn.restrictions) + '){')
                }
                bodies.push('emit(doc.' + mapFn.result.key + ', doc.' + mapFn.result.value + ');')
                if(mapFn.restrictions.length > 0){
                    bodies.push('}');
                }
                return {
                    map: [head, '\t' + bodies.join('\n'), footer].join('\n'),
                    reduce: 'function(k,v){return v.length;}'
                };
            };

            scope.mapFn = {
                result: {
                    key: '',
                    value: ''
                },
                restrictions: []
            };

            scope.addRestriction = function(){
                scope.mapFn.restrictions.push({key: '', value: ''});
            };

            scope.removeRestriction = function(index){
                scope.mapFn.restrictions.splice(index, 1);
            };

            scope.$watch(function(){
                return scope.mapFn;
            }, function(val){
                var mapReduce = computeFn(val);
                scope.bindModel.map = mapReduce.map;
                scope.bindModel.reduce = mapReduce.reduce;
            }, true);
        }
    }
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
                return adapter.toGoogleChart('Table', results);
            case 'PIE':
                return adapter.toGoogleChart('PieChart', results);
            case 'BAR':
                return adapter.toGoogleChart('BarChart', results);
            case 'COLUMN':
                return adapter.toGoogleChart('ColumnChart', results);
            case 'LINE':
                return adapter.toGoogleChart('LineChart', results);
            case 'GEO':
                return adapter.toGoogleChart('GeoChart', results);
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

            var setResults = function(results, type){
                scope.error = false;
                scope.results = results && type ? transformResults(type, results) : null;
            };

            scope.$watch(function(){
                return scope.analyse;
            }, function(val){
                setResults();
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
                        limit: 1000,
                        skip: 0,
                        descending:false,
                        include_docs: !scope.analyse.reduce,
                        group: !(!scope.analyse.reduce)
                    }, fn).then(function(results){
                        setResults(results, scope.analyse.type);
                    }, function(error){
                        scope.error = error;
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
            formSubmit: '=appAnalyseFormSubmit',
            isOwner: '=appAnalyseFormIsOwner'
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

            scope.canShow = function(){
                return scope.form.endPoint.$valid && scope.form.map.$valid;
            };

            scope.$watch(function(){
                return scope.analyse;
            }, function(){
                if(scope.canShow()){
                    scope.analyseToshow = angular.copy(scope.analyse);
                }
            },true);

            scope.submit = function(){
                if(scope.form.$valid){
                    scope.formSubmit(scope.analyse);
                    scope.toggleActive();
                }
            };

        }
    };

});
angular.module('app').factory('Dashboard', function($pouchDbResource, config){
    return new $pouchDbResource(config.backend.endpoint + config.backend.resource, config.backend.auth);
});
angular.module('app').controller('DashboardCtrl', function($rootScope, $scope, dashboard, formActive, $state){

    $scope.dashboard = dashboard;

    $scope.isOwner = function(){
        return !dashboard.author || $rootScope.user && dashboard.author.id === $rootScope.user.id;
    };

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