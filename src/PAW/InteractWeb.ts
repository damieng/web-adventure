// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Spectrum } from '../Platforms/Spectrum';
import { Runner } from './Runner';
import { Adventure, GameLocation, TextState, EscapeCode } from './Adventure';
import { Platform } from '../Platforms/Platform';


export class InteractWeb {
    private doc: HTMLDocument;
    private log: (text: any) => void;
    public runner: Runner;
    private platform: Platform = new Spectrum();
    private textState: TextState;

    constructor(private adventure: Adventure, private playArea: HTMLElement) {
        this.log = console.log;
        this.runner = new Runner(adventure, this.log);
        this.doc = playArea.ownerDocument;
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
        if (location == null) return;
        
        const locationDiv = this.doc.createElement('div');
        locationDiv.classList.add('location');
        this.BuildHTML(location.Description, locationDiv);
        this.playArea.appendChild(locationDiv);
    }

    private processEscapeSequence(escapeSequence: EscapeCode[]): TextState {
        const newTextState = Object.assign(this.textState);
        let lastEscapeCode: EscapeCode = null;
        for (let escape of escapeSequence) {
            switch (lastEscapeCode) {
                case EscapeCode.Paper:
                    newTextState.PaperColor = escape;
                    lastEscapeCode = null;
                    break;
                case EscapeCode.Ink:
                    newTextState.InkColor = escape;
                    lastEscapeCode = null;
                    break;
                case EscapeCode.Bright:
                    newTextState.BrightState = escape;
                    lastEscapeCode = null;
                    break;
                case EscapeCode.Flash:
                    newTextState.FlashState = escape;
                    lastEscapeCode = null;
                    break;
                case EscapeCode.Inverse:
                    newTextState.InverseState = escape;
                    lastEscapeCode = null;
                    break;
                default: {
                    switch (escape) {
                        case EscapeCode.Charset0:
                        case EscapeCode.Charset1:
                        case EscapeCode.Charset2:
                        case EscapeCode.Charset3:
                        case EscapeCode.Charset4:
                        case EscapeCode.Charset5:
                            newTextState.CharacterSet = escape;
                            break;
                    }
                }
            }
        }
        return newTextState;
    }

    public BuildHTML(text: string, container: HTMLElement): void {
        if (!text) return;

        const lines = text.split('\n');
        let textState = this.textState;
        let textContainer = container;

        for (let line of lines) {
            const segments = line.match(/({\d+})+|([^{]*)/g).filter(s => s != null);
            for (let segment of segments) {
                if (segment.indexOf('{') == -1) {
                    textContainer.appendChild(this.doc.createTextNode(segment));
                } else {
                    const escapeSequence = segment.split('{').map(p => parseInt(p)).filter(e => !isNaN(e));
                    textState = this.processEscapeSequence(escapeSequence);
                    const styledSpan = this.createStyledSpan(textState);
                    textContainer.appendChild(styledSpan);                    
                    textContainer = styledSpan;
                }
            }
            textContainer.appendChild(this.doc.createElement('br'));
        }
    }

    private createStyledSpan(s: TextState): HTMLSpanElement {
        const styledSpan = this.doc.createElement('span');
        const ink = this.platform.GetPalette(s.InkColor + s.BrightState * 16).toRgb();
        const paper = this.platform.GetPalette(s.PaperColor + s.BrightState * 16).toRgb();
        styledSpan.style.color = s.InverseState ? paper : ink;
        styledSpan.style.backgroundColor = s.InverseState ? ink : paper;
        styledSpan.classList.add(`charset${s.CharacterSet}`);
        // TODO: Flash & Over
        return styledSpan;
    }
}