const Joi = require('joi')
const {
  QUALIFICATION_LEVELS,
  GRADUATION_STATUSES,
  CATEGORIES,
  GENDERS,
} = require('../constants/eligibilityConstants');

const signupSchema = Joi.object({
    username : Joi.string().alphanum().min(3).max(10).required() ,
    email : Joi.string().email().required() ,
    password : Joi.string().alphanum().required()
})

const loginSchema = Joi.object({
    email : Joi.string().email().required() ,
    password : Joi.required() 
})

const userDetailsSchema = Joi.object({
  // 1. NESTED PERSONAL OBJECT
  basic: Joi.object({
    fullName: Joi.string().trim().required(),
    dob: Joi.date().iso().max('now').required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(), // NEW REQUIRED FIELD
    gender: Joi.string().valid(...GENDERS).allow('', null).optional(),
    category: Joi.string().valid(...CATEGORIES).allow('', null).optional(),
    isPwD: Joi.boolean().allow('', null).optional(),
    pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).allow('', null).optional(),
    district: Joi.string().allow('', null).optional(),
    domicile: Joi.string().allow('', null).optional(),
    nationality: Joi.string().allow('', null).optional(),
  }).required(),

  // 2. NESTED ACADEMIC OBJECT
  academic: Joi.object({
    highestQualification: Joi.string()
      .valid(...QUALIFICATION_LEVELS)
      .required(),

    tenthBoard: Joi.string().allow('', null).optional(),
    tenthPercentage: Joi.number().min(0).max(100).precision(2).allow('', null).optional(),
    tenthPassingYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).allow('', null).optional(),

    twelfthBoard: Joi.string().allow('', null).optional(),
    twelfthStream: Joi.string().allow('', null).optional(),
    twelfthSubjects: Joi.array().items(Joi.string()).allow(null, '').optional(),
    twelfthPercentage: Joi.number().min(0).max(100).precision(2).allow('', null).optional(),
    twelfthPassingYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).allow('', null).optional(),

    diplomaPercentage: Joi.number().min(0).max(100).precision(2).allow('', null).optional(),

    programme: Joi.string().allow('', null).optional(),
    branch: Joi.string().allow('', null).optional(),
    graduationStatus: Joi.string().valid(...GRADUATION_STATUSES).allow('', null).optional(),
    college: Joi.string().allow('', null).optional(),
    gpa: Joi.number().min(0).max(100).precision(2).allow('', null).optional(),

    // NEW UG fields for Postgraduates
    ugProgramme: Joi.string().allow('', null).optional(),
    ugBranch: Joi.string().allow('', null).optional(),
    ugCollege: Joi.string().allow('', null).optional(),
    ugPassingYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).allow('', null).optional(),
    ugPercentage: Joi.number().min(0).max(100).precision(2).allow('', null).optional(),
  }).required(),

  certifications: Joi.array().items(Joi.string().trim()).allow(null).optional(),

  experience: Joi.object({
    hasExperience: Joi.boolean().allow('', null).optional(),
    years: Joi.number().integer().min(0).max(50).allow('', null).optional(),
    field: Joi.string().allow('', null).optional()
  }).optional().allow(null),

  physical: Joi.object({
    height: Joi.number().integer().min(50).max(250).allow('', null).optional(),
    weight: Joi.number().integer().min(20).max(300).allow('', null).optional(),
    chest: Joi.number().integer().min(20).max(200).allow('', null).optional(),
    isPhysicalFit: Joi.boolean().allow('', null).optional()
  }).optional().allow(null),

  other: Joi.object({
    isExServiceman: Joi.boolean().allow('', null).optional()
  }).optional().allow(null)
});



module.exports = {signupSchema,loginSchema,userDetailsSchema}
