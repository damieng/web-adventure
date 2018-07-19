// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

namespace PAW {
    export class PAWReader {
        public static async Parse(source: string[]): Promise<PAWAdventureDefinition> {
            const adventure = new PAWAdventureDefinition();
            await PAWReader.ParseAdventure(adventure, source);
            return adventure;
        }

        private static async ParseAdventure(adventure: PAWAdventureDefinition, source: string[]): Promise<void> {
            let section = SourceSection.Preamble;
            let processNumber = 0;

            for (let i = 0; i < source.length; i++) {
                let line = source[i].trim();
                if (line === '' || line.startsWith('-----')) continue;

                let newSection = sectionHeadings.get(line.toUpperCase());
                const processTokens = line.split(' ').filter(x => x !== '');
                switch (processTokens[0]) {
                    case 'PROCESS': {
                        newSection = SourceSection.Process;
                        processNumber = parseInt(processTokens[1]);
                        break;
                    }
                    case 'Charset': {
                        newSection = SourceSection.Charset;
                        break;
                    }
                }
                if (newSection) {
                    section = newSection;
                    continue;
                }

                switch (section) {
                    case SourceSection.Preamble: {
                        PAWReader.ParsePreamble(adventure, line);
                        break;
                    }
                    case SourceSection.GeneralData: {
                        PAWReader.ParseGeneralData(adventure, line);
                        break;
                    }
                    case SourceSection.Vocabulary: {
                        PAWReader.ParseVocabulary(adventure, line);
                        break;
                    }
                    case SourceSection.Messages: {
                        if (line.startsWith('Message')) {
                            adventure.Messages.set(parseInt(line.substring(7)), source[++i]);
                        } else {
                            throw new Error(`Unexpected line in Messages section '${line}'`);
                        }
                        break;
                    }
                    case SourceSection.SystemMessages: {
                        if (line.startsWith('System Message')) {
                            adventure.SystemMessages.set(parseInt(line.substring(14)), source[++i]);
                        } else {
                            throw new Error(`Unexpected line in System Messages section '${line}'`);
                        }
                        break;
                    }
                    case SourceSection.Locations: {
                        PAWReader.ParseKeyedDescription(adventure.Locations, line, source[++i], 'Location', (d) => new GameLocation(d));
                        break;
                    }
                    case SourceSection.Connections: {
                        if (line.startsWith('Location')) {
                            const lineTokens = line.split(':');
                            const locationId = parseInt(lineTokens[0].substring(8));
                            const location = adventure.Locations.getOrCreate(locationId, () => new GameLocation(''));

                            let connection = lineTokens[1];
                            do {
                                const tokens = connection.split(' ').filter(x => x !== '');
                                location.Connections.set(tokens[0], parseInt(tokens[1]));
                                connection = source[++i];
                            } while (connection.trim() !== '');
                        } else {
                            throw new Error(`Unexpected line in Locations section '${line}'`);
                        }
                        break;
                    }
                    case SourceSection.ObjectNames: {
                        PAWReader.ParseKeyedDescription(adventure.Objects, line, source[++i], 'Object', (d) => new GameObject(d));
                        break;
                    }
                    case SourceSection.ObjectWords: {
                        const tokens = line.split(' ').filter(x => x !== '');
                        if (tokens[0] === 'Object') {
                            const objectId = parseInt(tokens[1]);
                            const object = adventure.Objects.getOrCreate(objectId, () => new GameObject(''));
                            for (var p = 2; p < tokens.length - 1; p += 2) {
                                if ((tokens[p] !== '_') && (tokens[p + 1] !== '_')) {
                                    object.Words.set(tokens[p], parseInt(tokens[p + 1]));
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
                            const object = adventure.Objects.getOrCreate(objectId, () => new GameObject(''));
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
                        const nounTable = adventure.Responses.getOrCreate(tokens[0], () => new Map<string, Array<Command>>());
                        const commands = nounTable.getOrCreate(tokens[1], () => new Array<Command>());

                        let actionLine = tokens[2] + (tokens.length > 3 ? ' ' + tokens[3] : '');
                        do {
                            const actionTokens = actionLine.split(' ').filter(x => x !== '');
                            commands.push(new Command(actionTokens[0], actionTokens.slice(1).map(t => parseInt(t))));
                            actionLine = source[++i];
                        } while (actionLine.trim() !== '');
                        break;
                    }
                    case SourceSection.Process: {
                        let block: ProcessBlock | null = null;
                        do {
                            line = source[i];
                            const tokens = line.split(' ').filter(x => x !== '');
                            if (tokens.length > 0) {
                                const isNewBlock = line[0] != ' ';
                                if (isNewBlock) {
                                    block = new ProcessBlock(tokens.shift(), tokens.shift());
                                    const table = adventure.ProcessTables.getOrCreate(processNumber, () => new Array<ProcessBlock>());
                                    table.push(block);
                                }
                                block.Commands.push(new Command(tokens.shift(), tokens.map(t => parseInt(t))));
                            }
                        } while (!source[++i].startsWith('------'));
                        break;
                    }
                    case SourceSection.Charset: {
                        let charIndex = 0;
                        let charTable: Array<Glyph> = null;
                        do {
                            line = source[i];
                            if (line.startsWith('static char ')) {
                                charIndex = 0;
                                const charId = line.substring(12, line.indexOf('['));
                                switch (charId) {
                                    case 'udg_bits': {
                                        charTable = adventure.UserDefinedGraphics;
                                        break;
                                    }
                                    case 'shade_bits': {
                                        charTable = adventure.Shade;
                                        break;
                                    }
                                    default: {
                                        charTable = new Array<Glyph>();
                                        const fontIndex = parseInt(charId.substring(charId.lastIndexOf('_') + 1));
                                        adventure.Charsets[fontIndex] = charTable;
                                    }
                                }
                            } else {
                                const glyphTokens = line.split(',');
                                if (glyphTokens.length > 7) {
                                    const glyphData = glyphTokens.map(t => parseInt(t)).filter(t => !isNaN(t));
                                    charTable[charIndex++] = new Glyph(glyphData);
                                }
                            }
                        } while (++i < source.length);
                        break;
                    }
                }
            }
        }

        private static ParseKeyedDescription<T1>(map: Map<number, T1>, line: string, description: string, keyLineStart: string, creator: (description: string) => T1): void {
            if (line.startsWith(keyLineStart)) {
                const key = parseInt(line.substring(keyLineStart.length));
                if (description.trim() != '') {
                    map.getOrCreate(key, () => creator(description));
                }
            } else {
                throw new Error(`Unexpected line in ${keyLineStart} section '${line}'`);
            }
        }

        private static ParsePreamble(adventure: PAWAdventureDefinition, line: string): void {
            if (line.startsWith('Extracted by'))
                adventure.Meta.Extractor = line.substring(13).trim();
        }

        private static ParseGeneralData(adventure: PAWAdventureDefinition, line: string): void {
            if (line.startsWith('Database version'))
                adventure.Meta.DatabaseVersion = parseInt(line.substring(16));
            if (line.startsWith('Snapshot type'))
                adventure.Meta.SnapshotType = line.substring(13).trim();
        }

        private static ParseVocabulary(adventure: PAWAdventureDefinition, line: string): void {
            const tokens = line.split(' ').filter(t => t != '');
            if (tokens.length != 3)
                throw new Error(`Can't parse vocabulary line '${line}' - expect 3 parts`);

            const vocab = new VocabDefinition();
            vocab.Id = parseInt(tokens[1]),
                vocab.Type = PAWReader.GetVocabType(tokens[2]);
            adventure.Vocabulary.set(tokens[0], vocab);
        }

        private static GetVocabType(input: string): VocabType {
            switch (input) {
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
                headers: new Headers({ 'Content-Type': 'text/plain' })
            });

            const response = await fetch(request);
            return response.text();
        }
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
        ["GENERAL DATA", SourceSection.GeneralData],
        ["VOCABULARY", SourceSection.Vocabulary],
        ["MESSAGES", SourceSection.Messages],
        ["SYSTEM MESSAGES", SourceSection.SystemMessages],
        ["LOCATIONS", SourceSection.Locations],
        ["CONNECTIONS", SourceSection.Connections],
        ["OBJECT NAMES", SourceSection.ObjectNames],
        ["OBJECT WORDS", SourceSection.ObjectWords],
        ["INITIALLY AT", SourceSection.InitiallyAt],
        ["OBJECT WEIGHT AND TYPE", SourceSection.ObjectWeightAndType],
        ["RESPONSE TABLE", SourceSection.ResponseTable],
        ["PROCESS", SourceSection.Process],
        ["GRAPHICS DATA", SourceSection.GraphicsData],
        ["CHARSET", SourceSection.Charset]
    ])
}