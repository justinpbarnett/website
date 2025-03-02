import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // max requests per window
  cooldownMs: 1000, // 1 second between requests
};

// Store for rate limiting
const requestStore = new Map<string, { count: number; lastRequest: number }>();

// Rate limiting function
function isRateLimited(ip: string): { limited: boolean; message?: string } {
  const now = Date.now();
  const userRequests = requestStore.get(ip) || { count: 0, lastRequest: 0 };

  // Check cooldown
  if (now - userRequests.lastRequest < RATE_LIMIT.cooldownMs) {
    return { limited: true, message: 'Please wait a moment before sending another message.' };
  }

  // Reset count if window has passed
  if (now - userRequests.lastRequest > RATE_LIMIT.windowMs) {
    userRequests.count = 0;
  }

  // Check max requests
  if (userRequests.count >= RATE_LIMIT.maxRequests) {
    return { limited: true, message: 'Too many requests. Please try again later.' };
  }

  // Update request store
  requestStore.set(ip, {
    count: userRequests.count + 1,
    lastRequest: now,
  });

  return { limited: false };
}

// Create OpenAI client for embeddings
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Create Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContentMatch {
  id: string;
  content: string;
  similarity: number;
  metadata: any;
  source: string;
  type: string;
}

export async function POST(req: Request) {
  try {
    // Get IP address from headers or request
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const rateLimitCheck = isRateLimited(ip);
    if (rateLimitCheck.limited) {
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }), 
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Get embeddings for the last message
    const embedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: lastMessage.content,
    });

    // Search for relevant content in the vector store
    const { data: matches, error: searchError } = await supabase.rpc('match_content_vectors', {
      query_embedding: embedding.data[0].embedding,
      match_threshold: 0.2,
      match_count: 15,
    });

    if (searchError) {
      console.error('Vector search error:', searchError);
      return new Response(
        JSON.stringify({ error: 'Failed to search knowledge base' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Format relevant content for context
    const relevantContent = (matches as ContentMatch[] || [])
      .map((match) => `[${match.type}] ${match.content}${match.source ? ` (Source: ${match.source})` : ''}`)
      .join('\n\n');

    // Create the system message
    const systemMessage = {
      role: "system",
      content: `You are an AI assistant that speaks on behalf of Justin P Barnett. Your primary purpose is to answer questions about Justin's background, experience, projects, and expertise.

Key guidelines:
1. When someone asks about "you", always interpret and answer as if they're asking about "Justin"
2. NEVER say "I am an AI" or make AI disclaimers - simply answer directly about Justin
3. ONLY answer using the provided context about Justin
4. If you're not confident about some information, say "I don't have specific information about that aspect of Justin's background"
5. If asked about someone other than Justin, say "I can only provide information about Justin P Barnett"
6. Keep responses focused on Justin's professional background, skills, and projects
7. Respond in first person when appropriate (e.g. "I graduated from..." instead of "Justin graduated from...")
8. Format responses using markdown:
   - Use **bold** for emphasis
   - Use bullet points for lists
   - Use backticks for code or technical terms
   - Use proper heading levels (# ## ###)
   - Format links as [text](url)

Example:
Q: "Tell me about your latest project"
A: "My most recent project is my **personal portfolio website**. Here are the key features:

- Built with \`Next.js\`, \`React\`, and \`TypeScript\`
- Integrated with **Supabase** for the backend
- Features an AI-powered chat interface
- Responsive design for all devices

You can check out the [live demo](https://portfolio.com) or view the [source code](https://github.com/username)."

Context about Justin:
${relevantContent}`
    };

    // Add system message to the beginning of the messages array
    const augmentedMessages = [systemMessage, ...messages];

    // Use the new AI SDK v4 approach with simplified implementation
    console.log('Starting AI stream with model: gpt-4o');
    
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: augmentedMessages,
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log('Stream created successfully, returning response');
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process chat request' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 