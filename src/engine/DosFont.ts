import Font from './Font';
import Screen from './Screen';
import LocalFileLoader from './LocalFileLoader';
import SceneObject from '@/engine/SceneObject';

export default class DosFont extends Font {
    private static choType: number[] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 2, 4, 4, 4, 2, 1, 3, 0,
    ];
    private static choTypeJongExist: number[] = [
        0, 5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 6, 6, 7, 7, 7, 6, 6, 7, 5,
    ];
    private static jongType: number[] = [
        0, 0, 2, 0, 2, 1, 2, 1, 2, 3, 0, 2, 1, 3, 3, 1, 2, 1, 3, 3, 1, 1,
    ];
    private static jamoTable: number[] = [
        1, 2, 0, 3, 0, 0,  4,  5,  6,  0,  0,  0,  0,  0,  0,
        0, 7, 8, 9, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ];

    private static indexJoongStart = 160;
    private static indexJongStart = 160 + 88;

    private engFont: number[][] = []; // 256x16x8 (number as uint8)
    private korFont: number[][] = []; // 360x16x16 (number as uint16)

    private engFontReady = false;
    private korFontReady = false;

    private imgData: ImageData | null = null;

    constructor(engFilename: string, korFilename: string) {
        super();

        this.loadEnglishFont(engFilename);
        this.loadKoreanFont(korFilename);
    }

    public loadEnglishFont(filename: string): void {
        const loader = new LocalFileLoader();
        loader.loadAsBinary(filename, (buffer: ArrayBuffer | null): any => {
            if (buffer) {
                const array = new Uint8Array(buffer);
                for (let i = 0; i < 256; i++) {
                    this.engFont[i] = [];
                    for (let j = 0; j < 16; j++) {
                        this.engFont[i][j] = array[16 * i + j];
                    }
                }
                this.engFontReady = true;
            }
        });
    }

    public loadKoreanFont(filename: string): void {
        const loader = new LocalFileLoader();
        loader.loadAsBinary(filename, (buffer: ArrayBuffer | null): any => {
            if (buffer) {
                const array = new Uint16Array(buffer);
                for (let i = 0; i < 360; i++) {
                    this.korFont[i] = [];
                    for (let j = 0; j < 16; j++) {
                        this.korFont[i][j] = array[16 * i + j];
                    }
                }
                this.korFontReady = true;
            }
        });
    }

    public getWidth = (ch: string): number => {
        if (ch.charCodeAt(0) < 256) {
            return 8;
        } else {
            return 16;
        }
    }

    public getHeight = (): number => {
        return 16;
    }

    /**
     * Return value: {x, y} of the glyph
     */
    public drawGlyph = (
        sender: SceneObject,
        screen: Screen,
        x: number,
        y: number,
        fontColor: string,
        ch: string): void => {

        if (this.imgData === null) {
            this.imgData = screen.createImageData(16, 16);
        }

        if (this.imgData) {

            /**
             * Clear ImageData
             */
            for (let i = 0; i < 16 * 16 * 4; i++) {
                this.imgData.data[i] = 0;
            }

            let code = ch.charCodeAt(0);

            if (this.engFontReady && code < 256) {
                this.drawEngGlyph(this.imgData, fontColor, code);
            } else if (this.korFontReady) {
                code -= 0xac00;

                const cho = Math.floor(Math.floor(code / 28) / 21) + 1;
                const joong = (Math.floor(code / 28) % 21) + 1;
                const jong = code % 28;

                const choType = (jong) ? DosFont.choTypeJongExist[joong] : DosFont.choType[joong];
                const joongType = ((cho === 1 || cho === 16) ? 0 : 1) + (jong ? 2 : 0);
                const jongType = DosFont.jongType[joong];

                this.drawKorGlyph(this.imgData, fontColor, choType * 20 + cho);
                this.drawKorGlyph(this.imgData, fontColor, DosFont.indexJoongStart + (joongType * 22 + joong));

                if (jong) {
                    this.drawKorGlyph(this.imgData, fontColor, DosFont.indexJongStart + (jongType * 28 + jong));
                }
            }

            screen.drawImageData(this.imgData, x, y);
        }
    }

    private drawEngGlyph(
        imgData: ImageData,
        fontColor: string,
        code: number): void {

        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.engFont[code][i] & (0x80 >> j)) {
                    const index = ((i << 4) + j) << 2;
                    imgData.data[index + 0] = 0xff;
                    imgData.data[index + 1] = 0xff;
                    imgData.data[index + 2] = 0xff;
                    imgData.data[index + 3] = 0xff;
                }
            }
        }
    }

    private drawKorGlyph(
        imgData: ImageData,
        fontColor: string,
        code: number): void {

        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.korFont[code][i] & (0x0080 >> j)) {
                    const index = ((i << 4) + j) << 2;
                    imgData.data[index + 0] = 0xff;
                    imgData.data[index + 1] = 0xff;
                    imgData.data[index + 2] = 0xff;
                    imgData.data[index + 3] = 0xff;
                }
            }
            for (let j = 0; j < 8; j++) {
                if (this.korFont[code][i] & (0x8000 >> j)) {
                    const index = ((i << 4) + j + 8) << 2;
                    imgData.data[index + 0] = 0xff;
                    imgData.data[index + 1] = 0xff;
                    imgData.data[index + 2] = 0xff;
                    imgData.data[index + 3] = 0xff;
                }
            }
        }
    }
}
