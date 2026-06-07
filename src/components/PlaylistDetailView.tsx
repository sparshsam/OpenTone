import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type Track, type PlaylistInfo } from "@/types/music";
import TrackList from "./TrackList";

interface PlaylistDetailViewProps {
  playlist: PlaylistInfo;
  onPlay: (track: Track) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  onToggleFavorite: (trackId: string) => void;
  onBack: () => void;
  onPlaylistChanged: () => void;
}

export default function PlaylistDetailView({
  playlist,
  onPlay,
  currentTrackId,
  isPlaying,
  onToggleFavorite,
  onBack,
  onPlaylistChanged,
}: PlaylistDetailViewProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke<Track[]>("get_playlist_tracks", {
        playlistId: playlist.id,
      });
      setTracks(result);
    } catch (err) {
      setError(String(err));
      console.error("Failed to load playlist tracks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [playlist.id]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const handleRemoveFromPlaylist = useCallback(
    async (trackId: string) => {
      try {
        await invoke("remove_from_playlist", {
          playlistId: playlist.id,
          trackId,
        });
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
        onPlaylistChanged();
      } catch (err) {
        console.error("Failed to remove track from playlist:", err);
      }
    },
    [playlist.id, onPlaylistChanged],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:text-text"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-base font-semibold text-text">{playlist.name}</h1>
          <p className="text-xs text-muted">
            {playlist.track_count} track{playlist.track_count === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-red-400">Failed to load tracks: {error}</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="text-sm text-muted">This playlist is empty.</p>
            <p className="mt-1 text-xs text-muted/60">
              Add tracks from your library or album view.
            </p>
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            onPlay={onPlay}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            searchQuery=""
            onToggleFavorite={onToggleFavorite}
            showRemoveFromPlaylist={true}
            onRemoveFromPlaylist={handleRemoveFromPlaylist}
          />
        )}
      </div>
    </div>
  );
}
