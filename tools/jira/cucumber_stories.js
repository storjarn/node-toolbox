(function(context, undefined){
    var request = require('request');

    var config = {
        host: "https://tangogroup.jira.com",
        apiVersion : "2",
        projectName : "POLYB",
        startAt: "0",
        maxResults: "2000"
    }

    var jqlSearchString = config.host + "/rest/api/"+config.apiVersion+"/search?jql=project%20%3D%20"+config.projectName+"&maxResults="+config.maxResults+"&startAt="+config.startAt;

    function callback(error, response, body){
        console.log(body);
    }

    var options =  {
        url: jqlSearchString,
        jar: true,
        headers: {
            'User-Agent': 'request'
        },
        auth: {
            user: process.env.JIRAUSER,
            password: process.env.JIRAPASS
        },
        followRedirect : true
    }

    request(options, callback);

})(this)
