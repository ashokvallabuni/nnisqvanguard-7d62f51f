export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type SimpleTable<Row extends Record<string, unknown>> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type LabRow = {
  id: string;
  category_id: string | null;
  dataset_id: string | null;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  lab_type: string;
  learning_objectives: string[];
  prerequisites: string[];
  skills_gained: string[];
  estimated_time_minutes: number;
  tools: string[];
  points: number;
  completion_criteria: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type DatasetRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  source: string;
  source_url: string | null;
  license: string;
  version: string;
  dataset_type: string;
  file_format: string;
  record_count: number;
  schema_version: string;
  status: string;
  storage_path: string | null;
  checksum: string | null;
  created_at: string;
  updated_at: string;
};

type LearningPathRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type LabProgressRow = {
  id?: string;
  user_id: string;
  lab_id: string;
  tasks_completed?: number;
  total_tasks?: number;
  points?: number;
  score?: number;
  completed?: boolean;
  completed_at?: string | null;
  updated_at?: string;
};

type BadgeRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string | null;
  category: string;
  rarity: string;
  criteria?: Json;
  created_at: string;
};

type UserBadgeRow = {
  id?: string;
  user_id: string;
  badge_id: string;
  earned_at?: string;
  awarded_at?: string;
  metadata?: Json;
  badges?: BadgeRow;
};

type CertificateRow = {
  id: string;
  user_id: string;
  course_id?: string;
  course_slug: string;
  course_title: string;
  recipient_name: string;
  recipient_email?: string;
  completion_date: string;
  verification_checksum: string;
  skills: string[];
  issued_at: string;
};

