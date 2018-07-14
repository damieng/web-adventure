
class GameLocation {
    public Description: string;
    public Connections = new Map<string, number>();

    constructor(description: string) {
        this.Description = description;
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

class PawAdventureDefinition {
    public Defaults = new Defaults();
    public Locations = new Map<number, GameLocation>();
    public Messages = new Map<number, string>();
    public Meta = new Meta();
    public Objects = new Map<number, GameObject>();
    public Responses = new Map<string, Map<string, Array<Command>>>();
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

enum SourceSection {
    Preamble,
    GeneralData,
    Vocabulary,
    Messages,
    SystemMessages,
    Locations,
    Connections,
    ObjectNames,
    ObjectWords,
    InitiallyAt,
    ObjectWeightAndType,
    ResponseTable,
    Process,
    GraphicsData,
    Charset
}

const sectionHeadings = new Map([
    [ "GENERAL DATA", SourceSection.GeneralData ],
    [ "VOCABULARY", SourceSection.Vocabulary ],
    [ "MESSAGES", SourceSection.Messages ],
    [ "SYSTEM MESSAGES", SourceSection.SystemMessages ],
    [ "LOCATIONS", SourceSection.Locations ],
    [ "CONNECTIONS", SourceSection.Connections ],
    [ "OBJECT NAMES", SourceSection.ObjectNames ],
    [ "OBJECT WORDS", SourceSection.ObjectWords ],
    [ "INITIALLY AT", SourceSection.InitiallyAt ],
    [ "OBJECT WEIGHT AND TYPE", SourceSection.ObjectWeightAndType ],
    [ "RESPONSE TABLE", SourceSection.ResponseTable ],
    [ "PROCESS", SourceSection.Process ],
    [ "GRAPHICS DATA", SourceSection.GraphicsData ],
    [ "CHARSET", SourceSection.Charset ]
])

class PawReader {
    public static async Parse(source: string[]): Promise<PawAdventureDefinition> {
        const adventure = new PawAdventureDefinition();
        let section = SourceSection.Preamble;

        for (let i = 0; i < source.length; i++) {
            let line = source[i].trim();
            if (line === '' || line.startsWith('-----')) continue;

            const newSection = sectionHeadings.get(line.toUpperCase());
            if (newSection) {
                section = newSection;
                continue;
            }

            switch(section) {
                case SourceSection.Preamble: {
                    PawReader.ParsePreamble(adventure, line);
                    break;
                }
                case SourceSection.GeneralData: {
                    PawReader.ParseGeneralData(adventure, line);
                    break;
                }
                case SourceSection.Vocabulary: {
                    PawReader.ParseVocabulary(adventure, line);
                    break;
                }
                case SourceSection.Messages: {
                    if (line.startsWith('Message')) {
                        adventure.Messages[parseInt(line.substring(7))] = source[++i];
                    } else {
                        throw new Error(`Unexpected line in Messages section '${line}'`);
                    }
                    break;
                }
                case SourceSection.SystemMessages: {
                    if (line.startsWith('System Message')) {
                        adventure.SystemMessages[parseInt(line.substring(14))] = source[++i];
                    } else {
                        throw new Error(`Unexpected line in System Messages section '${line}'`);
                    }
                    break;
                }
                case SourceSection.Locations: {
                    PawReader.ParseKeyedDescription(adventure.Locations, line, source[++i], 'Location', (d) => new GameLocation(d));
                    break;
                }
                case SourceSection.Connections: {
                    if (line.startsWith('Location')) {
                        const lineTokens = line.split(':');
                        const locationId = parseInt(lineTokens[0].substring(8));
                        const location = PawReader.GetOrCreate(adventure.Locations, locationId, () => new GameLocation(''));

                        let connection = lineTokens[1];
                        do {
                            const tokens = connection.split(' ').filter(x => x !== '');
                            location.Connections.set(tokens[0], parseInt(tokens[1]));
                            connection = source[++i];
                        } while(connection.trim() !== '');
                    } else {
                        throw new Error(`Unexpected line in Locations section '${line}'`);
                    }
                    break;
                }
                case SourceSection.ObjectNames: {
                    PawReader.ParseKeyedDescription(adventure.Objects, line, source[++i], 'Object', (d) => new GameObject(d));
                    break;
                }
                case SourceSection.ObjectWords: {
                    const tokens = line.split(' ').filter(x => x !== '');
                    if (tokens[0] === 'Object') {
                        const objectId = parseInt(tokens[1]);
                        const object = PawReader.GetOrCreate(adventure.Objects, objectId, () => new GameObject(''));
                        for (var p = 2; p < tokens.length - 1; p += 2) {
                            if ((tokens[p] !== '_') && (tokens[p+1] !== '_')) {
                                object.Words.set(tokens[p], parseInt(tokens[p+1]));
                            }
                        }
                    } else {
                        throw new Error(`Unexpected line in Object Words section '${line}'`);
                    }
                    break;
                }
                case SourceSection.ObjectWeightAndType: {
                    const tokens = line.split(':');
                    if (tokens[0].startsWith('Object')) {
                        const objectId = parseInt(tokens[0].substring(6));
                        const object = PawReader.GetOrCreate(adventure.Objects, objectId, () => new GameObject(''));
                        const weightTokens = tokens[1].split(' ').filter(x => x !== '');
                        if (weightTokens[0] === 'weights') {
                            object.Weighs = parseInt(weightTokens[1]);
                            object.IsWearable = weightTokens.filter(t => t === 'W').length > 0;
                            object.IsContainer = weightTokens.filter(t => t === 'C').length > 0;
                        }
                        else {
                            throw new Error(`Unexpected line in Object Words weights token '${line}'`);
                        }
                    } else {
                        throw new Error(`Unexpected line in Object Words section '${line}'`);
                    }
                    break;
                }
                case SourceSection.ResponseTable: {
                    const tokens = line.split(' ').filter(x => x !== '');
                    const nounTable = PawReader.GetOrCreate(adventure.Responses, tokens[0], () => new Map<string, Array<Command>>());
                    const commands = PawReader.GetOrCreate(nounTable, tokens[1], () => new Array<Command>());

                    let actionLine = tokens[2] + (tokens.length > 3 ? ' ' + tokens[3] : '');
                    do {
                        const actionTokens = actionLine.split(' ').filter(x => x !== '');
                        commands.push(new Command(actionTokens[0], actionTokens.slice(1).map(t => parseInt(t))));
                        actionLine = source[++i];
                    } while(actionLine.trim() !== '');
                }
            }
        }

        return adventure;
    }

    private static GetOrCreate<T1, T2>(map: Map<T1, T2>, key: T1, creator: (() => T2)): T2 {
        let value = map.get(key);
        if (!value) {
            value = creator();
            map.set(key, value);
        }
        return value;
    }

    private static ParseKeyedDescription<T1>(map: Map<number, T1>, line: string, description: string, keyLineStart: string, creator: (description: string) => T1): void {
        if (line.startsWith(keyLineStart)) {
            const key = parseInt(line.substring(keyLineStart.length));
            if (description.trim() != '') {
                PawReader.GetOrCreate(map, key, () => creator(description));
            }
        } else {
            throw new Error(`Unexpected line in ${keyLineStart} section '${line}'`);
        }
    }

    private static ParsePreamble(adventure: PawAdventureDefinition, line: string): void {
        if (line.startsWith('Extracted by'))
            adventure.Meta.Extractor = line.substring(13).trim();
    }

    private static ParseGeneralData(adventure: PawAdventureDefinition, line: string): void {
        if (line.startsWith('Database version'))
            adventure.Meta.DatabaseVersion = parseInt(line.substring(16));
        if (line.startsWith('Snapshot type'))
            adventure.Meta.SnapshotType = line.substring(13).trim();
    }

    private static ParseVocabulary(adventure: PawAdventureDefinition, line: string): void {
        const tokens = line.split(' ').filter(t => t != '');
        if (tokens.length != 3)
            throw new Error(`Can't parse vocabulary line '${line}' - expect 3 parts`);

        const vocab = new VocabDefinition();
        vocab.Id = parseInt(tokens[1]),
        vocab.Type = PawReader.GetVocabType(tokens[2]);
        adventure.Vocabulary[tokens[0]] = vocab;
    }

    private static GetVocabType(input: string): VocabType {
        switch(input) {
            case 'RESERVED': return VocabType.RESERVED;
            case 'Adjective': return VocabType.Adjective;
            case 'Adverb': return VocabType.Adverb;
            case 'Conjunction': return VocabType.Conjunction;
            case 'Noun': return VocabType.Noun;
            case 'Pronoun': return VocabType.Pronoun;
            case 'Preposition': return VocabType.Preposition;
            case 'Verb': return VocabType.Verb;
            default:
                throw new Error(`Unknown vocabulary type '${input}'`)
        }
    }

    public static async GetSource(uri: string): Promise<string> {
        const request = new Request(uri, {
            headers: new Headers({'Content-Type': 'text/plain'})
        });

        const response = await fetch(request);
        return response.text();
    }
}