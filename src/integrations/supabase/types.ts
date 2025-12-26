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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          address: string | null
          balance: number
          created_at: string
          gstin: string | null
          id: string
          is_default: boolean
          name: string
          opening_balance: number
          organization_id: string
          phone_number: string | null
          sub_type: string | null
          updated_at: string
        }
        Insert: {
          account_type: string
          address?: string | null
          balance?: number
          created_at?: string
          gstin?: string | null
          id?: string
          is_default?: boolean
          name: string
          opening_balance?: number
          organization_id: string
          phone_number?: string | null
          sub_type?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          address?: string | null
          balance?: number
          created_at?: string
          gstin?: string | null
          id?: string
          is_default?: boolean
          name?: string
          opening_balance?: number
          organization_id?: string
          phone_number?: string | null
          sub_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_name: string
          created_at: string | null
          end_datetime: string
          event_name: string
          id: string
          notes: string | null
          organization_id: string | null
          phone_number: string | null
          rent_finalized: number
          rent_received: number
          secondary_income: number | null
          start_datetime: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          end_datetime: string
          event_name: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          phone_number?: string | null
          rent_finalized: number
          rent_received?: number
          secondary_income?: number | null
          start_datetime: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          end_datetime?: string
          event_name?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          phone_number?: string | null
          rent_finalized?: number
          rent_received?: number
          secondary_income?: number | null
          start_datetime?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      income_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "income_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          organization_id: string
          phone_number: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          organization_id: string
          phone_number?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          organization_id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      secondary_income: {
        Row: {
          amount: number
          booking_id: string | null
          category_id: string | null
          created_at: string | null
          id: string
          organization_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "additional_income_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "additional_income_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secondary_income_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "income_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          from_account_id: string | null
          id: string
          is_financial_transaction: boolean
          organization_id: string
          party_id: string | null
          party_type: Database["public"]["Enums"]["party_type"] | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          reference_voucher_id: string | null
          to_account_id: string | null
          voucher_date: string
          voucher_type: Database["public"]["Enums"]["voucher_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          is_financial_transaction?: boolean
          organization_id: string
          party_id?: string | null
          party_type?: Database["public"]["Enums"]["party_type"] | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          reference_voucher_id?: string | null
          to_account_id?: string | null
          voucher_date: string
          voucher_type: Database["public"]["Enums"]["voucher_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          is_financial_transaction?: boolean
          organization_id?: string
          party_id?: string | null
          party_type?: Database["public"]["Enums"]["party_type"] | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          reference_voucher_id?: string | null
          to_account_id?: string | null
          voucher_date?: string
          voucher_type?: Database["public"]["Enums"]["voucher_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_reference_voucher_id_fkey"
            columns: ["reference_voucher_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          business_name: string
          contact_person: string | null
          created_at: string
          gstin: string | null
          id: string
          organization_id: string | null
          phone_number: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          contact_person?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          organization_id?: string | null
          phone_number?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          contact_person?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          organization_id?: string | null
          phone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_deleted_records: { Args: never; Returns: undefined }
      is_super_admin: { Args: never; Returns: boolean }
      migrate_advance_to_payments: { Args: never; Returns: undefined }
    }
    Enums: {
      party_type: "customer" | "vendor"
      payment_method_type: "cash" | "bank"
      user_role: "admin" | "manager"
      voucher_type:
        | "purchase"
        | "payment"
        | "fund_transfer"
        | "sales"
        | "receipt"
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
      party_type: ["customer", "vendor"],
      payment_method_type: ["cash", "bank"],
      user_role: ["admin", "manager"],
      voucher_type: [
        "purchase",
        "payment",
        "fund_transfer",
        "sales",
        "receipt",
      ],
    },
  },
} as const
