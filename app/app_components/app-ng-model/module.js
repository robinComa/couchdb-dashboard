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