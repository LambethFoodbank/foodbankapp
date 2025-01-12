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
      audit_log: {
        Row: {
          action: string
          actor_profile_id: string | null
          client_id: string | null
          collection_centre_id: string | null
          content: Json | null
          created_at: string
          event_id: string | null
          list_id: string | null
          log_id: string | null
          packing_slot_id: string | null
          parcel_id: string | null
          primary_key: string
          profile_id: string | null
          status_order: string | null
          wasSuccess: boolean
          website_data: string | null
          wiki_id: string | null
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          client_id?: string | null
          collection_centre_id?: string | null
          content?: Json | null
          created_at?: string
          event_id?: string | null
          list_id?: string | null
          log_id?: string | null
          packing_slot_id?: string | null
          parcel_id?: string | null
          primary_key?: string
          profile_id?: string | null
          status_order?: string | null
          wasSuccess: boolean
          website_data?: string | null
          wiki_id?: string | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          client_id?: string | null
          collection_centre_id?: string | null
          content?: Json | null
          created_at?: string
          event_id?: string | null
          list_id?: string | null
          log_id?: string | null
          packing_slot_id?: string | null
          parcel_id?: string | null
          primary_key?: string
          profile_id?: string | null
          status_order?: string | null
          wasSuccess?: boolean
          website_data?: string | null
          wiki_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_plus"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "audit_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "audit_log_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_collection_centre_id_fkey"
            columns: ["collection_centre_id"]
            isOneToOne: false
            referencedRelation: "collection_centres"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_packing_slot_id_fkey"
            columns: ["packing_slot_id"]
            isOneToOne: false
            referencedRelation: "packing_slots"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_events"
            referencedColumns: ["parcel_id"]
          },
          {
            foreignKeyName: "public_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["parcel_id"]
          },
          {
            foreignKeyName: "public_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_status_order_fkey"
            columns: ["status_order"]
            isOneToOne: false
            referencedRelation: "status_order"
            referencedColumns: ["event_name"]
          },
          {
            foreignKeyName: "public_audit_log_website_data_fkey"
            columns: ["website_data"]
            isOneToOne: false
            referencedRelation: "website_data"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "public_audit_log_wiki_id_fkey"
            columns: ["wiki_id"]
            isOneToOne: false
            referencedRelation: "wiki"
            referencedColumns: ["wiki_key"]
          },
        ]
      }
      clients: {
        Row: {
          address_1: string | null
          address_2: string | null
          address_county: string | null
          address_postcode: string | null
          address_town: string | null
          baby_food: boolean | null
          cooking_facilities: string[] | null
          default_list: Database["public"]["Enums"]["list_type"]
          delivery_instructions: string | null
          dietary_requirements: string[] | null
          extra_information: string | null
          family_id: string
          feminine_products: string[] | null
          flagged_for_attention: boolean | null
          full_name: string | null
          is_active: boolean
          last_updated: string
          notes: string | null
          other_items: string[] | null
          pet_food: string[] | null
          phone_number: string | null
          primary_key: string
          signposting_call_reasons: string[] | null
          signposting_call_required: boolean | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          address_county?: string | null
          address_postcode?: string | null
          address_town?: string | null
          baby_food?: boolean | null
          cooking_facilities?: string[] | null
          default_list?: Database["public"]["Enums"]["list_type"]
          delivery_instructions?: string | null
          dietary_requirements?: string[] | null
          extra_information?: string | null
          family_id?: string
          feminine_products?: string[] | null
          flagged_for_attention?: boolean | null
          full_name?: string | null
          is_active?: boolean
          last_updated?: string
          notes?: string | null
          other_items?: string[] | null
          pet_food?: string[] | null
          phone_number?: string | null
          primary_key?: string
          signposting_call_reasons?: string[] | null
          signposting_call_required?: boolean | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          address_county?: string | null
          address_postcode?: string | null
          address_town?: string | null
          baby_food?: boolean | null
          cooking_facilities?: string[] | null
          default_list?: Database["public"]["Enums"]["list_type"]
          delivery_instructions?: string | null
          dietary_requirements?: string[] | null
          extra_information?: string | null
          family_id?: string
          feminine_products?: string[] | null
          flagged_for_attention?: boolean | null
          full_name?: string | null
          is_active?: boolean
          last_updated?: string
          notes?: string | null
          other_items?: string[] | null
          pet_food?: string[] | null
          phone_number?: string | null
          primary_key?: string
          signposting_call_reasons?: string[] | null
          signposting_call_required?: boolean | null
        }
        Relationships: []
      }
      collection_centres: {
        Row: {
          acronym: string
          is_delivery: boolean
          is_shown: boolean
          name: string
          primary_key: string
          time_slots:
            | Database["public"]["CompositeTypes"]["collection_timeslot_type"][]
            | null
        }
        Insert: {
          acronym?: string
          is_delivery?: boolean
          is_shown?: boolean
          name?: string
          primary_key?: string
          time_slots?:
            | Database["public"]["CompositeTypes"]["collection_timeslot_type"][]
            | null
        }
        Update: {
          acronym?: string
          is_delivery?: boolean
          is_shown?: boolean
          name?: string
          primary_key?: string
          time_slots?:
            | Database["public"]["CompositeTypes"]["collection_timeslot_type"][]
            | null
        }
        Relationships: []
      }
      events: {
        Row: {
          event_data: string | null
          new_parcel_status: string
          parcel_id: string
          primary_key: string
          timestamp: string
        }
        Insert: {
          event_data?: string | null
          new_parcel_status: string
          parcel_id: string
          primary_key?: string
          timestamp?: string
        }
        Update: {
          event_data?: string | null
          new_parcel_status?: string
          parcel_id?: string
          primary_key?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_events_new_parcel_status_fkey"
            columns: ["new_parcel_status"]
            isOneToOne: false
            referencedRelation: "status_order"
            referencedColumns: ["event_name"]
          },
          {
            foreignKeyName: "public_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_events"
            referencedColumns: ["parcel_id"]
          },
          {
            foreignKeyName: "public_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["parcel_id"]
          },
        ]
      }
      families: {
        Row: {
          birth_month: number | null
          birth_year: number | null
          family_id: string
          gender: Database["public"]["Enums"]["gender"] | null
          primary_key: string
          recorded_as_child: boolean | null
        }
        Insert: {
          birth_month?: number | null
          birth_year?: number | null
          family_id: string
          gender?: Database["public"]["Enums"]["gender"] | null
          primary_key?: string
          recorded_as_child?: boolean | null
        }
        Update: {
          birth_month?: number | null
          birth_year?: number | null
          family_id?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          primary_key?: string
          recorded_as_child?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "public_families_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["family_id"]
          },
          {
            foreignKeyName: "public_families_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_count"
            referencedColumns: ["family_id"]
          },
        ]
      }
      lists: {
        Row: {
          item_name: string
          list_type: Database["public"]["Enums"]["list_type"]
          notes_for_1: string | null
          notes_for_10: string | null
          notes_for_2: string | null
          notes_for_3: string | null
          notes_for_4: string | null
          notes_for_5: string | null
          notes_for_6: string | null
          notes_for_7: string | null
          notes_for_8: string | null
          notes_for_9: string | null
          primary_key: string
          quantity_for_1: string
          quantity_for_10: string
          quantity_for_2: string
          quantity_for_3: string
          quantity_for_4: string
          quantity_for_5: string
          quantity_for_6: string
          quantity_for_7: string
          quantity_for_8: string
          quantity_for_9: string
          row_order: number
        }
        Insert: {
          item_name?: string
          list_type?: Database["public"]["Enums"]["list_type"]
          notes_for_1?: string | null
          notes_for_10?: string | null
          notes_for_2?: string | null
          notes_for_3?: string | null
          notes_for_4?: string | null
          notes_for_5?: string | null
          notes_for_6?: string | null
          notes_for_7?: string | null
          notes_for_8?: string | null
          notes_for_9?: string | null
          primary_key?: string
          quantity_for_1?: string
          quantity_for_10?: string
          quantity_for_2?: string
          quantity_for_3?: string
          quantity_for_4?: string
          quantity_for_5?: string
          quantity_for_6?: string
          quantity_for_7?: string
          quantity_for_8?: string
          quantity_for_9?: string
          row_order?: number
        }
        Update: {
          item_name?: string
          list_type?: Database["public"]["Enums"]["list_type"]
          notes_for_1?: string | null
          notes_for_10?: string | null
          notes_for_2?: string | null
          notes_for_3?: string | null
          notes_for_4?: string | null
          notes_for_5?: string | null
          notes_for_6?: string | null
          notes_for_7?: string | null
          notes_for_8?: string | null
          notes_for_9?: string | null
          primary_key?: string
          quantity_for_1?: string
          quantity_for_10?: string
          quantity_for_2?: string
          quantity_for_3?: string
          quantity_for_4?: string
          quantity_for_5?: string
          quantity_for_6?: string
          quantity_for_7?: string
          quantity_for_8?: string
          quantity_for_9?: string
          row_order?: number
        }
        Relationships: []
      }
      packing_slots: {
        Row: {
          is_shown: boolean
          name: string
          order: number
          primary_key: string
        }
        Insert: {
          is_shown: boolean
          name: string
          order: number
          primary_key?: string
        }
        Update: {
          is_shown?: boolean
          name?: string
          order?: number
          primary_key?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          client_id: string
          collection_centre: string | null
          collection_datetime: string | null
          created_at: string
          last_updated: string
          list_type: Database["public"]["Enums"]["list_type"]
          packing_date: string | null
          packing_slot: string | null
          primary_key: string
          voucher_number: string | null
        }
        Insert: {
          client_id: string
          collection_centre?: string | null
          collection_datetime?: string | null
          created_at?: string
          last_updated?: string
          list_type?: Database["public"]["Enums"]["list_type"]
          packing_date?: string | null
          packing_slot?: string | null
          primary_key?: string
          voucher_number?: string | null
        }
        Update: {
          client_id?: string
          collection_centre?: string | null
          collection_datetime?: string | null
          created_at?: string
          last_updated?: string
          list_type?: Database["public"]["Enums"]["list_type"]
          packing_date?: string | null
          packing_slot?: string | null
          primary_key?: string
          voucher_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_parcels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_parcels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_plus"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "public_parcels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "public_parcels_collection_centre_fkey"
            columns: ["collection_centre"]
            isOneToOne: false
            referencedRelation: "collection_centres"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_parcels_packing_slot_fkey"
            columns: ["packing_slot"]
            isOneToOne: false
            referencedRelation: "packing_slots"
            referencedColumns: ["primary_key"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          last_sign_in_at: string | null
          primary_key: string
          role: Database["public"]["Enums"]["role"]
          telephone_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          primary_key?: string
          role: Database["public"]["Enums"]["role"]
          telephone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          primary_key?: string
          role?: Database["public"]["Enums"]["role"]
          telephone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      status_order: {
        Row: {
          event_name: string
          is_successfully_completed_event: boolean
          workflow_order: number
        }
        Insert: {
          event_name: string
          is_successfully_completed_event?: boolean
          workflow_order: number
        }
        Update: {
          event_name?: string
          is_successfully_completed_event?: boolean
          workflow_order?: number
        }
        Relationships: []
      }
      website_data: {
        Row: {
          name: string
          value: string
        }
        Insert: {
          name?: string
          value?: string
        }
        Update: {
          name?: string
          value?: string
        }
        Relationships: []
      }
      wiki: {
        Row: {
          content: string
          row_order: number
          title: string
          wiki_key: string
        }
        Insert: {
          content?: string
          row_order?: number
          title?: string
          wiki_key?: string
        }
        Update: {
          content?: string
          row_order?: number
          title?: string
          wiki_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      audit_log_plus: {
        Row: {
          action: string | null
          actor_name: string | null
          actor_profile_id: string | null
          actor_role: Database["public"]["Enums"]["role"] | null
          actor_user_id: string | null
          client_id: string | null
          collection_centre_id: string | null
          content: Json | null
          created_at: string | null
          event_id: string | null
          list_id: string | null
          log_id: string | null
          packing_slot_id: string | null
          parcel_id: string | null
          primary_key: string | null
          profile_id: string | null
          status_order: string | null
          wasSuccess: boolean | null
          website_data: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_plus"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "audit_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "audit_log_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_audit_log_collection_centre_id_fkey"
            columns: ["collection_centre_id"]
            isOneToOne: false
            referencedRelation: "collection_centres"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_packing_slot_id_fkey"
            columns: ["packing_slot_id"]
            isOneToOne: false
            referencedRelation: "packing_slots"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_events"
            referencedColumns: ["parcel_id"]
          },
          {
            foreignKeyName: "public_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["parcel_id"]
          },
          {
            foreignKeyName: "public_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_audit_log_status_order_fkey"
            columns: ["status_order"]
            isOneToOne: false
            referencedRelation: "status_order"
            referencedColumns: ["event_name"]
          },
          {
            foreignKeyName: "public_audit_log_website_data_fkey"
            columns: ["website_data"]
            isOneToOne: false
            referencedRelation: "website_data"
            referencedColumns: ["name"]
          },
        ]
      }
      clients_plus: {
        Row: {
          address_postcode: string | null
          client_id: string | null
          family_count: number | null
          full_name: string | null
          is_active: boolean | null
          phone_number: string | null
        }
        Relationships: []
      }
      completed_parcels: {
        Row: {
          completed_timestamp: string | null
          family_count: number | null
          parcel_id: string | null
          pet_food: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "public_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "public_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_events"
            referencedColumns: ["parcel_id"]
          },
          {
            foreignKeyName: "public_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels_plus"
            referencedColumns: ["parcel_id"]
          },
        ]
      }
      family_count: {
        Row: {
          family_count: number | null
          family_id: string | null
        }
        Relationships: []
      }
      parcels_events: {
        Row: {
          all_events: string[] | null
          last_event_data: string | null
          last_event_name: string | null
          last_event_timestamp: string | null
          last_event_workflow_order: number | null
          parcel_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_events_new_parcel_status_fkey"
            columns: ["last_event_name"]
            isOneToOne: false
            referencedRelation: "status_order"
            referencedColumns: ["event_name"]
          },
        ]
      }
      parcels_plus: {
        Row: {
          all_events: string[] | null
          client_address_postcode: string | null
          client_delivery_instructions: string | null
          client_flagged_for_attention: boolean | null
          client_full_name: string | null
          client_id: string | null
          client_is_active: boolean | null
          client_phone_number: string | null
          client_signposting_call_required: boolean | null
          collection_centre_acronym: string | null
          collection_centre_name: string | null
          collection_datetime: string | null
          created_at: string | null
          family_count: number | null
          is_delivery: boolean | null
          last_status_event_data: string | null
          last_status_event_name: string | null
          last_status_timestamp: string | null
          last_status_workflow_order: number | null
          packing_date: string | null
          packing_slot_name: string | null
          packing_slot_order: number | null
          parcel_id: string | null
          voucher_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_events_new_parcel_status_fkey"
            columns: ["last_status_event_name"]
            isOneToOne: false
            referencedRelation: "status_order"
            referencedColumns: ["event_name"]
          },
        ]
      }
      reports: {
        Row: {
          cat: number | null
          cat_and_dog: number | null
          dog: number | null
          family_size_1: number | null
          family_size_10_plus: number | null
          family_size_2: number | null
          family_size_3: number | null
          family_size_4: number | null
          family_size_5: number | null
          family_size_6: number | null
          family_size_7: number | null
          family_size_8: number | null
          family_size_9: number | null
          total_parcels: number | null
          total_with_pets: number | null
          week_commencing: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      deactivateClient: {
        Args: {
          clientid: string
        }
        Returns: undefined
      }
      insert_client_and_family: {
        Args: {
          clientrecord: Json
          familymembers: Json
        }
        Returns: string
      }
      packing_slot_order_swap: {
        Args: {
          id1: string
          id2: string
        }
        Returns: undefined
      }
      swap_two_wiki_rows: {
        Args: {
          key1: string
          key2: string
        }
        Returns: undefined
      }
      update_client_and_family: {
        Args: {
          clientrecord: Json
          clientid: string
          familymembers: Json
        }
        Returns: Database["public"]["CompositeTypes"]["update_client_result"]
      }
      user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_is_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_is_admin_or_manager_or_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      gender: "male" | "female" | "other"
      list_type: "regular" | "hotel"
      role: "volunteer" | "admin" | "manager" | "staff"
    }
    CompositeTypes: {
      collection_timeslot_type: {
        time: string | null
        is_active: boolean | null
      }
      update_client_result: {
        clientid: string | null
        updatedrows: number | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

