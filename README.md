This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Multi-Model Chat**: Chat with various AI models from OpenAI, Google, Anthropic, and Grok
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Supabase Integration**: User authentication and vector database for context retrieval
- **Markdown Support**: Format messages with markdown syntax

## Getting Started

### Prerequisites

Before running the application, you'll need to set up your environment variables. Copy the `.env.local.example` file to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required API keys:
- `OPENAI_API_KEY`: For OpenAI models (GPT-4o, GPT-4, GPT-3.5)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: For Supabase integration

Optional API keys (depending on which models you want to use):
- `ANTHROPIC_API_KEY`: For Anthropic models (Claude)
- `GOOGLE_API_KEY`: For Google models (Gemini)
- `XAI_API_KEY`: For Grok models

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. Select an AI model from the dropdown menu
2. Type your message in the input field
3. Press "Send" or hit Enter to send your message
4. View the AI's response in the chat window
5. Use the "Clear chat" option to start a new conversation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn more about the AI SDK used in this project:
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs) - learn about the AI SDK features and API.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
