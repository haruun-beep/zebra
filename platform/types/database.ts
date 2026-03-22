export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "technician";
          company_id: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "technician";
          company_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: "admin" | "technician";
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          tax_rate: number;
          payment_terms: number;
          invoice_notes: string | null;
          stripe_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          tax_rate?: number;
          payment_terms?: number;
          invoice_notes?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          tax_rate?: number;
          payment_terms?: number;
          invoice_notes?: string | null;
          stripe_account_id?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          company_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          notes: string | null;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          company_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          notes?: string | null;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          company_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          notes?: string | null;
          archived?: boolean;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          assigned_to: string | null;
          title: string;
          description: string | null;
          status: "scheduled" | "in_progress" | "complete" | "cancelled";
          scheduled_date: string | null;
          scheduled_time: string | null;
          duration_minutes: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          status?: "scheduled" | "in_progress" | "complete" | "cancelled";
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          status?: "scheduled" | "in_progress" | "complete" | "cancelled";
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          duration_minutes?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      job_photos: {
        Row: {
          id: string;
          job_id: string;
          url: string;
          caption: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          url: string;
          caption?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          caption?: string | null;
        };
      };
      quotes: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          quote_number: string;
          status: "draft" | "sent" | "approved" | "rejected" | "converted";
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          notes: string | null;
          valid_until: string | null;
          approval_token: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          quote_number?: string;
          status?: "draft" | "sent" | "approved" | "rejected" | "converted";
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          notes?: string | null;
          valid_until?: string | null;
          approval_token?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "draft" | "sent" | "approved" | "rejected" | "converted";
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          notes?: string | null;
          valid_until?: string | null;
          approved_at?: string | null;
          updated_at?: string;
        };
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          quote_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total?: number;
          sort_order?: number;
        };
        Update: {
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          sort_order?: number;
        };
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          job_id: string | null;
          invoice_number: string;
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          amount_paid: number;
          notes: string | null;
          due_date: string | null;
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          stripe_payment_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          job_id?: string | null;
          invoice_number?: string;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          amount_paid?: number;
          notes?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_payment_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          amount_paid?: number;
          notes?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_payment_link?: string | null;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total?: number;
          sort_order?: number;
        };
        Update: {
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          sort_order?: number;
        };
      };
      invitations: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          role: "admin" | "technician";
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          email: string;
          role: "admin" | "technician";
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          accepted_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_quote_number: {
        Args: { p_company_id: string };
        Returns: string;
      };
      next_invoice_number: {
        Args: { p_company_id: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: "admin" | "technician";
      job_status: "scheduled" | "in_progress" | "complete" | "cancelled";
      quote_status: "draft" | "sent" | "approved" | "rejected" | "converted";
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    };
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobPhoto = Database["public"]["Tables"]["job_photos"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type QuoteItem = Database["public"]["Tables"]["quote_items"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

export type JobStatus = Database["public"]["Enums"]["job_status"];
export type QuoteStatus = Database["public"]["Enums"]["quote_status"];
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];

// Extended types with joins
export type JobWithClient = Job & { client: Client };
export type QuoteWithItems = Quote & { items: QuoteItem[]; client: Client };
export type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
  client: Client;
  job: Job | null;
};
