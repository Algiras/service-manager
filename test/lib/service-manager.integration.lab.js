'use strict';

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var sinon = require('sinon');
var rewire = require('rewire');

var hapi = require('hapi');

var suite = lab.suite;
var test = lab.test;
var expect = Code.expect;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

suite('lib', function () {
  suite('service-manager', function () {
    test('should stop server from starting until defined endpoint is up', function(done){
      var Console = sinon.stub(console, 'log').returns();
      var httpStub = sinon.stub(require('request'), 'get');

      httpStub
        .onCall(0).yields(true)
        .onCall(1).yields(true);

      var server = new hapi.Server();
      server.connection({port : 3333});

      var callbackSpy = sinon.spy();

      server.register({
        register : require('../../lib/service-manager'),
        options : {
          url : { protocol: 'http', hostname : 'localhost', port : 3000 },
          retry : { times: 2, interval : 200},
          message : 'Unable to ping configd on : ${host}'
        }
      }, callbackSpy);
      setTimeout(function () {
        Console.restore();
        expect(callbackSpy.calledWith(true)).to.be.true();
        done();
      }, 400);
    });
  });
});
