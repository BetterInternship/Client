export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string;
          id: string;
          job_id: string | null;
          notes: string | null;
          review: string | null;
          status: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          applied_at?: string;
          id?: string;
          job_id?: string | null;
          notes?: string | null;
          review?: string | null;
          status?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          applied_at?: string;
          id?: string;
          job_id?: string | null;
          notes?: string | null;
          review?: string | null;
          status?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_status_fkey";
            columns: ["status"];
            isOneToOne: false;
            referencedRelation: "ref_app_statuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      employer_users: {
        Row: {
          created_at: string;
          email: string;
          employer_id: string;
          full_name: string;
          id: string;
          is_deactivated: boolean;
          password: string | null;
          profile_picture: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          employer_id: string;
          full_name: string;
          id?: string;
          is_deactivated?: boolean;
          password?: string | null;
          profile_picture?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          employer_id?: string;
          full_name?: string;
          id?: string;
          is_deactivated?: boolean;
          password?: string | null;
          profile_picture?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employer_users_employer_id_fkey";
            columns: ["employer_id"];
            isOneToOne: false;
            referencedRelation: "employers";
            referencedColumns: ["id"];
          }
        ];
      };
      employers: {
        Row: {
          created_at: string | null;
          description: string | null;
          email: string | null;
          has_dlsu_moa: boolean;
          id: string;
          industry: string | null;
          is_verified: boolean | null;
          job_count: number | null;
          legal_entity_name: string | null;
          location: string | null;
          logo: string | null;
          name: string;
          phone: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          has_dlsu_moa?: boolean;
          id?: string;
          industry?: string | null;
          is_verified?: boolean | null;
          job_count?: number | null;
          legal_entity_name?: string | null;
          location?: string | null;
          logo?: string | null;
          name: string;
          phone?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          has_dlsu_moa?: boolean;
          id?: string;
          industry?: string | null;
          is_verified?: boolean | null;
          job_count?: number | null;
          legal_entity_name?: string | null;
          location?: string | null;
          logo?: string | null;
          name?: string;
          phone?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      gods: {
        Row: {
          employer_user_id: string;
          id: string;
        };
        Insert: {
          employer_user_id: string;
          id?: string;
        };
        Update: {
          employer_user_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gods_employer_user_id_fkey";
            columns: ["employer_user_id"];
            isOneToOne: true;
            referencedRelation: "employer_users";
            referencedColumns: ["id"];
          }
        ];
      };
      jobs: {
        Row: {
          allowance: number | null;
          created_at: string | null;
          description: string;
          employer_id: string | null;
          end_date: number | null;
          id: string;
          is_active: boolean | null;
          is_unlisted: boolean;
          is_year_round: boolean | null;
          location: string | null;
          mode: number | null;
          require_github: boolean | null;
          require_portfolio: boolean | null;
          requirements: string | null;
          salary: number | null;
          salary_freq: number | null;
          start_date: number | null;
          title: string;
          type: number | null;
          updated_at: string | null;
          view_count: number;
        };
        Insert: {
          allowance?: number | null;
          created_at?: string | null;
          description: string;
          employer_id?: string | null;
          end_date?: number | null;
          id?: string;
          is_active?: boolean | null;
          is_unlisted?: boolean;
          is_year_round?: boolean | null;
          location?: string | null;
          mode?: number | null;
          require_github?: boolean | null;
          require_portfolio?: boolean | null;
          requirements?: string | null;
          salary?: number | null;
          salary_freq?: number | null;
          start_date?: number | null;
          title: string;
          type?: number | null;
          updated_at?: string | null;
          view_count?: number;
        };
        Update: {
          allowance?: number | null;
          created_at?: string | null;
          description?: string;
          employer_id?: string | null;
          end_date?: number | null;
          id?: string;
          is_active?: boolean | null;
          is_unlisted?: boolean;
          is_year_round?: boolean | null;
          location?: string | null;
          mode?: number | null;
          require_github?: boolean | null;
          require_portfolio?: boolean | null;
          requirements?: string | null;
          salary?: number | null;
          salary_freq?: number | null;
          start_date?: number | null;
          title?: string;
          type?: number | null;
          updated_at?: string | null;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_allowance_fkey";
            columns: ["allowance"];
            isOneToOne: false;
            referencedRelation: "ref_job_allowances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_employer_id_fkey";
            columns: ["employer_id"];
            isOneToOne: false;
            referencedRelation: "employers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_mode_fkey";
            columns: ["mode"];
            isOneToOne: false;
            referencedRelation: "ref_job_modes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_salary_freq_fkey";
            columns: ["salary_freq"];
            isOneToOne: false;
            referencedRelation: "ref_job_pay_freq";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_type_fkey";
            columns: ["type"];
            isOneToOne: false;
            referencedRelation: "ref_job_types";
            referencedColumns: ["id"];
          }
        ];
      };
      moa: {
        Row: {
          created_at: string;
          employer_id: string;
          expires_at: string | null;
          id: string;
          university_id: string;
        };
        Insert: {
          created_at?: string;
          employer_id: string;
          expires_at?: string | null;
          id?: string;
          university_id: string;
        };
        Update: {
          created_at?: string;
          employer_id?: string;
          expires_at?: string | null;
          id?: string;
          university_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moa_employer_id_fkey";
            columns: ["employer_id"];
            isOneToOne: false;
            referencedRelation: "employers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moa_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "ref_universities";
            referencedColumns: ["id"];
          }
        ];
      };
      ref_app_statuses: {
        Row: {
          id: number;
          name: string;
          order: number;
        };
        Insert: {
          id?: number;
          name: string;
          order: number;
        };
        Update: {
          id?: number;
          name?: string;
          order?: number;
        };
        Relationships: [];
      };
      ref_colleges: {
        Row: {
          id: string;
          name: string;
          university_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          university_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          university_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ref_colleges_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "ref_universities";
            referencedColumns: ["id"];
          }
        ];
      };
      ref_industries: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      ref_job_allowances: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      ref_job_categories: {
        Row: {
          class: string;
          id: string;
          name: string;
          order: number;
        };
        Insert: {
          class: string;
          id?: string;
          name: string;
          order: number;
        };
        Update: {
          class?: string;
          id?: string;
          name?: string;
          order?: number;
        };
        Relationships: [];
      };
      ref_job_modes: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      ref_job_pay_freq: {
        Row: {
          description: string;
          factor: number | null;
          id: number;
          name: string;
        };
        Insert: {
          description: string;
          factor?: number | null;
          id?: number;
          name: string;
        };
        Update: {
          description?: string;
          factor?: number | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      ref_job_types: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      ref_levels: {
        Row: {
          id: number;
          name: string;
          order: number;
        };
        Insert: {
          id?: number;
          name: string;
          order: number;
        };
        Update: {
          id?: number;
          name?: string;
          order?: number;
        };
        Relationships: [];
      };
      ref_universities: {
        Row: {
          domains: string[];
          id: string;
          name: string;
        };
        Insert: {
          domains: string[];
          id?: string;
          name: string;
        };
        Update: {
          domains?: string[];
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      saved_jobs: {
        Row: {
          id: string;
          job_id: string | null;
          saved_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          saved_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string | null;
          saved_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_activity: {
        Row: {
          activity_type: string | null;
          created_at: string | null;
          id: string;
          job_id: string | null;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          activity_type?: string | null;
          created_at?: string | null;
          id?: string;
          job_id?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          activity_type?: string | null;
          created_at?: string | null;
          id?: string;
          job_id?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_activity_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_activity_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          bio: string | null;
          calendly_link: string | null;
          college: string | null;
          created_at: string | null;
          email: string;
          full_name: string;
          github_link: string | null;
          id: string;
          is_deactivated: boolean | null;
          is_verified: boolean;
          linkage_officer: string | null;
          linkedin_link: string | null;
          phone_number: string | null;
          portfolio_link: string | null;
          profile_picture: string | null;
          resume: string | null;
          taking_for_credit: boolean;
          updated_at: string | null;
          verification_hash: string;
          year_level: number;
        };
        Insert: {
          bio?: string | null;
          calendly_link?: string | null;
          college?: string | null;
          created_at?: string | null;
          email: string;
          full_name: string;
          github_link?: string | null;
          id?: string;
          is_deactivated?: boolean | null;
          is_verified?: boolean;
          linkage_officer?: string | null;
          linkedin_link?: string | null;
          phone_number?: string | null;
          portfolio_link?: string | null;
          profile_picture?: string | null;
          resume?: string | null;
          taking_for_credit?: boolean;
          updated_at?: string | null;
          verification_hash: string;
          year_level: number;
        };
        Update: {
          bio?: string | null;
          calendly_link?: string | null;
          college?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string;
          github_link?: string | null;
          id?: string;
          is_deactivated?: boolean | null;
          is_verified?: boolean;
          linkage_officer?: string | null;
          linkedin_link?: string | null;
          phone_number?: string | null;
          portfolio_link?: string | null;
          profile_picture?: string | null;
          resume?: string | null;
          taking_for_credit?: boolean;
          updated_at?: string | null;
          verification_hash?: string;
          year_level?: number;
        };
        Relationships: [
          {
            foreignKeyName: "users_college_fkey";
            columns: ["college"];
            isOneToOne: false;
            referencedRelation: "ref_colleges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_year_level_fkey";
            columns: ["year_level"];
            isOneToOne: false;
            referencedRelation: "ref_levels";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
