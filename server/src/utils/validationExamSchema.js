const Joi = require('joi');
const {
  ALL_SENTINEL,
  QUALIFICATION_LEVELS,
  CATEGORIES,
  GENDERS,
  EXAM_STATUSES,
  isAllSelection,
} = require('../constants/eligibilityConstants');

const SECONDARY = QUALIFICATION_LEVELS[0];
const INTERMEDIATE = QUALIFICATION_LEVELS[1];
const GENDERS_WITH_ALL = [...GENDERS, ALL_SENTINEL];
const SECTORS = ["Banking", "Defence", "Railways", "SSC", "State PSC", "Teaching", "Police", "UPSC", "Medical", "Other"];

const stringArraySchema = Joi.array().items(Joi.string().trim().min(1)).min(1);

const validateAllSentinel = (value, helpers) => {
  if (Array.isArray(value) && value.some((item) => isAllSelection(item)) && !isAllSelection(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────

const relaxationSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  relaxation_years: Joi.number().integer().min(0).default(0),
  max_attempts: Joi.number().integer().min(1).allow(null, '')
});

const educationCriterionSchema = Joi.object({
  required_qualification: Joi.string().valid(...QUALIFICATION_LEVELS).required(),
  allowed_programmes: stringArraySchema.custom(validateAllSentinel).default([ALL_SENTINEL]),
  allowed_branches: stringArraySchema.custom(validateAllSentinel).default([ALL_SENTINEL]),
  min_percentage: Joi.number().precision(2).min(0).max(100).allow(null, ''),
  final_year_allowed: Joi.boolean().default(false),
  allowed_10th_boards: stringArraySchema.custom(validateAllSentinel).default([ALL_SENTINEL]),
  allowed_12th_boards: stringArraySchema.custom(validateAllSentinel).default([ALL_SENTINEL]),
  allowed_12th_streams: stringArraySchema.custom(validateAllSentinel).default([ALL_SENTINEL]),
  required_subjects: stringArraySchema.custom(validateAllSentinel).default([ALL_SENTINEL]),
}).custom((value, helpers) => {
  const qualification = value.required_qualification;

  if (qualification === SECONDARY && (!value.allowed_10th_boards || value.allowed_10th_boards.length === 0)) {
    return helpers.message('10th board rules must be defined for secondary criteria.');
  }

  if (
    qualification === INTERMEDIATE &&
    (
      !value.allowed_12th_boards?.length ||
      !value.allowed_12th_streams?.length ||
      !value.required_subjects?.length
    )
  ) {
    return helpers.message('Intermediate criteria must define 12th boards, streams, and subjects.');
  }

  return value;
});

const postSchema = Joi.object({
  post_name: Joi.string().required().trim(),
  department: Joi.string().allow('', null).trim(),
  min_age: Joi.number().integer().min(14).required(),
  max_age: Joi.number().integer().min(Joi.ref('min_age')).required(),
  allowed_genders: Joi.array().items(Joi.string().valid(...GENDERS_WITH_ALL)).min(1).custom(validateAllSentinel),
  rules: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
  
  relaxations: Joi.array().items(relaxationSchema).optional(),
  
  education_criteria: Joi.array().items(educationCriterionSchema).min(1).required(),
  
  special_requirements: Joi.object({
    physical_criteria: Joi.object({
      min_height_male: Joi.number().integer().min(0).optional(),
      min_height_female: Joi.number().integer().min(0).optional(),
      min_weight_male: Joi.number().integer().min(0).optional(),
      min_weight_female: Joi.number().integer().min(0).optional(),
      min_chest_cm: Joi.number().integer().min(0).optional(),
      must_be_fit: Joi.boolean()
    }).custom((value, helpers) => {
      if (!value) return value;
      const filledEntries = Object.entries(value).filter(([, item]) => item !== undefined);
      if (filledEntries.length === 0) {
        return helpers.message('physical_criteria must contain at least one rule when provided.');
      }
      return value;
    }).optional(),
    
    experience_criteria: Joi.object({
      min_years: Joi.number().integer().min(0).allow(null, ''),
      field: Joi.string().trim().allow('', null)
    }).custom((value, helpers) => {
      if (!value) return value;
      const hasYears = value.min_years !== '' && value.min_years !== null && value.min_years !== undefined;
      const hasField = Boolean(value.field);
      if (!hasYears && !hasField) {
        return helpers.message('experience_criteria must contain at least minimum years or a field.');
      }
      return value;
    }).optional(),
    
    required_certifications: Joi.array().items(Joi.string().trim().min(1)).optional(),
    domicile_required: Joi.boolean().required(),
    domicile_states: Joi.array().items(Joi.string().trim().min(1)).custom(validateAllSentinel).when('domicile_required', {
      is: true,
      then: Joi.array().min(1).required(),
      otherwise: Joi.optional()
    })
  }).required()
});

// ─── Main Exam Schema ─────────────────────────────────────────────────────────

const examSchema = Joi.object({
  exam: Joi.object({
    exam_name: Joi.string().required().trim(),
    organisation: Joi.string().allow('', null).trim(),
    sector: Joi.string().trim().min(2).required(),
    status: Joi.string().valid(...EXAM_STATUSES).required(),
    official_link: Joi.string().uri().allow('', null),
    
    // Dates
    notification_date: Joi.date().iso().allow('', null),
    application_start: Joi.date().iso().allow('', null),
    application_end: Joi.date().iso().greater(Joi.ref('application_start')).allow('', null),
    last_correction_date: Joi.date().iso().allow('', null),
    age_criteria_date: Joi.date().iso().required(), // Critical for ageCheck.js
    admit_card_release_date: Joi.date().iso().allow('', null),
    exam_city_details_date: Joi.date().iso().allow('', null),
    exam_date: Joi.date().iso().allow('', null),
    result_release_date: Joi.date().iso().allow('', null),
    
    application_fees: Joi.object().pattern(
      Joi.string(), 
      Joi.number().min(0)
    ).required(),
    
    allowed_states: Joi.array().items(Joi.string().trim().min(1)).min(1).custom(validateAllSentinel).default([ALL_SENTINEL])
  }).required(),
  
  posts: Joi.array().items(postSchema).min(1).required()
});

module.exports = {
  examSchema,
  postSchema,
  relaxationSchema,
  educationCriterionSchema
};
