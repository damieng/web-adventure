// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

namespace PAW {
    export class PAWRunner {
        private Spectrum = new Common.Spectrum();

        public GameState: Common.GameState;

        constructor(private adventure: PAWAdventureDefinition) {
        }

        public Start(): void {
            this.GameState = new Common.GameState({
                LocationDescription: this.adventure.Locations.get(0).Description
            });
        }

        public Process(command: string): void {
            this.GameState.Response = `I don't know how to ${command}`;
        }

        public BuildHTML(text: string, container: HTMLElement, creator: ((tag: string, text?: string) => HTMLElement)): void {
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
                                        const coloredSpan = creator('span');
                                        coloredSpan.style.color = this.Spectrum.Palette[paletteIndex].toRgb();
                                        container.appendChild(coloredSpan);
                                        textContainer = coloredSpan;
                                        mode = '';
                                    }
                                }
                            }
                        }
                    } else {
                        textContainer.appendChild(creator('', segment));
                    }
                }
                textContainer.appendChild(creator('br'));
            }
        }
    }
}