type LabSessionRow = {
  id: string;
  user_id: string;
  lab_id: string;
  instance_id: string | null;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
  score: number | null;
  created_at: string;
};

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_analyses: {
        Row: {
          analysis_result: Json | null;
          created_at: string | null;
          detection_result: Json | null;
          findings_count: number | null;
          id: string;
          input_data: string | null;
          input_type: string | null;
          request_id: string | null;
          response_result: Json | null;
          risk_result: Json | null;
          risk_score: number | null;
          severity: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          analysis_result?: Json | null;
          created_at?: string | null;
          detection_result?: Json | null;
          findings_count?: number | null;
          id?: string;
          input_data?: string | null;
          input_type?: string | null;
          request_id?: string | null;
          response_result?: Json | null;
          risk_result?: Json | null;
          risk_score?: number | null;
          severity?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          analysis_result?: Json | null;
          created_at?: string | null;
          detection_result?: Json | null;
          findings_count?: number | null;
          id?: string;
          input_data?: string | null;
          input_type?: string | null;
          request_id?: string | null;
          response_result?: Json | null;
          risk_result?: Json | null;
          risk_score?: number | null;
          severity?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          college_id: string | null;
          contact_person: string;
          created_at: string;
          email: string;
          id: string;
          notes: string | null;
          phone: string;
          preferred_date: string | null;
          program_type: string;
          scheduled_at: string | null;
          status: string;
          topic: string;
          user_id: string;
        };
        Insert: {
          college_id?: string | null;
          contact_person: string;
          created_at?: string;
          email: string;
          id?: string;
          notes?: string | null;
          phone: string;
          preferred_date?: string | null;
          program_type: string;
          scheduled_at?: string | null;
          status?: string;
          topic: string;
          user_id: string;
        };
        Update: {
          college_id?: string | null;
          contact_person?: string;
          created_at?: string;
          email?: string;
          id?: string;
          notes?: string | null;
          phone?: string;
          preferred_date?: string | null;
          program_type?: string;
          scheduled_at?: string | null;
          status?: string;
          topic?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_history: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          reply: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          reply: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          reply?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      colleges: {
        Row: {
          city: string | null;
          created_at: string;
          id: string;
          name: string;
          state: string | null;
          type: string | null;
          website: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          state?: string | null;
          type?: string | null;
          website?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          state?: string | null;
          type?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      complaints: {
        Row: {
          ai_result: Json | null;
          complaint_text: string;
          created_at: string;
          email: string;
          evidence_url: string | null;
          fraud_score: number | null;
          id: string;
          name: string;
          phone: string | null;
          status: string;
          user_id: string | null;
          verdict: string | null;
        };
        Insert: {
          ai_result?: Json | null;
          complaint_text: string;
          created_at?: string;
          email: string;
          evidence_url?: string | null;
          fraud_score?: number | null;
          id?: string;
          name: string;
          phone?: string | null;
          status?: string;
          user_id?: string | null;
          verdict?: string | null;
        };
        Update: {
          ai_result?: Json | null;
          complaint_text?: string;
          created_at?: string;
          email?: string;
          evidence_url?: string | null;
          fraud_score?: number | null;
          id?: string;
          name?: string;
          phone?: string | null;
          status?: string;
          user_id?: string | null;
          verdict?: string | null;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          cover_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          level: string;
          slug: string;
          sort_order: number;
          tier: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          level?: string;
          slug: string;
          sort_order?: number;
          tier?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          level?: string;
          slug?: string;
          sort_order?: number;
          tier?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campus_consultations: {
        Row: {
          college_id: string;
          contact_name: string;
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          organization_role: string | null;
          phone: string | null;
          requested_program_type: string;
          status: string;
          student_count: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          college_id: string;
          contact_name: string;
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          organization_role?: string | null;
          phone?: string | null;
          requested_program_type: string;
          status?: string;
          student_count?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          college_id?: string;
          contact_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          organization_role?: string | null;
          phone?: string | null;
          requested_program_type?: string;
          status?: string;
          student_count?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campus_consultations_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "campus_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      campus_programs: {
        Row: {
          application_deadline: string;
          city: string;
          college_name: string;
          country: string;
          created_at: string;
          description: string | null;
          dynamic_tier: string;
          enrolled_students: number;
          id: string;
          is_active: boolean;
          program_type: string;
          seats: number;
          security_level: string;
          state: string;
          updated_at: string;
        };
        Insert: {
          application_deadline: string;
          city: string;
          college_name: string;
          country?: string;
          created_at?: string;
          description?: string | null;
          dynamic_tier: string;
          enrolled_students?: number;
          id?: string;
          is_active?: boolean;
          program_type: string;
          seats?: number;
          security_level: string;
          state: string;
          updated_at?: string;
        };
        Update: {
          application_deadline?: string;
          city?: string;
          college_name?: string;
          country?: string;
          created_at?: string;
          description?: string | null;
          dynamic_tier?: string;
          enrolled_students?: number;
          id?: string;
          is_active?: boolean;
          program_type?: string;
          seats?: number;
          security_level?: string;
          state?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          created_at: string;
          expected_answer: string | null;
          id: string;
          instructions: string;
          module_id: string;
          sort_order: number;
          task_type: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          expected_answer?: string | null;
          id?: string;
          instructions: string;
          module_id: string;
          sort_order?: number;
          task_type?: string;
          title: string;
        };
        Update: {
          created_at?: string;
          expected_answer?: string | null;
          id?: string;
          instructions?: string;
          module_id?: string;
          sort_order?: number;
          task_type?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      quizzes: {
        Row: {
          correct_option: number;
          created_at: string;
          explanation: string | null;
          id: string;
          module_id: string;
          options: Json;
          question: string;
          sort_order: number;
        };
        Insert: {
          correct_option: number;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          module_id: string;
          options?: Json;
          question: string;
          sort_order?: number;
        };
        Update: {
          correct_option?: number;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          module_id?: string;
          options?: Json;
          question?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      user_course_progress: {
        Row: {
          assignment_id: string | null;
          completed: boolean;
          completed_at: string | null;
          course_id: string;
          created_at: string;
          id: string;
          module_id: string;
          progress_type: string;
          quiz_id: string | null;
          response: string | null;
          score: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assignment_id?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          course_id: string;
          created_at?: string;
          id?: string;
          module_id: string;
          progress_type: string;
          quiz_id?: string | null;
          response?: string | null;
          score?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assignment_id?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          course_id?: string;
          created_at?: string;
          id?: string;
          module_id?: string;
          progress_type?: string;
          quiz_id?: string | null;
          response?: string | null;
          score?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      logs: {
        Row: {
          created_at: string;
          id: string;
          input: string | null;
          result: Json | null;
          risk_level: string | null;
          type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          input?: string | null;
          result?: Json | null;
          risk_level?: string | null;
          type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          input?: string | null;
          result?: Json | null;
          risk_level?: string | null;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      module_progress: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          id: string;
          module_id: string;
          quiz_score: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          module_id: string;
          quiz_score?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          module_id?: string;
          quiz_score?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          course_id: string;
          created_at: string;
          id: string;
          locked: boolean;
          notes_md: string | null;
          practice_md: string | null;
          tags: string[];
          difficulty: string;
          duration_minutes: number;
          practice_labs: string[];
          quiz: Json | null;
          slug: string;
          sort_order: number;
          title: string;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          id?: string;
          locked?: boolean;
          notes_md?: string | null;
          practice_md?: string | null;
          tags?: string[];
          difficulty?: string;
          duration_minutes?: number;
          practice_labs?: string[];
          quiz?: Json | null;
          slug: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          id?: string;
          locked?: boolean;
          notes_md?: string | null;
          practice_md?: string | null;
          tags?: string[];
          difficulty?: string;
          duration_minutes?: number;
          practice_labs?: string[];
          quiz?: Json | null;
          slug?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          college: string | null;
          created_at: string;
          country: string | null;
          designation: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          organization: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          college?: string | null;
          created_at?: string;
          country?: string | null;
          designation?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          organization?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          college?: string | null;
          created_at?: string;
          country?: string | null;
          designation?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          organization?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          description: string | null;
          id: string;
          image_url: string | null;
          section_name: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          image_url?: string | null;
          section_name: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          image_url?: string | null;
          section_name?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          bio: string | null;
          created_at: string;
          display_order: number;
          id: string;
          image_url: string | null;
          name: string;
          role: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          display_order?: number;
          id?: string;
          image_url?: string | null;
          name: string;
          role: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          display_order?: number;
          id?: string;
          image_url?: string | null;
          name?: string;
          role?: string;
        };
        Relationships: [];
      };
      datasets: SimpleTable<DatasetRow>;
      dataset_versions: SimpleTable<{
        id: string;
        dataset_id: string;
        version: string;
        record_count: number;
        checksum: string | null;
        storage_path: string | null;
        status: string;
        imported_at: string | null;
        created_at: string;
      }>;
      lab_categories: SimpleTable<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        created_at: string;
      }>;
      labs: SimpleTable<LabRow>;
      lab_tasks: SimpleTable<{
        id: string;
        lab_id: string;
        title: string;
        description: string;
        task_type: string;
        sort_order: number;
        created_at: string;
      }>;
      lab_questions: SimpleTable<{
        id: string;
        task_id: string;
        prompt: string;
        options: Json;
        explanation: string | null;
        sort_order: number;
        created_at: string;
      }>;
      lab_hints: SimpleTable<{
        id: string;
        task_id: string;
        hint: string;
        sort_order: number;
        created_at: string;
      }>;
      lab_flags: SimpleTable<{
        id: string;
        task_id: string;
        validation_digest: string;
        points: number;
        created_at: string;
      }>;
      lab_sessions: SimpleTable<LabSessionRow>;
      lab_progress: SimpleTable<LabProgressRow>;
      learning_paths: SimpleTable<LearningPathRow>;
      learning_path_labs: SimpleTable<{
        learning_path_id: string;
        lab_id: string;
        sort_order: number;
      }>;
      badges: SimpleTable<BadgeRow>;
      user_badges: SimpleTable<UserBadgeRow>;
      certificates: SimpleTable<CertificateRow>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const;
