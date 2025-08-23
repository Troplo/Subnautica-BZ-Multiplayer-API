const express = require('express');
const NodeCache = require( "node-cache" );

const app = express();

const bzServers = new NodeCache();

// CONSTANTS
const SERVER_TTL = 604800 // 1 week in seconds
// https://www.kaverti.com/en/internal-services/ports
const DEFAULT_PORT = 24031;
const ENABLE_CACHE = false; // we don't even use it because no invites.


/**
 *
 * @param peerId
 * @returns {
 *   connectIP: string | undefined
 * }
 */
function parsePeerId(peerId) {
    if (!peerId || typeof peerId !== 'string') {
        // comply with jsdoc
        return {
          connectIP: undefined
        };
    }
    let serverIp = null;
    if (peerId.includes(":")) {
      const peerIdParts = peerId.split(":");
      if (peerIdParts.length >= 3) {
        // get connectIP from peerId and then +1 it because it's a string literal
        const index = peerIdParts.indexOf("connectIP");
        if (index !== -1 && index + 1 < peerIdParts.length) {
          serverIp = peerIdParts[index + 1];
        }
      }
    }

    return {
      ...serverIp ? { connectIP: serverIp } : {
        connectIP: undefined
      }
    }
}

app.get("/api/createserver", (req, res) => {
    // note: the game does not support "port" but maybe if you wanna set it manually idk
    const { peerId, v, port } = req.query || {};

    if (!peerId || !v) {
        return res.status(400).json({ error: "Missing peerId or v parameter" });
    }

    // There's a design flaw where it will send back the public IP address of the host. This is completely unnecessary and may cause
    // NAT reflection issues. To prevent this, we will parse the peerId to get the IP address of the format `ANYTHING:connectIP:127.0.0.1`
    const { connectIP: serverIp } = parsePeerId(peerId);

    const server = {
      JoinCode: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      AccessToken: "placeholder_access_token",
      ServerIp: serverIp || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      ServerPort: port || 666,
      _meta: {
        peerId: peerId,
        v: v,
      }
    }

    if(ENABLE_CACHE) {
      bzServers.set(peerId, server, SERVER_TTL);
    }

    delete server._meta;
    res.json(server);
})

// the game calls this 10 seconds wtf
app.get("/api/pingserver", (req, res) => {
  const { peerId } = req.query || {};

  res.json({})
})

app.get("/api/leaveserver", (req, res) => {
  const { peerIp } = req.query || {};

  res.json({})
})

// Would normally return { ServerIp: string; ServerPort: number } but we don't support invites.
app.get("/api/joinserver", (req, res) => {
  const { peerId, joinCode } = req.query || {};
  res.json({
    IsError: true,
    ErrorMessage: "Troplo's Subnautica BZMP Patch: Invites are not supported. Please connect via a direct IP address.",
  });
})

app.listen(process.env.PORT || DEFAULT_PORT, () => {
  console.log(`Troplo's Subnautica: Below Zero Multiplayer by BOT Benson API Server is running...`);
  console.log(`Server is running on port ${process.env.PORT || DEFAULT_PORT}`);
  console.log(`Set the environment variable PORT to change the port.`);
});
