export interface Track {
  id: string;
  path: string;
  title: string;
  artist: string;
  album: string;
  album_artist: string;
  track_number: number;
  disc_number: number;
  year: number;
  duration: number; // seconds
  format: string; // mp3, flac, wav, etc.
  bitrate: number;
  sample_rate: number;
  file_size: number; // bytes
  modified_at: string; // ISO timestamp
  is_favorite: boolean;
  has_artwork: boolean;
}

export interface AlbumInfo {
  id: string;
  title: string;
  artist: string;
  year: number;
  track_count: number;
  duration: number;
  has_artwork: boolean;
}

export interface ArtistInfo {
  id: string;
  name: string;
  album_count: number;
  track_count: number;
}

export interface PlaylistInfo {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  track_count: number;
}

export interface ScanProgress {
  scanned: number;
  found: number;
  current_file: string;
  complete: boolean;
}

export type View =
  | "library"
  | "tracks"
  | "albums"
  | "artists"
  | "playlists"
  | "playlist-detail"
  | "settings";

export interface QueueItem {
  track: Track;
  added_at: number;
}

export type SortField = "title" | "artist" | "album" | "duration" | "year" | "track_number" | "format" | "file_size";

export type SortDirection = "asc" | "desc";
