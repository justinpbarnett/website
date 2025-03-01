import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export async function searchVectors(embedding: number[], threshold = 0.7, count = 5) {
  const { data: matches, error } = await supabase.rpc('match_content_vectors', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: count,
  });

  if (error) throw error;
  return matches;
}

export async function isPersonalQuestion(text: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an AI designed to determine if a question is asking for personal information about the portfolio owner. Respond with "true" if the question is asking about personal information, experiences, projects, or opinions, and "false" if it\'s a general question. Only respond with "true" or "false".'
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0,
  });

  return response.choices[0].message.content?.toLowerCase() === 'true';
}

export async function generateResponse(
  question: string,
  relevantContent: Array<{ content: string; source: string; type: string }> = []
) {
  const systemPrompt = relevantContent.length > 0
    ? `You are an AI assistant representing the portfolio owner. Use the following information to answer questions about them. Only use this information and don't make up details. If you don't have enough information to answer, say so.

Relevant information:
${relevantContent.map(c => `[${c.type} from ${c.source}]: ${c.content}`).join('\n\n')}`
    : `You are an AI assistant for a portfolio website. For questions not about the portfolio owner, provide helpful, general responses. For personal questions, explain that you don't have specific information about that topic.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: question
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || 'I apologize, but I was unable to generate a response.';
} 