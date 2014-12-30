angular.module('app').directive('appAnalyse', function($pouchDbResource){

    var adapter = {
        toTable: function(results){
            return results;
        },
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
                return adapter.toTable(results);
            case 'PIE':
                return adapter.toGoogleChart('PieChart', results);
            case 'BAR':
                return adapter.toGoogleChart('BarChart', results);
            case 'COLUMN':
                return adapter.toGoogleChart('ColumnChart', results);
            case 'LINE':
                return adapter.toGoogleChart('LineChart', results);
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

            scope.$watch(function(){
                return scope.analyse;
            }, function(val){
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
                        limit: 50,
                        skip: 0,
                        include_docs: !scope.analyse.reduce,
                        group: !(!scope.analyse.reduce)
                    }, fn).then(function(results){
                        scope.results = results;
                        scope.pieResults =  transformResults('PIE', results);
                        scope.barResults =  transformResults('BAR', results);
                        scope.columnResults =  transformResults('COLUMN', results);
                        scope.lineResults =  transformResults('LINE', results);
                    });
                }
            });
        }
    };

});