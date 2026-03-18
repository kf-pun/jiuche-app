// =============================================
// 揪車 JiuChe — Database Types
// =============================================

// --- Row types (資料庫回傳) ---

export interface UserRow {
  id: string
  phone: string
  name: string
  company: string
  is_driver: boolean
  vehicle_type: string | null
  vehicle_plate: string | null
  vehicle_color: string | null
  avatar_url: string | null
  balance: number
  co2_total: number
  rating: number
  rating_count: number
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
}

export interface RideRow {
  id: string
  driver_id: string
  from_location: string
  to_location: string
  departure_time: string
  price: number
  total_seats: number
  available_seats: number
  is_recurring: boolean
  recurring_days: string[] | null
  co2_saved: number
  meeting_point: string | null
  notes: string | null
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
}

export interface BookingRow {
  id: string
  ride_id: string
  passenger_id: string
  seats: number
  total_price: number
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

export interface ReviewRow {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  tags: string[] | null
  comment: string | null
  created_at: string
}

export interface WalletTransactionRow {
  id: string
  user_id: string
  type: 'topup' | 'payment' | 'refund' | 'earning'
  amount: number
  description: string
  reference_id: string | null
  created_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  type: 'booking_confirmed' | 'ride_reminder' | 'payment' | 'review' | 'esg' | 'system'
  title: string
  body: string
  is_read: boolean
  reference_id: string | null
  created_at: string
}

// --- Insert types (寫入時，id 和 created_at 選填) ---

export type UserInsert = Omit<UserRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
export type RideInsert = Omit<RideRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
export type BookingInsert = Omit<BookingRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
export type ReviewInsert = Omit<ReviewRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
export type WalletTransactionInsert = Omit<WalletTransactionRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
export type NotificationInsert = Omit<NotificationRow, 'id' | 'created_at'> & { id?: string; created_at?: string }

// --- Update types (所有欄位皆選填) ---

export type UserUpdate = Partial<UserInsert>
export type RideUpdate = Partial<RideInsert>
export type BookingUpdate = Partial<BookingInsert>
export type ReviewUpdate = Partial<ReviewInsert>
export type WalletTransactionUpdate = Partial<WalletTransactionInsert>
export type NotificationUpdate = Partial<NotificationInsert>

// --- Database 型別（給 Supabase createClient 用）---

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
        Relationships: []
      }
      rides: {
        Row: RideRow
        Insert: RideInsert
        Update: RideUpdate
        Relationships: []
      }
      bookings: {
        Row: BookingRow
        Insert: BookingInsert
        Update: BookingUpdate
        Relationships: []
      }
      reviews: {
        Row: ReviewRow
        Insert: ReviewInsert
        Update: ReviewUpdate
        Relationships: []
      }
      wallet_transactions: {
        Row: WalletTransactionRow
        Insert: WalletTransactionInsert
        Update: WalletTransactionUpdate
        Relationships: []
      }
      notifications: {
        Row: NotificationRow
        Insert: NotificationInsert
        Update: NotificationUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// --- JOIN 常用型別 ---

export type RideWithDriver = RideRow & {
  driver: Pick<UserRow, 'id' | 'name' | 'rating' | 'rating_count' | 'avatar_url' | 'vehicle_type' | 'vehicle_color'>
}

export type BookingWithRide = BookingRow & {
  ride: RideWithDriver
}
