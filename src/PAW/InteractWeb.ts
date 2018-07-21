// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Spectrum } from '../Platforms/Spectrum';
import { Runner } from './Runner';
import { Adventure, GameLocation } from './Adventure';
import { Platform } from '../Platforms/Platform';

export class InteractWeb {
    private doc: HTMLDocument;
    private log: (text: any) => void;
    private runner: Runner;
    private platform: Platform = new Spectrum();

    constructor(private adventure: Adventure, private playArea: Node) {
        this.runner = new Runner(adventure);
        this.doc = playArea.ownerDocument;
        this.log = console.log;
        this.attachEvents();
    }

    public Start() {
        this.runner.Start();
    }

    private attachEvents(): void {
        this.runner.LocationChanged.on(this.onLocationChanged.bind(this));
    }

    private onLocationChanged(location: GameLocation): void {
        this.displayLocation(location);
    }

    private displayLocation(location: GameLocation): void {
        const locationDiv = this.doc.createElement('div');
        this.BuildHTML(location.Description, locationDiv);
        this.playArea.appendChild(locationDiv);
    }

    public BuildHTML(text: string, container: HTMLElement): void {
        if (!text) return;

        const lines = text.replace(/\{128}/g, ' ').split(/\^\{7\}/g);

        let mode = '';
        let textContainer = container;

        for (let line of lines) {
            const segments = line.match(/({\d+})|([^{}]+)/g);
            for (let segment of segments || ['']) {
                const escapeCode = segment.match(/{(\d+)}/);
                if (escapeCode) {
                    switch (escapeCode[1]) {
                        case '16': {
                            mode = 'color';
                            break;
                        }
                        default: {
                            switch (mode) {
                                case 'color': {
                                    const paletteIndex = parseInt(escapeCode[1]);
                                    const coloredSpan = this.doc.createElement('span');
                                    coloredSpan.style.color = this.platform.GetPalette(paletteIndex).toRgb();
                                    container.appendChild(coloredSpan);
                                    textContainer = coloredSpan;
                                    mode = '';
                                }
                            }
                        }
                    }
                } else {
                    textContainer.appendChild(this.doc.createTextNode(segment));
                }
            }
            textContainer.appendChild(this.doc.createElement('br'));
        }
    }
}