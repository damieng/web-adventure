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

    constructor(private adventure: Adventure, private playArea: HTMLElement) {
        this.runner = new Runner(adventure);
        this.doc = playArea.ownerDocument;
        this.log = console.log;
        this.log(adventure);
        this.attachEvents();
    }

    public Start() {
        this.setDefaultStyles(this.playArea);
        this.runner.Start();
    }

    private setDefaultStyles(element: HTMLElement) {
        const defaults = this.adventure.Defaults;
        const getPalette = (i: number) => this.platform.GetPalette(i).toHex();
        element.style.color = getPalette(defaults.InkColor);
        element.style.backgroundColor = getPalette(defaults.BorderColor);
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

        let mode = '';
        let textContainer = container;

        for (let line of text.replace(/\{128}/g, ' ').split(/\^\{7\}/g)) {
            for (let segment of line.match(/({\d+})|([^{}]+)/g) || ['']) {
                const escape = (segment.match(/{(\d+)}/) || ['', ''])[1];
                if (escape !== '' && mode === 'color') {
                    textContainer = this.createColorSpan(parseInt(escape), container, textContainer);
                    mode = '';
                } else if (escape === '16') {
                    mode = 'color';
                } else {
                    textContainer.appendChild(this.doc.createTextNode(segment));
                }
            }
            textContainer.appendChild(this.doc.createElement('br'));
        }
    }

    private createColorSpan(paletteIndex: number, container: HTMLElement, textContainer: HTMLElement): HTMLElement {
        const coloredSpan = this.doc.createElement('span');
        coloredSpan.style.color = this.platform.GetPalette(paletteIndex).toRgb();
        container.appendChild(coloredSpan);
        textContainer = coloredSpan;
        return textContainer;
    }
}