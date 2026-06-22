import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type Track, type AlbumInfo, type ArtistInfo } from "@/types/music";

interface SettingsViewProps {
  libraryPath: string | null;
  tracks: Track[];
  albums: AlbumInfo[];
  artists: ArtistInfo[];
}

export default function SettingsView({
  libraryPath,
  tracks,
  albums,
  artists,
}: SettingsViewProps) {
  const [formats, setFormats] = useState<string[]>([]);
  const [lastIndexed, setLastIndexed] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const supported = await invoke<string[]>("get_supported_formats");
        setFormats(supported);
      } catch {
        // Fallback to static list if backend unavailable
      }
      try {
        const settings = await invoke<Record<string, string>>("get_settings");
        if (settings.last_indexed) {
          const date = new Date(settings.last_indexed);
          setLastIndexed(date.toLocaleString());
        }
      } catch {
        // Ignore
      }
    }
    loadSettings();
  }, []);

  const displayFormats =
    formats.length > 0 ? formats : ["mp3", "flac", "wav", "aac", "m4a", "ogg"];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-3">
        <h1 className="text-base font-semibold text-text">Settings</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {/* Library section */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-text">Library</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-surface-raised p-4">
              <p className="text-sm text-muted">Music library path:</p>
              <p className="mt-1 text-sm text-text">
                {libraryPath ?? "No folder imported yet"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised p-4">
              <p className="text-sm text-muted">Library statistics:</p>
              <ul className="mt-2 space-y-1 text-sm text-text">
                <li>
                  <span className="text-muted">Tracks:</span>{" "}
                  {tracks.length.toLocaleString()}
                </li>
                <li>
                  <span className="text-muted">Albums:</span>{" "}
                  {albums.length.toLocaleString()}
                </li>
                <li>
                  <span className="text-muted">Artists:</span>{" "}
                  {artists.length.toLocaleString()}
                </li>
                <li>
                  <span className="text-muted">Total duration:</span>{" "}
                  {formatTotalDuration(
                    tracks.reduce((sum, t) => sum + t.duration, 0),
                  )}
                </li>
              </ul>
            </div>
            {lastIndexed && (
              <div className="rounded-lg border border-border bg-surface-raised p-4">
                <p className="text-sm text-muted">Last indexed:</p>
                <p className="mt-1 text-sm text-text">{lastIndexed}</p>
              </div>
            )}
          </div>
        </section>

        {/* Supported formats section */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-text">
            Supported formats
          </h2>
          <div className="flex flex-wrap gap-2">
            {displayFormats.map((fmt) => (
              <span
                key={fmt}
                className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
        </section>

        {/* About section */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-text">About</h2>
          <div className="rounded-lg border border-border bg-surface-raised p-4 text-sm text-muted leading-relaxed">
            <p>
              <strong className="text-text">OpenTone</strong> — offline-first
              personal music library and desktop player for music you own.
            </p>
            <p className="mt-2">
              <strong className="text-text">Version:</strong> 0.3.1
            </p>
            <p className="mt-2 italic text-muted/60">
              OpenTone does not provide music. It helps you organize and play
              music you already own.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
