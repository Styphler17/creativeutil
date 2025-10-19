import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Loader2, Music2, Pause, Play, Scissors, Upload } from "lucide-react";

type OutputFormat = "mp3" | "wav" | "aac" | "ogg" | "flac";

const SUPPORTED_FORMATS: OutputFormat[] = ["mp3", "wav", "aac", "ogg", "flac"];

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const secs = String(safe % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
};

const trimAudioBuffer = (buffer: AudioBuffer, start: number, end: number) => {
  const sampleRate = buffer.sampleRate;
  const safeStartSample = Math.floor(Math.max(0, start) * sampleRate);
  const safeEndSample = Math.floor(Math.min(buffer.duration, end) * sampleRate);
  const frameCount = Math.max(0, safeEndSample - safeStartSample);

  const trimmed = new AudioBuffer({
    length: frameCount,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate,
  });

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const sourceData = buffer.getChannelData(channel).subarray(safeStartSample, safeEndSample);
    trimmed.copyToChannel(sourceData, channel, 0);
  }

  return trimmed;
};

const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const { numberOfChannels, length, sampleRate } = buffer;
  const bytesPerSample = 2;
  const blockAlign = numberOfChannels * bytesPerSample;
  const bufferLength = 44 + length * blockAlign;
  const data = new ArrayBuffer(bufferLength);
  const view = new DataView(data);
  let offset = 0;

  const writeString = (value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
    offset += value.length;
  };

  const writeUint32 = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };

  const writeUint16 = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };

  writeString("RIFF");
  writeUint32(bufferLength - 8);
  writeString("WAVE");
  writeString("fmt ");
  writeUint32(16);
  writeUint16(1);
  writeUint16(numberOfChannels);
  writeUint32(sampleRate);
  writeUint32(sampleRate * blockAlign);
  writeUint16(blockAlign);
  writeUint16(bytesPerSample * 8);
  writeString("data");
  writeUint32(length * blockAlign);

  const channelData = Array.from({ length: numberOfChannels }, (_, channel) => buffer.getChannelData(channel));
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return data;
};

