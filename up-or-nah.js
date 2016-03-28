var request = require('request')
  , CODES = require('./status-codes')

// Up or Nah Lambda Function Definition

exports.handler = function(event, context){
  
  // POST body url param is converted to "event.url"
  var url = event.url

  var options = {
    url: url,
    method: 'HEAD'
  }

  request(options, function requireCallback(error, response, body) {

    if (!error && response.statusCode <= 399) {
      var message = 'Yeah! The response code message for the URL '
                    + url 
                    + ' is ' 
                    + CODES[response.statusCode] 
                    + ' which is a ' 
        						+ response.statusCode 
                    + ' response code.'
      context.succeed({message: message})
    }
    else {
      if(error) {
        // Call the Lambda context fail() method since we failed.
        context.fail(error)
      }
      else {
        var message = 'Nah! The response code message for the URL'
                      + url 
                      + ' is ' + CODES[response.statusCode] 
                      + ' which is a ' + response.statusCode 
                      + ' response code.'
        context.succeed({message: message})
      }
    }
  }) // end request()
} // end handler()