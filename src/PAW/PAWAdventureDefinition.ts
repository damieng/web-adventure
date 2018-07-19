// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

namespace PAW {
    export class PAWAdventureDefinition {
        public Charsets = new Array<Array<Glyph>>();
        public UserDefinedGraphics = new Array<Glyph>();
        public Shade = new Array<Glyph>();

        public Defaults = new Defaults();
        public Locations = new Map<number, GameLocation>();
        public Messages = new Map<number, string>();
        public Meta = new Meta();
        public Objects = new Map<number, GameObject>();
        public Responses = new Map<string, Map<string, Array<Command>>>();
        public ProcessTables = new Map<number, Array<ProcessBlock>>();
        public SystemMessages = new Map<number, string>();
        public Vocabulary = new Map<string, VocabDefinition>();
    }

    export class Glyph {
        public Data: Array<number>;

        constructor(data: Array<number>) {
            this.Data = data;
        }
    }

    export class Defaults {
        public CharacterSet: number;
        public InkColor: number;
        public PaperColor: number;
        public FlashState: number;
        public BrightState: number;
        public InverseState: number;
        public OverState: number;
        public BorderColor: number;
    }

    export class GameLocation {
        public Description: string;
        public Connections = new Map<string, number>();

        constructor(description: string) {
            this.Description = description;
        }
    }

    export class Meta {
        public Extractor: string;
        public DatabaseVersion: number;
        public Compressed: boolean;
        public SnapshotType: string;
    }

    export class GameObject {
        public Description: string;
        public Words = new Map<string, number>();
        public IsWearable: boolean;
        public IsContainer: boolean;
        public Weighs: number;

        constructor(description: string) {
            this.Description = description;
        }
    }

    export class Command {
        public Action: string;
        public References: Array<number>;

        constructor(action: string, references: Array<number>) {
            this.Action = action;
            this.References = references;
        }
    }

    export class ProcessBlock {
        public readonly Verb: string;
        public readonly Noun: string;
        public readonly Commands = new Array<Command>();

        constructor(verb: string, noun: string) {
            this.Verb = verb;
            this.Noun = noun;
        }
    }

    export class VocabDefinition {
        public Id: number;
        public Type: VocabType;
    }

    export enum VocabType {
        RESERVED,
        Adjective,
        Adverb,
        Conjunction,
        Noun,
        Pronoun,
        Preposition,
        Verb
    }
}
