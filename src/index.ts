
class GameLocation {
}

class GameObject {
}

class GameMessage {
}

class PawAdventureDefinition {
    public Messages = new Map<number, string>();
    public Meta = new Meta();
    public Defaults = new Defaults();

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
    [ "General data", SourceSection.GeneralData ],
    [ "Vocabulary", SourceSection.Vocabulary ],
    [ "Messages", SourceSection.Messages ],
    [ "System messages", SourceSection.SystemMessages ],
    [ "Locations", SourceSection.Locations ],
    [ "Connections", SourceSection.Connections ],
    [ "Object names", SourceSection.ObjectNames ],
    [ "Object words", SourceSection.ObjectWords ],
    [ "Initially at", SourceSection.InitiallyAt ],
    [ "Object weight and type", SourceSection.ObjectWeightAndType ],
    [ "Response table", SourceSection.ResponseTable ],
    [ "Process", SourceSection.Process ],
    [ "Graphics data", SourceSection.GraphicsData ],
    [ "Charset", SourceSection.Charset ]
])

class PawReader {
    public static async Parse(source: string[]): Promise<PawAdventureDefinition> {
        const adventure = new PawAdventureDefinition();
        let section = SourceSection.Preamble;

        for (let i = 0; i < source.length; i++) {
            let line = source[i].trim();
            if (line == '' || line.startsWith('-----')) continue;

            const newSection = sectionHeadings.get(line);
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
                }
            }
        }

        return adventure;
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