import Phaser, { Animations } from "phaser";

var fpsBuffer: number[] = [];

export class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: "GameScene",
            active: true,
            physics: {
                default: "arcade"
            }
        });
    }

    unload() {}
    preload() {}

    create() {}
    
    update(time: number, delta: number) {
        fpsBuffer.push(delta);
        if (fpsBuffer.length > 10) {
            fpsBuffer.shift();
        }
        const fps = fpsBuffer.reduce((a, b) => a + b, 0) / fpsBuffer.length;
    }
}
