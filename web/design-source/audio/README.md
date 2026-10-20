# Wedding accompaniment

Chosen 20 October 2026: Canon in D Major, Kevin MacLeod, ISRC USUAN1100301. The artist's `pieces.json` identifies a 5:56 recording with double bass, violin and harp. The primary track page publishes CC BY 4.0 attribution. Appending an excerpt does not turn the recording into public-domain music.

Source and visible attribution are shipped in `public/audio/CREDITS.txt` and the invitation's expandable music credits. Original MP3 is retained in ignored `.research-tools/canon-in-d-original.mp3`; compressed two-minute excerpt is `public/audio/canon-in-d-invitation.mp3` (1,200,706 bytes; SHA256 `8c5fe141265a201c31168438b52d24c546fd3a8a770dc67390a1581251e6e87a`). Embedded album artwork is omitted.

Regenerate with FFmpeg:

```text
ffmpeg -i canon-in-d-original.mp3 -vn -map_metadata -1 -t 120 -af "afade=t=in:st=0:d=2,afade=t=out:st=116:d=4" -c:a libmp3lame -b:a 80k -ar 44100 -metadata title="Canon in D Major - invitation excerpt" -metadata artist="Kevin MacLeod" canon-in-d-invitation.mp3
```

The file is self-hosted, not embedded from a third-party player. It has no source URL before an explicit music/open interaction and uses preload=none. Playback starts inside the gesture, not after the opening timer. Browser rejection keeps a truthful play/retry state. User pause is remembered per invitation scope; backgrounding pauses without silently restarting. Safari/OS volume policy may override the requested soft volume. Physical-device listening and loop quality still need review.
