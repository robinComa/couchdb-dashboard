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