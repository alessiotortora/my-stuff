export interface CVData {
  about: About;
  contact: Record<string, string>;
  education: EducationEntry[];
  experience: TimelineEntry[];
  languages: Language[];
  projects: Projects;
  skills: string[];
  soft: Soft;
  volunteering: TimelineEntry[];
}

export interface About {
  summary: string;
}

export interface Projects {
  link: string;
  summary: string;
}

export interface Soft {
  [key: string]: string;
}

export interface Language {
  language: string;
  level: string;
}

export interface TimelineEntry {
  details?: string[];
  link?: string;
  location: string;
  period: string;
  role: string;
}

export interface EducationEntry {
  degree: string;
  link?: string;
  period: string;
  school: string;
}
