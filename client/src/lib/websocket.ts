import { writable, type Writable } from "svelte/store";

export class WebsocketConnection extends EventTarget {
    ws: WebSocket;
    roomName: string | null = null;
    roomHost: string | null = null;
    players: Set<string>;

    constructor(public name: string) {
        super();
        // @ts-ignore Initialized in the next function call
        this.ws = null;
        this.players = new Set([name]);

        this.connect();
    }

    connect() {
        const host = location.hostname.includes("danbulant.eu") ? "wss://multidie.danbulant.cloud" : "ws://" + location.hostname + ":8080";
        this.ws = new WebSocket(host + "/?name=" + encodeURIComponent(this.name));
        this.ws.addEventListener("open", (e) => {
            console.log("WS ready");
            this.refreshList();
        });
        this.ws.addEventListener("close", (e) => {
            console.log("WS closed");
            this.addError(e.reason || "Connection closed");
            connection.set(null);
            room.set(null);
            list.set(null);
        });
        this.ws.addEventListener("error", (e) => {
            console.error("WS error");
            this.addError("Connection error");
            connection.set(null);
            room.set(null);
            list.set(null);
        });
        this.ws.addEventListener("message", (e) => {
            const msg = JSON.parse(e.data);
            console.log(msg);
            switch (msg.t) {
                case "join": {
                    messages.update(t => { t.push({ type: "system", content: `${msg.client} joined`});return t})
                    this.players.add(msg.client);
                    break;
                }
                case "joined": {
                    const clients = msg.clients;
                    this.players = new Set(clients);
                    messages.set([{
                        type: "system", content: `${msg.client} joined`
                    }]);
                    this.roomName = msg.name;
                    this.roomHost = msg.host;
                    room.set({
                        name: msg.name,
                        host: msg.host
                    });
                    break;
                }
                case "create": {
                    this.roomName = msg.name;
                    this.roomHost = this.name;
                    room.set({
                        name: msg.name,
                        host: this.name
                    });
                    this.addMessage({ type: "system", content: `${msg.name} created the room`});
                    break;
                }
                case "leave": {
                    this.addMessage({ type: "system", content: `${msg.client} left`});
                    if(this.players.size == 0) {
                        gameData.set(null);
                    }
                    this.players.delete(msg.client);
                    break;
                }
                case "host": {
                    this.roomHost = msg.host;
                    room.update(t => { t!.host = this.roomHost!; return t });
                    this.addMessage({ type: "system", content: `${msg.host} is now host`});
                    break;
                }
                case "left": {
                    console.log("Left room successfully");
                    this.roomName = null;
                    room.set(null);
                    messages.set([]);
                    this.players = new Set([this.name]);
                    break;
                }
                case "list": {
                    list.set(msg.rooms);
                    listLoading.set(false);
                    break;
                }
                case "error": {
                    console.error(msg.e);
                    this.addError(msg.e);
                    break;
                }
            }
        });
    }

    addMessage(message: ErrorMessage | UserMessage | SystemMessage) {
        messages.update(t => { t.push(message); return t });
    }
    addError(data: string) {
        messages.update(t => { t.push({ type: "error", error: data }); return t });
    }
    sendMessage(msg: string) {
        if (!this.roomName) return console.log("Not in a room");
        this.broadcast({ t: "msg", d: msg });
        messages.update(t => { t.push({ type: "user", author: this.name, content: msg }); return t });
    }
    broadcast(data: any) {
        if (!this.roomName) return console.log("Not in a room");
        this.ws.send(JSON.stringify({ t: "broadcast", d: data }));
    }

    createGame(name: string) {
        this.ws.send(JSON.stringify({ t: "create", name: name }));
    }

    startGame() {
        if (!this.roomName) return console.log("Not in a room");
        this.broadcast({ t: "start" });
        gameData.set({ log: [] });
    }

    join(name: string) {
        this.ws.send(JSON.stringify({ t: "join", name: name }));
    }

    refreshList() {
        this.ws.send(JSON.stringify({ t: "list" }));
        listLoading.set(true);
    }

    send(data: any) {
        this.ws.send(data);
    }
}

interface ErrorMessage {
    type: "error",
    error: string
}
interface UserMessage {
    type: "user",
    author: string,
    content: string
}
interface SystemMessage {
    type: "system",
    content: string
}

export const connection: Writable<WebsocketConnection | null> = writable(null);
export const list: Writable<{ name: string, count: number }[] | null> = writable(null);
export const listLoading = writable(true);
export const room: Writable<{ name: string, host: string } | null> = writable(null);
export const messages: Writable<(UserMessage | ErrorMessage | SystemMessage)[]> = writable([]);
export const gameData: Writable<{ log: { p: string, i: number, j: number }[] }|null> = writable(null);