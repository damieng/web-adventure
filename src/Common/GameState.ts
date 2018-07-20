namespace Common {
    export class GameState {
        public LocationDescription: string;
        public Response: string;

        constructor(fields: Partial<GameState>) {
            Object.assign(this, fields);
        }
    }
}