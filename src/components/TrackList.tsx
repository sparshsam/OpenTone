import { useState, useMemo, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  type Track,
  type SortField,
  type SortDirection,
} from "@/types/music";

interface TrackListProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  searchQuery: string;
  onToggleFavorite: (trackId: string) => void;
  showAddToPlaylist?: boolean;
  onAddToPlaylist?: (track: Track) => void;
  onRemoveFromPlaylist?: (trackId: string) => void;
  showRemoveFromPlaylist?: boolean;
}

interface ColumnDef {
  key: SortField | "actions";
  label: string;
  sortable: boolean;
  className: string;
}

const columns: ColumnDef[] = [
  { key: "track_number", label: "#", sortable: true, className: "w-10 px-2 py-2 text-center" },
  { key: "title", label: "Title", sortable: true, className: "px-2 py-2" },
  { key: "artist", label: "Artist", sortable: true, className: "px-2 py-2" },
  { key: "album", label: "Album", sortable: true, className: "px-2 py-2" },
  { key: "duration", label: "Duration", sortable: true, className: "w-20 px-2 py-2 text-right" },
  { key: "year", label: "Year", sortable: true, className: "w-16 px-2 py-2 text-right" },
  { key: "format", label: "Format", sortable: true, className: "w-16 px-2 py-2 text-center" },
  { key: "file_size", label: "Size", sortable: true, className: "w-20 px-3 py-2 text-right" },
  { key: "actions", label: "", sortable: false, className: "w-12 px-2 py-2 text-right" },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TrackRowProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isCurrentlyPlaying: boolean;
  onPlay: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  artworkCache: Record<string, string>;
  showAddToPlaylist?: boolean;
  onAddToPlaylist?: (track: Track) => void;
  showRemoveFromPlaylist?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
}

function TrackRow({
  track,
  index,
  isCurrent,
  isCurrentlyPlaying,
  onPlay,
  onToggleFavorite,
  artworkCache,
  showAddToPlaylist,
  onAddToPlaylist,
  showRemoveFromPlaylist,
  onRemoveFromPlaylist,
}: TrackRowProps) {
  const artworkUri = track.has_artwork ? artworkCache[track.id] : null;

  return (
    <tr
      onClick={() => onPlay(track)}
      className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-surface-raised ${
        isCurrent ? "bg-accent/5" : ""
      }`}
    >
      <td className="w-10 px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {isCurrent && isCurrentlyPlaying ? (
            <span className="text-accent animate-pulse">♫</span>
          ) : (
            <span className="text-muted">{index + 1}</span>
          )}
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-surface-hover">
            {artworkUri ? (
              <img
                src={artworkUri}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] text-muted">♪</span>
            )}
          </div>
          <span
            className={`max-w-[240px] truncate font-medium ${
              isCurrent ? "text-accent" : "text-text"
            }`}
          >
            {track.title}
          </span>
        </div>
      </td>
      <td className="max-w-[160px] truncate px-2 py-2 text-muted">
        {track.artist}
      </td>
      <td className="max-w-[160px] truncate px-2 py-2 text-muted">
        {track.album}
      </td>
      <td className="w-20 px-2 py-2 text-right text-muted tabular-nums">
        {formatDuration(track.duration)}
      </td>
      <td className="w-16 px-2 py-2 text-right text-muted tabular-nums">
        {track.year > 0 ? track.year : "—"}
      </td>
      <td className="w-16 px-2 py-2 text-center text-muted">
        {track.format.toUpperCase()}
      </td>
      <td className="w-20 px-3 py-2 text-right text-muted tabular-nums">
        <div className="flex items-center justify-end gap-2">
          <span>{formatSize(track.file_size)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track.id);
            }}
            className={`text-sm transition-colors ${
              track.is_favorite
                ? "text-accent"
                : "text-muted/30 hover:text-muted"
            }`}
            title={track.is_favorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={track.is_favorite ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`}
          >
            {track.is_favorite ? "★" : "☆"}
          </button>
        </div>
      </td>
      {showAddToPlaylist && onAddToPlaylist && (
        <td className="w-10 px-2 py-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(track);
            }}
            aria-label={`Add ${track.title} to playlist`}
            className="text-xs text-muted transition-colors hover:text-accent"
            title="Add to playlist"
          >
            +
          </button>
        </td>
      )}
      {showRemoveFromPlaylist && onRemoveFromPlaylist && (
        <td className="w-10 px-2 py-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromPlaylist(track.id);
            }}
            aria-label={`Remove ${track.title} from playlist`}
            className="text-xs text-muted transition-colors hover:text-red-400"
            title="Remove from playlist"
          >
            ✕
          </button>
        </td>
      )}
    </tr>
  );
}

