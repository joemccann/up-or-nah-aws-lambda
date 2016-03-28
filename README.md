# Learn AWS Lambda and the API Gateway

This is by _any_ means exhaustive and assumes _a lot_.  These are notes I captured while learning how to create Lambda functions and attach to the API Gateway.

The app, Up or Nah, is a simple app to determine if a site is returning an error code or not when it is pinged.  It is also not exhaustive and should never be used for production.

The following assumes you:

 - have a Mac
 - have the AWS CLI installed 
 - have your shell configured properly for AWS CLI usage

# Getting Started

You need to create your lambda function in its own directory/folder so it can be zipped up.

```
mkdir -p up-or-nah && cd up-or-nah
npm init
npm i --save request
vim status-codes.js
```

Copy/paste/save in `status-codes.js`

```
module.exports = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version not Supported',
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505
};
```

`vim up-or-nah.js`

Copy/paste/save in `up-or-nah.js`

```
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
```

Now you have the entire lambda function and its dependencies.  Let's zip it up (on a Mac).

```zip -r up-or-nah.zip ./```

# Lambda Setup and Commands

There are two major components to setup: the lambda and API Gateway permissions.

## Create or Use an IAM User in Your AWS Account

We need to make sure we have an IAM User has access/permissions to the API Gateway and Lambda

Go thru this step-by-step:

http://docs.aws.amazon.com/apigateway/latest/developerguide/setting-up.html#setting-up-iam


## Get User Information 

`aws iam get-user`

```js
{
    "User": {
        "UserName": "joemccann",
        "PasswordLastUsed": "2016-03-27T17:12:09Z",
        "CreateDate": "2016-03-27T16:56:08Z",
        "UserId": "AIDAJKZ343AX4LLAL2YLG",
        "Path": "/",
        "Arn": "arn:aws:iam::500402104666:user/joemccann"
    }
}
```

This helps us get the arn for the `create-function` call.

## Create API Gateway Role

The `APIGatewayLambdaExecRole` role is critical.  You will need to create it. Follow this tutorial:

http://docs.aws.amazon.com/apigateway/latest/developerguide/setting-up.html#setting-up-permissions

## Create Lambda Function

```sh

aws lambda create-function \
--region us-west-2 \
--function-name up-or-nah \
--zip-file fileb://up-or-nah.zip \
--role arn:aws:iam::500402104666:role/APIGatewayLambdaExecRole \
--handler up-or-nah.handler \
--runtime nodejs \
--memory-size 512 \
--timeout 10 \
--description "Lambda function to check if a site is returning a good or bad response code."

```

Response should be equivalent to:

```js
{
    "CodeSha256": "fsn3MsGtd/YKaoowJtV4ClnS5K9UDa/fkXSI2yDuW+M=",
    "FunctionName": "up-or-nah",
    "CodeSize": 1238744,
    "MemorySize": 512,
    "FunctionArn": "arn:aws:lambda:us-west-2:500402104533:function:up-or-nah",
    "Version": "$LATEST",
    "Role": "arn:aws:iam::500402104666:role/lambda_basic_execution",
    "Timeout": 10,
    "LastModified": "2016-03-27T19:39:55.399+0000",
    "Handler": "up-or-nah.handler",
    "Runtime": "nodejs",
    "Description": "Lambda function to check if a site is returning a good or bad response code."
}
```

## Delete Lambda Function

If you made a mistake or need to delete it anyway...

`aws lambda delete-function --function-name up-or-nah`

No output/response expected.

## Update Lambda Function

Now, assume you make some changes and want to update the lambda function. You'll need to re-zip and then upload.

```
zip -r up-or-nah.zip ./ && aws lambda update-function-code --function-name up-or-nah --zip-file fileb://up-or-nah.zip
```

## AWS Permissions Setup for API to Exec Lambda Functions

http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html#getting-started-open-console

## AWS API Gateway Setup

Let's make it RESTful.  Follow this exactly:

http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html#getting-started-open-console

Once you set up the API Gateway, test it with a `POST`:

```sh
curl -H "Content-Type: application/json" -X POST -d "{\"url\": \"http://go.com\"}" https://aw4gbgvm1c.execute-api.us-west-2.amazonaws.com/test/check
```
