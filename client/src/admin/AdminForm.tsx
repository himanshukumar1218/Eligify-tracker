import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../utils/api";
import * as types from "@shared/constants/eligibilityConstants";
const {
  ALL_SENTINEL,
  CATEGORIES,
  EXAM_STATUSES,
  GENDERS,
  QUALIFICATION_LEVELS,
  isAllSelection,
  SECTORS,
  INDIAN_STATES: BASE_INDIAN_STATES,
  CERTIFICATION_OPTIONS,
  EXPERIENCE_FIELDS,
  BOARD_OPTIONS,
  TWELFTH_SUBJECTS_OPTIONS,
  COURSES_DATA: coursesData,
} = ((types as any).default || types) as typeof types;

const INDIAN_STATES = [ALL_SENTINEL, ...BASE_INDIAN_STATES];
const boardOptions = BOARD_OPTIONS;
const twelfthSubjectsOptions = TWELFTH_SUBJECTS_OPTIONS;
const CUSTOM_OPTION = "__custom__";
const defaultAllSelection = (): string[] => [ALL_SENTINEL];

type ReservationCategory = typeof CATEGORIES[number];
interface Relaxation {
  category: ReservationCategory | "";
  relaxation_years: number;
  max_attempts: number | "";
}

interface EducationCriterion {
  required_qualification: string;
  allowed_programmes: string[];   // [ALL_SENTINEL] sentinel
  allowed_branches: string[];     // [ALL_SENTINEL] sentinel
  min_percentage: number | "";
  final_year_allowed: boolean;
  allowed_10th_boards: string[];
  allowed_12th_boards: string[];
  allowed_12th_streams: string[];
  required_subjects: string[];
}

interface SpecialRequirements {
  physical_criteria: {
    min_height_male: number | "";
    min_height_female: number | "";
    min_weight_male: number | "";
    min_weight_female: number | "";
    min_chest_cm: number | "";
    must_be_fit: boolean;
  };
  experience_criteria: {
    min_years: number | "";
    field: string;
  };
  required_certifications: string[];
  domicile_required: boolean;
  domicile_states: string[];
}

interface Post {
  id: string;
  post_name: string;
  department: string;
  min_age: number | "";
  max_age: number | "";
  allowed_genders: string[];
  rules: string;
  relaxations: Relaxation[];
  education_criteria: EducationCriterion[];
  special_requirements: SpecialRequirements;
  _expanded: boolean;
  _activeTab: "basic" | "relaxations" | "education" | "special";
}

