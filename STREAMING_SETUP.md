# Ant Media StreamApp Integration Guide

This guide explains how to set up and use Ant Media StreamApp for live shopping streams on JB Live Shopping.

## Prerequisites

1. **Ant Media Server** - Deployed and running
   - Download: https://github.com/ant-media/StreamApp
   - Recommended: Docker deployment or standalone installation

2. **Broadcasting Software** - One of:
   - OBS Studio (Open Broadcaster Software)
   - Streamlabs Desktop
   - XSplit Broadcaster
   - Any RTMP-compatible streaming software

3. **Environment Variables** - Set in `.env.local`:
   \`\`\`
   NEXT_PUBLIC_ANT_MEDIA_SERVER=http://your-ant-media-server:5080
   ANT_MEDIA_APP_NAME=LiveApp
   ANT_MEDIA_API_KEY=your_api_key
   \`\`\`

## Getting Started

### 1. Start a Live Show

1. Navigate to `/shows/[showId]` for a scheduled show
2. Click "Start Streaming" button (for hosts)
3. A modal will appear with streaming credentials

### 2. Configure Your Broadcasting Software (OBS Example)

1. **Get Streaming Credentials:**
   - RTMP URL: `rtmp://your-ant-media-server:5080/app/`
   - Stream ID: Provided in the setup modal

2. **OBS Configuration:**
   - Go to Settings → Stream
   - Service: Custom RTMP Server
   - Server: `rtmp://your-ant-media-server:5080/app/`
   - Stream Key: Your Stream ID

3. **Recommended Settings:**
   - Resolution: 1920x1080 or 1280x720
   - Bitrate: 4500-6000 kbps
   - FPS: 30 or 60
   - Encoder: H.264

### 3. Start Broadcasting

1. Click "Start Streaming" in your broadcasting software
2. Your live stream will appear on JB Live Shopping
3. Viewers can watch in real-time with HLS/DASH playback

## Architecture

### Client-Side Playback
- **Format:** HLS (HTTP Live Streaming) for web browsers
- **URL:** `http://your-ant-media-server:5080/app/streams/{streamId}.m3u8`
- **Fallback:** DASH format available

### Broadcasting
- **Protocol:** RTMP (Real Time Messaging Protocol)
- **Endpoint:** `rtmp://your-ant-media-server:5080/app/`
- **Authentication:** Via Stream ID

### Metrics & Analytics
- Real-time viewer counts
- Bitrate monitoring
- FPS tracking
- Stream duration

## API Endpoints

### Initialize Stream
\`\`\`
POST /api/streams/initialize
Body: { showId, hostName }
Response: { streamId, hlsUrl, dashUrl, rtmpUrl }
\`\`\`

### Get Streaming Metrics
\`\`\`
GET /api/streams/metrics?streamId={streamId}
Response: { totalViewers, bitrate, fps, timestamp }
\`\`\`

### Stop Stream
\`\`\`
POST /api/streams/stop
Body: { streamId }
Response: { success: true }
\`\`\`

## Troubleshooting

### No Video Stream Appearing
- Verify Ant Media Server is running
- Check RTMP URL is correct
- Ensure firewall allows RTMP traffic (port 1935)
- Check broadcaster software connection status

### Playback Issues (Black Screen)
- Verify HLS URL is correct
- Check CORS settings on Ant Media Server
- Try refreshing the page
- Switch to DASH format if available

### High Latency
- Reduce bitrate in broadcaster settings
- Check network connection quality
- Consider lower resolution (720p instead of 1080p)
- Verify server is geographically close

## Security Considerations

1. **API Key Protection:**
   - Never expose `ANT_MEDIA_API_KEY` in client code
   - Use environment variables
   - Rotate keys regularly

2. **Stream ID Rotation:**
   - Generate unique Stream IDs per show
   - Don't reuse Stream IDs across shows

3. **RTMP Authentication:**
   - Implement token-based auth if available
   - Restrict RTMP endpoints to authorized hosts only

## Performance Optimization

1. **Bitrate Optimization:**
   - Start at 4500 kbps
   - Monitor viewer feedback
   - Adjust based on network conditions

2. **Server Configuration:**
   - Enable adaptive bitrate streaming
   - Configure server-side transcoding if needed
   - Set up CDN for geographic distribution

3. **Client-Side:**
   - Use HLS over HTTP for better compatibility
   - Implement video quality selector
   - Add buffering indicators

## Additional Resources

- [Ant Media GitHub](https://github.com/ant-media/StreamApp)
- [OBS Documentation](https://obsproject.com/wiki)
- [HLS Specification](https://tools.ietf.org/html/rfc8216)
