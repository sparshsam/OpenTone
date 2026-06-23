import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type PlaylistInfo } from "@/types/music";

interface AddToPlaylistModalProps {
  trackId: string;
  trackTitle: string;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddToPlaylistModal({
  trackId,
  trackTitle,
  onClose,
  onAdded,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await invoke<PlaylistInfo[]>("get_playlists");
        setPlaylists(result);
      } catch (err) {
        setError(String(err));
      }
    }
    load();
  }, []);

  const handleAdd = async (playlistId: string) => {
    setAdding(playlistId);
    setError(null);
    try {
      await invoke("add_to_playlist", { playlistId, trackId });
      onAdded();
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setAdding(null);
    }
  };

   return (
     <div
       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
       role="dialog"
       aria-modal="true"
       aria-label="Add to playlist"
       onClick={onClose}
     >
      <div
        className="w-80 rounded-xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">Add to playlist</h2>
          <p className="mt-0.5 truncate text-xs text-muted">{trackTitle}</p>
        </div>

        <div className="max-h-60 overflow-auto px-2 py-2">
          {error && (
            <p className="px-2 py-1 text-xs text-red-400">{error}</p>
          )}
          {playlists.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted">
              No playlists yet. Create one first.
            </p>
          ) : (
            playlists.map((pl) => (
               <button type="button" key={pl.id}
                 onClick={() => handleAdd(pl.id)}
                 disabled={adding === pl.id}
                 aria-label={`Add to ${pl.name}`}
                 className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-raised disabled:opacity-50"
               >
                <span className="text-muted">♪</span>
                <span className="flex-1 truncate">{pl.name}</span>
                <span className="text-xs text-muted">{pl.track_count}</span>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border px-4 py-2 text-right">
         <button type="button" onClick={onClose}
           aria-label="Cancel"
           className="rounded-lg px-3 py-1.5 text-xs text-muted hover:text-text"
         >
           Cancel
         </button>
        </div>
      </div>
    </div>
  );
}
