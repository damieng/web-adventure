
class GameLocation {
    public Description: string;
    public Connections = new Map<string, number>();

    constructor(description: string) {
        this.Description = description;
    }
}

class Glyph {
    public Data: Array<number>;

    constructor(data: Array<number>) {
        this.Data = data;
    }
}

class GameObject {
    public Description: string;
    public Words = new Map<string, number>();
    public IsWearable: boolean;
    public IsContainer: boolean;
    public Weighs: number;

    constructor(description: string) {
        this.Description = description;
    }
}

class Command {
    public Action: string;
    public References: Array<number>;

    constructor(action: string, references: Array<number>) {
        this.Action = action;
        this.References = references;
    }
}

class ProcessBlock {
    public Verb: string;
    public Noun: string;
    public Commands = new Array<Command>();

    constructor(verb: string, noun: string) {
        this.Verb = verb;
        this.Noun = noun;
    }
}

class PawAdventureDefinition {
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

enum VocabType {
    RESERVED,
    Adjective,
    Adverb,
    Conjunction,
    Noun,
    Pronoun,
    Preposition,
    Verb
}

class VocabDefinition {
    public Id: number;
    public Type: VocabType;
}

class Defaults {
    public CharacterSet: number;
    public InkColor: number;
    public PaperColor: number;
    public FlashState: number;
    public BrightState: number;
    public InverseState: number;
    public OverState: number;
    public BorderColor: number;
}

class Meta {
    public Extractor: string;
    public DatabaseVersion: number;
    public Compressed: boolean;
    public SnapshotType: string;
}
