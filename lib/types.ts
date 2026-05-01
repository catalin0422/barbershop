export type UserRole = "owner" | "barber";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  barber_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithRelations extends Appointment {
  barber: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  service: Pick<Service, "id" | "name" | "duration_minutes" | "price"> | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, "id" | "created_at"> & { id?: string };
        Update: Partial<Service>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<
          Appointment,
          "id" | "created_at" | "updated_at" | "end_time"
        > & {
          id?: string;
          end_time?: string;
        };
        Update: Partial<Appointment>;
      };
    };
    Functions: {
      get_available_slots: {
        Args: {
          p_barber_id: string;
          p_service_id: string;
          p_day: string;
          p_open_hour?: number;
          p_close_hour?: number;
          p_step_minutes?: number;
        };
        Returns: { slot_start: string }[];
      };
      is_owner: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
