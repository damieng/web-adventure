// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

namespace PAW {
    export class PAWRunner {
        constructor(private adventure: PAWAdventureDefinition)
        {
        }

        public Start(): Common.GameState {
            return new Common.GameState({
                LocationDescription: "I AM in the drawing room - a peaceful place, furnished simply but (if I may say so) elegantly"
            });
        }

        public Process(command: string): Common.GameState
        {
            return new Common.GameState({
                Response: ""
            });
        }
    }
}