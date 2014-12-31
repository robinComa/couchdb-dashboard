angular.module('app').directive('appAnalyseForm', function(Dashboard){

    return {
        replace: true,
        templateUrl: 'src/article/dashboard/form.html',
        scope: {
            analyse: '=appAnalyseForm',
            formActive: '=appAnalyseFormActive',
            formSubmit: '=appAnalyseFormSubmit'
        },
        link: function(scope){

            Dashboard.query({
                group: true
            }, {
                map: function(doc) {
                    doc.analyses.map(function(a){
                        emit(a.endpoint);
                    });
                },
                reduce: function(key, value){
                    return value.length;
                }
            }).then(function(endPoints){
                scope.endPoints = endPoints;
            });

            scope.toggleActive = function(){
                scope.formActive = !scope.formActive;
                scope.analyseToshow = null;
                scope.analyse = null;
            };

            scope.show = function(){
                if(scope.form.$valid){
                    scope.analyseToshow = angular.copy(scope.analyse);
                }
            };

            scope.submit = function(){
                if(scope.form.$valid){
                    scope.formSubmit(scope.analyse);
                    scope.toggleActive();
                }
            };

        }
    };

});