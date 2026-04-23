const test = require('node:test');
const assert = require('node:assert/strict');

const { examSchema } = require('./validationExamSchema');
const {
  ALL_SENTINEL,
  EXAM_STATUSES,
  GENDERS,
  QUALIFICATION_LEVELS,
} = require('../constants/eligibilityConstants');

const makePayload = () => ({
  exam: {
    exam_name: 'State Civil Services',
    organisation: 'PSC',
    sector: 'State PSC',
    status: EXAM_STATUSES[1],
    official_link: 'https://example.com',
    notification_date: '2026-03-01',
    application_start: '2026-03-02',
    application_end: '2026-03-30',
    last_correction_date: '',
    age_criteria_date: '2026-01-01',
    admit_card_release_date: '',
    exam_city_details_date: '',
    exam_date: '',
    result_release_date: '',
    application_fees: { UR: 100 },
    allowed_states: [ALL_SENTINEL],
  },
  posts: [
    {
      post_name: 'Assistant Engineer',
      department: 'Public Works',
      min_age: 21,
      max_age: 40,
      allowed_genders: [ALL_SENTINEL],
      rules: undefined,
      relaxations: [],
      education_criteria: [
        {
          required_qualification: QUALIFICATION_LEVELS[1],
          allowed_programmes: [ALL_SENTINEL],
          allowed_branches: [ALL_SENTINEL],
          min_percentage: 55,
          final_year_allowed: false,
          allowed_10th_boards: [ALL_SENTINEL],
          allowed_12th_boards: ['CBSE'],
          allowed_12th_streams: ['Science (PCM)'],
          required_subjects: ['Physics', 'Mathematics'],
        },
      ],
      special_requirements: {
        physical_criteria: undefined,
        experience_criteria: undefined,
        required_certifications: [],
        domicile_required: false,
        domicile_states: [],
      },
    },
  ],
});

test('examSchema accepts detailed education criteria fields used by the eligibility engine', () => {
  const { error } = examSchema.validate(makePayload(), {
    abortEarly: false,
  });

  assert.equal(error, undefined);
});

test('examSchema rejects invalid All-mixed arrays and empty experience criteria', () => {
  const payload = makePayload();
  payload.posts[0].education_criteria[0].allowed_programmes = [ALL_SENTINEL, 'B.Tech / B.E.'];
  payload.posts[0].special_requirements.experience_criteria = { min_years: '', field: '' };
  payload.posts[0].special_requirements.domicile_required = true;
  payload.posts[0].special_requirements.domicile_states = [];

  const { error } = examSchema.validate(payload, {
    abortEarly: false,
  });

  assert.ok(error);
  assert.ok(error.details.some((detail) => detail.message.includes('invalid') || detail.message.includes('experience_criteria') || detail.message.includes('domicile')));
});

test('examSchema accepts canonical enum values from shared constants', () => {
  const payload = makePayload();
  payload.exam.status = EXAM_STATUSES[0];
  payload.posts[0].allowed_genders = [GENDERS[0], GENDERS[1]];
  payload.posts[0].education_criteria[0].required_qualification = QUALIFICATION_LEVELS[3];

  const { error } = examSchema.validate(payload, {
    abortEarly: false,
  });

  assert.equal(error, undefined);
});
