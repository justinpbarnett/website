import { cn } from '@/lib/utils';
import type { Resume, Profile, Skill, Work, Education } from '@/types/resume';
import resumeData from '../../../data/resume.json';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-normal text-gray-600 dark:text-gray-400 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
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
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{resumeData.basics.name}</h1>
          <div className="text-gray-600 dark:text-gray-400 space-y-2">
            <p>{resumeData.basics.label}</p>
            <p>{resumeData.basics.summary}</p>
            <div className="flex gap-4 text-sm">
              <a 
                href={`mailto:${resumeData.basics.email}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
              >
                {resumeData.basics.email}
              </a>
              <a 
                href={`tel:${resumeData.basics.phone}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
              >
                {resumeData.basics.phone}
              </a>
            </div>
            <div className="flex gap-4 text-sm">
              {resumeData.basics.profiles.map((profile: Profile) => (
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
        <Section title="skills">
          <div className="space-y-4">
            {resumeData.skills.map((skillGroup: Skill) => (
              <div key={skillGroup.name}>
                <h3 className="font-medium mb-2">{skillGroup.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.keywords.map((keyword: string) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Experience */}
        <Section title="experience">
          <div className="space-y-6">
            {resumeData.work.map((job: Work) => (
              <div key={job.company} className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium">{job.position}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {job.startDate} — {job.endDate}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company}</p>
                <p className="text-sm">{job.summary}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section title="education">
          <div className="space-y-6">
            {resumeData.education.map((edu: Education) => (
              <div key={edu.institution} className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium">{edu.institution}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
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