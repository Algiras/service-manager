'use strict';

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var sinon = require('sinon');
var rewire = require('rewire');

var suite = lab.suite;
var test = lab.test;
var expect = Code.expect;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

suite('lib', function () {
  suite('service-manager', function () {
    var serviceManager = require('../../lib/service-manager');
    suite('hapi-plugin-properties', function () {
      var Joi, dependencyCheck, server;

      beforeEach(function(done){
        server = {
          ext : sinon.spy()
        };
        dependencyCheck = sinon.stub(require('../../lib/dependency-check'), 'test').yields(null);
        Joi = sinon.stub(require('joi'), 'assert').returns(true);
        done();
      });

      afterEach(function(done){
        Joi.restore();
        dependencyCheck.restore();
        done();
      });

      test('should have a register method', function (done) {
        expect(serviceManager.register, 'register method').to.be.function();
        done();
      });

      test('should have register.atrributes, same as package.json', function (done) {
        expect(serviceManager.register.attributes.pkg).to.deep.equal(require('../../package.json'));
        done();
      });

      test('should return callback on register', function (done) {
        var spy = sinon.spy();
        serviceManager.register(server, {}, spy);
        setTimeout(function () {
          expect(spy.called, 'Callback check').to.be.true();
          done();
        }, 10);
      });

      test('Joi should assert options', function (done) {
        serviceManager.register(server, {}, function(){});
        setTimeout(function () {
          expect(Joi.called, 'Validation').to.be.true();
          done();
        }, 10);
      });

      test('should call dependencyCheck', function (done) {
        serviceManager.register(server, {}, function(){});
        setTimeout(function () {
          expect(dependencyCheck.called, 'Route check').to.be.true();
          done();
        }, 10);
      });
    });
  });
});
