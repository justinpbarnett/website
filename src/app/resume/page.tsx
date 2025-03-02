import { cn } from '@/lib/utils';
import type { Resume, Profile, Skill, Work, Education } from '@/types/resume';
import resumeData from '../../../data/resume.json';
import Link from 'next/link';

// Type assertion to ensure TypeScript recognizes our custom structure
const typedResumeData = resumeData as unknown as Resume;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function WorkExperienceSection({ 
  title, 
  jobs,
  showEndDate = true
}: { 
  title: string; 
  jobs: Work[];
  showEndDate?: boolean;
}) {
  if (!jobs || jobs.length === 0) return null;
  
  return (
    <Section title={title}>
      <div className="grid gap-6">
        {jobs.map((job: Work, index: number) => (
          <div 
            key={`${job.company}-${job.position}`} 
            className="p-6 rounded-lg border dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.position}</h3>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {showEndDate ? `${job.startDate} — ${job.endDate}` : job.startDate}
              </span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-700 dark:text-gray-300">{job.company}</p>
              {job.location && (
                <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                  {job.location}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{job.summary}</p>
            {job.highlights && job.highlights.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {job.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function ResumePage() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{typedResumeData.basics.name}</h1>
        
        <div className="mb-12">
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p className="text-xl font-medium text-gray-900 dark:text-white">{typedResumeData.basics.label}</p>
            <p className="text-lg">{typedResumeData.basics.summary}</p>
            <div className="flex flex-wrap gap-4 text-sm pt-2">
              <a 
                href={`mailto:${typedResumeData.basics.email}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
              >
                {typedResumeData.basics.email}
              </a>
              <a 
                href={`tel:${typedResumeData.basics.phone}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
              >
                {typedResumeData.basics.phone}
              </a>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {typedResumeData.basics.profiles.map((profile: Profile) => (
                <a
                  key={profile.network}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                >
                  {profile.network}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <Section title="Skills">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedResumeData.skills.map((skillGroup: Skill) => (
              <div 
                key={skillGroup.name}
                className="p-6 rounded-lg border dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{skillGroup.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.keywords.map((keyword: string) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Full-Time Experience */}
        <WorkExperienceSection 
          title="Full-Time Experience" 
          jobs={typedResumeData.fullTimeWork} 
        />

        {/* Contract Work */}
        <WorkExperienceSection 
          title="Contract Work" 
          jobs={typedResumeData.contractWork} 
        />

        {/* Side Projects */}
        <WorkExperienceSection 
          title="Side Projects" 
          jobs={typedResumeData.sideProjects} 
        />

        {/* Speaking Engagements */}
        <WorkExperienceSection 
          title="Speaking Engagements" 
          jobs={typedResumeData.speakingEngagements} 
          showEndDate={false}
        />

        {/* Education */}
        <Section title="Education">
          <div className="grid gap-6">
            {typedResumeData.education.map((edu: Education) => (
              <div 
                key={edu.institution} 
                className="p-6 rounded-lg border dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{edu.institution}</h3>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {edu.studyType} in {edu.area}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
} 