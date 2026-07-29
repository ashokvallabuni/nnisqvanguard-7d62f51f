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
      bookings: {
        Row: {
          college_id: string | null
          contact_person: string
          created_at: string
          email: string
          id: string
          notes: string | null
          phone: string
          preferred_date: string | null
          program_type: string
          scheduled_at: string | null
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          college_id?: string | null
          contact_person: string
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          phone: string
          preferred_date?: string | null
          program_type: string
          scheduled_at?: string | null
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          college_id?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          phone?: string
          preferred_date?: string | null
          program_type?: string
          scheduled_at?: string | null
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          reply: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          reply: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          reply?: string
          user_id?: string | null
        }
        Relationships: []
      }
      colleges: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          state: string | null
          type: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          state?: string | null
          type?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          state?: string | null
          type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          ai_result: Json | null
          complaint_text: string
          created_at: string
          email: string
          evidence_url: string | null
          fraud_score: number | null
          id: string
          name: string
          phone: string | null
          status: string
          user_id: string | null
          verdict: string | null
        }
        Insert: {
          ai_result?: Json | null
          complaint_text: string
          created_at?: string
          email: string
          evidence_url?: string | null
          fraud_score?: number | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          user_id?: string | null
          verdict?: string | null
        }
        Update: {
          ai_result?: Json | null
          complaint_text?: string
          created_at?: string
          email?: string
          evidence_url?: string | null
          fraud_score?: number | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          user_id?: string | null
          verdict?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          level: string
          slug: string
          sort_order: number
          tier: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          slug: string
          sort_order?: number
          tier?: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          slug?: string
          sort_order?: number
          tier?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string
          id: string
          input: string | null
          result: Json | null
          risk_level: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          input?: string | null
          result?: Json | null
          risk_level?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          input?: string | null
          result?: Json | null
          risk_level?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          quiz_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          quiz_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          quiz_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          locked: boolean
          notes_md: string | null
          practice_md: string | null
          quiz: Json | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          locked?: boolean
          notes_md?: string | null
          practice_md?: string | null
          quiz?: Json | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          locked?: boolean
          notes_md?: string | null
          practice_md?: string | null
          quiz?: Json | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      site_content: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          section_name: string
          title: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          section_name: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          section_name?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          name: string
          role: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          role: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          role?: string
        }
        Relationships: []
      }
      ai_analyses: {
        Row: {
          id: string
          request_id: string
          user_id: string | null
          input_type: string
          input_data: string
          input_metadata: Json | null
          detection_result: Json | null
          analysis_result: Json | null
          risk_result: Json | null
          response_result: Json | null
          report_result: Json | null
          risk_score: number | null
          severity: string | null
          findings_count: number | null
          status: string
          error_message: string | null
          processing_time_ms: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          user_id?: string | null
          input_type: string
          input_data: string
          input_metadata?: Json | null
          detection_result?: Json | null
          analysis_result?: Json | null
          risk_result?: Json | null
          response_result?: Json | null
          report_result?: Json | null
          risk_score?: number | null
          severity?: string | null
          findings_count?: number | null
          status?: string
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string | null
          input_type?: string
          input_data?: string
          input_metadata?: Json | null
          detection_result?: Json | null
          analysis_result?: Json | null
          risk_result?: Json | null
          response_result?: Json | null
          report_result?: Json | null
          risk_score?: number | null
          severity?: string | null
          findings_count?: number | null
          status?: string
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          title: string
          description: string
          severity: string
          status: string
          source: string
          risk_score: number | null
          attack_pattern: string | null
          kill_chain_phase: string | null
          mitre_techniques: string[] | null
          affected_assets: string[] | null
          indicators: string[] | null
          analysis_id: string | null
          assigned_to: string | null
          resolution_notes: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          title: string
          description: string
          severity?: string
          status?: string
          source?: string
          risk_score?: number | null
          attack_pattern?: string | null
          kill_chain_phase?: string | null
          mitre_techniques?: string[] | null
          affected_assets?: string[] | null
          indicators?: string[] | null
          analysis_id?: string | null
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          title?: string
          description?: string
          severity?: string
          status?: string
          source?: string
          risk_score?: number | null
          attack_pattern?: string | null
          kill_chain_phase?: string | null
          mitre_techniques?: string[] | null
          affected_assets?: string[] | null
          indicators?: string[] | null
          analysis_id?: string | null
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          title: string
          report_type: string
          format: string
          incident_id: string | null
          analysis_id: string | null
          executive_summary: string | null
          technical_details: string | null
          risk_analysis: string | null
          recommendations: string[] | null
          timeline: Json | null
          report_content: string | null
          risk_score: number | null
          severity: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          title: string
          report_type?: string
          format?: string
          incident_id?: string | null
          analysis_id?: string | null
          executive_summary?: string | null
          technical_details?: string | null
          risk_analysis?: string | null
          recommendations?: string[] | null
          timeline?: Json | null
          report_content?: string | null
          risk_score?: number | null
          severity?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          title?: string
          report_type?: string
          format?: string
          incident_id?: string | null
          analysis_id?: string | null
          executive_summary?: string | null
          technical_details?: string | null
          risk_analysis?: string | null
          recommendations?: string[] | null
          timeline?: Json | null
          report_content?: string | null
          risk_score?: number | null
          severity?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          type: string
          incident_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          type: string
          incident_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          type?: string
          incident_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
