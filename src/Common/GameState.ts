namespace Common {
    export class GameState {
        public readonly LocationDescription: string;
        public readonly Response: string;

        constructor(fields: Partial<GameState>) {
            Object.assign(this, fields);
        }
    }
}