export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          first_name: string
          google_contact_id: string | null
          id: string
          job_title: string | null
          last_contacted_at: string | null
          last_name: string | null
          on_working_list: boolean
          pipeline_status: Database["public"]["Enums"]["pipeline_status"]
          pre_snooze_status: Database["public"]["Enums"]["pipeline_status"] | null
          profile_id: string
          snoozed_until: string | null
          updated_at: string
          working_list_added_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          google_contact_id?: string | null
          id?: string
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          on_working_list?: boolean
          pipeline_status?: Database["public"]["Enums"]["pipeline_status"]
          pre_snooze_status?: Database["public"]["Enums"]["pipeline_status"] | null
          profile_id: string
          snoozed_until?: string | null
          updated_at?: string
          working_list_added_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          google_contact_id?: string | null
          id?: string
          job_title?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          on_working_list?: boolean
          pipeline_status?: Database["public"]["Enums"]["pipeline_status"]
          pre_snooze_status?: Database["public"]["Enums"]["pipeline_status"] | null
          profile_id?: string
          snoozed_until?: string | null
          updated_at?: string
          working_list_added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_profile_id_fkey"
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
          id: string
          last_synced_at: string | null
          profile_id: string
          sync_token: string | null
        }
        Insert: {
          id?: string
          last_synced_at?: string | null
          profile_id: string
          sync_token?: string | null
        }
        Update: {
          id?: string
          last_synced_at?: string | null
          profile_id?: string
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
            foreignKeyName: "interactions_profile_id_fkey"
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
          id: string
          pipeline_view: string
          updated_at: string
        }
        Insert: {
          clerk_id: string
          confirmation_enabled?: boolean
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          pipeline_view?: string
          updated_at?: string
        }
        Update: {
          clerk_id?: string
          confirmation_enabled?: boolean
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          pipeline_view?: string
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
      [_ in never]: never
    }
    Functions: {
      get_my_clerk_id: { Args: never; Returns: string }
      get_my_profile_id: { Args: never; Returns: string }
    }
    Enums: {
      call_outcome: "connected" | "no_answer" | "voicemail"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      call_outcome: ["connected", "no_answer", "voicemail"],
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
