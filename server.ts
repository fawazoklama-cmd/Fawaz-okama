import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { RoomState, Player, ChatMessage } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for multiplayer rooms
const rooms: Record<string, RoomState> = {};
// Real-time connections (SSE active listeners)
const connections: Record<string, express.Response[]> = {};

// Clean up stale rooms after 4 hours
setInterval(() => {
  const now = Date.now();
  for (const code in rooms) {
    if (now - rooms[code].lastUpdated > 4 * 60 * 60 * 1000) {
      console.log(`Cleaning up stale room ${code}`);
      delete rooms[code];
      delete connections[code];
    }
  }
}, 30 * 60 * 1000);

// Helper to broadcast room changes to all active SSE listeners in a room
function broadcastRoomState(code: string) {
  const room = rooms[code];
  if (!room) return;
  
  room.lastUpdated = Date.now();
  const listeners = connections[code] || [];
  const payload = JSON.stringify(room);
  
  // Send the updated room to all clients
  listeners.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // Listener is likely disconnected, clean up occurs on close
    }
  });
}

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", roomsActive: Object.keys(rooms).length });
});

// Create a new room with a random 6-digit code
app.post("/api/rooms", (req, res) => {
  const { hostPlayer } = req.body;
  if (!hostPlayer) {
    return res.status(400).json({ error: "Host player details required" });
  }

  // Generate unique 6-digit code
  let code = "";
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);

  const newPlayer: Player = {
    ...hostPlayer,
    isHost: true,
    isMicOn: false,
    usePTT: false,
    isSpeaking: false,
    score: 0,
    lastActive: Date.now()
  };

  rooms[code] = {
    code,
    players: [newPlayer],
    activeGameId: null,
    gameState: {},
    chat: [],
    lastUpdated: Date.now()
  };

  connections[code] = [];

  console.log(`Room created: ${code} by ${hostPlayer.username}`);
  res.json(rooms[code]);
});

// Join an existing room via 6-digit code
app.post("/api/rooms/:code/join", (req, res) => {
  const { code } = req.params;
  const { player } = req.body;

  if (!player) {
    return res.status(400).json({ error: "Player details required" });
  }

  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  // Check if player already in the list
  const existingPlayerIndex = room.players.findIndex((p) => p.id === player.id);
  const formattedPlayer: Player = {
    ...player,
    isHost: room.players.length === 0, // Make host if empty
    isMicOn: false,
    usePTT: false,
    isSpeaking: false,
    score: 0,
    lastActive: Date.now()
  };

  if (existingPlayerIndex > -1) {
    room.players[existingPlayerIndex] = {
      ...room.players[existingPlayerIndex],
      ...formattedPlayer,
      score: room.players[existingPlayerIndex].score // Maintain score
    };
  } else {
    // Max 10 players as specified in guidelines (default duo mode)
    if (room.players.length >= 10) {
      return res.status(400).json({ error: "Room is full (max 10 players)" });
    }
    room.players.push(formattedPlayer);
  }

  // Create join chat message
  const joinMessage: ChatMessage = {
    id: `join-${Date.now()}-${Math.random()}`,
    playerId: "system",
    username: "System",
    color: "#E8E8E8",
    text: `${player.username} has joined the game playground!`,
    timestamp: Date.now()
  };
  room.chat.push(joinMessage);
  if (room.chat.length > 50) room.chat.shift();

  broadcastRoomState(code);
  res.json(room);
});

// Leave a lobby
app.post("/api/rooms/:code/leave", (req, res) => {
  const { code } = req.params;
  const { playerId } = req.body;

  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const leavingPlayer = room.players.find((p) => p.id === playerId);
  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    console.log(`Room empty, deleting room: ${code}`);
    delete rooms[code];
    delete connections[code];
    return res.json({ status: "room_deleted" });
  }

  // Assign a new host if the host left
  if (leavingPlayer?.isHost) {
    room.players[0].isHost = true;
  }

  // Post systemic message
  const leaveMessage: ChatMessage = {
    id: `leave-${Date.now()}-${Math.random()}`,
    playerId: "system",
    username: "System",
    color: "#E8E8E8",
    text: `${leavingPlayer?.username || 'Some player'} left the playground.`,
    timestamp: Date.now()
  };
  room.chat.push(leaveMessage);
  if (room.chat.length > 50) room.chat.shift();

  broadcastRoomState(code);
  res.json(room);
});

