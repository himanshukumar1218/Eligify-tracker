// shared/constants/eligibilityConstants.d.ts

export type QualificationLevel = 'secondary' | 'intermediate' | 'diploma' | 'undergraduate' | 'postgraduate';
export type GraduationStatus = 'Currently Pursuing' | 'Completed / Graduated';
export type ReservationCategory = 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ExamStatus = 'Upcoming' | 'Active' | 'Closed';

export const ALL_SENTINEL: 'All';
export const QUALIFICATION_LEVELS: readonly QualificationLevel[];
export const GRADUATION_STATUSES: readonly GraduationStatus[];
export const CATEGORIES: readonly ReservationCategory[];
export const GENDERS: readonly Gender[];
export const EXAM_STATUSES: readonly ExamStatus[];

export const CERTIFICATION_OPTIONS: string[];
export const EXPERIENCE_FIELDS: string[];
export const BOARD_OPTIONS: string[];
export const TWELFTH_SUBJECTS_OPTIONS: string[];

export interface CoursesData {
  [qualificationLevel: string]: {
    [courseName: string]: string[];
  };
}
export const COURSES_DATA: CoursesData;

export const SECTORS: string[];
export const INDIAN_STATES: string[];

export const QUALIFICATION_LOOKUP: Record<string, string>;
export const GRADUATION_STATUS_LOOKUP: Record<string, string>;
export const CATEGORY_LOOKUP: Record<string, string>;
export const GENDER_LOOKUP: Record<string, string>;
export const EXAM_STATUS_LOOKUP: Record<string, string>;

export function collapseWhitespace(value: string | undefined | null): string;
export function makeLookup(values: readonly string[]): Record<string, string>;
export function isAllSelection(value: string | string[]): boolean;
