// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

export enum PlatformType { SinclairSpectrum, AmstradCPC, Commodore64, AcornBBCMicro };

export class Adventure {
    public readonly PlatformType: PlatformType;

    public readonly Charsets = new Array<Array<Glyph>>();
    public readonly UserDefinedGraphics = new Array<Glyph>();
    public readonly Shade = new Array<Glyph>();

    public readonly Defaults = new Defaults();
    public readonly Locations = new Map<number, GameLocation>();
    public readonly Messages = new Map<number, string>();
    public readonly Meta = new Meta();
    public readonly Objects = new Map<number, GameObject>();
    public readonly Responses = new Map<string, Map<string, Array<Command>>>();
    public readonly ProcessTables = new Map<number, Array<ProcessBlock>>();
    public readonly SystemMessages = new Map<number, string>();
    public readonly Vocabulary = new Map<string, VocabDefinition>();

    constructor(platformType: PlatformType) {
        this.PlatformType = platformType;
    }
}

export class Glyph {
    public readonly Data: Array<number>;

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
