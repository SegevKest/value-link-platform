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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      asset: {
        Row: {
          activecontractid: string | null
          assetid: string
          name: string
          propertyownerid: string | null
          tenantid: string | null
          type: string
        }
        Insert: {
          activecontractid?: string | null
          assetid: string
          name: string
          propertyownerid?: string | null
          tenantid?: string | null
          type: string
        }
        Update: {
          activecontractid?: string | null
          assetid?: string
          name?: string
          propertyownerid?: string | null
          tenantid?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_asset_propertyowner"
            columns: ["propertyownerid"]
            isOneToOne: false
            referencedRelation: "propertyowner"
            referencedColumns: ["propertyownerid"]
          },
          {
            foreignKeyName: "fk_asset_tenant"
            columns: ["tenantid"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["tenantid"]
          },
          {
            foreignKeyName: "fk_asset_type"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "assettype"
            referencedColumns: ["name"]
          },
        ]
      }
      assetsmanager: {
        Row: {
          assetsmanagerid: string
          name: string
        }
        Insert: {
          assetsmanagerid: string
          name: string
        }
        Update: {
          assetsmanagerid?: string
          name?: string
        }
        Relationships: []
      }
      assettype: {
        Row: {
          assettypeid: number
          name: string
        }
        Insert: {
          assettypeid?: number
          name: string
        }
        Update: {
          assettypeid?: number
          name?: string
        }
        Relationships: []
      }
      category: {
        Row: {
          categoryid: string
          name: string
        }
        Insert: {
          categoryid: string
          name: string
        }
        Update: {
          categoryid?: string
          name?: string
        }
        Relationships: []
      }
      propertyowner: {
        Row: {
          name: string
          propertyownerid: string
        }
        Insert: {
          name: string
          propertyownerid: string
        }
        Update: {
          name?: string
          propertyownerid?: string
        }
        Relationships: []
      }
      tenant: {
        Row: {
          assetid: string | null
          email: string | null
          name: string
          phone: string | null
          tenantid: string
        }
        Insert: {
          assetid?: string | null
          email?: string | null
          name: string
          phone?: string | null
          tenantid: string
        }
        Update: {
          assetid?: string | null
          email?: string | null
          name?: string
          phone?: string | null
          tenantid?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_asset"
            columns: ["assetid"]
            isOneToOne: false
            referencedRelation: "asset"
            referencedColumns: ["assetid"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
