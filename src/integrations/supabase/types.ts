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
      AccountCategories: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          is_secondary_income: boolean
          name: string
          organization_id: string | null
          type: Database["public"]["Enums"]["account_category_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          is_secondary_income?: boolean
          name: string
          organization_id?: string | null
          type: Database["public"]["Enums"]["account_category_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          is_secondary_income?: boolean
          name?: string
          organization_id?: string | null
          type?: Database["public"]["Enums"]["account_category_type"]
        }
        Relationships: [
          {
            foreignKeyName: "AccountCategories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      Accounts: {
        Row: {
          account_type: string
          created_at: string
          id: string
          initial_balance: number
          is_default: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          account_type: string
          created_at?: string
          id?: string
          initial_balance?: number
          is_default?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          id?: string
          initial_balance?: number
          is_default?: boolean
          name?: string
          organization_id?: string
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
      BillAllocations: {
        Row: {
          amount_applied: number
          applied_at: string
          bill_id: string
          id: string
          organization_id: string
          transaction_id: string
        }
        Insert: {
          amount_applied: number
          applied_at?: string
          bill_id: string
          id?: string
          organization_id: string
          transaction_id: string
        }
        Update: {
          amount_applied?: number
          applied_at?: string
          bill_id?: string
          id?: string
          organization_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "BillAllocations_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "Bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BillAllocations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BillAllocations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "Transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      Bills: {
        Row: {
          amount: number
          bill_number: string | null
          category_id: string | null
          created_at: string
          date: string
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["bill_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          bill_number?: string | null
          category_id?: string | null
          created_at?: string
          date: string
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          bill_number?: string | null
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "AccountCategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Bills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "Vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      Bookings: {
        Row: {
          client_id: string | null
          created_at: string | null
          end_datetime: string
          event_name: string
          id: string
          notes: string | null
          organization_id: string | null
          rent_finalized: number
          rent_received: number
          secondary_income: number | null
          start_datetime: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          end_datetime: string
          event_name: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          rent_finalized: number
          rent_received?: number
          secondary_income?: number | null
          start_datetime: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          end_datetime?: string
          event_name?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          rent_finalized?: number
          rent_received?: number
          secondary_income?: number | null
          start_datetime?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "Clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      Clients: {
        Row: {
          address: string | null
          client_id: string
          created_at: string
          email: string | null
          name: string
          organization_id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id?: string
          created_at?: string
          email?: string | null
          name: string
          organization_id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string
          created_at?: string
          email?: string | null
          name?: string
          organization_id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      IncomeAllocations: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          id: string
          organization_id: string
          transaction_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          transaction_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "IncomeAllocations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "AccountCategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "IncomeAllocations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "IncomeAllocations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "Transactions"
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
          is_super_admin: boolean
          organization_id: string
          phone_number: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: Json | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          is_super_admin?: boolean
          organization_id: string
          phone_number?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: Json | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          is_super_admin?: boolean
          organization_id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: Json | null
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
      SecondaryIncome: {
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
            referencedRelation: "Bookings"
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
            referencedRelation: "AccountCategories"
            referencedColumns: ["id"]
          },
        ]
      }
      Transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          from_account_id: string | null
          id: string
          organization_id: string
          to_account_id: string | null
          transaction_date: string
          transaction_status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          from_account_id?: string | null
          id?: string
          organization_id: string
          to_account_id?: string | null
          transaction_date: string
          transaction_status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          from_account_id?: string | null
          id?: string
          organization_id?: string
          to_account_id?: string | null
          transaction_date?: string
          transaction_status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "Bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "Accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "Accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      Vendors: {
        Row: {
          address: string | null
          created_at: string
          current_balance: number
          gstin: string | null
          name: string
          organization_id: string | null
          phone_number: string | null
          vendor_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          current_balance?: number
          gstin?: string | null
          name: string
          organization_id?: string | null
          phone_number?: string | null
          vendor_id?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          current_balance?: number
          gstin?: string | null
          name?: string
          organization_id?: string | null
          phone_number?: string | null
          vendor_id?: string
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
      account_category_type: "income" | "expense"
      bill_status: "unpaid" | "partial" | "paid"
      party_type: "customer" | "vendor"
      payment_method_type: "cash" | "bank"
      transaction_status:
        | "Available"
        | "Partially Allocated"
        | "Fully Allocated"
        | "Void"
      transaction_type:
        | "Income"
        | "Expense"
        | "Refund"
        | "Advance Paid"
        | "Transfer"
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
      account_category_type: ["income", "expense"],
      bill_status: ["unpaid", "partial", "paid"],
      party_type: ["customer", "vendor"],
      payment_method_type: ["cash", "bank"],
      transaction_status: [
        "Available",
        "Partially Allocated",
        "Fully Allocated",
        "Void",
      ],
      transaction_type: [
        "Income",
        "Expense",
        "Refund",
        "Advance Paid",
        "Transfer",
      ],
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
