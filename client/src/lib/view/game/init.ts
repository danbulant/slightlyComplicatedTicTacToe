import { CANVAS, Game, Scale, WEBGL } from "phaser";
import { GameScene } from "./scene";

var ratio = window.devicePixelRatio || 1;
export function resize() {
    if(!game || !htmlcanvas) return;
    // try {
    //     game.scale.resize(htmlcanvas.parentElement!.clientWidth * ratio, htmlcanvas.parentElement!.clientHeight * ratio);
    // } catch(e) {
    //     // @ts-ignore
    //     console.error(e, new ErrorEvent(e.type, { colno: e.colno, error: e, lineno: e.lineno, message: e.message, filename: e.filename }));
    //     window.dispatchEvent(new ErrorEvent("error", e as any));
    // }
    // console.log("size", htmlcanvas.parentElement!.clientWidth * ratio, htmlcanvas.parentElement!.clientHeight * ratio);
}

var htmlcanvas: HTMLCanvasElement;
var game: Game;
var gs: GameScene | null = null;
export function setCanvas(canvas: HTMLCanvasElement) {
    htmlcanvas = canvas;
    var ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");
    gs = new GameScene();
    game = new Game({
        canvas: canvas,
        url: window.location.host,
        hideBanner: true,
        type: ctx ? WEBGL : CANVAS,
        // @ts-ignore
        context: ctx || canvas.getContext("2d"),
        customEnvironment: false,
        width: window.innerWidth * ratio,
        height: window.innerHeight * ratio,
        scale: {
            mode: Scale.RESIZE
        },
        physics: {
            default: "arcade",
        },
        title: "Multidie",
        version: "0",
        scene: [gs],
        backgroundColor: "#85e65c",
        banner: false
    });
}

export function stop() {
    game.destroy(false);
    gs = null;
}