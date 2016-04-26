'use strict';

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var sinon = require('sinon');
var nock = require('nock');

var suite = lab.suite;
var test = lab.test;
var expect = Code.expect;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

suite('init', function(){
  suite('dependency-check', function(){
    var dependencyCheck = require('../../lib/dependency-check');
    var ConsoleLog;

    beforeEach(function(done){
      ConsoleLog = sinon.stub(console, 'log').returns();
      done();
    });

    afterEach(function(done){
      ConsoleLog.restore();
      done();
    });

    test('should call callback when dependency service is active', function(done){
      var httpStub = sinon.stub(require('request'), 'get').yields(null, {statusCode : 200});
      var spy = sinon.spy();

      dependencyCheck.test(
        {hostname : 'localhost', port : 3000, pathname : '/'},
        {times : 3, interval : 200},
        null,
        spy
      );

      setTimeout(function () {
        httpStub.restore();
        expect(spy.called).to.be.true();
        expect(spy.calledWith(null)).to.be.true();
        expect(httpStub.calledWith('//localhost:3000/')).to.be.true();
        done();
      }, 0);
    });

    test('should retry up to times provided in the config', function(done){
      var httpStub = sinon.stub(require('request'), 'get');
      var spy = sinon.spy();

      httpStub
        .onCall(0).yields(true)
        .onCall(1).yields(true)
        .onCall(2).yields(null, {statusCode : 200});

      dependencyCheck.test(
        {hostname : 'localhost', port : 3000, pathname : '/'},
        {times : 3, interval : 200},
        null,
        spy
      );

      setTimeout(function () {
        httpStub.restore();
        expect(spy.called).to.be.true();
        expect(spy.calledWith(null)).to.be.true();
        expect(httpStub.calledWith('//localhost:3000/')).to.be.true();
        done();
      }, 200 * 3);
    });

    test('should return an error, when retry limit is reached', function(done){
      var httpStub = sinon.stub(require('request'), 'get');
      var spy = sinon.spy();
      httpStub
        .onCall(0).yields(true)
        .onCall(1).yields(null, {statusCode : 500})
        .onCall(2).yields(null, {statusCode : 200});

      dependencyCheck.test(
        {hostname : 'localhost', port : 3000, pathname : '/'},
        {times : 2, interval : 200},
        'Can not reach ${host} dependency, response ${response}',
        spy
      );

      var errorMessage = 'Can not reach //localhost:3000/ dependency, response 500';
      setTimeout(function () {
        httpStub.restore();
        ConsoleLog.restore();
        expect(ConsoleLog.called).to.be.true();
        expect(ConsoleLog.calledWith(errorMessage)).to.be.true();
        expect(spy.called).to.be.true();
        expect(spy.calledWith(
          new Error(errorMessage))
        ).to.be.true();
        expect(httpStub.calledWith('//localhost:3000/')).to.be.true();
        done();
      }, 500); // adding expect in a callback would not trigger the test if the callback is not being called
    });

    test('should default to 5 retries', function(done){
      var httpStub = sinon.stub(require('request'), 'get');
      var spy = sinon.spy();
      httpStub
        .onCall(0).yields(true)
        .onCall(1).yields(true)
        .onCall(2).yields(true)
        .onCall(3).yields(true)
        .onCall(4).yields(null, {statusCode : 200});

      dependencyCheck.test(
        {hostname : 'localhost', port : 3000, pathname : '/'},
        null,
        null,
        spy
      );

      setTimeout(function () {
        httpStub.restore();
        expect(spy.called).to.be.true();
        expect(spy.calledWith(null)).to.be.true();
        expect(httpStub.calledWith('//localhost:3000/')).to.be.true();
        done();
      }, 200 * 5); // timeouts are being used, to mimick reply interval
    });

    test('should support multiple requests', function (done) {
      var localhostStub = nock('http://localhost:3000/').get('/').reply(true);
      var googleStub = nock('http://google.com/').get('/').reply(true);
      var spy = sinon.spy();

      dependencyCheck.test(
        [
          {protocol: 'http', hostname : 'localhost', port : 3000, pathname : '/'},
          {protocol : 'http', hostname : 'google.com' , pathname : '/'}
        ],
        {times : 1, interval : 200},
        'Can not reach ${host} dependency',
        spy
      );

      setTimeout(function () {
        expect(spy.called, 'Multi Request Called').to.be.true();
        expect(localhostStub.isDone()).to.be.true();
        expect(googleStub.isDone()).to.be.true();
        done();
      }, 100);
    });
  });
});
