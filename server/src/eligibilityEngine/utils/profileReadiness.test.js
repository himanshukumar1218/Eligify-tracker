const test = require('node:test');
const assert = require('node:assert/strict');

const {
  profileReadiness,
  createProfileIncompleteError,
  PROFILE_INCOMPLETE_CODE,
} = require('./profileReadiness');

test('profileReadiness flags qualification-specific 12th fields for intermediate profiles', () => {
  const readiness = profileReadiness({
    dob: '2004-01-01',
    gender: 'male',
    category: 'UR',
    domicile_state: 'Uttar Pradesh',
    highest_qualification: 'intermediate',
    tenth_board: 'CBSE',
    tenth_percentage: 82,
    twelfth_board: '',
    twelfth_stream: null,
    twelfth_subjects: [],
    twelfth_percentage: null,
  });

  assert.equal(readiness.isReady, false);
  assert.deepEqual(
    readiness.hardMissing.map((field) => field.key),
    ['twelfth_board', 'twelfth_stream', 'twelfth_subjects', 'twelfth_percentage']
  );
});

test('profileReadiness requires degree and UG details for postgraduate profiles', () => {
  const readiness = profileReadiness({
    dob: '2000-05-12',
    gender: 'female',
    category: 'OBC',
    domicile_state: 'Bihar',
    highest_qualification: 'postgraduate',
    tenth_board: 'CBSE',
    tenth_percentage: 88,
    twelfth_board: 'CBSE',
    twelfth_stream: 'Science',
    twelfth_subjects: ['Physics', 'Chemistry', 'Mathematics'],
    twelfth_percentage: 84,
    programme: 'M.Tech',
    branch: 'Computer Science',
    graduation_status: 'Completed / Graduated',
    gpa: 8.3,
    ug_programme: '',
    ug_branch: '',
    ug_percentage: null,
  });

  assert.equal(readiness.isReady, false);
  assert.deepEqual(
    readiness.hardMissing.map((field) => field.key),
    ['ug_programme', 'ug_branch', 'ug_percentage']
  );
});

test('createProfileIncompleteError exposes a stable controller payload contract', () => {
  const readiness = {
    hardMissing: [{ key: 'gender', label: 'Gender' }],
    optionalMissing: [],
  };

  const error = createProfileIncompleteError(readiness);

  assert.equal(error.code, PROFILE_INCOMPLETE_CODE);
  assert.equal(error.statusCode, 400);
  assert.deepEqual(error.missingFields, readiness.hardMissing);
});
