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