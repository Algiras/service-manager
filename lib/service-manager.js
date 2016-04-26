'use strict';

var dependencyCheck = require('./dependency-check');
var Joi = require('joi');

var serviceMapperUrl = Joi.object().keys({
  protocol : Joi.string().valid(['http', 'https']).default('http'),
  hostname : Joi.string().default('localhost'),
  port : Joi.number().positive().default('80'),
  pathname : Joi.string().optional(),
  query : Joi.string().optional()
});

var serviceManagerOptionSchema = Joi.object().keys({
  url : Joi.alternatives(serviceMapperUrl, Joi.array().items(serviceMapperUrl)),
  retry : Joi.object().keys({
    interval : Joi.number().positive().min(100).default(100),
    times : Joi.number().min(1).default(1)
  }),
  message : Joi.string().optional()
}).required();

var serviceManager = {
  register : function(server, options, next){
    Joi.assert(options, serviceManagerOptionSchema);
    dependencyCheck.test(options.url, options.retry, options.message, next);
  }
};

serviceManager.register.attributes = {
  pkg : require('../package.json'),
  multiple: true
};

module.exports = serviceManager;
