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
      ai_analyses: {
        Row: {
          analysis_result: Json | null
          completed_at: string | null
          created_at: string
          detection_result: Json | null
          error_message: string | null
          findings_count: number | null
          id: string
          input_data: string
          input_metadata: Json | null
          input_type: string
          processing_time_ms: number | null
          report_result: Json | null
          request_id: string
          response_result: Json | null
          risk_result: Json | null
          risk_score: number | null
          severity: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          completed_at?: string | null
          created_at?: string
          detection_result?: Json | null
          error_message?: string | null
          findings_count?: number | null
          id?: string
          input_data: string
          input_metadata?: Json | null
          input_type: string
          processing_time_ms?: number | null
          report_result?: Json | null
          request_id: string
          response_result?: Json | null
          risk_result?: Json | null
          risk_score?: number | null
          severity?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          completed_at?: string | null
          created_at?: string
          detection_result?: Json | null
          error_message?: string | null
          findings_count?: number | null
          id?: string
          input_data?: string
          input_metadata?: Json | null
          input_type?: string
          processing_time_ms?: number | null
          report_result?: Json | null
          request_id?: string
          response_result?: Json | null
          risk_result?: Json | null
          risk_score?: number | null
          severity?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      assignments: {
        Row: {
          created_at: string
          expected_answer: string | null
          id: string
          instructions: string
          module_id: string
          sort_order: number
          task_type: string
          title: string
        }
        Insert: {
          created_at?: string
          expected_answer?: string | null
          id?: string
          instructions: string
          module_id: string
          sort_order?: number
          task_type?: string
          title: string
        }
        Update: {
          created_at?: string
          expected_answer?: string | null
          id?: string
          instructions?: string
          module_id?: string
          sort_order?: number
          task_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_rules: {
        Row: {
          badge_id: string
          category_id: string | null
          id: string
          rule_type: string
          skill_id: string | null
          threshold: number
        }
        Insert: {
          badge_id: string
          category_id?: string | null
          id?: string
          rule_type: string
          skill_id?: string | null
          threshold: number
        }
        Update: {
          badge_id?: string
          category_id?: string | null
          id?: string
          rule_type?: string
          skill_id?: string | null
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "badge_rules_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lab_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_rules_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "lab_skill_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
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
      campus_consultations: {
        Row: {
          college_id: string
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          organization_role: string | null
          phone: string | null
          requested_program_type: string
          status: string
          student_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          college_id: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          organization_role?: string | null
          phone?: string | null
          requested_program_type: string
          status?: string
          student_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          college_id?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          organization_role?: string | null
          phone?: string | null
          requested_program_type?: string
          status?: string
          student_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_consultations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "campus_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_programs: {
        Row: {
          application_deadline: string
          city: string
          college_name: string
          country: string
          created_at: string
          description: string | null
          dynamic_tier: string
          enrolled_students: number
          id: string
          is_active: boolean
          program_type: string
          seats: number
          security_level: string
          state: string
          updated_at: string
        }
        Insert: {
          application_deadline: string
          city: string
          college_name: string
          country?: string
          created_at?: string
          description?: string | null
          dynamic_tier: string
          enrolled_students?: number
          id?: string
          is_active?: boolean
          program_type: string
          seats?: number
          security_level: string
          state: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string
          city?: string
          college_name?: string
          country?: string
          created_at?: string
          description?: string | null
          dynamic_tier?: string
          enrolled_students?: number
          id?: string
          is_active?: boolean
          program_type?: string
          seats?: number
          security_level?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: string | null
          course_title: string
          id: string
          issued_at: string
          recipient_name: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id?: string | null
          course_title: string
          id?: string
          issued_at?: string
          recipient_name: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string | null
          course_title?: string
          id?: string
          issued_at?: string
          recipient_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      ctf_challenges: {
        Row: {
          created_at: string
          ctf_id: string
          description: string
          id: string
          lab_id: string | null
          points: number
          published: boolean
          title: string
        }
        Insert: {
          created_at?: string
          ctf_id: string
          description: string
          id?: string
          lab_id?: string | null
          points?: number
          published?: boolean
          title: string
        }
        Update: {
          created_at?: string
          ctf_id?: string
          description?: string
          id?: string
          lab_id?: string | null
          points?: number
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_challenges_ctf_id_fkey"
            columns: ["ctf_id"]
            isOneToOne: false
            referencedRelation: "ctfs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_challenges_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_participants: {
        Row: {
          ctf_id: string
          joined_at: string
          score: number
          user_id: string
        }
        Insert: {
          ctf_id: string
          joined_at?: string
          score?: number
          user_id: string
        }
        Update: {
          ctf_id?: string
          joined_at?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_participants_ctf_id_fkey"
            columns: ["ctf_id"]
            isOneToOne: false
            referencedRelation: "ctfs"
            referencedColumns: ["id"]
          },
        ]
      }
      ctfs: {
        Row: {
          competition_type: string
          created_at: string
          description: string
          ends_at: string
          id: string
          name: string
          slug: string
          starts_at: string
          status: string
        }
        Insert: {
          competition_type: string
          created_at?: string
          description: string
          ends_at: string
          id?: string
          name: string
          slug: string
          starts_at: string
          status?: string
        }
        Update: {
          competition_type?: string
          created_at?: string
          description?: string
          ends_at?: string
          id?: string
          name?: string
          slug?: string
          starts_at?: string
          status?: string
        }
        Relationships: []
      }
      dataset_versions: {
        Row: {
          checksum: string | null
          created_at: string
          dataset_id: string
          id: string
          imported_at: string | null
          record_count: number
          status: string
          storage_path: string | null
          version: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          dataset_id: string
          id?: string
          imported_at?: string | null
          record_count?: number
          status?: string
          storage_path?: string | null
          version: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          dataset_id?: string
          id?: string
          imported_at?: string | null
          record_count?: number
          status?: string
          storage_path?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataset_versions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          checksum: string | null
          created_at: string
          dataset_type: string
          description: string
          file_format: string
          id: string
          license: string
          name: string
          record_count: number
          schema_version: string
          slug: string
          source: string
          source_url: string | null
          status: string
          storage_path: string | null
          updated_at: string
          version: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          dataset_type: string
          description: string
          file_format: string
          id?: string
          license: string
          name: string
          record_count?: number
          schema_version?: string
          slug: string
          source: string
          source_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          version: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          dataset_type?: string
          description?: string
          file_format?: string
          id?: string
          license?: string
          name?: string
          record_count?: number
          schema_version?: string
          slug?: string
          source?: string
          source_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          affected_assets: string[] | null
          analysis_id: string | null
          assigned_to: string | null
          attack_pattern: string | null
          created_at: string
          description: string
          id: string
          indicators: string[] | null
          kill_chain_phase: string | null
          mitre_techniques: string[] | null
          organization_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          risk_score: number | null
          severity: Database["public"]["Enums"]["incident_severity"]
          source: Database["public"]["Enums"]["incident_source"]
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          affected_assets?: string[] | null
          analysis_id?: string | null
          assigned_to?: string | null
          attack_pattern?: string | null
          created_at?: string
          description: string
          id?: string
          indicators?: string[] | null
          kill_chain_phase?: string | null
          mitre_techniques?: string[] | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          source?: Database["public"]["Enums"]["incident_source"]
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          affected_assets?: string[] | null
          analysis_id?: string | null
          assigned_to?: string | null
          attack_pattern?: string | null
          created_at?: string
          description?: string
          id?: string
          indicators?: string[] | null
          kill_chain_phase?: string | null
          mitre_techniques?: string[] | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          source?: Database["public"]["Enums"]["incident_source"]
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
          user_id?: string | null
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
      lab_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      lab_environment_templates: {
        Row: {
          cpu_limit: number
          created_at: string
          disk_limit_mb: number
          enabled: boolean
          id: string
          image_ref: string
          memory_limit_mb: number
          name: string
          network_mode: string
          time_limit_minutes: number
          updated_at: string
        }
        Insert: {
          cpu_limit?: number
          created_at?: string
          disk_limit_mb?: number
          enabled?: boolean
          id?: string
          image_ref: string
          memory_limit_mb?: number
          name: string
          network_mode?: string
          time_limit_minutes?: number
          updated_at?: string
        }
        Update: {
          cpu_limit?: number
          created_at?: string
          disk_limit_mb?: number
          enabled?: boolean
          id?: string
          image_ref?: string
          memory_limit_mb?: number
          name?: string
          network_mode?: string
          time_limit_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      lab_execution_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_code: string | null
          id: string
          operation: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          id?: string
          operation: string
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          id?: string
          operation?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_execution_jobs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lab_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_flag_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          id: string
          is_correct: boolean
          session_id: string
          task_id: string
          user_id: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          session_id: string
          task_id: string
          user_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          session_id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_flag_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lab_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_flag_attempts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_flag_attempts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_flags: {
        Row: {
          created_at: string
          id: string
          points: number
          task_id: string
          validation_digest: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          task_id: string
          validation_digest: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          task_id?: string
          validation_digest?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_flags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_flags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_hints: {
        Row: {
          created_at: string
          hint: string
          id: string
          sort_order: number
          task_id: string
        }
        Insert: {
          created_at?: string
          hint: string
          id?: string
          sort_order?: number
          task_id: string
        }
        Update: {
          created_at?: string
          hint?: string
          id?: string
          sort_order?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_hints_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_hints_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lab_id: string
          points: number
          tasks_completed: number
          total_tasks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lab_id: string
          points?: number
          tasks_completed?: number
          total_tasks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lab_id?: string
          points?: number
          tasks_completed?: number
          total_tasks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_progress_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          options: Json
          prompt: string
          sort_order: number
          task_id: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          prompt: string
          sort_order?: number
          task_id: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          prompt?: string
          sort_order?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_questions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_questions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_runner_instances: {
        Row: {
          cleanup_completed_at: string | null
          created_at: string
          id: string
          provider_instance_id: string | null
          session_id: string
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          cleanup_completed_at?: string | null
          created_at?: string
          id?: string
          provider_instance_id?: string | null
          session_id: string
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          cleanup_completed_at?: string | null
          created_at?: string
          id?: string
          provider_instance_id?: string | null
          session_id?: string
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_runner_instances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "lab_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_runner_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lab_environment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_session_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lab_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          instance_id: string | null
          lab_id: string
          score: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          instance_id?: string | null
          lab_id: string
          score?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          instance_id?: string | null
          lab_id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_sessions_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_skill_definitions: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      lab_task_attempts: {
        Row: {
          answer: string | null
          attempt_number: number
          created_at: string
          hints_used: number
          id: string
          is_correct: boolean
          score: number
          session_id: string
          task_id: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          attempt_number?: number
          created_at?: string
          hints_used?: number
          id?: string
          is_correct?: boolean
          score?: number
          session_id: string
          task_id: string
          user_id: string
        }
        Update: {
          answer?: string | null
          attempt_number?: number
          created_at?: string
          hints_used?: number
          id?: string
          is_correct?: boolean
          score?: number
          session_id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_task_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lab_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_task_attempts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_task_attempts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lab_tasks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tasks: {
        Row: {
          created_at: string
          description: string
          expected_answer: string | null
          id: string
          lab_id: string
          sort_order: number
          task_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          expected_answer?: string | null
          id?: string
          lab_id: string
          sort_order?: number
          task_type: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          expected_answer?: string | null
          id?: string
          lab_id?: string
          sort_order?: number
          task_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_tasks_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          category_id: string | null
          completion_criteria: string | null
          created_at: string
          dataset_id: string | null
          description: string
          difficulty: string
          estimated_time_minutes: number
          id: string
          lab_type: string
          learning_objectives: string[]
          points: number
          prerequisites: string[]
          skills_gained: string[]
          slug: string
          status: string
          title: string
          tools: string[]
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          completion_criteria?: string | null
          created_at?: string
          dataset_id?: string | null
          description: string
          difficulty?: string
          estimated_time_minutes?: number
          id?: string
          lab_type?: string
          learning_objectives?: string[]
          points?: number
          prerequisites?: string[]
          skills_gained?: string[]
          slug: string
          status?: string
          title: string
          tools?: string[]
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          completion_criteria?: string | null
          created_at?: string
          dataset_id?: string | null
          description?: string
          difficulty?: string
          estimated_time_minutes?: number
          id?: string
          lab_type?: string
          learning_objectives?: string[]
          points?: number
          prerequisites?: string[]
          skills_gained?: string[]
          slug?: string
          status?: string
          title?: string
          tools?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "labs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lab_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_labs: {
        Row: {
          lab_id: string
          learning_path_id: string
          sort_order: number
        }
        Insert: {
          lab_id: string
          learning_path_id: string
          sort_order?: number
        }
        Update: {
          lab_id?: string
          learning_path_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_labs_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_labs_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          status?: string
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
          difficulty: string
          duration_minutes: number
          id: string
          locked: boolean
          notes_md: string | null
          practice_labs: string[]
          practice_md: string | null
          quiz: Json | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          locked?: boolean
          notes_md?: string | null
          practice_labs?: string[]
          practice_md?: string | null
          quiz?: Json | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          locked?: boolean
          notes_md?: string | null
          practice_labs?: string[]
          practice_md?: string | null
          quiz?: Json | null
          slug?: string
          sort_order?: number
          tags?: string[]
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
      notifications: {
        Row: {
          created_at: string
          id: string
          incident_id: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
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
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          college: string | null
          country: string | null
          created_at: string
          designation: string | null
          email: string | null
          full_name: string | null
          id: string
          organization: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          organization?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          id: string
          is_correct: boolean
          quiz_id: string
          score: number
          selected_option: number
          user_id: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          quiz_id: string
          score?: number
          selected_option: number
          user_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          quiz_id?: string
          score?: number
          selected_option?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          correct_option: number
          created_at: string
          explanation: string | null
          id: string
          module_id: string
          options: Json
          question: string
          sort_order: number
        }
        Insert: {
          correct_option: number
          created_at?: string
          explanation?: string | null
          id?: string
          module_id: string
          options?: Json
          question: string
          sort_order?: number
        }
        Update: {
          correct_option?: number
          created_at?: string
          explanation?: string | null
          id?: string
          module_id?: string
          options?: Json
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          analysis_id: string | null
          created_at: string
          executive_summary: string | null
          format: Database["public"]["Enums"]["report_format"]
          id: string
          incident_id: string | null
          organization_id: string | null
          recommendations: string[] | null
          report_content: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          risk_analysis: string | null
          risk_score: number | null
          severity: string | null
          technical_details: string | null
          timeline: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          executive_summary?: string | null
          format?: Database["public"]["Enums"]["report_format"]
          id?: string
          incident_id?: string | null
          organization_id?: string | null
          recommendations?: string[] | null
          report_content?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          risk_analysis?: string | null
          risk_score?: number | null
          severity?: string | null
          technical_details?: string | null
          timeline?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          executive_summary?: string | null
          format?: Database["public"]["Enums"]["report_format"]
          id?: string
          incident_id?: string | null
          organization_id?: string | null
          recommendations?: string[] | null
          report_content?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          risk_analysis?: string | null
          risk_score?: number | null
          severity?: string | null
          technical_details?: string | null
          timeline?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
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
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          assignment_id: string | null
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          module_id: string
          progress_type: string
          quiz_id: string | null
          response: string | null
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          module_id: string
          progress_type: string
          quiz_id?: string | null
          response?: string | null
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          module_id?: string
          progress_type?: string
          quiz_id?: string | null
          response?: string | null
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          completion_percentage: number
          enrolled_at: string
          id: string
          last_activity_at: string | null
          learning_path_id: string | null
          path_slug: string | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number
          enrolled_at?: string
          id?: string
          last_activity_at?: string | null
          learning_path_id?: string | null
          path_slug?: string | null
          user_id: string
        }
        Update: {
          completion_percentage?: number
          enrolled_at?: string
          id?: string
          last_activity_at?: string | null
          learning_path_id?: string | null
          path_slug?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          points: number
          skill_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          points?: number
          skill_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          points?: number
          skill_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "lab_skill_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lab_tasks_public: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          lab_id: string | null
          sort_order: number | null
          task_type: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          lab_id?: string | null
          sort_order?: number | null
          task_type?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          lab_id?: string | null
          sort_order?: number | null
          task_type?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_tasks_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      incident_severity: "Low" | "Medium" | "High" | "Critical"
      incident_source:
        | "ai_detection"
        | "user_report"
        | "threat_intel"
        | "system_alert"
        | "manual"
      incident_status:
        | "new"
        | "analyzing"
        | "investigating"
        | "contained"
        | "resolved"
        | "closed"
      report_format: "markdown" | "json"
      report_type:
        | "incident"
        | "threat_summary"
        | "weekly"
        | "monthly"
        | "custom"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      incident_severity: ["Low", "Medium", "High", "Critical"],
      incident_source: [
        "ai_detection",
        "user_report",
        "threat_intel",
        "system_alert",
        "manual",
      ],
      incident_status: [
        "new",
        "analyzing",
        "investigating",
        "contained",
        "resolved",
        "closed",
      ],
      report_format: ["markdown", "json"],
      report_type: [
        "incident",
        "threat_summary",
        "weekly",
        "monthly",
        "custom",
      ],
    },
  },
} as const
