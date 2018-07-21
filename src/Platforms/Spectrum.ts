// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Color } from "../Common/Color";
import { Platform } from "./Platform";

export class Spectrum implements Platform {
    constructor() {
    }

    public GetPalette(index: number): Color {
        return palette[index];
    }

    public WasCentered(text: string): boolean {
        if (text === '') return false;
        const parts = text.split(/(\s*)(.*)/).filter(p => p);
        if (parts.length != 2) {
            parts.unshift('');
        }
        const position = screenWidth / 2 - parts[1].length / 2;
        const indent = parts[0].length;
        return Math.round(position) == indent || Math.floor(position) == indent;
    }
}

const screenWidth = 32;

const palette = [
    new Color(0, 0, 0),
    new Color(0, 0, 0xd7),
    new Color(0xd7, 0, 0),
    new Color(0xd7, 0, 0xd7),
    new Color(0, 0xd7, 0),
    new Color(0, 0xd7, 0xd7),
    new Color(0xd7, 0xd7, 0),
    new Color(0xd7, 0xd7, 0xd7)
];
