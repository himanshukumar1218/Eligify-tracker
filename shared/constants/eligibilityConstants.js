// shared/constants/eligibilityConstants.js

const ALL_SENTINEL = 'All';

const QUALIFICATION_LEVELS = [
  'secondary',
  'intermediate',
  'diploma',
  'undergraduate',
  'postgraduate',
];

const GRADUATION_STATUSES = [
  'Currently Pursuing',
  'Completed / Graduated',
];

const CATEGORIES = [
  'UR',
  'OBC',
  'SC',
  'ST',
  'EWS',
];

const GENDERS = [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
];

const EXAM_STATUSES = [
  'Upcoming',
  'Active',
  'Closed',
];

const CERTIFICATION_OPTIONS = [
  'B.Ed',
  'BTC',
  'D.El.Ed',
  'ITI',
  'Diploma',
  'NCC',
  'Computer Certificate',
  'Typing',
  'Stenography',
  'Driving License',
  'CA',
  'CMA',
  'CS',
  'Nursing',
  'Pharmacist',
  'Teacher Training',
];

const EXPERIENCE_FIELDS = [
  'Teaching',
  'Engineering',
  'Accounts',
  'Clerk',
  'Technician',
  'Medical',
  'IT',
  'Legal',
  'Agriculture',
  'Other',
];

const BOARD_OPTIONS = [
  "CBSE", "ICSE", "NIOS", "UP Board", "Bihar Board", "Maharashtra Board", 
  "Tamil Nadu Board", "Karnataka Board", "Rajasthan Board", "West Bengal Board", 
  "Gujarat Board", "Andhra Pradesh Board", "Telangana Board", "State Board (Other)"
];

const TWELFTH_SUBJECTS_OPTIONS = [
  "Physics", "Chemistry", "Mathematics", "Biology", "English", "Hindi",
  "Accountancy", "Business Studies", "Economics", "History", "Geography",
  "Political Science", "Computer Science", "Informatics Practices", "Sociology",
  "Psychology", "Physical Education", "Statistics", "Sanskrit"
];

const SECTORS = [
  "Banking", "Defence", "Railways", "SSC", "State PSC", 
  "Teaching", "Police", "UPSC", "Medical", "Other"
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", 
  "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh", "Other UT"
];

