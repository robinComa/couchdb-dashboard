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