import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { xai } from '@ai-sdk/xai';
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

    const { messages, model = 'openai:gpt-4o', isAuthenticated = false } = await req.json();
    
    // Parse the model string to get provider and model name
    const [provider, modelName] = model.split(':');
    
    console.log(`Request received for provider: ${provider}, model: ${modelName}, authenticated: ${isAuthenticated}`);
    console.log(`API keys available: OpenAI: ${!!process.env.OPENAI_API_KEY}, Google: ${!!process.env.GOOGLE_API_KEY}, Anthropic: ${!!process.env.ANTHROPIC_API_KEY}, XAI: ${!!process.env.XAI_API_KEY}`);
    
    if (!provider || !modelName) {
      console.error(`Invalid model format: ${model}`);
      return new Response(
        JSON.stringify({ error: 'Invalid model format. Expected format: provider:model' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if the model is expensive and requires authentication
    const isExpensiveModel = (
      // OpenAI expensive models
      (provider === 'openai' && ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'o1', 'o1-mini', 'o1-preview', 'o3-mini'].includes(modelName)) ||
      // Anthropic expensive models
      (provider === 'anthropic' && ['claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-opus-latest', 'claude-3-sonnet-latest'].includes(modelName)) ||
      // Google expensive models
      (provider === 'google' && ['gemini-2.0-flash-001', 'gemini-1.5-pro-latest'].includes(modelName)) ||
      // Grok models
      (provider === 'grok')
    );
    
    if (isExpensiveModel && !isAuthenticated) {
      console.error(`Unauthorized access attempt to expensive model: ${model}`);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required for this model. Please log in to use premium models.',
          requiresAuth: true
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate API keys based on provider
    switch (provider) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          console.error('OpenAI API key is missing');
          return new Response(
            JSON.stringify({ error: 'OpenAI API key is not configured' }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        break;
      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          console.error('Anthropic API key is missing');
          return new Response(
            JSON.stringify({ error: 'Anthropic API key is not configured' }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        break;
      case 'google':
        if (!process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          console.error('Google API key is missing');
          return new Response(
            JSON.stringify({ 
              error: 'Google API key is not configured. Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable.' 
            }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        break;
      case 'grok':
        if (!process.env.XAI_API_KEY) {
          console.error('XAI API key is missing');
          return new Response(
            JSON.stringify({ error: 'XAI API key is not configured' }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        break;
    }
    
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

    let result;
    
    // Select the appropriate model based on the provider
    switch (provider) {
      case 'openai':
        console.log(`Using OpenAI model: ${modelName}`);
        
        try {
          // Create a custom OpenAI provider with explicit configuration
          const openaiProvider = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
          
          console.log(`Using OpenAI model with name: ${modelName}`);
          
          result = await streamText({
            model: openaiProvider(modelName),
            messages: augmentedMessages,
            temperature: 0.7,
            maxTokens: 500,
          });
          
          console.log('Successfully created stream for OpenAI model');
        } catch (openaiError) {
          console.error('Error creating OpenAI stream:', openaiError);
          throw openaiError; // Re-throw to be caught by the outer catch block
        }
        break;
      case 'anthropic':
        console.log(`Using Anthropic model: ${modelName}`);
        
        try {
          // Create a custom Anthropic provider with explicit configuration
          const anthropicProvider = createAnthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
          
          console.log(`Using Anthropic model with name: ${modelName}`);
          
          result = await streamText({
            model: anthropicProvider(modelName),
            messages: augmentedMessages,
            temperature: 0.7,
            maxTokens: 500,
          });
          
          console.log('Successfully created stream for Anthropic model');
        } catch (anthropicError) {
          console.error('Error creating Anthropic stream:', anthropicError);
          throw anthropicError; // Re-throw to be caught by the outer catch block
        }
        break;
      case 'google':
        console.log(`Using Google model: ${modelName}`);
        
        try {
          // Create a custom Google provider with explicit configuration
          const googleProvider = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
          });
          
          // Clean the model name if it includes 'models/' prefix
          // For Google models, we need to ensure the format is correct
          let cleanModelName = modelName;
          
          // If the model doesn't start with 'models/', add it
          if (!cleanModelName.startsWith('models/')) {
            cleanModelName = `models/${cleanModelName}`;
          }
          
          console.log(`Using Google model with formatted name: ${cleanModelName}`);
          
          result = await streamText({
            model: googleProvider(cleanModelName),
            messages: augmentedMessages,
            temperature: 0.7,
            maxTokens: 500,
          });
          
          console.log('Successfully created stream for Google model');
        } catch (googleError) {
          console.error('Error creating Google stream:', googleError);
          throw googleError; // Re-throw to be caught by the outer catch block
        }
        break;
      case 'grok':
        result = await streamText({
          model: xai(modelName),
          messages: augmentedMessages,
          temperature: 0.7,
          maxTokens: 500,
        });
        break;
      default:
        // Default to OpenAI GPT-4o
        console.log('Using default OpenAI model: gpt-4o');
        
        try {
          // Create a custom OpenAI provider with explicit configuration
          const openaiProvider = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
          
          result = await streamText({
            model: openaiProvider('gpt-4o'),
            messages: augmentedMessages,
            temperature: 0.7,
            maxTokens: 500,
          });
          
          console.log('Successfully created stream for default OpenAI model');
        } catch (openaiError) {
          console.error('Error creating default OpenAI stream:', openaiError);
          throw openaiError; // Re-throw to be caught by the outer catch block
        }
    }

    console.log('Stream created successfully, returning response');
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to process chat request';
    let statusCode = 500;
    let provider = 'unknown';
    let errorDetails = {};
    
    // Try to extract the provider from the error context if possible
    try {
      const reqData = await req.clone().json();
      if (reqData.model) {
        provider = reqData.model.split(':')[0];
        console.log(`Error occurred with provider: ${provider}`);
      }
    } catch (e) {
      console.error('Failed to extract provider from request:', e);
    }
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(`Original error message: ${errorMessage}`);
      
      // Add error details for debugging
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack trace
      };
      
      // Check for specific error types
      if (errorMessage.includes('API key')) {
        errorMessage = 'Invalid or missing API key. Please check your configuration.';
        statusCode = 401;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (errorMessage.includes('not found') || errorMessage.includes('invalid model')) {
        errorMessage = 'The requested model is not available or invalid.';
        statusCode = 404;
      } else if (provider === 'google') {
        // Special handling for Google errors
        errorMessage = 'Error with Google Gemini model: ' + errorMessage;
        
        // Check for common Google API issues
        if (errorMessage.includes('not found') || errorMessage.includes('invalid model')) {
          errorMessage += '. Please verify the model name is correct.';
        } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
          errorMessage += '. Please check API key permissions.';
        } else if (errorMessage.includes('content')) {
          errorMessage += '. This may be due to content policy restrictions.';
        }
        
        console.error('Google Gemini error details:', JSON.stringify(errorDetails));
      } else if (provider === 'anthropic') {
        // Special handling for Anthropic errors
        errorMessage = 'Error with Anthropic Claude model: ' + errorMessage;
        
        // Check for common Anthropic API issues
        if (errorMessage.includes('not found') || errorMessage.includes('invalid model')) {
          errorMessage += '. Please verify the model name is correct.';
        } else if (errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('unauthorized')) {
          errorMessage += '. Please check API key permissions.';
        } else if (errorMessage.includes('content') || errorMessage.includes('policy')) {
          errorMessage += '. This may be due to content policy restrictions.';
        }
        
        console.error('Anthropic Claude error details:', JSON.stringify(errorDetails));
      } else if (provider === 'openai') {
        // Special handling for OpenAI errors
        errorMessage = 'Error with OpenAI model: ' + errorMessage;
        
        // Check for common OpenAI API issues
        if (errorMessage.includes('not found') || errorMessage.includes('invalid model')) {
          errorMessage += '. Please verify the model name is correct.';
        } else if (errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('unauthorized')) {
          errorMessage += '. Please check API key permissions.';
        } else if (errorMessage.includes('content') || errorMessage.includes('policy') || errorMessage.includes('moderation')) {
          errorMessage += '. This may be due to content policy restrictions.';
        } else if (errorMessage.includes('capacity') || errorMessage.includes('overloaded')) {
          errorMessage += '. The model is currently overloaded with requests. Please try again later.';
        }
        
        console.error('OpenAI error details:', JSON.stringify(errorDetails));
      }
      
      // Include stack trace in server logs but not in response
      console.error('Error stack:', error.stack);
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        provider: provider,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      }), 
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 