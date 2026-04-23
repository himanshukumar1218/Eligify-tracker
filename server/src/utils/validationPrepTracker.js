const Joi = require('joi')

/** ISO date string YYYY-MM-DD (optional, also accepts empty string / null) */
const isoDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .allow("", null)
  .optional()
  .messages({ "string.pattern.base": '"{{#label}}" must be in YYYY-MM-DD format' });

 const addTaskSchema = Joi.object({
  examId: Joi.number().integer().positive().required(),

  title: Joi.string().trim().min(1).max(300).required(),

  dueDate: isoDate,
});

 const upsertNoteSchema = Joi.object({
  examId: Joi.number().integer().positive().required(),

  content: Joi.string().allow("").max(20_000).required(),
});

module.exports = {isoDate,addTaskSchema,upsertNoteSchema}