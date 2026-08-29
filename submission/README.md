# Demo production

The shot list and voiceover are in `docs/DEMO_SCRIPT.md`. Run the deterministic capture with:

```bash
npm run record:demo
```

The final video should contain native WebMCP discovery, one complete human-agent training cycle, and a visible model-setting approval. A local replay recording can be used for review footage only if its `local replay` source label remains visible.

Export requirements:

- shorter than 3 minutes;
- 1920 by 1080 at 30 frames per second;
- H.264 video and AAC audio;
- narration near -16 LUFS and true peak below -1.5 dB;
- reviewed burned-in captions; and
- public or unlisted YouTube URL for Devpost.

Generated audio and video belong in `submission/render/`, which is excluded from Git.

## Reviewed export

`submission/render/label-loop-demo-final.mp4` has been checked with `ffprobe` and `ebur128`:

- duration: 2 minutes 49.6 seconds;
- video: 1920 by 1080, H.264, 30 fps;
- audio: AAC, 48 kHz stereo;
- integrated loudness: -16.4 LUFS;
- true peak: -4.5 dBFS; and
- file size: 19 MB.

## YouTube metadata

Title: `Label Loop - WebMCP online model training demo`

Description:

```text
Label Loop trains an online support-ticket classifier in the browser with human-confirmed labels and nine WebMCP tools.

Live app: https://leofratu.github.io/oai-hackathon/
Source: https://github.com/leofratu/oai-hackathon

The opening verifies native WebMCP registration in Chrome 152. The repeatable training sequence uses the app's labeled local replay, which invokes the same production handlers and remains identified on screen.
```
