import { useState, useCallback, useRef, useEffect } from "react";
import { type Track, type View } from "@/types/music";
import Sidebar from "@/components/Sidebar";
import LibraryView from "@/components/LibraryView";
import SettingsView from "@/components/SettingsView";
import PlaybackBar from "@/components/PlaybackBar";

// Mock tracks for development before Tauri backend is connected
const MOCK_TRACKS: Track[] = [
  {
    id: "1", path: "/music/song1.flac", title: "Midnight Waves",
    artist: "Luna Drift", album: "Coastal", album_artist: "Luna Drift",
    track_number: 1, disc_number: 1, year: 2024, duration: 245,
    format: "flac", bitrate: 1411, sample_rate: 44100,
    file_size: 42_500_000, modified_at: "2024-06-01T10:00:00Z", is_favorite: false,
  },
  {
    id: "2", path: "/music/song2.mp3", title: "Golden Hour",
    artist: "Solstice", album: "Dawn", album_artist: "Solstice",
    track_number: 1, disc_number: 1, year: 2023, duration: 198,
    format: "mp3", bitrate: 320, sample_rate: 44100,
    file_size: 7_920_000, modified_at: "2023-11-15T14:30:00Z", is_favorite: false,
  },
  {
    id: "3", path: "/music/song3.wav", title: "Silicon Dreams",
    artist: "Neon Pulse", album: "Binary Romance", album_artist: "Neon Pulse",
    track_number: 3, disc_number: 1, year: 2025, duration: 312,
    format: "wav", bitrate: 2116, sample_rate: 96000,
    file_size: 80_580_000, modified_at: "2025-01-20T09:15:00Z", is_favorite: true,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>("library");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [libraryPath, setLibraryPath] = useState<string | null>(null);

  // Playback state
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = queueIndex >= 0 && queueIndex < queue.length ? queue[queueIndex]! : null;

  // Set up audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      // Auto-advance to next track
      setQueueIndex((prev) => {
        const next = prev + 1;
        if (next < queue.length) {
          // Will be handled by the queueIndex effect
          return next;
        }
        setIsPlaying(false);
        return prev;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Load track when queue index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // For now, load a silent placeholder — real Tauri backend
    // will provide the actual file path via asset protocol
    audio.src = currentTrack.path;
    if (isPlaying) {
      audio.play().catch(() => {
        // Playback may fail without proper audio backend
        console.warn("Playback unavailable — audio backend may not be connected");
      });
    }
  }, [queueIndex, currentTrack?.id]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    setQueueIndex((prev) => Math.min(prev + 1, queue.length - 1));
  }, [queue]);

  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      // Restart current track if past 3 seconds
      audio.currentTime = 0;
      return;
    }
    setQueueIndex((prev) => Math.max(prev - 1, 0));
  }, [queue]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      // If track is already in queue at current position, resume
      if (currentTrack?.id === track.id) {
        if (isPlaying) return;
        setIsPlaying(true);
        return;
      }

      // Check if track is already queued
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx);
        setIsPlaying(true);
        return;
      }

      // Add to queue and play
      setQueue((prev) => [...prev, track]);
      setQueueIndex(queue.length);
      setIsPlaying(true);
    },
    [queue, currentTrack, isPlaying],
  );

  const handleImport = useCallback(async () => {
    // For MVP, load mock tracks as a demo
    if (tracks.length === 0) {
      setIsScanning(true);
      // Simulate scan delay
      await new Promise((r) => setTimeout(r, 500));
      setTracks(MOCK_TRACKS);
      setQueue(MOCK_TRACKS);
      setLibraryPath("/home/user/Music");
      setIsScanning(false);
    }
  }, [tracks]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          trackCount={tracks.length}
        />

        {currentView === "settings" ? (
          <SettingsView libraryPath={libraryPath} />
        ) : (
          <LibraryView
            tracks={tracks}
            onPlay={handlePlayTrack}
            onImport={handleImport}
            currentTrackId={currentTrack?.id ?? null}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            view={currentView}
            isScanning={isScanning}
          />
        )}
      </div>

      <PlaybackBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={currentTrack?.duration ?? 0}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
      />
    </div>
  );
}
