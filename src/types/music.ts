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
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  track_count: number;
  duration: number;
  cover_path: string | null;
}

export interface Artist {
  id: string;
  name: string;
  album_count: number;
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
  | "settings";

export interface QueueItem {
  track: Track;
  added_at: number;
}
