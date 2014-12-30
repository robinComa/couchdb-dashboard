angular.module('app').controller('DashboardCtrl', function($scope, dashboard, formActive){

    $scope.dashboard = dashboard;

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