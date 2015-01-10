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