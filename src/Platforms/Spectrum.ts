// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Color } from "../Common/Color";
import { Platform } from "./Platform";

export class Spectrum implements Platform {
    constructor() {
    }

    public GetPalette(index: number): Color {
        return this.palette[index];
    }

    private palette: Array<Color> = [
        new Color(0, 0, 0),
        new Color(0, 0, 0xd7),
        new Color(0xd7, 0, 0),
        new Color(0xd7, 0, 0xd7),
        new Color(0, 0xd7, 0),
        new Color(0, 0xd7, 0xd7),
        new Color(0xd7, 0xd7, 0),
        new Color(0xd7, 0xd7, 0xd7)
    ];
}