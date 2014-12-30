angular.module('app').directive('appAnalyseForm', function($pouchDbResource){

    return {
        replace: true,
        templateUrl: 'src/article/dashboard/form.html',
        scope: {
            analyse: '=appAnalyseForm',
            formActive: '=appAnalyseFormActive',
            formSubmit: '=appAnalyseFormSubmit'
        },
        link: function(scope){

            var init = function(){
                scope.analyse = {
                    title: null,
                    endpoint: 'http://robin-db.iriscouch.com/tweet',
                    map : function(doc) {
                        emit(doc.text.split(' ')[0], doc);
                    }.toString(),
                    reduce: null
                };
            };
            init();

            scope.toggleActive = function(){
                scope.formActive = !scope.formActive;
                scope.analyseToshow = null;
                init();
            };

            scope.show = function(){
                if(scope.form.$valid){
                    scope.analyseToshow = scope.analyse;
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