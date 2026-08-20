export type UserRole = 'admin' | 'operator';

export interface OrganizationPivot {
  role: 'ADMIN' | 'OPERATOR';
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  invite_code?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  songs_count?: number;
  setlists_count?: number;
  users_count?: number;
  pivot?: OrganizationPivot;
}

export interface OrganizationMember {
  id: number;
  name: string;
  email: string;
  created_at: string;
  pivot: OrganizationPivot;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizations?: Organization[];
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServerStatsSummary {
  total_organizations: number;
  total_users: number;
  total_songs: number;
  total_setlists: number;
}

export interface ServerStats {
  summary: ServerStatsSummary;
  organizations: Organization[];
}

export interface LyricChunk {
  id: number;
  label: string;
  content: string;
  order: number;
}

export interface Song {
  id: number;
  organization_id?: number;
  title: string;
  artist: string;
  lyrics_raw?: string;
  lyrics: LyricChunk[];
  created_at?: string;
  updated_at?: string;
}

export interface SetlistItem {
  id: number;
  type: 'song' | 'announcement';
  song_id?: number;
  song_title?: string;
  artist?: string;
  content?: string;
  order: number;
}

export interface Setlist {
  id: number;
  organization_id?: number;
  name: string;
  items: SetlistItem[];
  created_at?: string;
  updated_at?: string;
}

export type LiveContentType = 'lyric' | 'announcement' | 'clear';

export interface LiveState {
  type: LiveContentType;
  content: string | null;
  song_id: number | null;
  song_title?: string | null;
  lyric_chunk_id: number | null;
  label?: string | null;
  updated_at?: string;
}

export interface WsMessage {
  type: 'display:update' | 'display:clear' | 'INIT_STATE';
  payload: LiveState;
}
