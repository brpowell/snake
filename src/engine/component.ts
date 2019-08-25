export class GameComponent {
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    // GameComponents don't have to be smart or visible
    public update() {}
    public draw(canvasCtx: CanvasRenderingContext2D) {}
}