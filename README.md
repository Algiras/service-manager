# service-manager
Service manager plugin, to initiate the services

```javascript
var hapi = require('hapi');
var serviceManager = require('service-manager');

var server = new hapi.Server();
server.connection({port: 8088});

server.register([{
  register : serviceManager,
  options: {
    url : [{
      protocol: 'http',
      hostname: 'localhost',
      port : 3000
    }, {
      protocol: 'http',
      hostname: 'localhost',
      port : 5000,
      pathname : '/alfa/meta'
    }],
    retry: {
      times: 2, interval: 3000
    },
    message : "Unable to ping service on: ${host}"
  },
}}], function(err) {

  if (err) {
    console.error('Failed loading plugins');
    process.exit(1);
  }

  server.start(function(){
    console.log('Server running at:', server.info.uri);
  });
});
```
