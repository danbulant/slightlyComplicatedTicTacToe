const decoder = new TextDecoder();
const PORT = 8080;

/**
 * @typedef Room
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
                `An Http connection wants to become WebSocket, URL: ${req.getUrl()}?${req.getQuery()}!`
            );
            let name = req.getQuery("name").trim().toLocaleLowerCase();
            if (
                !name ||
                typeof name !== "string" ||
                name.length < 2 ||
                name.length > 64 ||
                !name.trim()
            )
                return res.end("invalid_name");
            name = name.trim();
            if ([...clients.values()].find((client) => client.name === name))
                return res.end("name_used");
            /* This immediately calls open handler, you must not use res after this call */
            res.upgrade(
                {
                    name,
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
                room: null,
            });
        },
        message: (ws, message, isBinary) => {
            if (isBinary) return ws.end(0, "invalid_message");
            try {
                const data = JSON.parse(decoder.decode(message));
                const client = clients.get(ws);
                console.log(client.name, data);
                if (data.t === "ping") return ws.ping();
                switch (data.t) {
                    case "ping": {
                        return ws.ping();
                    }
                    case "create": {
                        if (client.room)
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "already_in_room",
                                })
                            );
                        const name = data.name.trim().toLocaleLowerCase();
                        if (
                            !name ||
                            typeof name !== "string" ||
                            name.length < 2 ||
                            name.length > 64 ||
                            !name.trim()
                        )
                            return res.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "invalid_room_name",
                                })
                            );
                        if (
                            [...rooms.values()].find(
                                (room) => room.name === name
                            )
                        )
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "room_name_used",
                                })
                            );
                        const room = {
                            name: name,
                            host: ws,
                            clients: [client],
                        };
                        rooms.set(room.name, room);
                        client.room = room;
                        return ws.send(
                            JSON.stringify({ t: "create", name: name })
                        );
                    }
                    case "leave": {
                        const room = client.room;
                        if (!room)
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "room_not_found",
                                })
                            );
                        if (!room.clients.includes(client))
                            return ws.send(
                                JSON.stringify({ t: "error", e: "not_in_room" })
                            );
                        room.clients.splice(room.clients.indexOf(client), 1);
                        if (room.clients.length === 0) {
                            rooms.delete(room.name);
                        } else if (room.host == ws) {
                            room.host = room.clients[0];
                            room.clients.forEach((client) =>
                                client.connection.send(
                                    JSON.stringify({
                                        t: "host",
                                        host: client.name,
                                    })
                                )
                            );
                        }
                        client.room = null;
                        room.clients.forEach((client) =>
                            client.connection.send(
                                JSON.stringify({
                                    t: "leave",
                                    client: client.name,
                                })
                            )
                        );
                        ws.send(
                            JSON.stringify({ t: "left", name: client.name })
                        );
                        break;
                    }
                    case "join": {
                        if (!client) return ws.end(0, "missing_client");
                        const room = rooms.get(data.name);
                        if (!room)
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "room_not_found",
                                })
                            );
                        if (client.room)
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "already_in_other_room",
                                })
                            );
                        if (room.clients.includes(client))
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "already_in_room",
                                })
                            );
                        if (room.clients.length > 5)
                            return ws.send(
                                JSON.stringify({ t: "error", e: "room_full" })
                            );
                        room.clients.push(client);
                        client.room = room;
                        const srcclient = client;
                        room.clients
                            .filter((t) => t !== client)
                            .forEach((client) =>
                                client.connection.send(
                                    JSON.stringify({
                                        t: "join",
                                        client: srcclient.name,
                                    })
                                )
                            );
                        ws.send(
                            JSON.stringify({
                                t: "joined",
                                name: room.name,
                                client: client.name,
                                host: room.host.name,
                                clients: room.clients.map((t) => t.name),
                            })
                        );
                        break;
                    }
                    case "cand":
                    case "desc": {
                        if (!client) return ws.end(0, "missing_client");
                        const room = client.room;
                        if (!room)
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "room_not_found",
                                })
                            );
                        if (!room.clients.includes(client))
                            return ws.send(
                                JSON.stringify({ t: "error", e: "not_in_room" })
                            );
                        const targetClient = room.clients.find(
                            (t) => t.name === data.target
                        );
                        if (!targetClient)
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "target_not_found",
                                })
                            );
                        if (!room.clients.includes(targetClient))
                            return ws.send(
                                JSON.stringify({
                                    t: "error",
                                    e: "target_not_in_room",
                                })
                            );
                        targetClient.connection.send(
                            JSON.stringify({
                                t: data.t,
                                source: client.name,
                                d: data.d,
                            })
                        );
                    }
                    case "list": {
                        ws.send(
                            JSON.stringify({
                                t: "list",
                                rooms: [...rooms.values()]
                                    .filter((t) => t.clients.length < 5)
                                    .map((t) => ({
                                        name: t.name,
                                        host: t.host.name,
                                        count: t.clients.length,
                                    })),
                            })
                        );
                        break;
                    }
                }
            } catch (e) {
                console.warn(e);
                return ws.end(0, "internal");
            }
        },
        close: (ws, code, message) => {
            console.log("DIS1", ws, code, message);
            try {
                if (clients.get(ws)) {
                    const client = clients.get(ws);
                    console.log("DIS", client.name, client.ipa);
                    let room = client.room;
                    if (room) {
                        room.clients.splice(room.clients.indexOf(client), 1);
                        if (room.clients.length === 0) {
                            rooms.delete(room.name);
                        } else if (room.host == ws) {
                            room.host = room.clients[0];
                            room.clients.forEach((client) =>
                                client.connection.send(
                                    JSON.stringify({
                                        t: "host",
                                        host: client.name,
                                    })
                                )
                            );
                        }
                        const srcclient = client;
                        room.clients.forEach((client) =>
                            client.connection.send(JSON.stringify({ t: "leave", client: srcclient.name }))
                        );
                    }
                }
            } catch (e) {
                console.warn("Error during closing", e);
            }
            clients.delete(ws);
        },
    })
    .get("/*", (res, req) => {
        res.writeStatus("200 OK").writeHeader("Content-Type", "text/plain").end("OK");
    })
    .listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
