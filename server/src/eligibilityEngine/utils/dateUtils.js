/**
 * Calculates the age of a person as of a specific reference date.
 * @param {Date|string} dob - Date of birth
 * @param {Date|string} referenceDate - The "age as on" date from the exam
 * @returns {number} - Calculated age in years
 */
const calculateAge = (dob, referenceDate) => {
  const ref = new Date(referenceDate);
  const birth = new Date(dob);

  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Formats a Date object into a human-readable string (e.g. "1 Jan 2025").
 * @param {Date|string} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

module.exports = { calculateAge, formatDate };
