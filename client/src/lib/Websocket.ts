import { writable, type Writable } from "svelte/store";

class FastEvent extends Event {
    data: any;
    constructor(name: string, data: any) {
        super(name);
        this.data = data;
    }
}

const hosts: { urls: string, credential?: string, username?: string }[] = ("stun.ipfire.org:3478\n" +
    "stun.rolmail.net:3478\n" +
    "stun.steinbeis-smi.de:3478\n" +
    "stun.marcelproust.it:3478\n" +
    "stun3.3cx.com:3478\n" +
    "stun.voipraider.com:3478\n" +
    "stun.kore.com:3478\n" +
    "stun.voipstunt.com:3478\n" +
    "stun.fairytel.at:3478\n" +
    "stun.h4v.eu:3478\n" +
    "stun.peethultra.be:3478\n" +
    "stun.ortopediacoam.it:3478\n" +
    "stun.infra.net:3478\n" +
    "stun.vavadating.com:3478\n" +
    "stun.mixvoip.com:3478\n" +
    "stun.tele2.net:3478\n" +
    "stun2.3cx.com:3478\n" +
    "stun.myhowto.org:3478\n" +
    "stun.cellmail.com:3478\n" +
    "stun.poetamatusel.org:3478\n" +
    "stun.textz.com:3478\n" +
    "stun.romancecompass.com:3478\n" +
    "stun.ixc.ua:3478\n" +
    "stun.actionvoip.com:3478\n" +
    "stun.bethesda.net:3478\n" +
    "stun.parcodeinebrodi.it:3478\n" +
    "stun.jay.net:3478\n" +
    "stun.demos.ru:3478\n" +
    "stun.cloopen.com:3478\n" +
    "stun.crimeastar.net:3478\n" +
    "stun.vivox.com:3478\n" +
    "stun.openjobs.hu:3478\n" +
    "stun.kaznpu.kz:3478\n" +
    "stun.linphone.org:3478\n" +
    "stun.l.google.com:19302\n" +
    "stun.sonetel.net:3478").split("\n").map(t => ({ urls: "stun:" + t }));

hosts.push({
    urls: 'turn:relay.backups.cz',
    credential: 'webrtc',
    username: 'webrtc'
},
    {
        urls: 'turn:relay.backups.cz?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
    });

class ConnectedClient extends EventTarget {
    conn: RTCPeerConnection;
    sendChannel: RTCDataChannel;
    candidates: any[] = [];
    state: RTCDataChannelState | null = null;

    constructor(public ws: WebsocketConnection, public name: string) {
        super();
        // @ts-ignore Initialized in the next function call
        this.conn = null;
        // @ts-ignore
        this.sendChannel = null;
        this.initializeConnection();
    }

    initializeConnection() {
        console.log("Initializing connection");
        this.conn = new RTCPeerConnection({
            iceServers: hosts
        });

        this.conn.onicecandidate = e => {
            console.log(e);
            if (!e.candidate) return;
            this.candidates.push(e.candidate);
            this.ws.send(JSON.stringify({ t: "cand", target: this.name, d: e.candidate }));
        };
        this.conn.onicecandidateerror = (e) => console.error(e);
        this.conn.ondatachannel = e => {
            this.sendChannel = e.channel;
            let timer: any;
            this.sendChannel.onclose = (e) => {
                clearInterval(timer);
                this.statusChanged();
            }
            this.sendChannel.onopen = (e) => {
                timer = setInterval(() => {
                    this.send({ t: "p", d: Date.now() });
                }, 300);
                this.statusChanged();
            }
            this.statusChanged();
            this.sendChannel.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                switch (msg.t) {
                    default:
                        console.log("MSG", msg);
                        this.dispatchEvent(new FastEvent(msg.t, msg.d));
                }
            };
        }
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
                console.log("state", this.state);
            }
        }
    }
}

class WebsocketConnection extends EventTarget {
    ws: WebSocket;
    fast: Map<string, ConnectedClient> = new Map();
    roomName: string | null = null;
    roomId: string | null = null;

    constructor(public name: string) {
        super();
        // @ts-ignore Initialized in the next function call
        this.ws = null;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket("ws://" + location.hostname + ":8080");
        this.ws.addEventListener("open", () => {
            console.log("WS ready");
        });
        this.ws.addEventListener("message", (e) => {
            const msg = JSON.parse(e.data);
            console.log(msg);
            switch (msg.t) {
                case "cand": {
                    const fast = this.fast.get(msg.source);
                    if (!fast) return;
                    if (fast.state === "open") return console.log("Already open");
                    for (const candidate of msg.d) {
                        fast.conn.addIceCandidate(candidate).then();
                    }
                    break;
                }
                case "desc": {
                    const fast = this.fast.get(msg.source);
                    if (!fast) return;
                    if (fast.state === "open") return console.log("Already open");
                    fast.conn.setRemoteDescription(msg.d)
                        .then(() => fast.conn.createAnswer())
                        .then(answer => fast.conn.setLocalDescription(answer))
                        .then(() =>
                            this.ws.send(JSON.stringify({ t: "desc", target: fast.name, d: fast.conn.localDescription }))
                        )
                    break;
                }
                case "join": {
                    const fast = new ConnectedClient(this, msg.name);
                    this.fast.set(msg.name, fast);
                    if (fast.conn.localDescription) {
                        this.ws.send(JSON.stringify({ t: "desc", target: msg.name, d: fast.conn.localDescription }))
                    }
                    if (fast.candidates) {
                        this.ws.send(JSON.stringify({ t: "cand", target: msg.name, d: fast.candidates }));
                    }
                    break;
                }
                case "joined": {
                    const clients = msg.clients;
                    this.fast = new Map();
                    for (const client of clients) {
                        const fast = new ConnectedClient(this, client);
                        if (fast.conn.localDescription) {
                            this.ws.send(JSON.stringify({ t: "desc", target: msg.name, d: fast.conn.localDescription }))
                        }
                        if (fast.candidates) {
                            this.ws.send(JSON.stringify({ t: "cand", target: msg.name, d: fast.candidates }));
                        }
                        this.fast.set(client, fast);
                    }
                }
                case "leave": {
                    const fast = this.fast.get(msg.name);
                    if (!fast) return;
                    fast.conn.close();
                    this.fast.delete(msg.name);
                }
                case "left": {
                    console.log("Left room successfully");
                    this.roomName = null;
                    this.roomId = null;
                    this.fast.forEach(connection => connection.conn.close());
                    this.fast = new Map();
                }
                case "list": {
                    list.set(msg.rooms);
                }
                case "error": {
                    console.error(msg.e);
                }
            }
        });
    }

    refreshList() {
        this.ws.send(JSON.stringify({ t: "list" }));
    }

    send(data: any) {
        this.ws.send(data);
    }
}

export const connection: Writable<WebsocketConnection|null> = writable(null);
export const list: Writable<{ id: string, name: string, count: number }[]|null> = writable(null);