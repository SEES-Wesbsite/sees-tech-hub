// Only the active application schema is exposed here. Historical tables remain intact.
export type Profile = {
  id: string;
  full_name: string;
  preferred_name: string | null;
  avatar_url: string | null;
  github_url: string | null;
  primary_stacks: string[] | null;
  portfolio_link: string | null;
  social_link: string | null;
  total_points: number;
  role: 'member' | 'admin';
  onboarding_status: 'pending' | 'completed' | null;
  created_at: string;
};

export type ProfileUpdate = Partial<Pick<Profile,
  'full_name' | 'preferred_name' | 'primary_stacks' | 'portfolio_link' |
  'social_link' | 'github_url' | 'onboarding_status'
>>;

export type Database = {
  public: {
    Tables: {
      users: { Row: Profile; Insert: never; Update: ProfileUpdate; Relationships: [] };
      short_links: {
        Row: {
          id: string; slug: string; destination_url: string; description: string | null;
          clicks: number; created_by: string | null; is_active: boolean; created_at: string;
        };
        Insert: {
          slug: string; destination_url: string; description?: string | null;
          created_by?: string | null;
        };
        Update: { clicks?: number; is_active?: boolean };
        Relationships: [{
          foreignKeyName: 'short_links_created_by_fkey';
          columns: ['created_by']; isOneToOne: false;
          referencedRelation: 'users'; referencedColumns: ['id'];
        }];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
