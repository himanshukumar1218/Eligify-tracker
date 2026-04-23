import * as types from '@shared/constants/eligibilityConstants';
const { QUALIFICATION_LEVELS } = ((types as any).default || types) as typeof types;

export type MissingField = {
  key: string;
  label: string;
};

type EligibilityProfile = {
  basic?: {
    dob?: string;
    gender?: string;
    category?: string;
    domicile?: string;
  };
  academic?: {
    highestQualification?: string;
    tenthBoard?: string;
    tenthPercentage?: string | number;
    twelfthBoard?: string;
    twelfthStream?: string;
    twelfthSubjects?: string[];
    twelfthPercentage?: string | number;
    diplomaPercentage?: string | number;
    programme?: string;
    branch?: string;
    graduationStatus?: string;
    gpa?: string | number;
    ugProgramme?: string;
    ugBranch?: string;
    ugPercentage?: string | number;
  };
};

const qualificationOrder: string[] = [...QUALIFICATION_LEVELS];

const fieldLabels: Record<string, string> = {
  'basic.dob': 'Date of birth',
  'basic.gender': 'Gender',
  'basic.category': 'Category',
  'basic.domicile': 'Domicile state',
  'academic.highestQualification': 'Highest qualification',
  'academic.tenthBoard': '10th board',
  'academic.tenthPercentage': '10th percentage',
  'academic.twelfthBoard': '12th board',
  'academic.twelfthStream': '12th stream',
  'academic.twelfthSubjects': '12th subjects',
  'academic.twelfthPercentage': '12th percentage',
  'academic.diplomaPercentage': 'Diploma percentage',
  'academic.programme': 'Programme',
  'academic.branch': 'Branch',
  'academic.graduationStatus': 'Graduation status',
  'academic.gpa': 'Graduation score',
  'academic.ugProgramme': 'UG programme',
  'academic.ugBranch': 'UG branch',
  'academic.ugPercentage': 'UG score',
};

const baseFields = [
  'basic.dob',
  'basic.gender',
  'basic.category',
  'basic.domicile',
  'academic.highestQualification',
  'academic.tenthBoard',
  'academic.tenthPercentage',
];

const qualificationRules = [
  {
    minQualification: 'intermediate',
    fields: [
      'academic.twelfthBoard',
      'academic.twelfthStream',
      'academic.twelfthSubjects',
      'academic.twelfthPercentage',
    ],
  },
  {
    minQualification: 'diploma',
    exactQualification: 'diploma',
    fields: ['academic.diplomaPercentage', 'academic.programme', 'academic.branch'],
  },
  {
    minQualification: 'undergraduate',
    fields: [
      'academic.programme',
      'academic.branch',
      'academic.graduationStatus',
      'academic.gpa',
    ],
  },
  {
    minQualification: 'postgraduate',
    exactQualification: 'postgraduate',
    fields: ['academic.ugProgramme', 'academic.ugBranch', 'academic.ugPercentage'],
  },
];

const getQualificationRank = (qualification?: string) =>
  qualification ? qualificationOrder.indexOf(qualification) : -1;

const isFilled = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  return Boolean(value);
};

const getValue = (profile: EligibilityProfile, path: string): unknown =>
  path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[part];
  }, profile);

export const getEligibilityReadiness = (profile: EligibilityProfile) => {
  const qualification = profile.academic?.highestQualification;
  const qualificationRank = getQualificationRank(qualification);
  const requiredFields = new Set(baseFields);

  qualificationRules.forEach((rule) => {
    const minRank = getQualificationRank(rule.minQualification);
    const meetsMinimum = qualificationRank >= 0 && qualificationRank >= minRank;
    const matchesExact = !rule.exactQualification || qualification === rule.exactQualification;

    if (meetsMinimum && matchesExact) {
      rule.fields.forEach((field) => requiredFields.add(field));
    }
  });

  const missingFields: MissingField[] = Array.from(requiredFields)
    .filter((field) => !isFilled(getValue(profile, field)))
    .map((field) => ({
      key: field,
      label: fieldLabels[field] || field,
    }));

  return {
    isReady: missingFields.length === 0,
    missingFields,
  };
};
