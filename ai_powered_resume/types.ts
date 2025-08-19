
export interface Profile {
  name: string;
  title: string;
  company: string;
  images: string[];
  conferenceImages?: string[];
  bio: string[];
  contact: {
    email: string;
    phone: string;
  };
  details: {
    age: string;
  };
  skills: {
    technical: Skill[];
    languages: Skill[];
    management: Skill[];
  };
  interests: {
      sports: string[];
      travelling: string;
      other: OtherInterest[];
  };
  certifications: Certification[];
  values?: Value[];
}

export interface Value {
    name: string;
    summary: string;
    details: string; // For AI context
    icon: string;
    analysis?: RelevanceAnalysis;
}

export interface Skill {
    name: string;
    rating: number; // 0-5
    analysis?: RelevanceAnalysis;
}

export interface OtherInterest {
    name: string;
    url?: string;
}

export interface Certification {
    name: string;
    icon: string; // e.g. 'fa-award'
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  logo: string;
  project?: string;
  summary: string;
  description: string[];
  longDescription: string;
  geminiPrompts: string[];
  relatedLinks?: RelatedLink[];
  keyAchievements?: string[];
  analysis?: RelevanceAnalysis;
}

export interface RelatedLink {
    title: string;
    uri: string;
}

export interface Education {
    degree: string;
    institution: string;
    period: string;
    summary:string;
    description: string[];
    longDescription?: string;
    geminiPrompts?: string[];
    analysis?: RelevanceAnalysis;
}

export interface Talk {
    title: string;
    event: string;
    date: string; // YYYY-MM-DD
    url?: string;
    location: string;
}

export interface TooltipTerm {
    term: string;
    definition: string;
}

export interface Prompt {
    text: string; // Translation key or raw text
    type: 'personal' | 'general';
    fillIn?: boolean;
    replacements?: { [key: string]: string | number };
    isRawText?: boolean;
}

export interface ModalInfo {
    title: string; // Translation key
    titleReplacements?: { [key: string]: string };
    context: string;
    prompts: Prompt[];
}

// Types for Job Relevance Analysis
export interface RelevanceAnalysis {
    justification: string;
}

export interface TailoredExperience {
    role: string;
    company: string;
    tailoredSummary: string;
    tailoredDescription: string[];
    justification: string;
}

export interface TailoredEducation {
    degree: string;
    institution: string;
    tailoredSummary: string;
    tailoredDescription: string[];
    justification: string;
}

export interface RelevantSkill {
    name: string;
    justification: string;
}

export interface TailoredValue {
    name: string;
    tailoredSummary: string;
    justification: string;
}

export interface TailoredResumeAnalysis {
    tailoredBio: string[];
    tailoredExperiences: TailoredExperience[];
    tailoredEducation: TailoredEducation[];
    relevantSkills: RelevantSkill[];
    tailoredValues: TailoredValue[];
}
