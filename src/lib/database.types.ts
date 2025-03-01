export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          technologies: string[]
          features: string[]
          github_url: string | null
          live_url: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          technologies?: string[]
          features?: string[]
          github_url?: string | null
          live_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          technologies?: string[]
          features?: string[]
          github_url?: string | null
          live_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_vectors: {
        Row: {
          id: string
          content: string
          embedding: number[]
          metadata: Json
          source: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          embedding: number[]
          metadata?: Json
          source: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          embedding?: number[]
          metadata?: Json
          source?: string
          type?: string
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_content_vectors: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
          metadata: Json
          source: string
          type: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 