const express = require('express');
const NodeCache = require( "node-cache" );

const app = express();

const bzServers = new NodeCache();

// CONSTANTS
const SERVER_TTL = 604800 // 1 week in seconds
// https://www.kaverti.com/en/internal-services/ports
const DEFAULT_PORT = 24031;
const ENABLE_CACHE = false; // we don't even use it because no invites.

app.get("/api/createserver", (req, res) => {
    // note: the game does not support "port" but maybe if you wanna set it manually idk
    const { peerId, v, port } = req.query || {};
    if (!peerId || !v) {
        return res.status(400).json({ error: "Missing peerId or v parameter" });
    }

    const server = {
      JoinCode: "JOIN_VIA_IP",
      AccessToken: "placeholder_access_token",
      ServerIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
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
app.get("/joinserver", (req, res) => {
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