interface ExamForm {
  exam_name: string;
  organisation: string;
  sector: string;
  status: typeof EXAM_STATUSES[number];
  official_link: string;
  notification_date: string;
  application_start: string;
  application_end: string;
  last_correction_date: string;
  age_criteria_date: string;
  admit_card_release_date: string;
  exam_city_details_date: string;
  exam_date: string;
  result_release_date: string;
  application_fees: Record<string, number | "">;
  allowed_states: string[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const blankPost = (): Post => ({
  id: uid(),
  post_name: "", department: "", min_age: "", max_age: "",
  allowed_genders: defaultAllSelection(),
  rules: "",
  relaxations: CATEGORIES.map(c => ({ category: c, relaxation_years: 0, max_attempts: "" })),
  education_criteria: [],
  special_requirements: {
    physical_criteria: { min_height_male: "", min_height_female: "", min_weight_male: "", min_weight_female: "", min_chest_cm: "", must_be_fit: false },
    experience_criteria: { min_years: "", field: "" },
    required_certifications: [],
    domicile_required: false,
    domicile_states: [],
  },
  _expanded: true,
  _activeTab: "basic",
});

const blankEducationCriterion = (): EducationCriterion => ({
  required_qualification: "",
  allowed_programmes: defaultAllSelection(),
  allowed_branches: defaultAllSelection(),
  min_percentage: "",
  final_year_allowed: false,
  allowed_10th_boards: defaultAllSelection(),
  allowed_12th_boards: defaultAllSelection(),
  allowed_12th_streams: defaultAllSelection(),
  required_subjects: defaultAllSelection(),
});

const blankExam = (): ExamForm => ({
  exam_name: "", organisation: "", sector: "", status: EXAM_STATUSES[0], official_link: "",
  notification_date: "", application_start: "", application_end: "",
  last_correction_date: "", age_criteria_date: "", admit_card_release_date: "",
  exam_city_details_date: "", exam_date: "", result_release_date: "",
  application_fees: { UR: "", OBC: "", SC: "", ST: "", EWS: "", female: "", pwd: "" },
  allowed_states: defaultAllSelection(),
});

const DISCOVERY_API_BASE = "http://127.0.0.1:3001/api/discovery";

type DiscoveryJsonPayload = {
  exam?: Partial<ExamForm> & {
    application_fees?: Record<string, number | string>;
    allowed_states?: string[];
  };
  posts?: Array<{
    post_name?: string;
    department?: string;
    min_age?: number | null;
    max_age?: number | null;
    allowed_genders?: string[];
    relaxations?: Relaxation[];
    education_criteria?: Array<Partial<EducationCriterion>>;
    special_requirements?: Partial<SpecialRequirements> & {
      physical_criteria?: Partial<SpecialRequirements["physical_criteria"]>;
      experience_criteria?: Partial<SpecialRequirements["experience_criteria"]>;
    };
  }>;
};

function mapApplicationFees(fees?: Record<string, number | string>): Record<string, number | ""> {
  return {
    UR: fees?.UR === undefined || fees?.UR === null ? "" : Number(fees.UR),
    OBC: fees?.OBC === undefined || fees?.OBC === null ? "" : Number(fees.OBC),
    SC: fees?.SC === undefined || fees?.SC === null ? "" : Number(fees.SC),
    ST: fees?.ST === undefined || fees?.ST === null ? "" : Number(fees.ST),
    EWS: fees?.EWS === undefined || fees?.EWS === null ? "" : Number(fees.EWS),
    female: fees?.female === undefined || fees?.female === null ? "" : Number(fees.female),
    pwd: fees?.pwd === undefined || fees?.pwd === null ? "" : Number(fees.pwd),
  };
}

function normalizeDiscoveryJson(raw: unknown): DiscoveryJsonPayload {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const candidate = raw as Record<string, unknown>;

  if (candidate.exam || candidate.posts) {
    return candidate as unknown as DiscoveryJsonPayload;
  }

  const nested = candidate["0"];
  if (nested && typeof nested === "object") {
    const nestedCandidate = nested as Record<string, unknown>;
    if (nestedCandidate.exam || nestedCandidate.posts) {
      return nestedCandidate as unknown as DiscoveryJsonPayload;
    }
  }

  return candidate as unknown as DiscoveryJsonPayload;
}

function mapDiscoveryExamToForm(examData?: DiscoveryJsonPayload["exam"]): ExamForm {
  const base = blankExam();

  if (!examData) {
    return base;
  }

  return {
    ...base,
    ...examData,
    status: (examData.status as typeof EXAM_STATUSES[number]) || base.status,
    application_fees: mapApplicationFees(examData.application_fees),
    allowed_states: examData.allowed_states && examData.allowed_states.length > 0 ? examData.allowed_states : defaultAllSelection(),
    official_link: examData.official_link === "leave it blank" ? "" : (examData.official_link ?? "")
  };
}

function mapDiscoveryPost(postData: NonNullable<DiscoveryJsonPayload["posts"]>[number] | undefined): Post {
  const base = blankPost();
  const specialRequirements = postData?.special_requirements ?? {};
  const physical: Partial<SpecialRequirements["physical_criteria"]> = specialRequirements.physical_criteria ?? {};
  const experience: Partial<SpecialRequirements["experience_criteria"]> = specialRequirements.experience_criteria ?? {};

  return {
    ...base,
    post_name: postData?.post_name ?? "",
    department: postData?.department ?? "",
    min_age: postData?.min_age ?? "",
    max_age: postData?.max_age ?? "",
    allowed_genders: postData?.allowed_genders && postData.allowed_genders.length > 0 ? postData.allowed_genders : defaultAllSelection(),
    relaxations: postData?.relaxations && postData.relaxations.length > 0
      ? postData.relaxations.map((relaxation) => ({
          category: relaxation.category,
          relaxation_years: relaxation.relaxation_years,
          max_attempts: relaxation.max_attempts ?? ""
        }))
      : base.relaxations,
    education_criteria: postData?.education_criteria?.map((criterion) => ({
      ...blankEducationCriterion(),
      ...criterion,
      allowed_programmes: criterion.allowed_programmes && criterion.allowed_programmes.length > 0 ? criterion.allowed_programmes : defaultAllSelection(),
      allowed_branches: criterion.allowed_branches && criterion.allowed_branches.length > 0 ? criterion.allowed_branches : defaultAllSelection(),
      allowed_10th_boards: criterion.allowed_10th_boards && criterion.allowed_10th_boards.length > 0 ? criterion.allowed_10th_boards : defaultAllSelection(),
      allowed_12th_boards: criterion.allowed_12th_boards && criterion.allowed_12th_boards.length > 0 ? criterion.allowed_12th_boards : defaultAllSelection(),
      allowed_12th_streams: criterion.allowed_12th_streams && criterion.allowed_12th_streams.length > 0 ? criterion.allowed_12th_streams : defaultAllSelection(),
      required_subjects: criterion.required_subjects && criterion.required_subjects.length > 0 ? criterion.required_subjects : defaultAllSelection(),
      min_percentage: criterion.min_percentage ?? "",
      final_year_allowed: Boolean(criterion.final_year_allowed)
    })) ?? [],
    special_requirements: {
      physical_criteria: {
        ...base.special_requirements.physical_criteria,
        ...physical,
        must_be_fit: Boolean(physical.must_be_fit)
      },
      experience_criteria: {
        ...base.special_requirements.experience_criteria,
        ...experience,
        min_years: experience.min_years ?? "",
        field: experience.field ?? ""
      },
      required_certifications: specialRequirements.required_certifications ?? [],
      domicile_required: Boolean(specialRequirements.domicile_required),
      domicile_states: specialRequirements.domicile_states ?? []
    }
  };
}

// ─── Shared UI atoms ───────────────────────────────────────────────────────────

const Label = ({ children, required, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor?: string }) => (
  <label
    htmlFor={htmlFor}
    style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
    {children}{required && <span style={{ color: "#f59e0b", marginLeft: 3 }}>*</span>}
  </label>
);

const Input = ({ value, onChange, placeholder, type = "text", style = {}, id }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; style?: React.CSSProperties; id?: string;
}) => (
  <input
    id={id}
    type={type} value={value} placeholder={placeholder}
    onChange={e => onChange(e.target.value)}
    style={{ width: "100%", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 6, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", ...style }}
    onFocus={e => e.target.style.borderColor = "#f59e0b"}
    onBlur={e => e.target.style.borderColor = "#1e3a5f"}
  />
);

const Select = ({ value, onChange, options, placeholder, id, allowCustom = false, customPlaceholder = "Enter custom value" }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; id?: string; allowCustom?: boolean; customPlaceholder?: string;
}) => {
  const [customMode, setCustomMode] = useState(false);
  const isKnownValue = options.includes(value);
  const selectValue = isKnownValue ? value : value ? CUSTOM_OPTION : "";
  const showCustomInput = allowCustom && (customMode || (!!value && !isKnownValue));

  return (
    <div>
      <select
        id={id}
        value={selectValue}
        onChange={e => {
          if (e.target.value === CUSTOM_OPTION) {
            setCustomMode(true);
            onChange("");
            return;
          }
          setCustomMode(false);
          onChange(e.target.value);
        }}
        style={{ width: "100%", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 6, padding: "9px 12px", color: value ? "#e2e8f0" : "#475569", fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}
        onFocus={e => e.target.style.borderColor = "#f59e0b"}
        onBlur={e => e.target.style.borderColor = "#1e3a5f"}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o} value={o} style={{ background: "#0f172a" }}>{o}</option>)}
        {allowCustom && <option value={CUSTOM_OPTION} style={{ background: "#0f172a" }}>Other</option>}
      </select>
      {showCustomInput && (
        <Input value={value} onChange={onChange} placeholder={customPlaceholder} style={{ marginTop: 10 }} />
      )}
    </div>
  );
};

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
    <div onClick={() => onChange(!checked)} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "#f59e0b" : "#1e3a5f", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
    </div>
    <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
  </label>
);

