var url = require('url')
var dashButton = require('node-dash-button');
var request = require('request')
var wol = require('wake_on_lan')

function doLog(message) {
  console.log('[' + (new Date().toISOString()) + '] ' + message);
}

function DasherButton(button) {
  var options = {headers: button.headers, body: button.body, json: button.json, formData: button.formData}

  this.dashButton = dashButton(button.address, button.interface, button.timeout)

  this.dashButton.on("detected", function() {
    doLog(button.name + " pressed.")
    if(button.targetMac)
      doWol(button.targetMac)
    else
      doRequest(button.url, button.method, options)
  })

  doLog(button.name + " added.")
}

function doWol(address) {
  wol.wake(address, function(error) {
    if (error) {
      doLog("there was an error");
      console.log(error);
    } else {
      console.log('Sent magic packet to ' +  address);
    }
  });
}

function doRequest(requestUrl, method, options, callback) {
  options = options || {}
  options.query = options.query || {}
  options.json = options.json || false
  options.headers = options.headers || {}

  var reqOpts = {
    url: url.parse(requestUrl),
    method: method || 'GET',
    qs: options.query,
    body: options.body,
    json: options.json,
    headers: options.headers,
    formData: options.formData
  }

  request(reqOpts, function onResponse(error, response, body) {
    if (error) {
      doLog("there was an error");
      console.log(error);
    }
    if (response && response.statusCode === 401) {
      doLog("Not authenticated");
      console.log(error);
    }
    if (response && (response.statusCode < 200 || response.statusCode > 299)) {
      doLog("Unsuccessful status code");
      console.log(error);
    }

    if (callback) {
      callback(error, response, body)
    }
  })
}

module.exports = DasherButton
