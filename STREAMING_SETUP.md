# LiveKit Streaming Setup

This project uses LiveKit for real-time video and chat integration with sub-100ms latency.

## Prerequisites

1.  **LiveKit Project**: Sign up at [LiveKit Cloud](https://livekit.io/cloud) or host your own.
2.  **API Credentials**: Get your `API URL`, `API Key`, and `API Secret` from your project settings.

## Environment Variables

Add the following to your `.env.local` file or in Vercel's environment variables:

\`\`\`bash
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
\`\`\`

## How it works

### Architecture Overview

1.  **Token Generation**: The backend (`/api/livekit/token`) generates JWT access tokens with appropriate permissions.
2.  **Host Broadcasting**: Hosts use `/host` dashboard with `StreamControlPanel` to broadcast using `@livekit/components-react`.
3.  **Iframe Integration**: Viewers see the stream via iframe (`/iframe/live`) embedded in show pages.
4.  **Video & Chat**: LiveKit handles video streaming and chat messaging using data channels.

### Components

#### Host Dashboard (`/host`)
- **StreamControlPanel**: Broadcasting interface with camera/mic controls
- **Permissions**: Tokens generated with `canPublish=true`
- **Features**: Live preview, duration tracking, stream controls

#### Viewer Interface (`/shows/[id]`)
- **LiveKitIframeEmbed**: Wrapper with fullscreen toggle
- **Permissions**: Tokens with `canPublish=false` (subscribe-only)
- **Features**: Video playback, chat overlay, fullscreen mode

#### Iframe Page (`/iframe/live`)
- **LiveKitRoom**: Auto-connects to room based on URL params
- **VideoConference**: Displays broadcaster's stream
- **Chat**: Real-time messaging overlay

### Room Naming Convention

- Each show has a unique room name (typically the show ID)
- Host enters room name in Stream Control Panel
- Viewers auto-connect based on show ID
- **Example**: Show at `/shows/1` uses room name "1"

## Usage

### For Hosts (Broadcasting)

1. Navigate to `/host` dashboard
2. Enter the room name matching your show ID (e.g., "1")
3. Click "Go Live"
4. Grant browser camera and microphone permissions
5. Your stream is now broadcasting!

### For Viewers (Watching)

1. Navigate to a show page (e.g., `/shows/1`)
2. Video player loads in iframe
3. If host is live, stream displays automatically
4. If not live, shows "Waiting for stream" message
5. Click fullscreen button to expand

## API Endpoints

### Initialize Stream
\`\`\`
POST /api/streams/initialize
Body: { showId, hostName }
Response: { streamId }
\`\`\`

### Get LiveKit Token
\`\`\`
GET /api/livekit/token?room={roomName}&username={username}&canPublish={true|false}
Response: { token: "eyJhbGc..." }
\`\`\`

**Query Parameters:**
- `room` (required): Room name to join
- `username` (required): Participant identity
- `canPublish` (optional): "true" for hosts, omit for viewers

## Features

### Video Streaming
- Sub-100ms latency using WebRTC
- Adaptive bitrate streaming
- Automatic quality adjustment
- Dynacast for optimal bandwidth usage

### Chat
- Real-time messaging via LiveKit data channels
- Chat overlay on video player
- Synchronized with video stream

### Fullscreen Mode
- Click enlarge button or "Click to fullscreen" text
- Press ESC to exit
- Header with logo and close button in fullscreen

## Troubleshooting

### Stream Not Connecting

**Check Environment Variables:**
- Verify `NEXT_PUBLIC_LIVEKIT_URL` starts with `wss://`
- Ensure `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are correct
- Restart dev server after adding env vars

**Check Browser Permissions:**
- Allow camera and microphone when prompted
- Check browser settings if denied
- Try incognito mode to reset permissions

**Check Room Names:**
- Host and viewers must use matching room names
- Room names are case-sensitive
- Use simple names (numbers or alphanumeric)

### Video Not Displaying

**Check Console Logs:**
- Look for `[v0]` prefixed messages
- Check for WebRTC connection errors
- Verify token fetch succeeded

**Verify Token Endpoint:**
- Test: `/api/livekit/token?room=test&username=testuser`
- Should return `{ "token": "..." }`

**Check LiveKit Dashboard:**
- Go to [LiveKit Cloud Dashboard](https://cloud.livekit.io)
- Navigate to "Rooms" section
- Verify participants are connected
- Check for any error messages

### Camera/Microphone Issues

**Browser Compatibility:**
- Use Chrome, Firefox, Safari, or Edge (latest versions)
- WebRTC may not work in some mobile browsers
- Update browser to latest version

**HTTPS Required:**
- Camera/mic requires HTTPS in production
- `localhost` works for development
- Deploy to Vercel for HTTPS

**Device Conflicts:**
- Close other apps using camera/mic
- Check system privacy settings
- Try different browser if issues persist

### Connection Timeouts

**Firewall/Network:**
- Ensure WebRTC traffic is allowed
- Check corporate firewall settings
- Try different network (mobile hotspot)

**LiveKit Server:**
- Verify LiveKit Cloud is operational
- Check [status page](https://status.livekit.io)
- Test with different regions if self-hosting

## Security Considerations

1. **API Key Protection:**
   - Never expose `LIVEKIT_API_KEY` or `LIVEKIT_API_SECRET` in client code
   - Use environment variables only
   - Only expose `NEXT_PUBLIC_LIVEKIT_URL` to client

2. **Token Management:**
   - Tokens generated server-side only
   - Tokens have expiration times
   - Permissions controlled via `canPublish` flag
   - Each token bound to specific room and identity

3. **Room Security:**
   - Implement room access control in production
   - Validate user permissions before issuing tokens
   - Consider adding room passwords for private streams

## Dependencies

\`\`\`json
{
  "livekit-client": "^2.15.14",
  "livekit-server-sdk": "^2.14.1",
  "@livekit/components-react": "^2.7.0",
  "@livekit/components-styles": "^1.1.7"
}
\`\`\`

## Additional Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit React Components](https://docs.livekit.io/reference/components/react/)
- [LiveKit Examples Repository](https://github.com/livekit-examples)
- [LiveKit Livestream Example](https://github.com/livekit-examples/livestream)
- [WebRTC Troubleshooting](https://webrtc.github.io/samples/)
