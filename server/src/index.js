const decoder = new TextDecoder();
const encoder = new TextEncoder();
const PORT = 8080;

let i = 0;
function uuid() {
    return (++i).toString();
}

/**
 * @typedef Room
 * @property {string} id
 * @property {string} name
 * @property {Client} host
 * @property {Client[]} clients
 */
/**
 * @typedef Client
 * @property {string} name
 * @property {WebSocket} connection
 * @property {Room?} room
 */

/**
 * @type {Map<string, Room>}
 */
const rooms = new Map();
/**
 * @type {Map<WebSocket, Client>}
 */
const clients = new Map();

require("uWebSockets.js")
    .App({})
    .ws("/", {
        idleTimeout: 32,
        maxPayloadLength: 16 * 1024 * 1024,
        upgrade: (res, req, context) => {
            console.log(
                `An Http connection wants to become WebSocket, URL: ${req.getUrl()}!`
            );
            let name = req.getQuery("name").trim().toLocaleLowerCase();
            if (!name || typeof name !== "string" || name.length < 2 || name.length > 64 || !name.trim()) return res.end("invalid_name");
            name = name.trim();
            if ([...clients.values()].find(client => client.name === name)) return res.end("name_used");
            /* This immediately calls open handler, you must not use res after this call */
            res.upgrade(
                {
                    name
                },
                /* Spell these correctly */
                req.getHeader("sec-websocket-key"),
                req.getHeader("sec-websocket-protocol"),
                req.getHeader("sec-websocket-extensions"),
                context
            );
        },
        open: (ws) => {
            console.log(
                "CON",
                ws.name,
                decoder.decode(ws.getRemoteAddressAsText())
            );
            clients.set(ws, {
                connection: ws,
                name: ws.name,
                ipa: decoder.decode(ws.getRemoteAddressAsText()),
                room: null
            });
        },
        message: (ws, message, isBinary) => {
            if (isBinary) return ws.end();
            try {
                const data = JSON.parse(decoder.decode(message));
                if(data.t === "ping") return ws.ping();
                switch(data.t) {
                    case "ping": {
                        return ws.ping();
                    }
                    case "create": {
                        const client = clients.get(ws);
                        if(client.room) return ws.send(JSON.stringify({t: "error", e: "already_in_room"}));
                        const name = data.name.trim().toLocaleLowerCase();
                        if (!name || typeof name !== "string" || name.length < 2 || name.length > 64 || !name.trim()) return res.send(JSON.stringify({t: "error", e: "invalid_room_name"}));
                        if ([...rooms.values()].find(room => room.name === name)) return ws.send(JSON.stringify({t: "error", e: "room_name_used"}));
                        const room = {
                            name: name,
                            host: ws,
                            clients: [client],
                            id: uuid()
                        };
                        rooms.set(room.id, room);
                        client.room = room;
                        return ws.send(JSON.stringify({ t: "create", id: room.id, name: name }));
                    }
                    case "leave": {
                        const client = clients.get(ws);
                        const room = client.room;
                        if (!room) return ws.send(JSON.stringify({ t: "error", e: "room_not_found" }));
                        if (!room.clients.includes(client)) return ws.send(JSON.stringify({ t: "error", e: "not_in_room" }));
                        room.clients.splice(room.clients.indexOf(client), 1);
                        if (room.clients.length === 0) {
                            rooms.delete(room.id);
                        } else if(room.host == ws) {
                            room.host = room.clients[0];
                            room.clients.forEach(client => client.connection.send(JSON.stringify({ t: "host", host: client.name })));
                        }
                        client.room = null;
                        room.clients.forEach(client => client.connection.send(JSON.stringify({ t: "leave", id: room.id, name: client.name })));
                        ws.send(JSON.stringify({ t: "left", id: room.id, name: client.name }));
                        break;
                    }
                    case "join": {
                        const client = clients.get(ws);
                        if (!client) return ws.end();
                        const room = rooms.get(msg.room);
                        if (!room) return ws.send(JSON.stringify({ t: "error", e: "room_not_found" }));
                        if(client.room) return ws.send(JSON.stringify({ t: "error", e: "already_in_other_room" }));
                        if (room.clients.includes(client)) return ws.send(JSON.stringify({ t: "error", e: "already_in_room" }));
                        if(room.clients.length > 5) return ws.send(JSON.stringify({ t: "error", e: "room_full" }));
                        room.clients.push(ws);
                        ws.room = room;
                        room.clients.slice(0, -2).forEach(client => client.connection.send(JSON.stringify({ t: "join", id: room.id, client: client.name })));
                        ws.send(JSON.stringify({ t: "joined", id: room.id, name: room.name, client: client.name, clients: room.clients.map(t => t.name) }));
                        break;
                    }
                    case "cand":
                    case "desc": {
                        const client = clients.get(ws);
                        if (!client) return ws.end();
                        const room = client.room;
                        if (!room) return ws.send(JSON.stringify({ t: "error", e: "room_not_found" }));
                        if (!room.clients.includes(client)) return ws.send(JSON.stringify({ t: "error", e: "not_in_room" }));
                        const targetClient = room.clients.find(t => t.name === msg.target);
                        if(!targetClient) return ws.send(JSON.stringify({ t: "error", e: "target_not_found" }));
                        if(!room.clients.includes(targetClient)) return ws.send(JSON.stringify({ t: "error", e: "target_not_in_room" }));
                        targetClient.connection.send(JSON.stringify({ t: msg.t, id: room.id, source: client.name, d: msg.d }));
                    }
                    case "list": {
                        ws.send(JSON.stringify({ t: "list", rooms: [...rooms.values()].filter(t => t.clients.length < 5).map(t => ({ id: t.id, name: t.name, count: t.clients.length }))}));
                        break;
                    }
                }
            } catch (e) {
                return ws.end();
            }
        },
        close: (ws, code, message) => {
            console.log("DIS1", ws);
            if (clients.get(ws)) {
                const client = clients.get(ws);
                console.log("DIS", client.name, client.ipa);
                let room = client.room;
                if (room) {
                    room.clients.splice(room.clients.indexOf(ws), 1);
                    if (room.clients.length === 0) {
                        rooms.delete(room.id);
                    } else if(room.host == ws) {
                        room.host = room.clients[0];
                        room.clients.forEach(client => client.connection.send(JSON.stringify({ t: "host", host: client.name })));
                    }
                }
            }
            clients.delete(ws);
        },
    })
    .listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
