// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Color } from "../Common/Color";

export interface Platform {
    GetPalette(index: number): Color;
}
