interface SettingsViewProps {
  libraryPath: string | null;
}

export default function SettingsView({ libraryPath }: SettingsViewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-3">
        <h1 className="text-base font-semibold text-text">Settings</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-text">Library</h2>
          <div className="rounded-lg border border-border bg-surface-raised p-4">
            <p className="text-sm text-muted">Music library path:</p>
            <p className="mt-1 text-sm text-text">
              {libraryPath ?? "No folder imported yet"}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-text">Supported formats</h2>
          <div className="flex flex-wrap gap-2">
            {["MP3", "FLAC", "WAV", "AAC", "M4A", "OGG"].map((fmt) => (
              <span
                key={fmt}
                className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-text">About</h2>
          <div className="rounded-lg border border-border bg-surface-raised p-4 text-sm text-muted leading-relaxed">
            <p>
              <strong className="text-text">OpenTone</strong> — offline-first personal music library
              and desktop player for music you own.
            </p>
            <p className="mt-2">
              <strong className="text-text">Version:</strong> 0.1.0-alpha
            </p>
            <p className="mt-2 italic text-muted/60">
              OpenTone does not provide music. It helps you organize and play music you already own.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
