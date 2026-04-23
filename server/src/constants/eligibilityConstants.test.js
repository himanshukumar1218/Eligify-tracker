const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ALL_SENTINEL,
  QUALIFICATION_LEVELS,
  QUALIFICATION_LOOKUP,
  isAllSelection,
  normalizeCanonicalValue,
} = require('./eligibilityConstants');
const {
  getQualificationRank,
  meetsQualificationLevel,
} = require('../eligibilityEngine/utils/qualificationUtils');

test('shared constants expose canonical qualification ranking', () => {
  assert.equal(getQualificationRank(QUALIFICATION_LEVELS[0]), 0);
  assert.equal(getQualificationRank(QUALIFICATION_LEVELS[4]), 4);
  assert.equal(meetsQualificationLevel(QUALIFICATION_LEVELS[4], QUALIFICATION_LEVELS[3]), true);
  assert.equal(meetsQualificationLevel(QUALIFICATION_LEVELS[1], QUALIFICATION_LEVELS[3]), false);
});

test('constants helpers normalize canonical values and All sentinel consistently', () => {
  assert.equal(
    normalizeCanonicalValue(' UNDERGRADUATE ', QUALIFICATION_LOOKUP),
    QUALIFICATION_LEVELS[3]
  );
  assert.equal(isAllSelection([ALL_SENTINEL]), true);
  assert.equal(isAllSelection(['All', 'Uttar Pradesh']), false);
});
