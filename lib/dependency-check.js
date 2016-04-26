/*eslint no-console:0 */
'use strict';
var Url = require('url');
var async = require('async');
var request = require('request');

var testSingle = function(retryOptions, errorMessage, urlOptions, response){
  var url = Url.format(urlOptions);
  var message = typeof errorMessage === 'string' ? errorMessage.replace('${host}', url) : '';
  async.retry(
    retryOptions || { times : 5, interval : 200},
    function (callback) {
      request.get(url, function (error, httpResponse) {
        if (error) {
          console.log(message.replace('${response}', 'Unreachable'));
          callback(error);
        } else {
          if (httpResponse.statusCode !== 200){
            var errorMessage = message.replace('${response}', httpResponse.statusCode);
            console.log(errorMessage);
            callback(new Error(errorMessage));
          } else {
            callback(null, httpResponse);
          }
        }
      });
    },
    response
  );
};

module.exports = {
  test : function(urlOptions, retryOptions, errorMessage, response){
    if (Array.isArray(urlOptions)){
      async.each(urlOptions,
        async.apply(testSingle, retryOptions, errorMessage),
        response
      );
    } else {
      testSingle(retryOptions, errorMessage, urlOptions, response);
    }
  }
};
