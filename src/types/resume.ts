export interface Profile {
  network: string;
  url: string;
}

export interface Basics {
  name: string;
  label: string;
  email: string;
  phone: string;
  summary: string;
  profiles: Profile[];
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
  summary: string;
}

export interface Education {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
}

export interface Resume {
  basics: Basics;
  skills: Skill[];
  work: Work[];
  education: Education[];
} 