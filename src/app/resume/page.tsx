import { cn } from '@/lib/utils';
import type { Resume, Profile, Skill, Work, Education } from '@/types/resume';
import resumeData from '../../../data/resume.json';

// Type assertion to ensure TypeScript recognizes our custom structure
const typedResumeData = resumeData as unknown as Resume;

function Section({ 
  title, 
  children, 
  className,
  titleClassName
}: { 
  title: string; 
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <section className={cn("mb-12 pb-6", className)}>
      <h2 className={cn("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6 uppercase tracking-wider", titleClassName)}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function WorkExperienceSection({ 
  title, 
  jobs,
  className,
  titleClassName,
  showEndDate = true
}: { 
  title: string; 
  jobs: Work[];
  className?: string;
  titleClassName?: string;
  showEndDate?: boolean;
}) {
  if (!jobs || jobs.length === 0) return null;
  
  return (
    <Section title={title} className={className} titleClassName={titleClassName}>
      <div className="space-y-8">
        {jobs.map((job: Work, index: number) => (
          <div 
            key={`${job.company}-${job.position}`} 
            className={cn(
              "group p-6 rounded-lg transition-all",
              "bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900",
              "border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
              "shadow-sm hover:shadow"
            )}
          >
            <div className="flex flex-col md:flex-row md:justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{job.position}</h3>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 md:mt-0 whitespace-nowrap">
                {showEndDate ? `${job.startDate} — ${job.endDate}` : job.startDate}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:justify-between mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium">{job.company}</p>
              {job.location && (
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 md:mt-0 whitespace-nowrap">
                  {job.location}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{job.summary}</p>
            {job.highlights && job.highlights.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
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
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </a>
        </div>

        {/* Header */}
        <header className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-5xl font-bold mb-4">{typedResumeData.basics.name}</h1>
          <div className="text-gray-600 dark:text-gray-400 space-y-3">
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">{typedResumeData.basics.label}</p>
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
        </header>

        {/* Skills */}
        <Section 
          title="Skills" 
          className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedResumeData.skills.map((skillGroup: Skill) => (
              <div 
                key={skillGroup.name}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
              >
                <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-200">{skillGroup.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.keywords.map((keyword: string) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
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
          className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800"
        />

        {/* Contract Work */}
        <WorkExperienceSection 
          title="Contract Work" 
          jobs={typedResumeData.contractWork} 
          className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800"
        />

        {/* Side Projects */}
        <WorkExperienceSection 
          title="Side Projects" 
          jobs={typedResumeData.sideProjects} 
          className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800"
        />

        {/* Speaking Engagements */}
        <WorkExperienceSection 
          title="Speaking Engagements" 
          jobs={typedResumeData.speakingEngagements} 
          className="mb-16 pb-8 border-b border-gray-200 dark:border-gray-800"
          showEndDate={false}
        />

        {/* Education */}
        <Section 
          title="Education"
        >
          <div className="space-y-6">
            {typedResumeData.education.map((edu: Education) => (
              <div 
                key={edu.institution} 
                className="p-6 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex flex-col md:flex-row md:justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{edu.institution}</h3>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 md:mt-0 whitespace-nowrap">
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