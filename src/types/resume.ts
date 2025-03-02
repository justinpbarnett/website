export interface Profile {
  network: string;
  url: string;
}

export interface Skill {
  name: string;
  keywords: string[];
}

export interface Work {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location?: string;
  summary: string;
  highlights?: string[];
}

export interface Education {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
}

export interface Resume {
  basics: {
    name: string;
    label: string;
    email: string;
    phone: string;
    summary: string;
    profiles: Profile[];
  };
  skills: Skill[];
  fullTimeWork: Work[];
  contractWork: Work[];
  sideProjects: Work[];
  speakingEngagements: Work[];
  education: Education[];
} 