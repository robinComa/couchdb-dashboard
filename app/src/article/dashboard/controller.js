angular.module('app').controller('DashboardCtrl', function($scope, $pouchDbResource){

    $scope.search = {
        endpoint: 'tweet',
        map : function(doc) {
            emit(doc.text.split(' ')[0], doc);
        }.toString(),
        reduce: null
    };

    $scope.submitSearch = function(){
        if($scope.form.$valid){
            var fn = eval('(' + $scope.search.map + ')');
            if($scope.search.reduce){
                fn = {
                    map: fn,
                    reduce: eval('(' + $scope.search.reduce + ')')
                }
            }
            var resource = new $pouchDbResource($scope.search.endpoint);
            resource.query({
                limit: 50,
                skip: 0
            }, fn).then(function(results){
                $scope.results = results;
                $scope.active = false;
            })
        }
    };

});