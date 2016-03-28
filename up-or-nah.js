var request = require('request')
	, CODES = require('./status-codes')

// Up or Nah Lambda Function Definition

exports.handler = function(event, context){

var url = event.url

    // Configure the request
    var options = {
        url: url,
        method: 'HEAD'
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        	var message = 'Yeah! The response code message for the URL'+ url 
        								+ ' is ' + CODES[response.statusCode] + ' which is a ' 
        								+ response.statusCode + ' response code.'
        	console.log(message)
        	context.succeed(JSON.stringify({message: message}))
        }
        else {
        	if(error) {
        		console.error(error)
	        	context.fail(error)
        	}
        	else {
        		var message = '\n\nNah! The response code message for the URL'+ url 
        									+ ' is ' + CODES[response.statusCode] + ' which is a ' 
        									+ response.statusCode + ' response code.\n\n'
        		console.log(message)
	        	context.succeed(JSON.stringify({message: message}))
        	}
        }
    })
};