import { AccessToken } from "livekit-server-sdk"

export const LIVEKIT_CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
  API_KEY: process.env.LIVEKIT_API_KEY || "",
  API_SECRET: process.env.LIVEKIT_API_SECRET || "",
}

export async function createLiveKitToken(roomName: string, participantName: string, canPublish = false) {
  const at = new AccessToken(LIVEKIT_CONFIG.API_KEY, LIVEKIT_CONFIG.API_SECRET, {
    identity: participantName,
  })

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: canPublish,
    canSubscribe: true,
  })

  return at.toJwt()
}
