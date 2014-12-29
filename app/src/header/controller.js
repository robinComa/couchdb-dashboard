angular.module('app').controller('HeaderCtrl', function($rootScope, $scope, Login){

    $scope.logout = function(){
        Login.logout();
        $rootScope.user = null;
    }

});