// ALL-aware MultiSelect
const MultiSelect = ({ label, options, value, onChange, allowAll = true, id, allowCustom = false, customPlaceholder = "Add custom value" }: {
  label?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; allowAll?: boolean; id?: string; allowCustom?: boolean; customPlaceholder?: string;
}) => {
  const [customValue, setCustomValue] = useState("");
  const isAll = isAllSelection(value);
  const customSelected = value.filter(v => v !== ALL_SENTINEL && !options.includes(v));
  const toggle = (opt: string) => {
    if (opt === ALL_SENTINEL) { onChange(defaultAllSelection()); return; }
    const next = value.filter(v => v !== ALL_SENTINEL);
    if (next.includes(opt)) { const r = next.filter(v => v !== opt); onChange(r.length ? r : defaultAllSelection()); }
    else onChange([...next, opt]);
  };
  return (
    <div id={id}>
      {label && <Label>{label}</Label>}
      {allowAll && (
        <button type="button" onClick={() => onChange(defaultAllSelection())}
          style={{ marginBottom: 8, padding: "4px 14px", borderRadius: 20, border: "1px solid", borderColor: isAll ? "#f59e0b" : "#1e3a5f", background: isAll ? "#f59e0b22" : "transparent", color: isAll ? "#f59e0b" : "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer" }}>
          ALL
        </button>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => {
          const active = !isAll && value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: active ? "#3b82f6" : "#1e3a5f", background: active ? "#3b82f611" : "transparent", color: active ? "#93c5fd" : "#475569", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
              {opt}
            </button>
          );
        })}
        {!isAll && customSelected.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(value.filter(v => v !== opt))}
            style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid #f59e0b", background: "#f59e0b22", color: "#fcd34d", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
            {opt} ×
          </button>
        ))}
      </div>
      {allowCustom && !isAll && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <Input value={customValue} onChange={setCustomValue} placeholder={customPlaceholder} style={{ flex: 1 }} />
          <button type="button" onClick={() => {
            const trimmed = customValue.trim();
            if (!trimmed) return;
            const next = value.filter(v => v !== ALL_SENTINEL);
            if (!next.includes(trimmed)) onChange([...next, trimmed]);
            setCustomValue("");
          }}
            style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid #1e3a5f", background: "#10243f", color: "#93c5fd", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Add
          </button>
        </div>
      )}
      {!isAll && value.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
          {value.length} selected: {value.join(", ")}
        </div>
      )}
    </div>
  );
};

const CustomValueAdder = ({ placeholder, onAdd }: { placeholder: string; onAdd: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Input value={value} onChange={setValue} placeholder={placeholder} style={{ flex: 1 }} />
      <button type="button" onClick={() => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setValue("");
      }}
        style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid #1e3a5f", background: "#10243f", color: "#93c5fd", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        Add
      </button>
    </div>
  );
};

