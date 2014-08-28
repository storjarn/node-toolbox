(function(undefined){

    var fs = require('fs');

    var util = require('../../../../../src/utils.js');
    var perf = (new util.performance());

    var utility = require('./../utility');

    // console.log(utility.basePath);

    var model = function(params) {
        var dir = model.directory.path;

        //======================== Private



        //======================== Implementation
        // console.log(params);
        if (typeof params == 'string') {
            params = JSON.parse(params);
        } else {
            params = JSON.parse(JSON.stringify(params));
        }

        utility.bind(this, params || {});

        this.update = function(params) {
            if (!!dir && !!this.id) {
                utility.bind(this, params || {});
                model.directory.updateModelMeta(this, this.id);
                fs.writeFileSync(dir + '/' + this.id + '.json', JSON.stringifyPretty(this), {encoding: 'utf8'});
                index = model.directory.updateIndex(this.id + '.json', index, this);
                console.log('Model #' + model.id + ' updated');
                return true;
            }
            return false;
        }

        this.create = function() {
            this.id = model.directory.nextIndex();
            if (!!dir && !!this.id) {
                var filename = dir + '/' + this.id + '.json';
                var index = model.directory.getIndex();
                model.directory.updateModelMeta(this, this.id);
                fs.writeFileSync(filename, JSON.stringifyPretty(this), {encoding: 'utf8'});
                index = model.directory.updateIndex(this.id + '.json', index, this);
                console.log('Model #' + this.id + ' created');
                return true;
            }
            return false;
        }

        this.toData = function() {
            var ret = {};
            for(var key in this) {
                if (typeof this[key] !== 'function') {
                    ret[key] = this[key];
                }
            }
            return ret;
        }

        // this.toJSON = function() {
        //     // var ret = this.toData();
        //     return JSON.stringifyPretty(this);
        // }

        this.generateUrl = function() {
            return utility.generateResourceUrl(dir, this.id);
        };

        return this;
    }

    //======================== Static

    model.directory = {
        path: '',
        index : function(){
            var self = this;
            var container = {
                entries : { },
                count : 0,
                lastIndex : 0
            };
            var index = 0;
            // console.log(this.path);
            utility.iterateFiles(this.path, function(file){
                var id = file.replace('.json', '');
                // console.log(id);
                if (!isNaN(parseInt(id))) {
                    var model = require(self.path + id);
                    container = self.updateIndex(file, container, model);
                    model.id = index = parseInt(id);
                    model.url = utility.generateResourceUrl(self.path, id);
                }
            })
            container.lastIndex = index;
            // console.log('=======================================');
            fs.writeFileSync(this.path + '/index.json', JSON.stringifyPretty(container), {encoding: 'utf8'});
            console.log('Index created at: ' + this.path + '/index.json');
            // req.uncache(this.path + 'index.json');
            // console.log('Index cache cleared');
            console.log('Creation took ' + perf.end('ms') + ' ms');
            // console.log('=======================================');
        },
        updateModelMeta : function(model, id){
            model.id = id;
            model.url = utility.generateResourceUrl(this.path, id);
            model.created_at = utility.timestamp();
            model.updated_at = utility.timestamp();
            return model;
        },
        updateIndex : function(file, container, model) {
            var id = parseInt(file.replace('.json', ''));
            if (!(file in container.entries)) {
                container.count++;
            }
            if (!isNaN(id)) {
                if (id > container.lastIndex) {
                    container.lastIndex = id;
                }
                container.entries[file] = model;
                model = this.updateModelMeta(model, id);
                fs.writeFileSync(this.path + '/index.json', JSON.stringifyPretty(container), {encoding: 'utf8'});
            }
            return container;
        },
        getIndex : function(){
            if (!fs.existsSync(this.path + '/index.json')
                    || !fs.statSync(this.path + '/index.json').isFile()) {
                this.index();
            }
            return require(this.path + '/index.json');
        },
        lastIndex : function() {
            var index = this.getIndex();
            return index.lastIndex;
        },
        nextIndex : function() {
            var lastIndex = this.lastIndex();
            return ++lastIndex;
        }
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = model;
    } else {
        this.model = model;
    }
})();


