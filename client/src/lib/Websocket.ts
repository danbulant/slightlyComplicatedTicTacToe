import { writable, type Writable } from "svelte/store";

class FastEvent extends Event {
    data: any;
    constructor(name: string, data: any) {
        super(name);
        this.data = data;
    }
}

const hosts: { urls: string, credential?: string, username?: string }[] = [
    {
        urls: "stun:openrelay.metered.ca:80",
    }
]

class ConnectedClient extends EventTarget {
    conn: RTCPeerConnection;
    sendChannel: RTCDataChannel;
    candidates: any[] = [];
    state: RTCDataChannelState | null = null;
    readyState: number = 0;
    pings: number[] = [];
    score: number = 0;
    lives: number = 3;
    lastScoreChange: number = 0;

    constructor(public ws: WebsocketConnection, public name: string) {
        super();
        // @ts-ignore Initialized in the next function call
        this.conn = null;
        // @ts-ignore
        this.sendChannel = null;
        this.initializeConnection();
    }

    initializeConnection() {
        this.pings = [];
        console.log("Initializing connection");
        this.conn = new RTCPeerConnection({
            iceServers: hosts
        });

        this.conn.onicecandidate = e => {
            console.log("candidate", e, e.candidate);
            if (!e.candidate) return;
            this.candidates.push(e.candidate);
            this.ws.send(JSON.stringify({ t: "cand", target: this.name, d: e.candidate }));
        };
        this.conn.onicecandidateerror = (e) => console.error(e);
        this.conn.ondatachannel = e => this.onDataChannel(e.channel);
    }

    onDataChannel(channel: RTCDataChannel) {
        console.log("on data channel");
        this.sendChannel = channel;
        let timer: any;
        this.sendChannel.onclose = (e) => {
            clearInterval(timer);
            this.statusChanged();
        }
        this.sendChannel.onopen = (e) => {
            timer = setInterval(() => {
                this.send({ t: "p", d: Date.now() });
            }, 100);
            this.statusChanged();
        }
        this.statusChanged();
        this.sendChannel.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            switch (msg.t) {
                case "p":
                    this.send({
                        t: "pr",
                        d: msg.d,
                        y: Date.now()
                    })
                    break;
                case "pr":
                    this.pings.push(Date.now() - msg.d);
                    if(this.pings.length > 15) this.pings = this.pings.slice(-15);
                    players.update(t => t);
                    break;
                case "msg":
                    console.log("message", msg.d);
                    this.dispatchEvent(new FastEvent("message", msg.d));
                    messages.update(t => { t.push({ author: this.name, content: msg.d });return t})
                    break;
                case "lives":
                    this.lives = msg.d;
                    players.update(t => t);
                    break;
                case "score":
                    this.score = msg.d;
                    this.lastScoreChange = Date.now();
                    players.update(t => t);
                    break;
                case "start":
                    gameData.set({ score: 0, lives: 3, lastScoreChange: 0 });
                    // break not on purpose
                default:
                    console.log("MSG", msg);
                    this.dispatchEvent(new FastEvent(msg.t, msg.d));
            }
        };
    }

    send(data: any) {
        this.sendChannel.send(JSON.stringify(data));
    }

    statusChanged() {
        if (this.sendChannel) {
            if (this.state !== this.sendChannel.readyState) {
                if (this.state === "open" && ["closing", "closed"].includes(this.sendChannel.readyState)) {
                    this.initializeConnection();
                }
                this.state = this.sendChannel.readyState;
                if (this.state === "open") this.readyState = 3;
                if (["closing", "closed"].includes(this.state)) this.readyState = 4;
                console.log("state", this.state);
                players.update(t => t);
            }
        }
    }
}

export class WebsocketConnection extends EventTarget {
    ws: WebSocket;
    fast: Map<string, ConnectedClient> = new Map();
    roomName: string | null = null;
    roomHost: string | null = null;

    constructor(public name: string) {
        super();
        // @ts-ignore Initialized in the next function call
        this.ws = null;
        this.connect();
        players.set(this.fast);
    }

