import { Color, Colors } from './types';
import { GameComponent } from './component';
import { setInterval, clearInterval } from 'timers';

/**
 * Object for managing GameComponents and the canvas
 */
export class Scene {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private color: Color = { fill: 'white', stroke: 'white' };
    private components: { [key: string]: GameComponent } = {};
    private interval?: NodeJS.Timeout;
    private _framerate: number = 60;

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Error getting canvas context');
        }
        this.context = context;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    /** Frames to render per second */
    get framerate(): number {
        return this._framerate;
    }

    set framerate(framerate: number) {
        if (this.interval) {
            clearInterval(this.interval)
        }
        if (framerate > 0) {
            this.interval = setInterval(() => { this.frameStep() }, 1000 / framerate)
        }
        this._framerate = framerate;
    }

    /** Border color of scene */
    set strokeColor(color: Colors | string) {
        this.color.stroke = color;
    }

    /** Background color of scene */
    set fillColor(color: Colors | string) {
        this.color.fill = color;
    }

    /**
     * Add a game component to the scene
     * @param component 
     */
    public addComponent(component: GameComponent): void {
        this.components[component.id] = component;
    }

    /**
     * Returns a GameComponent from the scene with the given id.
     * @param id of GameComponent
     */
    public getComponent(id: string): GameComponent {
        const component = this.components[id];
        if (!component) {
            throw new Error(`GameComponent with id ${id} does not exist`);
        }
        return component;
    }

    /**
     * Begin rendering scene
     * @param framerate of scene
     */
    public start(framerate: number) {
        const canvasBody = document.getElementById('canvasBody');
        if (!canvasBody) {
            throw new Error('Missing canvasBody element to attach canvas to');
        }
        canvasBody.appendChild(this.canvas);
        this.framerate = framerate;
    }

    /**
     * Stop the scene from rendering and destroy canvas element
     */
    public destroy() {
        this.framerate = 0;
        this.canvas.remove();
    }
    
    /**
     * Update and draw every GameComponent in the scene
     */
    private frameStep() {
        this._clear();
        Object.keys(this.components).forEach(k => {
            this.components[k].update();
            this.components[k].draw(this.context);
        });
    }

    private _clear = () => {
        const { width, height } = this.canvas;
        this.context.fillStyle = this.color.fill;
        this.context.strokeStyle = this.color.stroke;
        this.context.fillRect(0, 0, width, height);
        this.context.strokeRect(0, 0, width, height);
    }
}