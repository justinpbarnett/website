import { notFound } from 'next/navigation';

// This would typically come from your database
const projects = [
  {
    slug: 'portfolio-website',
    name: 'Portfolio Website',
    description: 'An interactive portfolio with AI-powered chat interface built with Next.js and Supabase.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    features: [
      'AI-powered chat interface',
      'User authentication',
      'Dark mode support',
      'Responsive design',
    ],
  },
  // Add more projects here
];

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = projects.find(p => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          {project.name}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
            {project.description}
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Technologies Used
          </h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Key Features
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            {project.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 