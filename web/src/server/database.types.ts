export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string;
          actor_id: string;
          created_at: string;
          id: string;
          order_id: string | null;
          reason: string;
          wedding_id: string | null;
        };
        Insert: {
          action: string;
          actor_id: string;
          created_at?: string;
          id?: string;
          order_id?: string | null;
          reason?: string;
          wedding_id?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string;
          created_at?: string;
          id?: string;
          order_id?: string | null;
          reason?: string;
          wedding_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_events_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_events_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      dashboard_grants: {
        Row: {
          actor_id: string | null;
          changed_at: string;
          reason: string;
          revision: number;
          state: string;
          wedding_id: string;
        };
        Insert: {
          actor_id?: string | null;
          changed_at?: string;
          reason?: string;
          revision?: number;
          state?: string;
          wedding_id: string;
        };
        Update: {
          actor_id?: string | null;
          changed_at?: string;
          reason?: string;
          revision?: number;
          state?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dashboard_grants_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: true;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      entitlements: {
        Row: {
          expires_at: string | null;
          starts_at: string | null;
          term_days: number;
          wedding_id: string;
        };
        Insert: {
          expires_at?: string | null;
          starts_at?: string | null;
          term_days: number;
          wedding_id: string;
        };
        Update: {
          expires_at?: string | null;
          starts_at?: string | null;
          term_days?: number;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'entitlements_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: true;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      event_keys: {
        Row: {
          event_id: string;
          wedding_id: string;
        };
        Insert: {
          event_id: string;
          wedding_id: string;
        };
        Update: {
          event_id?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_keys_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      household_events: {
        Row: {
          event_id: string;
          household_id: string;
          max_people: number;
          wedding_id: string;
        };
        Insert: {
          event_id: string;
          household_id: string;
          max_people: number;
          wedding_id: string;
        };
        Update: {
          event_id?: string;
          household_id?: string;
          max_people?: number;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'household_events_wedding_id_event_id_fkey';
            columns: ['wedding_id', 'event_id'];
            isOneToOne: false;
            referencedRelation: 'event_keys';
            referencedColumns: ['wedding_id', 'event_id'];
          },
          {
            foreignKeyName: 'household_events_wedding_id_household_id_fkey';
            columns: ['wedding_id', 'household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['wedding_id', 'id'];
          },
        ];
      };
      households: {
        Row: {
          created_at: string;
          greeting: string;
          greeting_en: string;
          id: string;
          message: string;
          message_en: string;
          name: string;
          name_bn: string;
          overlay_revision: number;
          private_note: string;
          response_revision: number;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          created_at?: string;
          greeting?: string;
          greeting_en?: string;
          id: string;
          message?: string;
          message_en?: string;
          name: string;
          name_bn?: string;
          overlay_revision?: number;
          private_note?: string;
          response_revision?: number;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          created_at?: string;
          greeting?: string;
          greeting_en?: string;
          id?: string;
          message?: string;
          message_en?: string;
          name?: string;
          name_bn?: string;
          overlay_revision?: number;
          private_note?: string;
          response_revision?: number;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'households_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      invitation_drafts: {
        Row: {
          content: Json;
          revision: number;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          content?: Json;
          revision?: number;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          content?: Json;
          revision?: number;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invitation_drafts_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: true;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      invitation_versions: {
        Row: {
          content: Json;
          created_at: string;
          draft_revision: number;
          id: string;
          template_version: string;
          wedding_id: string;
        };
        Insert: {
          content: Json;
          created_at?: string;
          draft_revision: number;
          id?: string;
          template_version?: string;
          wedding_id: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          draft_revision?: number;
          id?: string;
          template_version?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invitation_versions_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      media_assets: {
        Row: {
          bytes: number | null;
          created_at: string;
          created_by: string;
          error_code: string | null;
          expires_at: string;
          height: number | null;
          id: string;
          removed_at: string | null;
          state: string;
          upload_key: string;
          wedding_id: string;
          width: number | null;
        };
        Insert: {
          bytes?: number | null;
          created_at?: string;
          created_by: string;
          error_code?: string | null;
          expires_at?: string;
          height?: number | null;
          id?: string;
          removed_at?: string | null;
          state?: string;
          upload_key: string;
          wedding_id: string;
          width?: number | null;
        };
        Update: {
          bytes?: number | null;
          created_at?: string;
          created_by?: string;
          error_code?: string | null;
          expires_at?: string;
          height?: number | null;
          id?: string;
          removed_at?: string | null;
          state?: string;
          upload_key?: string;
          wedding_id?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'media_assets_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          amount_minor: number;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_name: string;
          exception_reason: string | null;
          id: string;
          package_name: string;
          payment_status: string;
          revision: number;
          status: string;
          template_id: string;
          term_days: number;
        };
        Insert: {
          amount_minor: number;
          created_at?: string;
          currency?: string;
          customer_email: string;
          customer_name: string;
          exception_reason?: string | null;
          id?: string;
          package_name: string;
          payment_status?: string;
          revision?: number;
          status?: string;
          template_id?: string;
          term_days: number;
        };
        Update: {
          amount_minor?: number;
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_name?: string;
          exception_reason?: string | null;
          id?: string;
          package_name?: string;
          payment_status?: string;
          revision?: number;
          status?: string;
          template_id?: string;
          term_days?: number;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          actor_id: string;
          amount_minor: number;
          created_at: string;
          id: string;
          method: string;
          order_id: string;
          reason: string;
          reference: string;
        };
        Insert: {
          actor_id: string;
          amount_minor: number;
          created_at?: string;
          id?: string;
          method: string;
          order_id: string;
          reason: string;
          reference: string;
        };
        Update: {
          actor_id?: string;
          amount_minor?: number;
          created_at?: string;
          id?: string;
          method?: string;
          order_id?: string;
          reason?: string;
          reference?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_events_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_submissions: {
        Row: {
          amount_minor: number;
          created_at: string;
          id: string;
          method: string;
          reference: string;
          request_id: string;
          review_note: string;
          reviewed_at: string | null;
          reviewer_id: string | null;
          sender: string;
          state: string;
          user_id: string;
        };
        Insert: {
          amount_minor: number;
          created_at?: string;
          id?: string;
          method: string;
          reference: string;
          request_id: string;
          review_note?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          sender: string;
          state?: string;
          user_id: string;
        };
        Update: {
          amount_minor?: number;
          created_at?: string;
          id?: string;
          method?: string;
          reference?: string;
          request_id?: string;
          review_note?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          sender?: string;
          state?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_submissions_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'sales_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      publication_media: {
        Row: {
          asset_id: string;
          version_id: string;
          wedding_id: string;
        };
        Insert: {
          asset_id: string;
          version_id: string;
          wedding_id: string;
        };
        Update: {
          asset_id?: string;
          version_id?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'publication_media_wedding_id_asset_id_fkey';
            columns: ['wedding_id', 'asset_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['wedding_id', 'id'];
          },
          {
            foreignKeyName: 'publication_media_wedding_id_version_id_fkey';
            columns: ['wedding_id', 'version_id'];
            isOneToOne: false;
            referencedRelation: 'invitation_versions';
            referencedColumns: ['wedding_id', 'id'];
          },
        ];
      };
      response_changes: {
        Row: {
          actor_id: string | null;
          change_sequence: number;
          created_at: string;
          current_value: Json;
          event_id: string;
          household_id: string;
          id: string;
          override_closed: boolean;
          previous: Json | null;
          reason: string;
          source: string;
          wedding_id: string;
        };
        Insert: {
          actor_id?: string | null;
          change_sequence?: never;
          created_at?: string;
          current_value: Json;
          event_id: string;
          household_id: string;
          id?: string;
          override_closed?: boolean;
          previous?: Json | null;
          reason?: string;
          source?: string;
          wedding_id: string;
        };
        Update: {
          actor_id?: string | null;
          change_sequence?: never;
          created_at?: string;
          current_value?: Json;
          event_id?: string;
          household_id?: string;
          id?: string;
          override_closed?: boolean;
          previous?: Json | null;
          reason?: string;
          source?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'response_changes_wedding_id_household_id_fkey';
            columns: ['wedding_id', 'household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['wedding_id', 'id'];
          },
        ];
      };
      responses: {
        Row: {
          adults: number;
          attendance: string;
          children: number;
          event_id: string;
          household_id: string;
          note: string;
          revision: number;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          adults: number;
          attendance: string;
          children: number;
          event_id: string;
          household_id: string;
          note: string;
          revision: number;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          adults?: number;
          attendance?: string;
          children?: number;
          event_id?: string;
          household_id?: string;
          note?: string;
          revision?: number;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'responses_wedding_id_household_id_event_id_fkey';
            columns: ['wedding_id', 'household_id', 'event_id'];
            isOneToOne: true;
            referencedRelation: 'household_events';
            referencedColumns: ['wedding_id', 'household_id', 'event_id'];
          },
        ];
      };
      rsvp_policies: {
        Row: {
          deadline: string | null;
          event_id: string;
          is_open: boolean;
          wedding_id: string;
        };
        Insert: {
          deadline?: string | null;
          event_id: string;
          is_open?: boolean;
          wedding_id: string;
        };
        Update: {
          deadline?: string | null;
          event_id?: string;
          is_open?: boolean;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rsvp_policies_wedding_id_event_id_fkey';
            columns: ['wedding_id', 'event_id'];
            isOneToOne: true;
            referencedRelation: 'event_keys';
            referencedColumns: ['wedding_id', 'event_id'];
          },
        ];
      };
      sales_requests: {
        Row: {
          amount_minor: number | null;
          brief: string;
          created_at: string;
          customer_email: string;
          customer_name: string;
          event_date: string | null;
          id: string;
          order_id: string | null;
          package_name: string | null;
          quote_notes: string | null;
          revision: number;
          state: string;
          template_id: string;
          term_days: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_minor?: number | null;
          brief: string;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          event_date?: string | null;
          id?: string;
          order_id?: string | null;
          package_name?: string | null;
          quote_notes?: string | null;
          revision?: number;
          state?: string;
          template_id?: string;
          term_days?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_minor?: number | null;
          brief?: string;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          event_date?: string | null;
          id?: string;
          order_id?: string | null;
          package_name?: string | null;
          quote_notes?: string | null;
          revision?: number;
          state?: string;
          template_id?: string;
          term_days?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sales_requests_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      staff_roles: {
        Row: {
          active: boolean;
          granted_at: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          granted_at?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          granted_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      wedding_memberships: {
        Row: {
          active: boolean;
          user_id: string;
          wedding_id: string;
        };
        Insert: {
          active?: boolean;
          user_id: string;
          wedding_id: string;
        };
        Update: {
          active?: boolean;
          user_id?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wedding_memberships_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: true;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      weddings: {
        Row: {
          created_at: string;
          id: string;
          live_version_id: string | null;
          order_id: string;
          publication_revision: number;
          rsvp_policy_revision: number;
          slug: string;
          template_id: string;
          title: string;
          visibility: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          live_version_id?: string | null;
          order_id: string;
          publication_revision?: number;
          rsvp_policy_revision?: number;
          slug?: string;
          template_id?: string;
          title: string;
          visibility?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          live_version_id?: string | null;
          order_id?: string;
          publication_revision?: number;
          rsvp_policy_revision?: number;
          slug?: string;
          template_id?: string;
          title?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'live_version_same_wedding';
            columns: ['id', 'live_version_id'];
            isOneToOne: false;
            referencedRelation: 'invitation_versions';
            referencedColumns: ['wedding_id', 'id'];
          },
          {
            foreignKeyName: 'weddings_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      wishes: {
        Row: {
          body: string;
          created_at: string;
          household_id: string;
          id: string;
          wedding_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          household_id: string;
          id?: string;
          wedding_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          household_id?: string;
          id?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishes_wedding_id_household_id_fkey';
            columns: ['wedding_id', 'household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['wedding_id', 'id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      correct_response: {
        Args: {
          p_body: Json;
          p_household_id: string;
          p_key: string;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      exchange_guest_link: {
        Args: {
          p_link_digest: string;
          p_session_digest: string;
          p_slug: string;
        };
        Returns: Json;
      };
      export_households: {
        Args: {
          p_event_id: string;
          p_search?: string;
          p_status?: string;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      guest_command: {
        Args: {
          p_body: Json;
          p_household_id: string;
          p_key: string;
          p_session_digest: string;
          p_slug: string;
        };
        Returns: Json;
      };
      guest_invitation: {
        Args: {
          p_household_id: string;
          p_session_digest: string;
          p_slug: string;
        };
        Returns: Json;
      };
      household_link: {
        Args: {
          p_ciphertext: string;
          p_digest: string;
          p_household_id: string;
          p_key: string;
          p_key_id: string;
          p_kind: string;
          p_revision: number;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      household_preview: {
        Args: { p_household_id: string; p_wedding_id: string };
        Returns: Json;
      };
      household_report: {
        Args: {
          p_after?: string;
          p_event_id: string;
          p_search?: string;
          p_status?: string;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      media_cleanup_batch: { Args: { p_done?: string }; Returns: Json };
      my_sales_progress: { Args: never; Returns: Json };
      payment_submission_command: {
        Args: { p_body: Json; p_key: string };
        Returns: Json;
      };
      process_media: {
        Args: {
          p_actor: string;
          p_asset_id: string;
          p_data?: Json;
          p_kind: string;
          p_lease: string;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      publish_invitation: {
        Args: { p_key: string; p_revision: number; p_wedding_id: string };
        Returns: Json;
      };
      remove_media: {
        Args: { p_asset_id: string; p_wedding_id: string };
        Returns: undefined;
      };
      reserve_media: {
        Args: { p_key: string; p_wedding_id: string };
        Returns: Json;
      };
      resolve_general_invitation: { Args: { p_slug: string }; Returns: Json };
      resolve_media: {
        Args: {
          p_asset_id: string;
          p_household_id?: string;
          p_session_digest?: string;
          p_size: string;
          p_slug?: string;
          p_wedding_id?: string;
        };
        Returns: Json;
      };
      sales_command: { Args: { p_body: Json; p_key: string }; Returns: Json };
      save_draft: {
        Args: { p_content: Json; p_revision: number; p_wedding_id: string };
        Returns: Json;
      };
      save_household: {
        Args: {
          p_body: Json;
          p_household_id: string;
          p_key: string;
          p_revision: number;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      seller_command: { Args: { p_body: Json; p_key: string }; Returns: Json };
      set_invitation_visibility: {
        Args: {
          p_key: string;
          p_live: boolean;
          p_revision: number;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      set_rsvp_policy: {
        Args: {
          p_deadline?: string;
          p_event_id: string;
          p_open: boolean;
          p_revision: number;
          p_wedding_id: string;
        };
        Returns: Json;
      };
      workspace_overview: { Args: never; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
