const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const examControllerPath = require.resolve('./examController');
const eligibilityControllerPath = require.resolve('./eligibilityController');
const enginePath = require.resolve('../eligibilityEngine/checkEligibility');

const originalEngineModule = require.cache[enginePath];
const originalExamController = require.cache[examControllerPath];
const originalEligibilityController = require.cache[eligibilityControllerPath];

const loadControllerWithEngineStub = (controllerPath, stubExports) => {
  delete require.cache[controllerPath];

  const stubModule = new Module(enginePath);
  stubModule.exports = stubExports;
  stubModule.loaded = true;
  require.cache[enginePath] = stubModule;

  return require(controllerPath);
};

const restoreModules = () => {
  if (originalEngineModule) {
    require.cache[enginePath] = originalEngineModule;
  } else {
    delete require.cache[enginePath];
  }

  if (originalExamController) {
    require.cache[examControllerPath] = originalExamController;
  } else {
    delete require.cache[examControllerPath];
  }

  if (originalEligibilityController) {
    require.cache[eligibilityControllerPath] = originalEligibilityController;
  } else {
    delete require.cache[eligibilityControllerPath];
  }
};

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

afterEach(() => {
  restoreModules();
});

test('examController returns structured PROFILE_INCOMPLETE payload for bulk eligibility', async () => {
  const error = new Error('Complete your profile to get accurate eligibility results.');
  error.code = 'PROFILE_INCOMPLETE';
  error.statusCode = 400;
  error.missingFields = [{ key: 'gender', label: 'Gender' }];
  error.optionalMissing = [];

  const { getEligibleExams } = loadControllerWithEngineStub(examControllerPath, {
    checkAllExams: async () => {
      throw error;
    },
  });

  const req = { user: { id: 'user-1' } };
  const res = createResponse();

  await getEligibleExams(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    code: 'PROFILE_INCOMPLETE',
    missingFields: [{ key: 'gender', label: 'Gender' }],
    optionalMissing: [],
    message: 'Complete your profile to get accurate eligibility results.',
  });
});

test('examController preserves structured reason objects in near matches', async () => {
  const { getEligibleExams } = loadControllerWithEngineStub(examControllerPath, {
    checkAllExams: async () => ({
      eligible: [],
      nearMatches: [
        {
          postId: 9,
          postName: 'Junior Engineer',
          examName: 'State PSC',
          organisation: 'PSC',
          deadline: '2026-04-12',
          url: 'https://example.com',
          timingStatus: 'Active',
          reasons: [
            {
              code: 'EXPERIENCE_CRITERIA_NOT_MET',
              category: 'experience',
              field: 'experience',
              severity: 'soft',
              message: 'Experience criteria not met: minimum 2 year(s) of experience required',
              actionText: 'Review the experience requirement for this post',
              details: null,
            },
          ],
        },
      ],
    }),
  });

  const req = { user: { id: 'user-1' } };
  const res = createResponse();

  await getEligibleExams(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.nearMatches[0].reasons[0].category, 'experience');
});

test('eligibilityController returns structured PROFILE_INCOMPLETE payload for single-post checks', async () => {
  const error = new Error('Complete your profile to get accurate eligibility results.');
  error.code = 'PROFILE_INCOMPLETE';
  error.statusCode = 400;
  error.missingFields = [{ key: 'academic.twelfthBoard', label: '12th board' }];
  error.optionalMissing = [];

  const { checkPostEligibility } = loadControllerWithEngineStub(eligibilityControllerPath, {
    checkEligibility: async () => {
      throw error;
    },
  });

  const req = { user: { id: 'user-1' }, params: { postId: '12' } };
  const res = createResponse();

  await checkPostEligibility(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    code: 'PROFILE_INCOMPLETE',
    missingFields: [{ key: 'academic.twelfthBoard', label: '12th board' }],
    optionalMissing: [],
    message: 'Complete your profile to get accurate eligibility results.',
  });
});
