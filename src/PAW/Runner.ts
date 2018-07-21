// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Adventure, GameLocation } from './Adventure';
import { LiteEvent } from '../Common/LiteEvent';

export class Runner {
    public Location: GameLocation;
    public Response: string;

    constructor(private adventure: Adventure) {
    }

    public Start(): void {
        this.setLocation(0);
    }

    public Process(command: string): void {
        this.Response = `I don't know how to ${command}`;
    }

    private setLocation(id: number): void {
        const newLocation = this.adventure.Locations.get(id);
        if (this.Location !== newLocation) {
            this.Location = newLocation;
            this.LocationChanged.trigger(newLocation);
        }
    }

    public readonly LocationChanged = new LiteEvent<GameLocation>();
}