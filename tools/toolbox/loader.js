(function() {

    var _aliases
    var currDir = '.'+__dirname

    function Loader(opts) {

        if (!_aliases) {
            _aliases = {}
        }

        function bind(obj1, obj2) {
            for(var key in obj2) {
                obj1[key] = obj2[key]
            }
            return obj1
        }

        if( Object.prototype.toString.call( opts ) === '[object Array]' ) {
            /*
             * alias array looks like:
             *      [ 
                      'alias1', 'path/for/alias1',
                      'alias2', 'path/for/alias2',
                      'alias3', 'path/for/alias3'
                    ]
            */
            for(var i = 0; i < opts.length; i = i + 2) {
                _aliases[opts[i]] = opts[i+1]
            }
        } else if (typeof opts == 'object') {
            _aliases = bind( _aliases, opts )
        } else if (typeof opts == 'string') {
            var src = _aliases[opts]
            if (!!src) {
                console.log(currDir+src)
                return require(currDir+src)
            } else {
                return require(opts)
            }
        }
    }
    
    module.exports = Loader
})()