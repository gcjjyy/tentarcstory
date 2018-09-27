import Screen from './Screen';
import SceneObject from './SceneObject';

export default class Plane extends SceneObject {
    private color: string = 'white';

    constructor(width: number, height: number, color: string) {
        super(width, height);
        this.color = color;
    }

    public onDraw = (screen: Screen): void => {
        screen.drawRect(this, this.getAbsoluteX(), this.getAbsoluteY(), this.getWidth(), this.getHeight(), this.color);
    }
}