export default function TrackList({
  tracks,
  onPlay,
  currentTrackId,
  isPlaying,
  searchQuery,
  onToggleFavorite,
  showAddToPlaylist,
  onAddToPlaylist,
  showRemoveFromPlaylist,
  onRemoveFromPlaylist,
}: TrackListProps) {
  const [sortField, setSortField] = useState<SortField>("track_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [artworkCache, setArtworkCache] = useState<Record<string, string>>({});

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection(field === "track_number" ? "asc" : "asc");
      }
    },
    [sortField],
  );

  // Load artwork in parallel with a single batched state update
  const loadVisibleArtwork = useCallback(
    async (tracks: Track[]) => {
      const needed = tracks.filter(
        (t) => t.has_artwork && !artworkCache[t.id]
      );
      if (needed.length === 0) return;
      const results = await Promise.all(
        needed.map(async (track) => {
          try {
            const dataUri = await invoke<string | null>("get_album_artwork", {
              trackId: track.id,
            });
            return dataUri ? { id: track.id, uri: dataUri } : null;
          } catch {
            return null;
          }
        })
      );
      const batch: Record<string, string> = {};
      for (const r of results) {
        if (r) batch[r.id] = r.uri;
      }
      if (Object.keys(batch).length > 0) {
        setArtworkCache((prev) => ({ ...prev, ...batch }));
      }
    },
    [artworkCache],
  );

  const filtered = useMemo(() => {
    if (!searchQuery) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q),
    );
  }, [tracks, searchQuery]);

  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    sortedList.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "artist":
          cmp = a.artist.localeCompare(b.artist);
          break;
        case "album":
          cmp = a.album.localeCompare(b.album);
          break;
        case "duration":
          cmp = a.duration - b.duration;
          break;
        case "year":
          cmp = a.year - b.year;
          break;
        case "track_number":
          cmp = a.track_number - b.track_number;
          break;
        case "format":
          cmp = a.format.localeCompare(b.format);
          break;
        case "file_size":
          cmp = a.file_size - b.file_size;
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sortedList;
  }, [filtered, sortField, sortDirection]);

  // Trigger artwork loading for visible tracks in parallel
  loadVisibleArtwork(sorted.slice(0, 100));

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted">
          {searchQuery
            ? "No tracks match your search."
            : "No tracks yet. Import a folder to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.className} font-medium ${
                  col.sortable ? "cursor-pointer select-none hover:text-subtle" : ""
                }`}
                aria-sort={col.sortable && sortField === col.key ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
                aria-label={col.sortable ? `Sort by ${col.label}` : undefined}
                onClick={() => col.sortable && handleSort(col.key as SortField)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortField === col.key && (
                    <span className="text-accent text-[10px]">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              index={filtered.indexOf(track)}
              isCurrent={currentTrackId === track.id}
              isCurrentlyPlaying={currentTrackId === track.id && isPlaying}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              artworkCache={artworkCache}
              showAddToPlaylist={showAddToPlaylist}
              onAddToPlaylist={onAddToPlaylist}
              showRemoveFromPlaylist={showRemoveFromPlaylist}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
