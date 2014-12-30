angular.module('app').controller('DashboardCtrl', function($scope, dashboard, formActive){

    $scope.dashboard = dashboard;

    $scope.formActive = formActive;

    $scope.saveDashboard = function(){
        $scope.dashboard.$save().then(function(){

        });
    };

    $scope.formAnalyseSubmit = function(analyse){
        if(!$scope.dashboard.analyses){
            $scope.dashboard.analyses = [];
        }
        $scope.dashboard.analyses.push(analyse);
    };

    $scope.updateAnalyse = function(analyse){
        $scope.analyse = angular.copy(analyse);
        $scope.formActive = true;
    };

    $scope.deleteAnalyse = function(index){
        $scope.dashboard.analyses.splice(index, 1);
    };

});