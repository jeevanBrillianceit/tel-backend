const Joi = require('joi');

module.exports = Joi.object({
  title: Joi.string().required().max(20).min(4).messages({
    "string.base": `Title should be string`,
    "string.empty": `Title cannot be an empty field`,
    "any.required": `Title is a required field`,
    "string.min": `Title should have a minimum length of 4`,
    "string.max": `Title characters limit cannnot more than 20`,
  }),
  description: Joi.string().required().max(250).min(5).messages({
    "string.base": `Description should be string`,
    "string.empty": `Description cannot be an empty field`,
    "any.required": `Description is a required field`,
    "string.min": `Description should have a minimum length of 5`,
    "string.max": `Description characters limit cannnot more than 20`,
  }),
  url: Joi.array(),
  latitude:Joi.string().allow(''),
  longitude:Joi.string().allow(''),
  from_date: Joi.date().optional().allow(null),
  to_date: Joi.date().optional().allow(null),
  time:Joi.string().allow('')
});