const SectionCard = ({ title, children, accent = "#1e3a5f" }: { title: string; children: React.ReactNode; accent?: string }) => (
  <div style={{ background: "#0f1e35", border: `1px solid ${accent}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #1e3a5f" }}>{title}</div>
    {children}
  </div>
);

const Grid = ({ cols = 2, children }: { cols?: number; children: React.ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>{children}</div>
);

const Field = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
);

// ─── Course Selector (qualification → programme → branch) ─────────────────────

const CourseSelector = ({ criterion, onChange, pathIndex }: {
  criterion: EducationCriterion;
  onChange: (updated: EducationCriterion) => void;
  pathIndex: number;
}) => {
  const q = criterion.required_qualification;
  const boards10th = boardOptions;
  const streams12th = coursesData.intermediate["12th Standard"];
  const commonSubjects = twelfthSubjectsOptions;

  const programmes = q && (q === "undergraduate" || q === "postgraduate" || q === "diploma")
    ? Object.keys(coursesData[q] || {})
    : [];

  const selectedAllProgrammes = isAllSelection(criterion.allowed_programmes);

  const branches = !selectedAllProgrammes && criterion.allowed_programmes.length > 0
    ? [...new Set(criterion.allowed_programmes.flatMap(p =>
      coursesData[q]?.[p] ?? []
    ))]
    : q && (q === "undergraduate" || q === "postgraduate" || q === "diploma")
      ? [...new Set(Object.values(coursesData[q] || {}).flat())]
      : [];

  return (
    <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <Grid cols={2}>
        <Field>
          <Label required htmlFor={`qual-${pathIndex}`}>Qualification Level</Label>
          <Select
            id={`qual-${pathIndex}`}
            value={criterion.required_qualification}
            onChange={v => onChange({ ...blankEducationCriterion(), required_qualification: v })}
            options={[...QUALIFICATION_LEVELS]} placeholder="Select level" />
        </Field>
        <Field>
          <Label htmlFor={`min-perc-${pathIndex}`}>Min Percentage</Label>
          <Input
            id={`min-perc-${pathIndex}`}
            value={criterion.min_percentage} onChange={v => onChange({ ...criterion, min_percentage: v === "" ? "" : parseFloat(v) })}
            placeholder="e.g. 60" type="number" />
        </Field>
      </Grid>

      {q === "secondary" && (
        <div style={{ marginTop: 14 }}>
          <MultiSelect
            label="Allowed 10th Boards"
            options={boards10th}
            value={criterion.allowed_10th_boards}
            onChange={v => onChange({ ...criterion, allowed_10th_boards: v })}
            allowCustom
            customPlaceholder="Add custom 10th board"
          />
        </div>
      )}

      {q === "intermediate" && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <MultiSelect
            label="Allowed 12th Boards"
            options={boards10th}
            value={criterion.allowed_12th_boards}
            onChange={v => onChange({ ...criterion, allowed_12th_boards: v })}
            allowCustom
            customPlaceholder="Add custom 12th board"
          />

          <MultiSelect
            label="Allowed Streams"
            options={streams12th}
            value={criterion.allowed_12th_streams}
            onChange={v => onChange({ ...criterion, allowed_12th_streams: v })}
            allowCustom
            customPlaceholder="Add custom stream"
          />

          <MultiSelect
            label="Mandatory Subjects (12th)"
            options={commonSubjects}
            value={criterion.required_subjects}
            onChange={v => onChange({ ...criterion, required_subjects: v })}
          />
        </div>
      )}

      {(q === "undergraduate" || q === "postgraduate" || q === "diploma") && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label>Allowed Programmes</Label>
            <button type="button" onClick={() => onChange({ ...criterion, allowed_programmes: defaultAllSelection(), allowed_branches: defaultAllSelection() })}
              style={{ padding: "3px 12px", borderRadius: 20, border: "1px solid", borderColor: selectedAllProgrammes ? "#f59e0b" : "#1e3a5f", background: selectedAllProgrammes ? "#f59e0b22" : "transparent", color: selectedAllProgrammes ? "#f59e0b" : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ALL PROGRAMMES
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {programmes.map(prog => {
              const active = !selectedAllProgrammes && criterion.allowed_programmes.includes(prog);
              return (
                <button key={prog} type="button"
                  onClick={() => {
                    const next = selectedAllProgrammes ? [prog] : criterion.allowed_programmes.includes(prog)
                      ? criterion.allowed_programmes.filter(p => p !== prog)
                      : [...criterion.allowed_programmes, prog];
                    onChange({ ...criterion, allowed_programmes: next.length ? next : defaultAllSelection(), allowed_branches: defaultAllSelection() });
                  }}
                  style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid", borderColor: active ? "#22d3ee" : "#1e3a5f", background: active ? "#22d3ee11" : "transparent", color: active ? "#67e8f9" : "#475569", fontSize: 12, cursor: "pointer" }}>
                  {prog}
                </button>
              );
            })}
          </div>
          {!selectedAllProgrammes && (
            <div style={{ marginTop: 10 }}>
              <CustomValueAdder placeholder="Add custom programme" onAdd={(customProgramme) => {
                const next = criterion.allowed_programmes.filter(p => p !== ALL_SENTINEL);
                if (!next.includes(customProgramme)) {
                  onChange({ ...criterion, allowed_programmes: [...next, customProgramme], allowed_branches: defaultAllSelection() });
                }
              }} />
            </div>
          )}
        </div>
      )}

      {(q === "undergraduate" || q === "postgraduate" || q === "diploma") && branches.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label>Allowed Branches / Specialisations</Label>
            <button type="button" onClick={() => onChange({ ...criterion, allowed_branches: defaultAllSelection() })}
              style={{ padding: "3px 12px", borderRadius: 20, border: "1px solid", borderColor: isAllSelection(criterion.allowed_branches) ? "#f59e0b" : "#1e3a5f", background: isAllSelection(criterion.allowed_branches) ? "#f59e0b22" : "transparent", color: isAllSelection(criterion.allowed_branches) ? "#f59e0b" : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ALL BRANCHES
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {branches.map(br => {
              const isAllBranch = isAllSelection(criterion.allowed_branches);
              const active = !isAllBranch && criterion.allowed_branches.includes(br);
              return (
                <button key={br} type="button"
                  onClick={() => {
                    const isAllB = isAllSelection(criterion.allowed_branches);
                    const next = isAllB ? [br] : criterion.allowed_branches.includes(br)
                      ? criterion.allowed_branches.filter(b => b !== br)
                      : [...criterion.allowed_branches, br];
                    onChange({ ...criterion, allowed_branches: next.length ? next : defaultAllSelection() });
                  }}
                  style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid", borderColor: active ? "#a78bfa" : "#1e3a5f", background: active ? "#a78bfa11" : "transparent", color: active ? "#c4b5fd" : "#475569", fontSize: 11, cursor: "pointer" }}>
                  {br}
                </button>
              );
            })}
          </div>
          {!isAllSelection(criterion.allowed_branches) && (
            <div style={{ marginTop: 10 }}>
              <CustomValueAdder placeholder="Add custom branch" onAdd={(customBranch) => {
                const next = criterion.allowed_branches.filter(b => b !== ALL_SENTINEL);
                if (!next.includes(customBranch)) {
                  onChange({ ...criterion, allowed_branches: [...next, customBranch] });
                }
              }} />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Toggle checked={criterion.final_year_allowed}
          onChange={v => onChange({ ...criterion, final_year_allowed: v })}
          label="Final year / currently pursuing students are eligible" />
      </div>
    </div>
  );
};

// ─── Post Tabs ─────────────────────────────────────────────────────────────────

const PostSection = ({ post, index, onChange, onRemove }: {
  post: Post; index: number;
  onChange: (updated: Post) => void;
  onRemove: () => void;
}) => {
  const set = <K extends keyof Post>(key: K, val: Post[K]) => onChange({ ...post, [key]: val });
  const setSR = (partial: Partial<SpecialRequirements>) =>
    set("special_requirements", { ...post.special_requirements, ...partial });
  const setPhysical = (partial: Partial<SpecialRequirements["physical_criteria"]>) =>
    setSR({ physical_criteria: { ...post.special_requirements.physical_criteria, ...partial } });
  const setExp = (partial: Partial<SpecialRequirements["experience_criteria"]>) =>
    setSR({ experience_criteria: { ...post.special_requirements.experience_criteria, ...partial } });

  const tabs: { key: Post["_activeTab"]; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "relaxations", label: "Relaxations" },
    { key: "education", label: "Education" },
    { key: "special", label: "Special Req." },
  ];

  return (
    <div style={{ background: "#081428", border: "1px solid #1e3a5f", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
      {/* Post header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#0a1e38", borderBottom: "1px solid #1e3a5f", cursor: "pointer" }}
        onClick={() => set("_expanded", !post._expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f59e0b22", border: "1px solid #f59e0b44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>{index + 1}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{post.post_name || `Post ${index + 1}`}</div>
            {post.department && <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{post.department}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ padding: "4px 12px", borderRadius: 6, background: "#7f1d1d22", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 11, cursor: "pointer" }}>
            Remove
          </button>
          <span style={{ color: "#475569", fontSize: 16 }}>{post._expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {post._expanded && (
        <div style={{ padding: 20 }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #1e3a5f", paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t.key} type="button" onClick={() => set("_activeTab", t.key)}
                style={{ padding: "8px 18px", borderRadius: "6px 6px 0 0", border: "1px solid", borderBottom: "none", borderColor: post._activeTab === t.key ? "#f59e0b" : "#1e3a5f", background: post._activeTab === t.key ? "#f59e0b15" : "transparent", color: post._activeTab === t.key ? "#f59e0b" : "#475569", fontSize: 12, fontWeight: post._activeTab === t.key ? 700 : 400, cursor: "pointer", marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* BASIC INFO */}
          {post._activeTab === "basic" && (
            <div>
              <Grid cols={2}>
                <Field>
                  <Label required htmlFor={`p-name-${post.id}`}>Post Name</Label>
                  <Input id={`p-name-${post.id}`} value={post.post_name} onChange={v => set("post_name", v)} placeholder="e.g. Junior Engineer" />
                </Field>
                <Field>
                  <Label htmlFor={`p-dept-${post.id}`}>Department</Label>
                  <Input id={`p-dept-${post.id}`} value={post.department} onChange={v => set("department", v)} placeholder="e.g. Ministry of Railways" />
                </Field>
                <Field>
                  <Label required htmlFor={`p-minage-${post.id}`}>Min Age</Label>
                  <Input id={`p-minage-${post.id}`} value={post.min_age} onChange={v => set("min_age", v === "" ? "" : parseInt(v))} type="number" placeholder="18" />
                </Field>
                <Field>
                  <Label required htmlFor={`p-maxage-${post.id}`}>Max Age</Label>
                  <Input id={`p-maxage-${post.id}`} value={post.max_age} onChange={v => set("max_age", v === "" ? "" : parseInt(v))} type="number" placeholder="27" />
                </Field>
              </Grid>
              <div style={{ marginTop: 16 }}>
                <MultiSelect label="Allowed Genders" options={[...GENDERS]} value={post.allowed_genders} onChange={v => set("allowed_genders", v)} allowAll />
              </div>
              <div style={{ marginTop: 16 }}>
                <Label htmlFor={`p-rules-${post.id}`}>Extra Rules (JSON)</Label>
                <textarea
                  id={`p-rules-${post.id}`}
                  value={post.rules} onChange={e => set("rules", e.target.value)}
                  placeholder={'e.g. {"vision": "6/6", "must_know_hindi": true, "max_attempts": 6}'}
                  rows={3}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 6, padding: "9px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "'Fira Code', monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
          )}

          {/* RELAXATIONS */}
          {post._activeTab === "relaxations" && (
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Set relaxation years and attempt limits per reservation category. Leave blank if not applicable.</div>
              <div style={{ display: "grid", gap: 12 }}>
                {post.relaxations.map((rel, i) => (
                  <div key={rel.category} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 12, alignItems: "end", background: "#0a1628", borderRadius: 8, padding: 14 }}>
                    <div>
                      <Label>Category</Label>
                      <div style={{ padding: "9px 12px", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{rel.category}</div>
                    </div>
                    <Field>
                      <Label htmlFor={`rel-yrs-${post.id}-${i}`}>Relaxation Years</Label>
                      <Input id={`rel-yrs-${post.id}-${i}`} value={rel.relaxation_years} onChange={v => {
                        const next = [...post.relaxations];
                        next[i] = { ...rel, relaxation_years: parseInt(v) || 0 };
                        set("relaxations", next);
                      }} type="number" placeholder="0" />
                    </Field>
                    <Field>
                      <Label htmlFor={`rel-att-${post.id}-${i}`}>Max Attempts</Label>
                      <Input id={`rel-att-${post.id}-${i}`} value={rel.max_attempts} onChange={v => {
                        const next = [...post.relaxations];
                        next[i] = { ...rel, max_attempts: v === "" ? "" : parseInt(v) };
                        set("relaxations", next);
                      }} type="number" placeholder="No limit" />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION CRITERIA */}
          {post._activeTab === "education" && (
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Each row below is an independent qualifying path (OR logic). A student satisfying any one path is eligible.</div>
              {post.education_criteria.map((ec, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em" }}>PATH {i + 1}</span>
                    <button type="button" onClick={() => set("education_criteria", post.education_criteria.filter((_, j) => j !== i))}
                      style={{ fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer" }}>✕ Remove path</button>
                  </div>
                  <CourseSelector criterion={ec} pathIndex={i} onChange={updated => {
                    const next = [...post.education_criteria];
                    next[i] = updated;
                    set("education_criteria", next);
                  }} />
                </div>
              ))}
              <button type="button" onClick={() => set("education_criteria", [...post.education_criteria, blankEducationCriterion()])}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px dashed #1e3a5f", background: "transparent", color: "#475569", fontSize: 13, cursor: "pointer", marginTop: 4 }}>
                + Add Education Path
              </button>
            </div>
          )}

          {/* SPECIAL REQUIREMENTS */}
          {post._activeTab === "special" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Physical */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Physical Criteria</div>
                <Grid cols={2}>
                  <Field><Label htmlFor={`h-m-${post.id}`}>Min Height – Male (cm)</Label><Input id={`h-m-${post.id}`} value={post.special_requirements.physical_criteria.min_height_male} onChange={v => setPhysical({ min_height_male: v === "" ? "" : parseInt(v) })} type="number" placeholder="165" /></Field>
                  <Field><Label htmlFor={`h-f-${post.id}`}>Min Height – Female (cm)</Label><Input id={`h-f-${post.id}`} value={post.special_requirements.physical_criteria.min_height_female} onChange={v => setPhysical({ min_height_female: v === "" ? "" : parseInt(v) })} type="number" placeholder="155" /></Field>
                  <Field><Label htmlFor={`w-m-${post.id}`}>Min Weight – Male (kg)</Label><Input id={`w-m-${post.id}`} value={post.special_requirements.physical_criteria.min_weight_male} onChange={v => setPhysical({ min_weight_male: v === "" ? "" : parseInt(v) })} type="number" placeholder="50" /></Field>
                  <Field><Label htmlFor={`w-f-${post.id}`}>Min Weight – Female (kg)</Label><Input id={`w-f-${post.id}`} value={post.special_requirements.physical_criteria.min_weight_female} onChange={v => setPhysical({ min_weight_female: v === "" ? "" : parseInt(v) })} type="number" placeholder="45" /></Field>
                  <Field><Label htmlFor={`ch-${post.id}`}>Min Chest (cm)</Label><Input id={`ch-${post.id}`} value={post.special_requirements.physical_criteria.min_chest_cm} onChange={v => setPhysical({ min_chest_cm: v === "" ? "" : parseInt(v) })} type="number" placeholder="80" /></Field>
                </Grid>
                <div style={{ marginTop: 12 }}>
                  <Toggle checked={post.special_requirements.physical_criteria.must_be_fit} onChange={v => setPhysical({ must_be_fit: v })} label="Must be declared physically fit" />
                </div>
              </div>

              {/* Experience */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Experience Criteria</div>
                <Grid cols={2}>
                  <Field>
                    <Label htmlFor={`exp-y-${post.id}`}>Minimum Years</Label>
                    <Input id={`exp-y-${post.id}`} value={post.special_requirements.experience_criteria.min_years} onChange={v => setExp({ min_years: v === "" ? "" : parseInt(v) })} type="number" placeholder="0" />
                  </Field>
                  <Field>
                    <Label htmlFor={`exp-f-${post.id}`}>Field / Domain</Label>
                    <Select id={`exp-f-${post.id}`} value={post.special_requirements.experience_criteria.field} onChange={v => setExp({ field: v })} options={EXPERIENCE_FIELDS} placeholder="Select field" allowCustom customPlaceholder="Enter custom experience field" />
                  </Field>
                </Grid>
              </div>

              {/* Certifications */}
              <div>
                <MultiSelect label="Required Certifications" options={CERTIFICATION_OPTIONS}
                  value={post.special_requirements.required_certifications.length ? post.special_requirements.required_certifications : defaultAllSelection()}
                  onChange={v => setSR({ required_certifications: isAllSelection(v) ? [] : v })}
                  allowAll
                  allowCustom
                  customPlaceholder="Add custom certification" />
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Select only the certifications that are mandatory. Leave ALL / empty for no requirement.</div>
              </div>

              {/* Domicile */}
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Toggle checked={post.special_requirements.domicile_required} onChange={v => setSR({ domicile_required: v, domicile_states: v ? post.special_requirements.domicile_states : [] })} label="Domicile of specific state(s) required" />
                </div>
                {post.special_requirements.domicile_required && (
                  <MultiSelect label="Allowed Domicile States" options={INDIAN_STATES.filter(s => s !== ALL_SENTINEL)}
                    value={post.special_requirements.domicile_states.length ? post.special_requirements.domicile_states : defaultAllSelection()}
                    onChange={v => setSR({ domicile_states: isAllSelection(v) ? [] : v })}
                    allowAll={false} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Form ─────────────────────────────────────────────────────────────────

export default function ExamNotificationForm({ initialData = null }: { initialData?: DiscoveryJsonPayload | null }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamForm>(blankExam());
  const [posts, setPosts] = useState<Post[]>([blankPost()]);
  const [submitted, setSubmitted] = useState<object | null>(null);
  const [activeSection, setActiveSection] = useState<"exam" | "posts" | "preview">("exam");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const discoveryId = searchParams.get("discoveryId");

  const setExamField = <K extends keyof ExamForm>(key: K, val: ExamForm[K]) =>
    setExam(prev => ({ ...prev, [key]: val }));

  const setFee = (key: string, val: string) =>
    setExam(prev => ({ ...prev, application_fees: { ...prev.application_fees, [key]: val === "" ? "" : parseInt(val) } }));

  const updatePost = useCallback((id: string, updated: Post) =>
    setPosts(prev => prev.map(p => p.id === id ? updated : p)), []);

  const removePost = useCallback((id: string) =>
    setPosts(prev => prev.filter(p => p.id !== id)), []);
  useEffect(() => {
    const data = initialData;
    if (!data) {
      return;
    }

    setExam(mapDiscoveryExamToForm(data.exam));
    setPosts(data.posts && data.posts.length > 0 ? data.posts.map((post) => mapDiscoveryPost(post)) : [blankPost()]);
    setSubmitted(null);
    setDiscoveryError(null);
  }, [initialData]);

  useEffect(() => {
    if (!discoveryId) {
      return;
    }

    let cancelled = false;

    async function loadDiscovery() {
      setIsLoadingDiscovery(true);
      setDiscoveryError(null);

      try {
        const response = await fetch(`${DISCOVERY_API_BASE}/${discoveryId}`);

        if (!response.ok) {
          throw new Error("Failed to load discovered exam JSON");
        }

        const data = await response.json();
        if (cancelled) {
          return;
        }

        const jsonData = normalizeDiscoveryJson(data.json_data ?? {});
        setExam(mapDiscoveryExamToForm(jsonData.exam));
        setPosts(jsonData.posts && jsonData.posts.length > 0 ? jsonData.posts.map((post) => mapDiscoveryPost(post)) : [blankPost()]);
        setSubmitted(null);
      } catch (error) {
        if (!cancelled) {
          setDiscoveryError(error instanceof Error ? error.message : "Failed to load discovered exam JSON");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDiscovery(false);
        }
      }
    }

    loadDiscovery();

    return () => {
      cancelled = true;
    };
  }, [discoveryId]);

  const buildPayload = () => ({
    exam: {
      ...exam,
      application_fees: Object.fromEntries(Object.entries(exam.application_fees).filter(([, v]) => v !== "")),
    },
    posts: posts.map(({ id: _id, _expanded, _activeTab, ...rest }) => ({
      ...rest,
      rules: rest.rules ? (() => { try { return JSON.parse(rest.rules); } catch { return rest.rules; } })() : undefined,
      relaxations: rest.relaxations.filter(r => r.relaxation_years > 0 || r.max_attempts !== ""),
      education_criteria: rest.education_criteria.map(ec => ({
        ...ec,
        allowed_programmes: isAllSelection(ec.allowed_programmes) ? undefined : ec.allowed_programmes,
        allowed_branches: isAllSelection(ec.allowed_branches) ? undefined : ec.allowed_branches,
        allowed_10th_boards: isAllSelection(ec.allowed_10th_boards) ? undefined : ec.allowed_10th_boards,
        allowed_12th_boards: isAllSelection(ec.allowed_12th_boards) ? undefined : ec.allowed_12th_boards,
        allowed_12th_streams: isAllSelection(ec.allowed_12th_streams) ? undefined : ec.allowed_12th_streams,
        required_subjects: isAllSelection(ec.required_subjects) ? undefined : ec.required_subjects,
      })),
      special_requirements: {
        ...rest.special_requirements,
        physical_criteria: Object.fromEntries(
          Object.entries(rest.special_requirements.physical_criteria).filter(([, v]) => v !== "" && v !== false)
        ),
        experience_criteria: rest.special_requirements.experience_criteria.min_years !== "" || rest.special_requirements.experience_criteria.field
          ? {
              min_years: rest.special_requirements.experience_criteria.min_years === "" ? undefined : rest.special_requirements.experience_criteria.min_years,
              field: rest.special_requirements.experience_criteria.field || undefined,
            }
          : undefined,
        required_certifications: rest.special_requirements.required_certifications.length ? rest.special_requirements.required_certifications : undefined,
        domicile_states: rest.special_requirements.domicile_required ? rest.special_requirements.domicile_states : undefined,
      }
    }))
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    setSubmitted(payload);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (discoveryId) {
          const publishResponse = await fetch(`${DISCOVERY_API_BASE}/${discoveryId}/publish`, {
            method: "PATCH",
          });

          if (!publishResponse.ok) {
            throw new Error("Exam saved, but failed to mark discovered exam as published.");
          }
        }

        alert("Exam notification published successfully!");
        if (discoveryId) {
          navigate("/admin/review-discoveries");
        }
      } else {
        const errorData = await response.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          alert(`Validation Error:\n${errorData.errors.join("\n")}`);
        } else {
          alert(`Error: ${errorData.message || "Failed to publish"}`);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Network error: Could not reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems: { key: typeof activeSection; label: string; num: number }[] = [
    { key: "exam", label: "Exam Details", num: 1 },
    { key: "posts", label: `Posts (${posts.length})`, num: 2 },
    { key: "preview", label: "Preview & Submit", num: 3 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060e1a", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #060e1a; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
        button:hover { opacity: 0.85; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#081428", borderBottom: "1px solid #1e3a5f", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#f59e0b", fontWeight: 800, textTransform: "uppercase" }}>Government Exam Platform</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginTop: 2 }}>{discoveryId ? "Review Discovered Exam" : "New Exam Notification"}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button type="button" onClick={() => navigate("/admin/review-discoveries")} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #1e3a5f", background: "transparent", color: "#93c5fd", fontSize: 12, cursor: "pointer" }}>Review Queue</button>
          {navItems.map(n => (
            <button key={n.key} type="button" onClick={() => setActiveSection(n.key)}
              style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid", borderColor: activeSection === n.key ? "#f59e0b" : "#1e3a5f", background: activeSection === n.key ? "#f59e0b18" : "transparent", color: activeSection === n.key ? "#f59e0b" : "#64748b", fontSize: 12, fontWeight: activeSection === n.key ? 700 : 400, cursor: "pointer" }}>
              <span style={{ opacity: 0.6, marginRight: 6 }}>{n.num}.</span>{n.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {isLoadingDiscovery && <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 8, background: "#0f1e35", border: "1px solid #1e3a5f", color: "#93c5fd" }}>Loading discovered exam data...</div>}
        {discoveryError && <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 8, background: "#2a1215", border: "1px solid #7f1d1d", color: "#fecaca" }}>{discoveryError}</div>}

        {/* ── SECTION 1: EXAM DETAILS ── */}
        {activeSection === "exam" && (
          <>
            <SectionCard title="Exam Identity">
              <Grid cols={2}>
                <Field><Label required htmlFor="ex-name">Exam Name</Label><Input id="ex-name" value={exam.exam_name} onChange={v => setExamField("exam_name", v)} placeholder="e.g. SSC CGL 2025" /></Field>
                <Field><Label htmlFor="ex-org">Organisation / Board</Label><Input id="ex-org" value={exam.organisation} onChange={v => setExamField("organisation", v)} placeholder="e.g. Staff Selection Commission" /></Field>
                <Field><Label htmlFor="ex-sector">Sector</Label><Select id="ex-sector" value={exam.sector} onChange={v => setExamField("sector", v)} options={SECTORS} placeholder="Select sector" allowCustom customPlaceholder="Enter custom sector" /></Field>
                <Field><Label htmlFor="ex-status">Status</Label><Select id="ex-status" value={exam.status} onChange={v => setExamField("status", v as typeof EXAM_STATUSES[number])} options={[...EXAM_STATUSES]} /></Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label htmlFor="ex-link">Official Notification Link</Label>
                  <Input id="ex-link" value={exam.official_link} onChange={v => setExamField("official_link", v)} placeholder="https://..." />
                </div>
              </Grid>
            </SectionCard>

            <SectionCard title="Important Dates">
              <Grid cols={2}>
                {([
                  ["notification_date", "Notification Date"],
                  ["application_start", "Application Start"],
                  ["application_end", "Application End"],
                  ["last_correction_date", "Last Correction Date"],
                  ["age_criteria_date", "Age Criteria Date *"],
                  ["admit_card_release_date", "Admit Card Release"],
                  ["exam_city_details_date", "Exam City Details"],
                  ["exam_date", "Exam Date"],
                  ["result_release_date", "Result Release Date"],
                ] as [keyof ExamForm, string][]).map(([key, label]) => (
                  <Field key={key}>
                    <Label required={key === "age_criteria_date"} htmlFor={`date-${key}`}>{label}</Label>
                    <Input id={`date-${key}`} value={exam[key] as string} onChange={v => setExamField(key, v)} type="date" />
                  </Field>
                ))}
              </Grid>
            </SectionCard>

            <SectionCard title="Application Fees & Eligibility">
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Fee per Category (₹)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {Object.keys(exam.application_fees).map(cat => (
                    <Field key={cat}>
                      <Label htmlFor={`fee-${cat}`}>{cat.toUpperCase()}</Label>
                      <Input id={`fee-${cat}`} value={exam.application_fees[cat]} onChange={v => setFee(cat, v)} type="number" placeholder="0 = free" />
                    </Field>
                  ))}
                </div>
              </div>
              <div>
                <MultiSelect label="Allowed States" options={INDIAN_STATES.filter(s => s !== ALL_SENTINEL)} value={exam.allowed_states} onChange={v => setExamField("allowed_states", v)} allowAll />
              </div>
            </SectionCard>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setActiveSection("posts")}
                style={{ padding: "12px 32px", borderRadius: 8, background: "#f59e0b", border: "none", color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: "0.04em" }}>
                Continue to Posts →
              </button>
            </div>
          </>
        )}

        {/* ── SECTION 2: POSTS ── */}
        {activeSection === "posts" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Exam Posts</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Each post can have independent age rules, education paths, and physical requirements.</div>
              </div>
              <button type="button" onClick={() => setPosts(prev => [...prev, blankPost()])}
                style={{ padding: "10px 22px", borderRadius: 8, background: "#1e3a5f", border: "1px solid #2d5f99", color: "#93c5fd", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Add Post
              </button>
            </div>

            {posts.map((post, i) => (
              <PostSection key={post.id} post={post} index={i}
                onChange={updated => updatePost(post.id, updated)}
                onRemove={() => removePost(post.id)} />
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button type="button" onClick={() => setActiveSection("exam")}
                style={{ padding: "12px 28px", borderRadius: 8, background: "transparent", border: "1px solid #1e3a5f", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
                ← Back
              </button>
              <button type="button" onClick={() => { setSubmitted(buildPayload()); setActiveSection("preview"); }}
                style={{ padding: "12px 32px", borderRadius: 8, background: "#f59e0b", border: "none", color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                Preview & Submit →
              </button>
            </div>
          </>
        )}

        {/* ── SECTION 3: PREVIEW ── */}
        {activeSection === "preview" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Review Payload</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>This is the exact JSON that will be sent to <code style={{ color: "#f59e0b" }}>POST /api/admin/exams</code></div>
            </div>
            <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: 24, marginBottom: 24 }}>
              <pre style={{ margin: 0, fontSize: 12, color: "#93c5fd", fontFamily: "'Fira Code', monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(submitted || buildPayload(), null, 2)}
              </pre>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="button" disabled={isSubmitting} onClick={() => setActiveSection("posts")}
                style={{ padding: "12px 28px", borderRadius: 8, background: "transparent", border: "1px solid #1e3a5f", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
                ← Edit Posts
              </button>
              <button type="submit" disabled={isSubmitting}
                style={{ padding: "12px 40px", borderRadius: 8, background: "#16a34a", border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: "0.04em" }}>
                {isSubmitting ? "Submitting..." : "✓ Submit Notification"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
