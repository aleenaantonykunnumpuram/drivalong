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
      booking_events: {
        Row: {
          actor_id: string | null
          booking_id: string
          created_at: string
          event: string
          id: string
          payload: Json | null
        }
        Insert: {
          actor_id?: string | null
          booking_id: string
          created_at?: string
          event: string
          id?: string
          payload?: Json | null
        }
        Update: {
          actor_id?: string | null
          booking_id?: string
          created_at?: string
          event?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          customer_id: string
          driver_id: string | null
          drop_address: string | null
          drop_lat: number | null
          drop_lng: number | null
          estimated_km: number | null
          estimated_minutes: number | null
          fare_estimate: number
          final_fare: number | null
          id: string
          notes: string | null
          otp: string
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          scheduled_at: string
          status: Database["public"]["Enums"]["booking_status"]
          transmission: Database["public"]["Enums"]["transmission"]
          trip_type: Database["public"]["Enums"]["trip_type"]
          updated_at: string
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          driver_id?: string | null
          drop_address?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          estimated_km?: number | null
          estimated_minutes?: number | null
          fare_estimate: number
          final_fare?: number | null
          id?: string
          notes?: string | null
          otp?: string
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          transmission?: Database["public"]["Enums"]["transmission"]
          trip_type: Database["public"]["Enums"]["trip_type"]
          updated_at?: string
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          driver_id?: string | null
          drop_address?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          estimated_km?: number | null
          estimated_minutes?: number | null
          fare_estimate?: number
          final_fare?: number | null
          id?: string
          notes?: string | null
          otp?: string
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          transmission?: Database["public"]["Enums"]["transmission"]
          trip_type?: Database["public"]["Enums"]["trip_type"]
          updated_at?: string
          vehicle_category?: Database["public"]["Enums"]["vehicle_category"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          driver_id: string
          heading: number | null
          id: number
          lat: number
          lng: number
          speed_kph: number | null
          ts: string
        }
        Insert: {
          driver_id: string
          heading?: number | null
          id?: number
          lat: number
          lng: number
          speed_kph?: number | null
          ts?: string
        }
        Update: {
          driver_id?: string
          heading?: number | null
          id?: number
          lat?: number
          lng?: number
          speed_kph?: number | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          assigned_vehicle_id: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          is_online: boolean
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_seen_at: string | null
          license_number: string | null
          rating: number
          total_trips: number
          updated_at: string
        }
        Insert: {
          assigned_vehicle_id?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id: string
          is_online?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_seen_at?: string | null
          license_number?: string | null
          rating?: number
          total_trips?: number
          updated_at?: string
        }
        Update: {
          assigned_vehicle_id?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_online?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_seen_at?: string | null
          license_number?: string | null
          rating?: number
          total_trips?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          webhook_verified_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          webhook_verified_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          webhook_verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          city: string
          id: string
          min_fare: number
          surge_multiplier: number
          updated_at: string
        }
        Insert: {
          city?: string
          id?: string
          min_fare?: number
          surge_multiplier?: number
          updated_at?: string
        }
        Update: {
          city?: string
          id?: string
          min_fare?: number
          surge_multiplier?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          customer_id: string
          driver_id: string | null
          id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          customer_id: string
          driver_id?: string | null
          id?: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          customer_id?: string
          driver_id?: string | null
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          base_fare: number
          capacity: number
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at: string
          display_name: string
          hourly_rate: number
          id: string
          is_active: boolean
          per_km: number
          per_min: number
          transmission: Database["public"]["Enums"]["transmission"]
          updated_at: string
        }
        Insert: {
          base_fare?: number
          capacity?: number
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          display_name: string
          hourly_rate?: number
          id?: string
          is_active?: boolean
          per_km?: number
          per_min?: number
          transmission?: Database["public"]["Enums"]["transmission"]
          updated_at?: string
        }
        Update: {
          base_fare?: number
          capacity?: number
          category?: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          display_name?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean
          per_km?: number
          per_min?: number
          transmission?: Database["public"]["Enums"]["transmission"]
          updated_at?: string
        }
        Relationships: []
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
      app_role: "customer" | "driver" | "admin"
      booking_status:
        | "pending"
        | "assigned"
        | "started"
        | "completed"
        | "cancelled"
      kyc_status: "pending" | "approved" | "rejected"
      payment_provider: "razorpay" | "cash"
      payment_status:
        | "created"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
      transmission: "manual" | "automatic"
      trip_type: "one_way" | "round_trip" | "hourly" | "outstation"
      vehicle_category: "hatchback" | "sedan" | "suv" | "luxury" | "ev"
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
      app_role: ["customer", "driver", "admin"],
      booking_status: [
        "pending",
        "assigned",
        "started",
        "completed",
        "cancelled",
      ],
      kyc_status: ["pending", "approved", "rejected"],
      payment_provider: ["razorpay", "cash"],
      payment_status: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      transmission: ["manual", "automatic"],
      trip_type: ["one_way", "round_trip", "hourly", "outstation"],
      vehicle_category: ["hatchback", "sedan", "suv", "luxury", "ev"],
    },
  },
} as const
