import fs from 'fs';
import path from 'path';

const DATA_DIR = 'data';
const directories = ['blog'];

// Create directory structure
function createDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  directories.forEach(dir => {
    const dirPath = path.join(DATA_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });
}

// Create example resume.json
function createExampleResume() {
  const resumePath = path.join(DATA_DIR, 'resume.json');
  if (!fs.existsSync(resumePath)) {
    const exampleResume = {
      basics: {
        name: "Your Name",
        label: "Software Developer",
        email: "your.email@example.com",
        phone: "(123) 456-7890",
        summary: "A passionate software developer with experience in web development and cloud technologies.",
        profiles: [
          {
            network: "GitHub",
            url: "https://github.com/yourusername"
          },
          {
            network: "LinkedIn",
            url: "https://linkedin.com/in/yourusername"
          }
        ]
      },
      skills: [
        {
          name: "Web Development",
          keywords: ["JavaScript", "TypeScript", "React", "Next.js"]
        },
        {
          name: "Backend Development",
          keywords: ["Node.js", "Python", "SQL", "REST APIs"]
        }
      ],
      work: [
        {
          company: "Example Corp",
          position: "Senior Software Engineer",
          startDate: "2020-01",
          endDate: "Present",
          summary: "Lead developer for multiple web applications using React and Node.js."
        }
      ],
      education: [
        {
          institution: "University Example",
          area: "Computer Science",
          studyType: "Bachelor",
          startDate: "2015-09",
          endDate: "2019-05"
        }
      ]
    };

    fs.writeFileSync(resumePath, JSON.stringify(exampleResume, null, 2));
  }
}

// Create example projects.json
function createExampleProjects() {
  const projectsPath = path.join(DATA_DIR, 'projects.json');
  if (!fs.existsSync(projectsPath)) {
    const exampleProjects = [
      {
        id: "1",
        name: "Portfolio Website",
        slug: "portfolio-website",
        description: "Personal portfolio website with AI-powered chat interface",
        technologies: ["Next.js", "React", "TypeScript", "Supabase", "OpenAI"],
        features: [
          "AI chat assistant",
          "Dark mode support",
          "Responsive design",
          "Project showcase"
        ],
        github_url: "https://github.com/yourusername/portfolio",
        live_url: "https://your-portfolio.com"
      }
    ];

    fs.writeFileSync(projectsPath, JSON.stringify(exampleProjects, null, 2));
  }
}

// Create example blog post
function createExampleBlogPost() {
  const blogPath = path.join(DATA_DIR, 'blog', 'example-post.md');
  if (!fs.existsSync(blogPath)) {
    const examplePost = `# Building a Modern Portfolio Website

In this post, I'll share my experience building a modern portfolio website using Next.js, React, and TypeScript.

## Why Next.js?

Next.js provides an excellent developer experience with features like:
- Server-side rendering
- API routes
- File-based routing
- TypeScript support out of the box

## Key Features

1. **AI-Powered Chat**: Implemented using OpenAI's GPT-4 and vector embeddings
2. **Dark Mode**: Seamless theme switching with system preference detection
3. **Responsive Design**: Mobile-first approach using Tailwind CSS

## Technical Implementation

The project uses several modern technologies and practices:
- Next.js 13+ with App Router
- TypeScript for type safety
- Supabase for authentication and database
- OpenAI for natural language processing

## Conclusion

Building this portfolio has been an exciting journey that showcases modern web development practices.
`;

    fs.writeFileSync(blogPath, examplePost);
  }
}

// Run setup
function setup() {
  try {
    console.log('Creating directory structure...');
    createDirectories();

    console.log('Creating example resume...');
    createExampleResume();

    console.log('Creating example projects...');
    createExampleProjects();

    console.log('Creating example blog post...');
    createExampleBlogPost();

    console.log('\nSetup complete! Next steps:');
    console.log('1. Update data/resume.json with your information');
    console.log('2. Update data/projects.json with your projects');
    console.log('3. Add your blog posts as .md files in data/blog/');
    console.log('4. Run the ingest-content.ts script to populate the vector database');
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

// Run the setup
setup(); 