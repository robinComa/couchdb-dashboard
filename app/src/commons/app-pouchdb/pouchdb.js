angular.module('pouchdb', []).config(function(){

}).run(function(){

});

angular.module('pouchdb').provider('$pouchDbResource', function(){

    var options = {
        ajax: {
            cache: true
        }
    };

    this.settings = {
        debug: false
    };

    this.$get = function($q, cfpLoadingBar) {

        if(this.settings.debug){
            PouchDB.debug.enable('*');
        }else{
            PouchDB.debug.disable();
        }

        return function(resource, auth){

            var db = new PouchDB(resource, options);

            if(auth){
                db.login(auth.login, auth.password).then(function () {

                });
            }

            var Resource = function(){
                this.$save = function () {
                    cfpLoadingBar.start();
                    var deferred = $q.defer();
                    this._id = this._id || new Date().toISOString();
                    db.put(this, function (err, doc) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(doc);
                        }
                        cfpLoadingBar.complete();
                    });
                    return deferred.promise;
                };

                this.$remove = function(){
                    cfpLoadingBar.start();
                    var deferred = $q.defer();
                    db.remove(this, function(err, doc){
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(doc);
                        }
                        cfpLoadingBar.complete();
                    });
                    return deferred.promise;
                };
                this.$delete = this.$remove;
            };

            var toResource = function(doc){
                return angular.extend(new Resource(), doc);
            };

            var toResources = function(doc){
                return doc.rows.map(function (row) {
                    return toResource(row.doc || row);
                });
            };

            var defaultParams = {include_docs: true, descending: true};

            Resource.get = function(_id, params){
                cfpLoadingBar.start();
                var deferred = $q.defer();
                db.get(_id, angular.extend(defaultParams, params), function (err, doc) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(toResource(doc));
                        cfpLoadingBar.complete();
                    }
                });
                return deferred.promise;
            };
            Resource.query = function(params, fn){
                cfpLoadingBar.start();
                var deferred = $q.defer();
                db.query(fn || function(doc){
                    emit(doc._id, doc)
                }, angular.extend(defaultParams, params), function (err, doc) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(toResources(doc));
                    }
                    cfpLoadingBar.complete();
                });
                return deferred.promise;
            };
            return Resource;
        }
    };

});