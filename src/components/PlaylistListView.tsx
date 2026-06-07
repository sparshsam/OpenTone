import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type PlaylistInfo } from "@/types/music";

interface PlaylistListViewProps {
  playlists: PlaylistInfo[];
  onPlaylistClick: (id: string) => void;
  onPlaylistsChanged: () => void;
  activePlaylistId: string | null;
}

export default function PlaylistListView({
  playlists,
  onPlaylistClick,
  onPlaylistsChanged,
  activePlaylistId,
}: PlaylistListViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await invoke("create_playlist", { name });
      setNewName("");
      setIsCreating(false);
      onPlaylistsChanged();
    } catch (err) {
      console.error("Failed to create playlist:", err);
    }
  };

  const handleRename = async (playlistId: string) => {
    const name = renameValue.trim();
    if (!name) return;
    try {
      await invoke("rename_playlist", { playlistId, name });
      setRenamingId(null);
      onPlaylistsChanged();
    } catch (err) {
      console.error("Failed to rename playlist:", err);
    }
  };

  const handleDelete = async (playlistId: string, name: string) => {
    if (!confirm(`Delete playlist "${name}"?`)) return;
    try {
      await invoke("delete_playlist", { playlistId });
      onPlaylistsChanged();
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  };

  const startRename = (pl: PlaylistInfo) => {
    setRenamingId(pl.id);
    setRenameValue(pl.name);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-base font-semibold text-text">Playlists</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        >
          + New
        </button>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="border-b border-border px-6 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Playlist name…"
              autoFocus
              className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-sm text-text placeholder-muted/50 outline-none focus:border-accent"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => { setIsCreating(false); setNewName(""); }}
              className="rounded-lg bg-surface-hover px-3 py-1.5 text-xs text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {playlists.length === 0 && !isCreating ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="text-sm text-muted">No playlists yet.</p>
            <p className="mt-1 text-xs text-muted/60">
              Create a playlist to organize your music.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-surface-raised/50 ${
                  activePlaylistId === pl.id ? "bg-accent/5" : ""
                }`}
              >
                {/* Playlist icon + info */}
                <div
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                  onClick={() => onPlaylistClick(pl.id)}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-hover text-muted">
                    ♫
                  </div>
                  <div className="min-w-0 flex-1">
                    {renamingId === pl.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(pl.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                          className="flex-1 rounded border border-border bg-surface-raised px-2 py-0.5 text-sm text-text outline-none focus:border-accent"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRename(pl.id); }}
                          className="text-xs text-accent"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="truncate text-sm font-medium text-text">
                          {pl.name}
                        </h3>
                        <p className="text-xs text-muted">
                          {pl.track_count} track{pl.track_count === 1 ? "" : "s"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {renamingId !== pl.id && (
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(pl); }}
                      className="rounded px-2 py-1 text-xs text-muted transition-colors hover:text-text"
                      title="Rename"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(pl.id, pl.name); }}
                      className="rounded px-2 py-1 text-xs text-muted transition-colors hover:text-red-400"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
