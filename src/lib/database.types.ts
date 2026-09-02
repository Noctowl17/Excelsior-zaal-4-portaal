export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          id: string
          match_id: string
          note: string | null
          player_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          note?: string | null
          player_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          note?: string | null
          player_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          card_type: string
          created_at: string
          id: string
          match_id: string
          minute: number | null
          player_id: string
        }
        Insert: {
          card_type: string
          created_at?: string
          id?: string
          match_id: string
          minute?: number | null
          player_id: string
        }
        Update: {
          card_type?: string
          created_at?: string
          id?: string
          match_id?: string
          minute?: number | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      injuries: {
        Row: {
          created_at: string
          description: string | null
          expected_return_date: string | null
          id: string
          player_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expected_return_date?: string | null
          id?: string
          player_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expected_return_date?: string | null
          id?: string
          player_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "injuries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "injuries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_stats: {
        Row: {
          assists: number
          goals: number
          id: string
          match_id: string
          player_id: string
        }
        Insert: {
          assists?: number
          goals?: number
          id?: string
          match_id: string
          player_id: string
        }
        Update: {
          assists?: number
          goals?: number
          id?: string
          match_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          created_at: string
          home_score: number | null
          ical_uid: string | null
          id: string
          is_home: boolean | null
          location: string | null
          opponent: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          created_at?: string
          home_score?: number | null
          ical_uid?: string | null
          id?: string
          is_home?: boolean | null
          location?: string | null
          opponent?: string | null
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          created_at?: string
          home_score?: number | null
          ical_uid?: string | null
          id?: string
          is_home?: boolean | null
          location?: string | null
          opponent?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          active: boolean
          birth_date: string | null
          created_at: string
          first_name: string
          id: string
          is_starter: boolean
          last_name: string
          photo_url: string | null
          position: string | null
          shirt_number: number | null
        }
        Insert: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          first_name: string
          id?: string
          is_starter?: boolean
          last_name: string
          photo_url?: string | null
          position?: string | null
          shirt_number?: number | null
        }
        Update: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_starter?: boolean
          last_name?: string
          photo_url?: string | null
          position?: string | null
          shirt_number?: number | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      player_stats_overview: {
        Row: {
          active: boolean | null
          assists: number | null
          first_name: string | null
          goals: number | null
          id: string | null
          is_injured: boolean | null
          is_starter: boolean | null
          last_name: string | null
          matches_absent: number | null
          matches_excused: number | null
          matches_injured: number | null
          matches_present: number | null
          matches_won: number | null
          photo_url: string | null
          position: string | null
          red_cards: number | null
          shirt_number: number | null
          yellow_cards: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
