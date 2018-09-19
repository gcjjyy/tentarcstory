import GameObject from './GameObject';
import Image from './Image';

export default class Sprite extends GameObject {
    private image: Image;
    private sx: number;
    private sy: number;

    constructor(image: Image, sx: number, sy: number, width: number, height: number) {
        super(width, height);

        this.sx = sx;
        this.sy = sy;
        this.image = image;
    }

    public onDraw = (context2d: CanvasRenderingContext2D, scale: number): void => {
        context2d.drawImage(
            this.image.getImageElement(),
            this.sx, this.sy,
            this.getWidth(), this.getHeight(),
            this.getAbsoluteX() * scale,
            this.getAbsoluteY() * scale,
            this.getWidth() * scale,
            this.getHeight() * scale);
    }

    public setSourceX(sx: number): void {
        this.sx = sx;
    }

    public setSourceY(sy: number): void {
        this.sy = sy;
    }
}
