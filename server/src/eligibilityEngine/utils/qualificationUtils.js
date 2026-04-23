const {
  QUALIFICATION_LEVELS,
  isAllSelection,
} = require('../../constants/eligibilityConstants');

/**
 * Canonical order of qualifications from lowest to highest.
 * Matches the `qualification_type` ENUM in the database.
 */
const QUALIFICATION_ORDER = QUALIFICATION_LEVELS;

const isAll = (arr) => !arr || arr.length === 0 || isAllSelection(arr);

const getQualificationRank = (qualification) => {
  return QUALIFICATION_ORDER.indexOf(qualification);
};


const meetsQualificationLevel = (userQualification, requiredQualification) => {
  return getQualificationRank(userQualification) >= getQualificationRank(requiredQualification);
};

module.exports = { QUALIFICATION_ORDER, getQualificationRank, meetsQualificationLevel , isAll};
