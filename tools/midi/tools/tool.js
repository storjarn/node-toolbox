(function(undefined){

    var messages = require('./messages');
    var fs = require('fs');

    for (var i = 0; i < messages.length; ++i) {
        messages[i].MessageNumber = parseInt(messages[i].MessageNumber);
    }

    fs.writeFileSync('/Users/cmaples/Dev/midi/messages.js', JSON.stringify(messages))
})();
