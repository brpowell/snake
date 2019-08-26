import { GameComponent } from '../engine';
import { Snake } from './snake';
import { Point } from '../engine/types';
import { MainScene } from '..';

export class FoodSpawner extends GameComponent {
    public foodSpawned: boolean = false;

    constructor() {
        super('foodSpawner');
    }

    public update() {
        if (!this.foodSpawned) {
            const snake = MainScene.getComponent('snake') as Snake;
            const { partWidth: pw } = snake;
            let isOnSnake = true;
            while (isOnSnake) {
                const foodX = this.randomCoordinate(0, MainScene.width - pw, pw);
                const foodY = this.randomCoordinate(0, MainScene.height - pw, pw);
                isOnSnake = snake.getParts().some(
                    part => part.x === foodX && part.y === foodY
                );
                if (!isOnSnake) {
                    MainScene.addComponent(new Food(foodX, foodY));
                    this.foodSpawned = true;
                }
            }
        }
    }

    private randomCoordinate(min: number, max: number, snakePartWidth: number): number {
        return Math.round((Math.random() * (max - min) + min) / snakePartWidth) * snakePartWidth;
    }
}

export class Food extends GameComponent {
    public location: Point;
    
    constructor(x: number, y: number) {
        super('food');
        this.location = { x, y };
    }

    public draw(canvasCtx: CanvasRenderingContext2D) {
        const { partWidth } = (MainScene.getComponent('snake') as Snake);
        const { x, y } = this.location;
        canvasCtx.fillStyle = 'yellow';
        canvasCtx.strokeStyle = 'black';
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, (partWidth / 2) - 2, 0, 2*Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }
}