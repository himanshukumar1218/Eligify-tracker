const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeStringArray,
  normalizeStudentPayload,
  normalizeAdminPayload,
} = require('./persistenceNormalization');
const {
  ALL_SENTINEL,
  GRADUATION_STATUSES,
} = require('../constants/eligibilityConstants');

test('normalizeStudentPayload canonicalizes enums and trims custom text values before save', () => {
  const normalized = normalizeStudentPayload({
    basic: {
      fullName: '  Jane   Doe  ',
      gender: ' FEMALE ',
      category: ' obc ',
      isPwD: 'false',
      district: '  lucknow ',
      domicile: '  Uttar   Pradesh ',
      nationality: '  Indian ',
      pinCode: '226001',
    },
    academic: {
      highestQualification: ' UNDERGRADUATE ',
      tenthBoard: '  State Board ',
      twelfthBoard: '  cbse ',
      twelfthStream: '  Science (PCM) ',
      twelfthSubjects: [' Physics ', 'Mathematics', 'physics'],
      programme: '  B.Tech / B.E. ',
      branch: '  Computer Science  ',
      graduationStatus: ' currently pursuing ',
      college: '  ABC Institute ',
      ugProgramme: '',
      ugBranch: '',
      ugCollege: '',
    },
    certifications: [' NCC ', 'Typing', 'ncc'],
    experience: { hasExperience: 'true', field: '  Field Ops ' },
    physical: { isPhysicalFit: 'true' },
    other: { isExServiceman: 'false' },
  });

  assert.equal(normalized.basic.fullName, 'Jane Doe');
  assert.equal(normalized.basic.gender, 'female');
  assert.equal(normalized.basic.category, 'OBC');
  assert.equal(normalized.academic.highestQualification, 'undergraduate');
  assert.equal(normalized.academic.graduationStatus, GRADUATION_STATUSES[0]);
  assert.deepEqual(normalized.academic.twelfthSubjects, ['Physics', 'Mathematics']);
  assert.deepEqual(normalized.certifications, ['NCC', 'Typing']);
  assert.equal(normalized.experience.hasExperience, true);
});

test('normalizeAdminPayload canonicalizes arrays and preserves custom values in trimmed form', () => {
  const normalized = normalizeAdminPayload(
    {
      exam_name: '  Sample   Exam ',
      organisation: '  State  Board ',
      sector: '  Other Public Sector ',
      status: ' active ',
      allowed_states: [' all ', 'Uttar Pradesh'],
    },
    [
      {
        post_name: '  Assistant   Engineer ',
        department: '  PWD ',
        allowed_genders: [' Male ', 'female', 'male'],
        relaxations: [{ category: ' sc ', relaxation_years: 5, max_attempts: '' }],
        education_criteria: [
          {
            required_qualification: ' intermediate ',
            allowed_programmes: [' All ', 'B.Tech / B.E.'],
            allowed_branches: [' Computer Science ', 'computer science'],
            allowed_10th_boards: [' CBSE ', 'cbse'],
            allowed_12th_boards: [' State Board '],
            allowed_12th_streams: [' Science (PCM) '],
            required_subjects: [' Physics ', 'Mathematics'],
          },
        ],
        special_requirements: {
          experience_criteria: { field: '  Site   Works ' },
          required_certifications: [' NCC ', 'ncc'],
          domicile_states: [' Uttar  Pradesh ', 'uttar pradesh'],
        },
      },
    ]
  );

  assert.equal(normalized.exam.exam_name, 'Sample Exam');
  assert.equal(normalized.exam.status, 'Active');
  assert.deepEqual(normalized.exam.allowed_states, [ALL_SENTINEL]);
  assert.deepEqual(normalized.posts[0].allowed_genders, ['male', 'female']);
  assert.equal(normalized.posts[0].relaxations[0].category, 'SC');
  assert.deepEqual(normalized.posts[0].education_criteria[0].allowed_programmes, [ALL_SENTINEL]);
  assert.deepEqual(normalized.posts[0].education_criteria[0].allowed_branches, ['Computer Science']);
  assert.deepEqual(normalized.posts[0].special_requirements.required_certifications, ['NCC']);
});

test('normalizeStringArray keeps canonical All sentinel exclusive', () => {
  assert.deepEqual(
    normalizeStringArray([' all ', ' Uttar Pradesh '], { allSentinel: true }),
    [ALL_SENTINEL]
  );
});
