/**
 * Container for adding a component to a game's scene
 */
export class GameComponent {
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    // GameComponents don't have to be smart or visible

    /** Called each frame. Reserved for the main logic of the component */
    public update() {}

    /** Called each frame. Reserved for drawing the component in a scene */
    public draw(canvasCtx: CanvasRenderingContext2D) {}
}