    connect() {
        this.ws = new WebSocket("ws://" + location.hostname + ":8080/?name=" + encodeURIComponent(this.name));
        this.ws.addEventListener("open", (e) => {
            console.log("WS ready");
            this.refreshList();
        });
        this.ws.addEventListener("close", (e) => {
            console.log("WS closed");
            lastError.set(e.reason || "Connection closed");
            connection.set(null);
            room.set(null);
            list.set(null);
        });
        this.ws.addEventListener("error", (e) => {
            console.error("WS error");
            lastError.set("Connection error");
            connection.set(null);
            room.set(null);
            list.set(null);
        });
        this.ws.addEventListener("message", (e) => {
            const msg = JSON.parse(e.data);
            console.log(msg);
            switch (msg.t) {
                case "cand": {
                    const fast = this.fast.get(msg.source);
                    if (!fast) return console.log("No fast connection");
                    if (fast.readyState < 1) fast.readyState == 1;
                    players.set(this.fast);
                    console.log("Received candidates");
                    if (fast.state === "open") return console.log("Already open");
                    fast.conn.addIceCandidate(msg.d).then();
                    break;
                }
                case "desc": {
                    const fast = this.fast.get(msg.source);
                    if (!fast) return console.log("No fast connection");
                    if (fast.readyState < 2) fast.readyState == 2;
                    players.set(this.fast);
                    if (fast.state === "open") return console.log("Already open");
                    if (msg.d.type === "answer") {
                        fast.conn.setRemoteDescription(msg.d);
                    } else if (msg.d.type === "offer") {
                        fast.conn.setRemoteDescription(msg.d)
                            .then(() => fast.conn.createAnswer())
                            .then(answer => fast.conn.setLocalDescription(answer))
                            .then(() =>
                                this.ws.send(JSON.stringify({ t: "desc", target: fast.name, d: fast.conn.localDescription }))
                            )
                    }
                    break;
                }
                case "join": {
                    const fast = new ConnectedClient(this, msg.client);
                    players.set(this.fast);
                    this.fast.set(msg.client, fast);
                    if (fast.candidates && fast.candidates.length) {
                        for (const candidate of fast.candidates) {
                            this.ws.send(JSON.stringify({ t: "cand", target: msg.client, d: candidate }));
                        }
                    }
                    messages.update(t => { t.push({ author: " SYS ", content: `${msg.client} joined`});return t})
                    break;
                }
                case "joined": {
                    const clients = msg.clients;
                    this.fast = new Map();
                    for (const client of clients) {
                        if (client === this.name) continue;
                        const fast = new ConnectedClient(this, client);
                        fast.conn.createOffer()
                            .then(offer => fast.conn.setLocalDescription(offer))
                            .then(() =>
                                this.ws.send(JSON.stringify({ t: "desc", target: client, d: fast.conn.localDescription }))
                            );
                        fast.sendChannel = fast.conn.createDataChannel("sendChannel");
                        fast.onDataChannel(fast.sendChannel);
                        this.fast.set(client, fast);
                    }
                    players.set(this.fast);
                    messages.set([{
                        author: " SYS ", content: `${msg.client} joined`
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
                    messages.update(t => { t.push({ author: " SYS ", content: `${msg.name} created the room`});return t})
                    break;
                }
                case "leave": {
                    const fast = this.fast.get(msg.client);
                    if (!fast) return;
                    fast.conn.close();
                    this.fast.delete(msg.client);
                    players.set(this.fast);
                    messages.update(t => { t.push({ author: " SYS ", content: `${msg.client} left`});return t})
                    if(this.fast.size == 0) {
                        gameData.set(null);
                    }
                    break;
                }
                case "host": {
                    this.roomHost = msg.host;
                    room.update(t => { t!.host = this.roomHost!; return t });
                    messages.update(t => { t.push({ author: " SYS ", content: `${msg.host} is now host`});return t})
                    break;
                }
                case "left": {
                    console.log("Left room successfully");
                    this.roomName = null;
                    room.set(null);
                    this.fast.forEach(connection => connection.conn.close());
                    this.fast = new Map();
                    players.set(this.fast);
                    messages.set([]);
                    break;
                }
                case "list": {
                    list.set(msg.rooms);
                    listLoading.set(false);
                    break;
                }
                case "error": {
                    console.error(msg.e);
                    lastError.set(msg.e);
                    break;
                }
            }
        });
    }

    sendMessage(msg: string) {
        if (!this.roomName) return console.log("Not in a room");
        this.broadcast({ t: "msg", d: msg });
        messages.update(t => { t.push({ author: this.name, content: msg }); return t });
    }
    broadcast(data: any) {
        if (!this.roomName) return console.log("Not in a room");
        for(const [, client] of this.fast) {
            client.send(data);
        }
    }

    setScore(score: number) {
        if (!this.roomName) return console.log("Not in a room");
        this.broadcast({ t: "score", d: score });
        gameData.update(t => { t!.score = score; t!.lastScoreChange = Date.now(); return t});
    }
    setLives(lives: number) {
        if (!this.roomName) return console.log("Not in a room");
        this.broadcast({ t: "lives", d: lives });
        gameData.update(t => { t!.lives = lives; return t});
    }

    createGame(name: string) {
        this.ws.send(JSON.stringify({ t: "create", name: name }));
    }

    startGame() {
        if (!this.roomName) return console.log("Not in a room");
        this.broadcast({ t: "start" });
        for(const [, client] of this.fast) {
            client.score = 0;
        }
        gameData.set({ score: 0, lives: 3, lastScoreChange: 0 });
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

export const connection: Writable<WebsocketConnection | null> = writable(null);
export const list: Writable<{ name: string, count: number }[] | null> = writable(null);
export const listLoading = writable(true);
export const lastError: Writable<string> = writable("");
export const room: Writable<{ name: string, host: string } | null> = writable(null);
export const players: Writable<Map<string, ConnectedClient>> = writable(new Map);
export const messages: Writable<{ author: string, content: string }[]> = writable([]);
export const gameData: Writable<{ score: number, lives: number, lastScoreChange: number }|null> = writable(null);