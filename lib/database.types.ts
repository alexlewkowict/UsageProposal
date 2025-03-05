export interface Database {
  public: {
    Tables: {
      'Salesforce Data': {
        Row: {
          opportunity_owner: string
          close_month: string
          account_name: string
          shiphero_account_id: string
          stage: string
          age: number
          amount: number
          close_date: string
          created_date: string
          opportunity_name: string
          account_type: string
          opportunity_id: string
        }
        Insert: {
          opportunity_owner: string
          close_month?: string
          account_name: string
          shiphero_account_id?: string
          stage: string
          age?: number
          amount?: number
          close_date?: string
          created_date?: string
          opportunity_name: string
          account_type?: string
          opportunity_id: string
        }
        Update: {
          opportunity_owner?: string
          close_month?: string
          account_name?: string
          shiphero_account_id?: string
          stage?: string
          age?: number
          amount?: number
          close_date?: string
          created_date?: string
          opportunity_name?: string
          account_type?: string
          opportunity_id?: string
        }
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
  }
} 