// Sync voice state (mic, speaking, push to talk)
app.post("/api/rooms/:code/voice", (req, res) => {
  const { code } = req.params;
  const { playerId, isMicOn, usePTT, isSpeaking } = req.body;

  const room = rooms[code];
  if (!room) return res.status(404).json({ error: "Room not found" });

  const p = room.players.find((player) => player.id === playerId);
  if (p) {
    if (typeof isMicOn === "boolean") p.isMicOn = isMicOn;
    if (typeof usePTT === "boolean") p.usePTT = usePTT;
    if (typeof isSpeaking === "boolean") p.isSpeaking = isSpeaking;
    p.lastActive = Date.now();
  }

  broadcastRoomState(code);
  res.json(room);
});

// Add message to chat list
app.post("/api/rooms/:code/chat", (req, res) => {
  const { code } = req.params;
  const { playerId, username, color, text } = req.body;

  const room = rooms[code];
  if (!room) return res.status(404).json({ error: "Room not found" });

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random()}`,
    playerId,
    username,
    color,
    text,
    timestamp: Date.now()
  };

  room.chat.push(newMessage);
  if (room.chat.length > 50) room.chat.shift();

  broadcastRoomState(code);
  res.json(room);
});

// Dispatch actions to update the active game selection or change dynamic states
app.post("/api/rooms/:code/action", (req, res) => {
  const { code } = req.params;
  const { type, payload } = req.body; // type can be: 'SELECT_GAME', 'UPDATE_GAME_STATE', 'RESET_GAME'

  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (type === "SELECT_GAME") {
    room.activeGameId = payload.gameId;
    room.gameState = {
      gameId: payload.gameId,
      turnPlayerId: room.players[0]?.id || "",
      board: null,
      score: {},
      status: "playing", // 'playing', 'ended'
      winnerId: null,
      clicks: {},
      speedScores: {},
      matchHistory: [],
      seed: Math.random(),
      lastMoveTime: Date.now()
    };

    // Initialize scores
    room.players.forEach(p => {
      room.gameState.score[p.id] = 0;
    });

    const sysMessage: ChatMessage = {
      id: `system-game-${Date.now()}`,
      playerId: "system",
      username: "System",
      color: "#4DA3FF",
      text: `Starts Game Node #${payload.gameId}`,
      timestamp: Date.now()
    };
    room.chat.push(sysMessage);

  } else if (type === "UPDATE_GAME_STATE") {
    // Simply merge the payload into the gameState
    room.gameState = {
      ...room.gameState,
      ...payload,
      lastMoveTime: Date.now()
    };
  } else if (type === "RESET_GAME") {
    if (room.activeGameId !== null) {
      room.gameState = {
        gameId: room.activeGameId,
        turnPlayerId: room.players[Math.floor(Math.random() * room.players.length)]?.id || "",
        board: null,
        score: {},
        status: "playing",
        winnerId: null,
        clicks: {},
        speedScores: {},
        matchHistory: [],
        seed: Math.random(),
        lastMoveTime: Date.now()
      };
      
      room.players.forEach(p => {
        room.gameState.score[p.id] = 0;
      });
    }
  } else if (type === "LEAVE_GAME") {
    room.activeGameId = null;
    room.gameState = {};
  }

  broadcastRoomState(code);
  res.json(room);
});

// SSE Stream route
app.get("/api/rooms/:code/stream", (req, res) => {
  const { code } = req.params;
  const room = rooms[code];

  if (!room) {
    res.status(404).write("HTTP/1.1 404 Room Not Found\n\nRoom does not exist.");
    res.end();
    return;
  }

  // Set response headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Establishes stream with client

  // Immediately send current room state
  res.write(`data: ${JSON.stringify(room)}\n\n`);

  // Track listener
  if (!connections[code]) {
    connections[code] = [];
  }
  connections[code].push(res);

  // Connection closer clean-up
  req.on("close", () => {
    if (connections[code]) {
      connections[code] = connections[code].filter((item) => item !== res);
    }
  });
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FawMan Playground Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
