import type { AuditEntry, DailyTraffic, ExecutiveAccount, ExecutiveRole, LinkResolution, LinkSettings, ShortLink } from './short-links';

export type Profile = {
  id: string; full_name: string; preferred_name: string | null; avatar_url: string | null;
  github_url: string | null; primary_stacks: string[] | null; portfolio_link: string | null;
  social_link: string | null; total_points: number; role: 'member' | 'admin';
  onboarding_status: 'pending' | 'completed' | null; created_at: string;
};
export type ProfileUpdate = Partial<Pick<Profile, 'full_name' | 'preferred_name' | 'primary_stacks' | 'portfolio_link' | 'social_link' | 'github_url' | 'onboarding_status'>>;
type Relation<Row, Insert = never, Update = never> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };
export type Database = {
  public: {
    Tables: {
      users: Relation<Profile, never, ProfileUpdate>;
      executive_access: Relation<{ id: string; user_id: string; role: ExecutiveRole; granted_by: string | null; created_at: string }>;
      executive_audit: Relation<AuditEntry>;
      short_link_daily: Relation<DailyTraffic>;
      short_links: Relation<ShortLink, LinkSettings & { slug: string; created_by: string }, Partial<LinkSettings> & { is_active?: boolean; archived_at?: string | null }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      search_executive_accounts: { Args: { search_email?: string }; Returns: ExecutiveAccount[] };
      set_executive_access: { Args: { account_ids: string[]; grant_access: boolean }; Returns: undefined };
      resolve_short_link: { Args: { link_slug: string; request_kind: string }; Returns: LinkResolution };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
