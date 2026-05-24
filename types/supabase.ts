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
      action_log: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          payload: Json
          profile_id: string
          undo_expires_at: string | null
          undone_at: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          payload?: Json
          profile_id: string
          undo_expires_at?: string | null
          undone_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          payload?: Json
          profile_id?: string
          undo_expires_at?: string | null
          undone_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_details: {
        Row: {
          duration_seconds: number | null
          id: string
          interaction_id: string
          outcome: Database["public"]["Enums"]["call_outcome"]
          summary: string | null
        }
        Insert: {
          duration_seconds?: number | null
          id?: string
          interaction_id: string
          outcome: Database["public"]["Enums"]["call_outcome"]
          summary?: string | null
        }
        Update: {
          duration_seconds?: number | null
          id?: string
          interaction_id?: string
          outcome?: Database["public"]["Enums"]["call_outcome"]
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_details_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: true
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_labels: {
        Row: {
          contact_id: string
          label_id: string
          profile_id: string
        }
        Insert: {
          contact_id: string
          label_id: string
          profile_id: string
        }
        Update: {
          contact_id?: string
          label_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_labels_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_labels_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_labels_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          created_by_source: Database["public"]["Enums"]["contact_source"]
          custom_description: string | null
          email: string | null
          first_name: string
          google_contact_id: string | null
          id: string
          import_log_id: string | null
          job_title: string | null
          last_contacted_at: string | null
          last_name: string | null
          last_updated_by_source: Database["public"]["Enums"]["contact_source"]
          on_working_list: boolean
          pipeline_status: Database["public"]["Enums"]["pipeline_status"]
          pre_snooze_status: string | null
          preferred_contact_method: string | null
          profile_id: string
          snoozed_until: string | null
          source_detail: string | null
          updated_at: string
          working_list_added_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          created_by_source?: Database["public"]["Enums"]["contact_source"]
          custom_description?: string | null
          email?: string | null
          first_name: string
          google_contact_id?: string | null
          id?: string
          import_log_id?: string | null
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          last_updated_by_source?: Database["public"]["Enums"]["contact_source"]
          on_working_list?: boolean
          pipeline_status?: Database["public"]["Enums"]["pipeline_status"]
          pre_snooze_status?: string | null
          preferred_contact_method?: string | null
          profile_id: string
          snoozed_until?: string | null
          source_detail?: string | null
          updated_at?: string
          working_list_added_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          created_by_source?: Database["public"]["Enums"]["contact_source"]
          custom_description?: string | null
          email?: string | null
          first_name?: string
          google_contact_id?: string | null
          id?: string
          import_log_id?: string | null
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          last_updated_by_source?: Database["public"]["Enums"]["contact_source"]
          on_working_list?: boolean
          pipeline_status?: Database["public"]["Enums"]["pipeline_status"]
          pre_snooze_status?: string | null
          preferred_contact_method?: string | null
          profile_id?: string
          snoozed_until?: string | null
          source_detail?: string | null
          updated_at?: string
          working_list_added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "csv_imports_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_imports_log: {
        Row: {
          created_at: string
          filename: string
          id: string
          profile_id: string
          record_count: number
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          profile_id: string
          record_count?: number
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          profile_id?: string
          record_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "csv_imports_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_details: {
        Row: {
          body: string | null
          id: string
          interaction_id: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          id?: string
          interaction_id: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          id?: string
          interaction_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_details_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: true
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_state: {
        Row: {
          access_token: string | null
          id: string
          last_synced_at: string | null
          profile_id: string
          refresh_token: string | null
          sync_token: string | null
        }
        Insert: {
          access_token?: string | null
          id?: string
          last_synced_at?: string | null
          profile_id: string
          refresh_token?: string | null
          sync_token?: string | null
        }
        Update: {
          access_token?: string | null
          id?: string
          last_synced_at?: string | null
          profile_id?: string
          refresh_token?: string | null
          sync_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_sync_state_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_items: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          payload: Json
          profile_id: string
          read: boolean
          type: Database["public"]["Enums"]["inbox_item_type"]
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          profile_id: string
          read?: boolean
          type: Database["public"]["Enums"]["inbox_item_type"]
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          profile_id?: string
          read?: boolean
          type?: Database["public"]["Enums"]["inbox_item_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inbox_items_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_items_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          occurred_at: string
          profile_id: string
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          occurred_at?: string
          profile_id: string
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          occurred_at?: string
          profile_id?: string
          type?: Database["public"]["Enums"]["interaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          profile_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          profile_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      note_details: {
        Row: {
          body: string
          id: string
          interaction_id: string
        }
        Insert: {
          body: string
          id?: string
          interaction_id: string
        }
        Update: {
          body?: string
          id?: string
          interaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_details_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: true
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          is_primary: boolean
          number: string
          profile_id: string
          type: Database["public"]["Enums"]["phone_type"]
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          number: string
          profile_id: string
          type?: Database["public"]["Enums"]["phone_type"]
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          number?: string
          profile_id?: string
          type?: Database["public"]["Enums"]["phone_type"]
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_numbers_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_numbers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clerk_id: string
          confirmation_enabled: boolean
          created_at: string
          display_name: string | null
          email: string
          followup_rules: Json
          id: string
          pipeline_view: string
          undo_window_seconds: number
          updated_at: string
        }
        Insert: {
          clerk_id: string
          confirmation_enabled?: boolean
          created_at?: string
          display_name?: string | null
          email: string
          followup_rules?: Json
          id?: string
          pipeline_view?: string
          undo_window_seconds?: number
          updated_at?: string
        }
        Update: {
          clerk_id?: string
          confirmation_enabled?: boolean
          created_at?: string
          display_name?: string | null
          email?: string
          followup_rules?: Json
          id?: string
          pipeline_view?: string
          undo_window_seconds?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          profile_id: string
          url: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          profile_id: string
          url: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_links_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_conflicts: {
        Row: {
          contact_id: string
          created_at: string
          field_name: string
          google_value: string | null
          id: string
          our_value: string | null
          profile_id: string
          resolved: boolean
        }
        Insert: {
          contact_id: string
          created_at?: string
          field_name: string
          google_value?: string | null
          id?: string
          our_value?: string | null
          profile_id: string
          resolved?: boolean
        }
        Update: {
          contact_id?: string
          created_at?: string
          field_name?: string
          google_value?: string | null
          id?: string
          our_value?: string | null
          profile_id?: string
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sync_conflicts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_search_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      contacts_search_view: {
        Row: {
          avatar_url: string | null
          company: string | null
          contact_labels: Json | null
          created_at: string | null
          created_by_source:
            | Database["public"]["Enums"]["contact_source"]
            | null
          custom_description: string | null
          email: string | null
          first_name: string | null
          google_contact_id: string | null
          id: string | null
          import_log_id: string | null
          job_title: string | null
          label_ids: string[] | null
          last_contacted_at: string | null
          last_name: string | null
          last_updated_by_source:
            | Database["public"]["Enums"]["contact_source"]
            | null
          on_working_list: boolean | null
          phone_numbers: Json | null
          phone_numbers_concat: string | null
          pipeline_status: Database["public"]["Enums"]["pipeline_status"] | null
          preferred_contact_method: string | null
          profile_id: string | null
          snoozed_until: string | null
          source_detail: string | null
          updated_at: string | null
          working_list_added_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          contact_labels?: never
          created_at?: string | null
          created_by_source?:
            | Database["public"]["Enums"]["contact_source"]
            | null
          custom_description?: string | null
          email?: string | null
          first_name?: string | null
          google_contact_id?: string | null
          id?: string | null
          import_log_id?: string | null
          job_title?: string | null
          label_ids?: never
          last_contacted_at?: string | null
          last_name?: string | null
          last_updated_by_source?:
            | Database["public"]["Enums"]["contact_source"]
            | null
          on_working_list?: boolean | null
          phone_numbers?: never
          phone_numbers_concat?: never
          pipeline_status?:
            | Database["public"]["Enums"]["pipeline_status"]
            | null
          preferred_contact_method?: string | null
          profile_id?: string | null
          snoozed_until?: string | null
          source_detail?: string | null
          updated_at?: string | null
          working_list_added_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          contact_labels?: never
          created_at?: string | null
          created_by_source?:
            | Database["public"]["Enums"]["contact_source"]
            | null
          custom_description?: string | null
          email?: string | null
          first_name?: string | null
          google_contact_id?: string | null
          id?: string | null
          import_log_id?: string | null
          job_title?: string | null
          label_ids?: never
          last_contacted_at?: string | null
          last_name?: string | null
          last_updated_by_source?:
            | Database["public"]["Enums"]["contact_source"]
            | null
          on_working_list?: boolean | null
          phone_numbers?: never
          phone_numbers_concat?: never
          pipeline_status?:
            | Database["public"]["Enums"]["pipeline_status"]
            | null
          preferred_contact_method?: string | null
          profile_id?: string | null
          snoozed_until?: string | null
          source_detail?: string | null
          updated_at?: string | null
          working_list_added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "csv_imports_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_contact_with_phone: {
        Args: {
          p_profile_id: string
          p_first_name: string
          p_last_name: string | null
          p_email: string | null
          p_company: string | null
          p_job_title: string | null
          p_phone: string | null
        }
        Returns: string
      }
      get_crm_stats: {
        Args: { p_profile_id: string }
        Returns: {
          overdue_contacts: number
          snoozed_contacts: number
          total_contacts: number
        }[]
      }
      get_my_clerk_id: { Args: never; Returns: string }
      get_my_profile_id: { Args: never; Returns: string }
      mark_done_with_note: {
        Args: {
          p_contact_id: string
          p_note_body: string
          p_profile_id: string
        }
        Returns: undefined
      }
      resurface_expired_contacts: {
        Args: { p_profile_id: string; p_today: string }
        Returns: number
      }
    }
    Enums: {
      call_outcome: "connected" | "no_answer" | "voicemail"
      contact_source: "manual" | "google_sync" | "csv_import" | "api"
      inbox_item_type: "resurfaced" | "working_list_changed" | "sync_conflict"
      interaction_type: "call" | "email" | "note"
      phone_type: "mobile" | "work" | "home"
      pipeline_status:
        | "lead"
        | "qualified"
        | "bought"
        | "leave_alone"
        | "snoozed"
      social_platform: "linkedin" | "twitter" | "instagram" | "other"
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
      call_outcome: ["connected", "no_answer", "voicemail"],
      contact_source: ["manual", "google_sync", "csv_import", "api"],
      inbox_item_type: ["resurfaced", "working_list_changed", "sync_conflict"],
      interaction_type: ["call", "email", "note"],
      phone_type: ["mobile", "work", "home"],
      pipeline_status: [
        "lead",
        "qualified",
        "bought",
        "leave_alone",
        "snoozed",
      ],
      social_platform: ["linkedin", "twitter", "instagram", "other"],
    },
  },
} as const
