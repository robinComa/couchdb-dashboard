angular.module('app').directive('appAnalyse', function($pouchDbResource){

    var adapter = {
        toGoogleChart: function(type, results){
            var chartObject = {
                type: type,
                data: {
                    cols: [
                        {id: "t", label: "Key", type: "string"},
                        {id: "s", label: "Value", type: "number"}
                    ],
                    rows: []
                }
            };
            angular.forEach(results, function(value){
                chartObject.data.rows.push({c: [
                    {v: value.key},
                    {v: value.value},
                ]});
            });
            return chartObject;
        }
    };

    var transformResults = function(type, results){
        switch (type){
            case 'TABLE':
                return adapter.toGoogleChart('Table', results);
            case 'PIE':
                return adapter.toGoogleChart('PieChart', results);
            case 'BAR':
                return adapter.toGoogleChart('BarChart', results);
            case 'COLUMN':
                return adapter.toGoogleChart('ColumnChart', results);
            case 'LINE':
                return adapter.toGoogleChart('LineChart', results);
            case 'GEO':
                return adapter.toGoogleChart('GeoChart', results);
            default:
                return results;
        }
    };

    return {
        replace: true,
        templateUrl: 'src/article/dashboard/analyse.html',
        scope: {
            analyse: '=appAnalyse'
        },
        link: function(scope){

            var setResults = function(results, type){
                scope.error = false;
                scope.results = results && type ? transformResults(type, results) : null;
            };

            scope.$watch(function(){
                return scope.analyse;
            }, function(val){
                setResults();
                if(val){
                    var fn = eval('(' + scope.analyse.map + ')');
                    if(scope.analyse.reduce){
                        fn = {
                            map: fn,
                            reduce: eval('(' + scope.analyse.reduce + ')')
                        }
                    }
                    var resource = new $pouchDbResource(scope.analyse.endpoint);
                    resource.query({
                        limit: 1000,
                        skip: 0,
                        descending:false,
                        include_docs: !scope.analyse.reduce,
                        group: !(!scope.analyse.reduce)
                    }, fn).then(function(results){
                        setResults(results, scope.analyse.type);
                    }, function(error){
                        scope.error = error.message;
                    });
                }
            });
        }
    };

});