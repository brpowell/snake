import { Scene } from './engine';
import { Colors } from './engine/types';
import { Snake } from './game/snake';
import { FoodSpawner } from './game/food';
import './styles/index.css';

export let MainScene: Scene;

export function startGame() {
    if (MainScene) {
        MainScene.destroy();
    }
    MainScene = new Scene(400, 400);
    MainScene.stroke = Colors.BLACK;

    const snake = new Snake(5, 15);
    MainScene.addComponent(snake);

    const foodSpawner = new FoodSpawner();
    foodSpawner.update();
    MainScene.addComponent(foodSpawner);

    MainScene.start(10);
}

startGame();