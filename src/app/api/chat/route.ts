import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create OpenAI client
const openai = new OpenAI({
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
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Get embeddings for the last message
    const embedding = await openai.embeddings.create({
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

    // Debug log the matches with more detail
    console.log('Found matches:', matches?.map((match: ContentMatch) => ({
      type: match.type,
      similarity: match.similarity,
      content: match.content,
      source: match.source
    })));

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

    // Create chat completion with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: augmentedMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Use the new OpenAIStream helper
    const stream = OpenAIStream(response);

    // Return the streaming response
    return new StreamingTextResponse(stream);
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