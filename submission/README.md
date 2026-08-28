# Demo production files

`docs/DEMO_SCRIPT.md` is the final native-browser shot list. The files here support an honest local review cut when Chrome 149 or ChatGPT's browser is unavailable.

Run the app recording:

```bash
node scripts/record-review-demo.mjs
```

The recording labels fallback calls as `local replay`. It must not be presented as native Site tools footage.

Generate each narration segment with a neural TTS voice, align the segments at the times in `captions.srt`, then mix them with the recorded WebM video. The final export target is 1920 by 1080, H.264, AAC, under three minutes, and about -16 LUFS.

Generated audio and video go in `submission/render/`, which is excluded from Git.

The reviewed local export is `submission/render/seven-transects-demo-review-v2.mp4`. It is 1920 by 1080, 2 minutes 57 seconds, H.264 with AAC audio, and includes burned-in captions. Replace its native-status segment with a real Site tools capture before uploading the final Devpost video.
