export const ANT_MEDIA_CONFIG = {
  SERVER_URL: process.env.NEXT_PUBLIC_ANT_MEDIA_SERVER || "http://localhost:5080",
  APPLICATION_NAME: process.env.ANT_MEDIA_APP_NAME || "LiveApp",
  API_KEY: process.env.ANT_MEDIA_API_KEY || "",
}

export async function initializeAntMediaStream(showId: string, hostName: string) {
  try {
    const response = await fetch(`${ANT_MEDIA_CONFIG.SERVER_URL}/WebRTCAppEE/rest/v2/broadcasts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANT_MEDIA_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        name: `${hostName}-${showId}`,
        description: `Live show: ${showId}`,
        type: "broadcast",
      }),
    })

    if (!response.ok) throw new Error("Failed to initialize stream")
    const data = await response.json()
    
    return {
      streamId: data.streamId,
      rtmpUrl: `rtmp://${ANT_MEDIA_CONFIG.SERVER_URL}/app/`,
      hlsUrl: `${ANT_MEDIA_CONFIG.SERVER_URL}/app/streams/${data.streamId}.m3u8`,
      dashUrl: `${ANT_MEDIA_CONFIG.SERVER_URL}/app/streams/${data.streamId}.mpd`,
    }
  } catch (error) {
    console.error("[v0] Error initializing Ant Media stream:", error)
    throw error
  }
}

export async function getStreamMetrics(streamId: string) {
  try {
    const response = await fetch(
      `${ANT_MEDIA_CONFIG.SERVER_URL}/WebRTCAppEE/rest/v2/broadcasts/${streamId}`,
      {
        headers: {
          Authorization: `Bearer ${ANT_MEDIA_CONFIG.API_KEY}`,
        },
      }
    )

    if (!response.ok) throw new Error("Failed to fetch stream metrics")
    const data = await response.json()

    return {
      totalViewers: data.webRTCViewerCount || 0,
      bitrate: data.bitrate || 0,
      fps: data.fps || 0,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("[v0] Error fetching stream metrics:", error)
    throw error
  }
}

export async function stopStream(streamId: string) {
  try {
    const response = await fetch(
      `${ANT_MEDIA_CONFIG.SERVER_URL}/WebRTCAppEE/rest/v2/broadcasts/${streamId}/stop`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ANT_MEDIA_CONFIG.API_KEY}`,
        },
      }
    )

    if (!response.ok) throw new Error("Failed to stop stream")
    return true
  } catch (error) {
    console.error("[v0] Error stopping stream:", error)
    throw error
  }
}
