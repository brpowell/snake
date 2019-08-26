import { Scene } from './engine';
import { Colors } from './engine/types';
import { FoodSpawner, Snake } from './game';
import './styles/index.css';

export let MainScene: Scene;

document.getElementById('retry')!.onclick = () => {
    startGame();
}

export function startGame() {
    if (MainScene) {
        MainScene.destroy();
    }
    MainScene = new Scene(400, 400);
    MainScene.strokeColor = Colors.BLACK;

    const snake = new Snake(5, 15);
    MainScene.addComponent(snake);

    const foodSpawner = new FoodSpawner();
    foodSpawner.update();
    MainScene.addComponent(foodSpawner);

    MainScene.start(10);
}

startGame();