import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const messageSync = 0;
const messageAwareness = 1;
const PORT = Number(process.env.YJS_PORT || process.env.PORT || 1234);
const HOST = process.env.YJS_HOST || '0.0.0.0';
const DATA_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../.yjs-docs',
);

fs.mkdirSync(DATA_DIR, { recursive: true });

const docs = new Map();

function persistencePath(name) {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(DATA_DIR, `${safe}.bin`);
}

function getDoc(name) {
  let entry = docs.get(name);
  if (entry) return entry;

  const ydoc = new Y.Doc();
  const file = persistencePath(name);
  if (fs.existsSync(file)) {
    Y.applyUpdate(ydoc, fs.readFileSync(file));
  }
  const awareness = new awarenessProtocol.Awareness(ydoc);
  const conns = new Set();
  const persist = () => {
    fs.writeFileSync(file, Buffer.from(Y.encodeStateAsUpdate(ydoc)));
  };
  ydoc.on('update', persist);
  entry = { ydoc, awareness, conns, persist };
  docs.set(name, entry);
  return entry;
}

function send(conn, message) {
  if (conn.readyState === 1) conn.send(message);
}

function closeConn(name, conn) {
  const entry = docs.get(name);
  if (!entry) return;
  entry.conns.delete(conn);
  awarenessProtocol.removeAwarenessStates(
    entry.awareness,
    [conn.clientId].filter(Boolean),
    null,
  );
}

function setupConnection(conn, req) {
  const url = new URL(req.url || '/', 'http://localhost');
  const name = decodeURIComponent(url.pathname.replace(/^\//, '') || 'default');
  conn.binaryType = 'arraybuffer';
  const { ydoc, awareness, conns } = getDoc(name);
  conns.add(conn);

  conn.on('message', (data) => {
    const buf = new Uint8Array(data);
    const decoder = decoding.createDecoder(buf);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);
    if (messageType === messageSync) {
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.readSyncMessage(decoder, encoder, ydoc, conn);
      if (encoding.length(encoder) > 1) send(conn, encoding.toUint8Array(encoder));
    } else if (messageType === messageAwareness) {
      awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), conn);
    }
  });

  conn.on('close', () => closeConn(name, conn));
  conn.on('error', () => closeConn(name, conn));

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, ydoc);
  send(conn, encoding.toUint8Array(encoder));

  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const awEncoder = encoding.createEncoder();
    encoding.writeVarUint(awEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())),
    );
    send(conn, encoding.toUint8Array(awEncoder));
  }

  const awarenessChange = ({ added, updated, removed }) => {
    const changed = added.concat(updated).concat(removed);
    const awEncoder = encoding.createEncoder();
    encoding.writeVarUint(awEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changed),
    );
    const payload = encoding.toUint8Array(awEncoder);
    conns.forEach((client) => send(client, payload));
  };
  awareness.on('update', awarenessChange);
  conn.on('close', () => awareness.off('update', awarenessChange));
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'yjs-websocket', rooms: docs.size }));
});

const wss = new WebSocketServer({ server });
wss.on('connection', setupConnection);

server.listen(PORT, HOST, () => {
  console.log(`Yjs WebSocket 已启动 ws://${HOST}:${PORT}`);
});