export const AudioCutterConverter: React.FC = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimeout = useRef<number | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [trackDuration, setTrackDuration] = useState<number>(0);
  const [trimRange, setTrimRange] = useState<number[]>([0, 0]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mp3");
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const trimmedLength = useMemo(() => {
    const safeStart = Math.max(0, trimRange[0]);
    const safeEnd = Math.max(0, Math.min(trackDuration, trimRange[1]));
    return Math.max(0, safeEnd - safeStart);
  }, [trackDuration, trimRange]);

  const appendLog = (message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 14));
  };

  const cleanupUrls = React.useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [audioUrl, previewUrl]);

  useEffect(() => () => cleanupUrls(), [cleanupUrls]);

  useEffect(
    () => () => {
      if (playbackTimeout.current) {
        window.clearTimeout(playbackTimeout.current);
        playbackTimeout.current = null;
      }
      audioRef.current?.pause();
    },
    [],
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = previewUrl ?? audioUrl ?? "";
    }
  }, [audioUrl, previewUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    cleanupUrls();
    setAudioFile(file);
    setPreviewUrl(null);
    setLogs([]);
    setIsDecoding(true);

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      setAudioBuffer(buffer);
      setTrackDuration(buffer.duration);
      setTrimRange([0, Math.min(30, buffer.duration)]);
      appendLog(`Loaded ${file.name} (${audioContext.sampleRate}hz, ${buffer.numberOfChannels} channels)`);
      await audioContext.close();
      toast({ title: "Audio file loaded", description: `${file.name} is ready to trim and convert.` });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to read audio",
        description: "Try a different file or format.",
        variant: "destructive",
      });
      setAudioFile(null);
      setAudioUrl(null);
      setAudioBuffer(null);
      setTrackDuration(0);
      setTrimRange([0, 0]);
    } finally {
      setIsDecoding(false);
    }
  };

  const stopPlayback = () => {
    if (playbackTimeout.current) {
      window.clearTimeout(playbackTimeout.current);
      playbackTimeout.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = previewUrl ? 0 : Math.max(0, trimRange[0]);
    }
    setIsPlaying(false);
  };

  const handlePlayTrim = () => {
    if (!audioRef.current || (!previewUrl && !audioUrl)) {
      toast({
        title: "Nothing to preview",
        description: "Upload and trim audio before previewing.",
        variant: "destructive",
      });
      return;
    }

    stopPlayback();

    const audioElement = audioRef.current;
    const source = previewUrl ?? audioUrl!;
    if (audioElement.src !== source) {
      audioElement.src = source;
    }

    const startAt = previewUrl ? 0 : Math.max(0, trimRange[0]);
    audioElement.currentTime = startAt;
    audioElement
      .play()
      .then(() => {
        setIsPlaying(true);
        const duration = previewUrl ? audioElement.duration : trimmedLength;
        playbackTimeout.current = window.setTimeout(() => {
          stopPlayback();
        }, Math.max(0, duration) * 1000);
      })
      .catch(() => {
        toast({
          title: "Playback blocked",
          description: "Interact with the page (e.g., click) before playing audio.",
          variant: "destructive",
        });
      });
  };

  const handleProcessAudio = async () => {
    if (!audioFile || !audioBuffer) {
      toast({
        title: "Upload an audio file first",
        description: "Choose a file to cut and convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    appendLog("Preparing trimmed preview…");

    try {
      const trimmed = trimAudioBuffer(audioBuffer, trimRange[0], trimRange[1]);
      const wavArrayBuffer = audioBufferToWav(trimmed);
      const blob = new Blob([wavArrayBuffer], { type: "audio/wav" });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      appendLog(`Generated WAV preview (${formatTime(trimmedLength)}).`);

      if (outputFormat !== "wav") {
        toast({
          title: `${outputFormat.toUpperCase()} export not ready`,
          description: "Preview is available as WAV. Additional formats are coming soon.",
        });
      } else {
        toast({
          title: "Preview ready",
          description: "Trimmed clip exported as WAV for download.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Processing failed",
        description: "We couldn't prepare the trimmed preview.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPreview = () => {
    if (!previewUrl) {
      toast({
        title: "No preview available",
        description: "Generate a preview before downloading.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "trimmed-preview.wav";
    link.click();
    appendLog("Preview download triggered.");
  };

  const handleCopySummary = async () => {
    if (!audioFile) return;
    const summary = [
      `File: ${audioFile.name}`,
      `Format: ${outputFormat.toUpperCase()}`,
      `Trim range: ${formatTime(trimRange[0])} – ${formatTime(trimRange[1])} (${formatTime(trimmedLength)})`,
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(summary);
    toast({
      title: "Summary copied",
      description: "Details about the trimmed clip are on your clipboard.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Audio Cutter & Converter</h1>
        <p className="text-lg text-muted-foreground">
          Trim the section you need, test the output, and prepare your audio exports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Upload & settings</CardTitle>
            <CardDescription>Load an audio file, set your trim range, and pick the target format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="audio-file" className="text-sm font-semibold text-muted-foreground">
                Audio file
              </Label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={isDecoding}
                  className="sm:col-span-2"
                />
                {audioFile ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="truncate">{audioFile.name}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Accepted formats include MP3, WAV, AAC, OGG, and FLAC.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Trim range</Label>
                  <p className="text-xs text-muted-foreground">
                    Drag the handles or enter precise times to capture the segment you need.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>Start</span>
                    <span className="font-medium text-foreground">{formatTime(trimRange[0])}</span>
                  </div>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>End</span>
                    <span className="font-medium text-foreground">{formatTime(trimRange[1])}</span>
                  </div>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>Length</span>
                    <span className="font-medium text-foreground">{formatTime(trimmedLength)}</span>
                  </div>
                </div>
              </div>
              <Slider
                min={0}
                max={Math.max(trackDuration, 1)}
                step={1}
                value={trimRange}
                onValueChange={value => setTrimRange([Math.max(0, value[0]), Math.min(trackDuration, value[1])])}
                disabled={!audioBuffer}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trim-start" className="text-sm font-medium">
                    Trim start (seconds)
                  </Label>
                  <Input
                    id="trim-start"
                    type="number"
                    min={0}
                    max={trimRange[1]}
                    value={trimRange[0]}
                    onChange={event => setTrimRange([Number(event.target.value), trimRange[1]])}
                    disabled={!audioBuffer}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trim-end" className="text-sm font-medium">
                    Trim end (seconds)
                  </Label>
                  <Input
                    id="trim-end"
                    type="number"
                    min={trimRange[0]}
                    max={trackDuration}
                    value={trimRange[1]}
                    onChange={event => setTrimRange([trimRange[0], Number(event.target.value)])}
                    disabled={!audioBuffer}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Output format</Label>
              <Select value={outputFormat} onValueChange={value => setOutputFormat(value as OutputFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_FORMATS.map(formatValue => (
                    <SelectItem key={formatValue} value={formatValue}>
                      {formatValue.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-muted-foreground">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={event => setNotes(event.target.value)}
                placeholder="Describe how you'll use the exported clip, or note timestamps you want to revisit."
                className="min-h-[6rem]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleProcessAudio}
              className="w-full"
              disabled={!audioBuffer || isProcessing || isDecoding}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing audio…
                </>
              ) : (
                <>
                  <Scissors className="mr-2 h-4 w-4" />
                  Process audio
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Preview & export</CardTitle>
            <CardDescription>
              Audition the trimmed segment and download a WAV preview. Additional formats are coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed border-muted bg-card/70 p-6 text-center text-sm text-muted-foreground">
              <Music2 className="mx-auto mb-3 h-8 w-8 text-primary" />
              Waveform and playback controls will appear here to preview the trimmed audio segment.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/80 px-4 py-3">
              <div className="text-xs text-muted-foreground">
                <p>
                  Output: <span className="font-semibold text-foreground">{outputFormat.toUpperCase()}</span>
                </p>
                <p>
                  Trimmed length: <span className="font-semibold text-foreground">{formatTime(trimmedLength)}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCopySummary} disabled={!audioFile}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy summary
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleDownloadPreview} disabled={!previewUrl}>
                  <Download className="mr-2 h-4 w-4" />
                  Download WAV
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/80 px-4 py-3">
              <audio ref={audioRef} controls className="w-full">
                {previewUrl && <source src={previewUrl} type="audio/wav" />}
                {audioUrl && !previewUrl && <source src={audioUrl} />}
                Your browser does not support the audio element.
              </audio>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!audioUrl && !previewUrl}
                onClick={isPlaying ? stopPlayback : handlePlayTrim}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <Textarea
              readOnly
              value={logs.join("\n")}
              placeholder="Conversion logs, warnings, or metadata will be displayed here."
              className="min-h-[14rem] font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
