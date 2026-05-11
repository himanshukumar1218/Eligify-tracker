import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';

interface DobPickerProps {
  value: string; // Expected format: YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

const DobPicker: React.FC<DobPickerProps> = ({ value, onChange, className = '' }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Parse incoming value (YYYY-MM-DD)
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31;
    const monthInt = parseInt(m, 10);
    const yearInt = y ? parseInt(y, 10) : 2000; // default to a leap year
    return new Date(yearInt, monthInt, 0).getDate();
  };

  const handleUpdate = (newDay: string, newMonth: string, newYear: string) => {
    const newDaysCount = getDaysInMonth(newMonth, newYear);
    let finalDay = newDay;
    if (newDay && parseInt(newDay, 10) > newDaysCount) {
      finalDay = newDaysCount.toString().padStart(2, '0');
    }

    setDay(finalDay);
    setMonth(newMonth);
    setYear(newYear);

    if (finalDay && newMonth && newYear) {
      onChange(`${newYear}-${newMonth}-${finalDay}`);
    } else {
      onChange(''); // clear value if incomplete
    }
  };

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) => {
    const d = (i + 1).toString().padStart(2, '0');
    return { value: d, label: d };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => {
    const y = (currentYear - i).toString();
    return { value: y, label: y };
  });

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      <CustomDropdown
        options={[{ value: '', label: 'Day' }, ...days]}
        value={day}
        onChange={(val) => handleUpdate(val, month, year)}
      />
      <CustomDropdown
        options={[{ value: '', label: 'Month' }, ...MONTHS]}
        value={month}
        onChange={(val) => handleUpdate(day, val, year)}
      />
      <CustomDropdown
        options={[{ value: '', label: 'Year' }, ...years]}
        value={year}
        onChange={(val) => handleUpdate(day, month, val)}
      />
    </div>
  );
};

export default DobPicker;