const COURSES_DATA = {
  intermediate: {
    "12th Standard": [
      "Science (PCM)", "Science (PCB)", "Science (PCMB)", "Commerce with Maths", "Commerce without Maths",
      "Arts/Humanities", "Fine Arts", "Home Science", "Vocational Stream", "Polytechnic (Bridge Course)"
    ]
  },
  diploma: {
    "Diploma in Engineering / Polytechnic": [
      "Mechanical", "Civil", "Electrical", "Electronics & Communication", "Computer Science",
      "Information Technology", "Automobile", "Chemical", "Mining", "Production / Industrial",
      "Instrumentation & Control", "Textile", "Printing", "Interior Decoration",
      "Architecture Assistantship", "Tool & Die Making"
    ],
    "Diploma in Medical/Health": [
      "Pharmacy (D.Pharm)", "General Nursing & Midwifery (GNM)", "Medical Laboratory Technology (DMLT)",
      "Radiology/X-Ray Technology", "Dental Mechanics", "Sanitary Inspector"
    ],
    "Diploma in Education": [
      "D.El.Ed (BTC)", "D.Ed (Special Education)", "Early Childhood Care & Education (ECCE)"
    ],
    "Other Professional Diploma": [
      "Agriculture", "Computer Applications (DCA)", "Fashion Designing", "Hotel Management",
      "Library & Information Science", "Modern Office Management (MOM)", "Travel & Tourism", "Animal Husbandry"
    ]
  },
  undergraduate: {
    "B.Tech / B.E.": [
      "Computer Science", "Information Technology", "Artificial Intelligence & Machine Learning",
      "Data Science", "Cyber Security", "Mechanical", "Electrical", "Electronics & Communication",
      "Civil", "Chemical", "Biotechnology", "Aerospace / Aeronautical", "Automobile", "Mining",
      "Production / Industrial", "Instrumentation", "Agricultural Engineering", "Food Technology",
      "Textile Engineering", "Marine Engineering", "Petroleum Engineering", "Metallurgical Engineering"
    ],
    "B.Sc": [
      "Physics", "Chemistry", "Mathematics", "Biology / Life Sciences", "Computer Science",
      "Information Technology", "Statistics", "Agriculture", "Horticulture", "Forestry",
      "Nursing", "Biotechnology", "Microbiology", "Food Science", "Geology", "Home Science",
      "Forensic Science", "Aviation", "Nautical Science", "Interior Design", "Fashion Design",
      "Physical Education", "B.Stat", "B.Math"
    ],
    "B.Com": [ "General", "Accounting & Finance", "Banking & Insurance", "Taxation", "Computer Applications", "Corporate Secretaryship", "Honours" ],
    "B.A.": [
      "History", "Political Science", "Economics", "Geography", "English", "Hindi", "Sanskrit",
      "Regional Language", "Sociology", "Psychology", "Philosophy", "Public Administration",
      "Journalism & Mass Communication", "Social Work (BSW)", "Fine Arts (BFA)", "Music",
      "Dance", "Physical Education", "Yoga", "Tourism", "Honours"
    ],
    "Management & Computer Apps": [ "BBA (General)", "BBA (Business Analytics)", "BBA (Finance/Marketing/HR)", "BMS", "BCA", "B.Sc (IT)" ],
    "Medical & Healthcare": [ "MBBS", "BDS", "BAMS", "BHMS", "BUMS", "BSMS", "BNYS", "B.Pharm", "BPT (Physiotherapy)", "BOT (Occupational Therapy)", "B.Sc (MLT)", "B.Sc (Radiology)", "B.Sc (Nursing)", "BVSc & AH" ],
    "Law": [ "LLB (3 Years)", "Integrated BA LLB", "Integrated BBA LLB", "Integrated B.Com LLB" ],
    "Architecture & Design": [ "B.Arch", "B.Planning", "B.Des (Graphic/Fashion/Interior/Product)" ],
    "Education": [ "B.Ed", "B.El.Ed", "B.P.Ed" ]
  },
  postgraduate: {
    "M.Tech / M.E.": [
      "Computer Science", "Software Engineering", "Data Science", "Artificial Intelligence",
      "Information Security", "VLSI Design", "Embedded Systems", "Communication Systems",
      "Power Systems", "Control Systems", "Machine Design", "Thermal Engineering",
      "Manufacturing / Production", "Structural Engineering", "Geotechnical Engineering",
      "Transportation Engineering", "Water Resources", "Environmental Engineering",
      "Chemical Engineering", "Bioprocess Engineering", "Nano Technology"
    ],
    "M.Sc": [
      "Physics", "Chemistry", "Mathematics", "Statistics", "Computer Science", "Information Technology",
      "Biotechnology", "Microbiology", "Environmental Science", "Life Sciences / Zoology / Botany",
      "Agriculture", "Horticulture", "Forestry", "Electronics", "Geology", "Applied Mathematics",
      "Home Science", "Forensic Science"
    ],
    "Management": [
      "MBA (Finance)", "MBA (Marketing)", "MBA (HR)", "MBA (Operations)", "MBA (Systems/IT)",
      "MBA (Business Analytics)", "MBA (International Business)", "MBA (Rural Management)",
      "MBA (Agri-Business)", "PGDM"
    ],
    "Computer Applications": [ "MCA" ],
    "M.Com": [ "General", "Accounting", "Finance", "Business Management", "Taxation" ],
    "M.A.": [ "Economics", "English", "Psychology", "Public Administration", "History", "Political Science", "Sociology", "Geography", "Philosophy", "Mass Communication & Journalism", "Social Work (MSW)", "Fine Arts (MFA)" ],
    "Medical & Law": [ "MS (Surgery)", "MD (Medicine)", "MDS", "M.Pharm", "MPT", "LLM" ],
    "Education": [ "M.Ed", "M.P.Ed" ]
  }
};

const collapseWhitespace = (value) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const makeLookup = (values) =>
  values.reduce((acc, value) => {
    acc[collapseWhitespace(value).toLowerCase()] = value;
    return acc;
  }, {});

const isAllSelection = (value) => {
  if (Array.isArray(value)) {
    return value.length === 1 && collapseWhitespace(value[0]) === ALL_SENTINEL;
  }
  return collapseWhitespace(value) === ALL_SENTINEL;
};

const QUALIFICATION_LOOKUP = makeLookup(QUALIFICATION_LEVELS);
const GRADUATION_STATUS_LOOKUP = makeLookup(GRADUATION_STATUSES);
const CATEGORY_LOOKUP = makeLookup(CATEGORIES);
const GENDER_LOOKUP = makeLookup(GENDERS);
const EXAM_STATUS_LOOKUP = makeLookup(EXAM_STATUSES);

const normalizeCanonicalValue = (value, lookup) => {
  if (value == null) return null;
  const norm = collapseWhitespace(value).toLowerCase();
  return lookup[norm] || null;
};

module.exports = {
  ALL_SENTINEL,
  QUALIFICATION_LEVELS,
  GRADUATION_STATUSES,
  CATEGORIES,
  GENDERS,
  EXAM_STATUSES,
  CERTIFICATION_OPTIONS,
  EXPERIENCE_FIELDS,
  BOARD_OPTIONS,
  TWELFTH_SUBJECTS_OPTIONS,
  SECTORS,
  INDIAN_STATES,
  COURSES_DATA,
  QUALIFICATION_LOOKUP,
  GRADUATION_STATUS_LOOKUP,
  CATEGORY_LOOKUP,
  GENDER_LOOKUP,
  EXAM_STATUS_LOOKUP,
  collapseWhitespace,
  makeLookup,
  isAllSelection,
  normalizeCanonicalValue,
};
