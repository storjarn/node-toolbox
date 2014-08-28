(function(undefined){

    var controller = function(model) {
        this.Model = model;

        var fs = require('fs');

        var util = require('../../../../../src/utils.js');
        var perf = (new util.performance());

        //======================== HTTP Methods

        this.get = function(req, res) {
            var ret = [];
            var params = req.params || {};
            var index = this.Model.directory.getIndex();
            // console.log(params);
            for(var file in index.entries) {
                // console.log(file);
                // var model = require(this.Model.directory.path + file);
                var model = index.entries[file];
                var id = file.replace('.json', '');
                var include = true;
                for(var key in params) {
                    include = req.queryObject(key, params[key], model);
                    if (include) {
                        break;
                    }
                }
                if (include) {
                    ret.push(model);
                }
            }
            return ret;
        }
        this.post = function(req, res) {
            var params = req.params || {};
            // console.log(params);
            var resource = params.resource;
            if (!resource) {
                console.log('Resource not given in request');
                return false;
            }
            if (typeof resource == 'string') {
                resource = JSON.parse(resource);
            } else {
                resource = JSON.parse(JSON.stringify(resource));
            }
            resource = new this.Model(resource);
            // console.log(resource);
            if (!resource.create()) {
                console.log("failed at creating resource");
                return false;
            }
            // this.Model.directory.index();
            return resource.toData();
            // return {};
        }
        this.delete = function(req, res) {
            return {deleted:true, resourceId: req.params.resourceId}
        }
        this.put = function(req, res) {
            return {put:true}
        }
        this.patch = function(req, res) {
            return {patched:true}
        }
        this.copy = function(req, res) {
            return {copied:true}
        }
        this.head = function(req, res) {
            return {headed:true}
        }
        this.options = function(req, res) {
            return {optioned:true}
        }
        this.link = function(req, res) {
            return {linked:true}
        }
        this.unlink = function(req, res) {
            return {unlinked:true}
        }
        this.purge = function(req, res) {
            return {purged:true}
        }

    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = controller;
    } else {
        this.controller = controller;
    }
})();


