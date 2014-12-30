angular.module('app').controller('NavCtrl', function($rootScope, $scope, Dashboard){

    Dashboard.query({include_docs: false}).then(function(dashboards){
        $scope.dashboards = dashboards;
    });

});