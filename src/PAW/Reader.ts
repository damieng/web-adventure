// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Adventure, PlatformType, GameObject, GameLocation, Command, ProcessBlock, VocabDefinition, VocabType, Glyph, Defaults } from "./Adventure";

export class Reader {
    public static async Parse(source: string[]): Promise<Adventure> {
        const adventure = new Adventure(PlatformType.SinclairSpectrum);
        await Reader.ParseAdventure(adventure, source);
        return adventure;
    }

    private static async ParseAdventure(adventure: Adventure, source: string[]): Promise<void> {
        let section = SourceSection.Preamble;
        let processTable: Array<ProcessBlock> = null;

        for (let i = 0; i < source.length; i++) {
            let line = source[i].trim();
            if (line === '' || line.startsWith('-----')) continue;

            let newSection = sectionHeadings.get(line.toUpperCase());
            const processTokens = line.split(' ').filter(x => x !== '');
            switch (processTokens[0]) {
                case 'PROCESS': {
                    newSection = SourceSection.Process;
                    const processNumber = parseInt(processTokens[1]);
                    processTable = adventure.ProcessTables.getOrCreate(processNumber, () => new Array<ProcessBlock>());
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
                    break;
                }
                case SourceSection.GeneralData: {
                    Reader.ParseGeneralData(adventure, line);
                    break;
                }
                case SourceSection.Vocabulary: {
                    Reader.ParseVocabulary(adventure.Vocabulary, line);
                    break;
                }
                case SourceSection.Messages: {
                    i = Reader.ParseMessage('Message', adventure.Messages, source, i);
                    break;
                }
                case SourceSection.SystemMessages: {
                    i = Reader.ParseMessage('System Message', adventure.SystemMessages, source, i);
                    break;
                }
                case SourceSection.Locations: {
                    Reader.ParseKeyedDescription(adventure.Locations, line, source[++i], 'Location', (d) => new GameLocation(d));
                    break;
                }
                case SourceSection.Connections: {
                    i = Reader.ParseConnection(adventure.Locations, source, i);
                    break;
                }
                case SourceSection.ObjectNames: {
                    Reader.ParseKeyedDescription(adventure.Objects, line, source[++i], 'Object', (d) => new GameObject(d));
                    break;
                }
                case SourceSection.ObjectWords: {
                    Reader.ParseObjectWords(adventure.Objects, line);
                    break;
                }
                case SourceSection.ObjectWeightAndType: {
                    Reader.ParseObjectWeightAndType(adventure.Objects, line);
                    break;
                }
                case SourceSection.ResponseTable: {
                    i = Reader.ParseResponseTable(adventure.Responses, source, i);
                    break;
                }
                case SourceSection.Process: {
                    i = Reader.ParseProcessTable(processTable, source, i);
                    break;
                }
                case SourceSection.Charset: {
                    i = Reader.ParseCharset(adventure, source, i);
                    break;
                }
                case SourceSection.GraphicsData: {
                    i = Reader.ParseGraphics(adventure, source, i);
                    break;
                }
            }
        }
    }

    private static ParseGraphics(adventure: Adventure, source: string[], i: number): number {
        return i;
    }

    private static ParseCharset(adventure: Adventure, source: string[], i: number): number {
        let charIndex = 0;
        let charTable: Array<Glyph> = null;
        do {
            const line = source[i];
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
            }
            else {
                const glyphTokens = line.split(',');
                if (glyphTokens.length > 7) {
                    const glyphData = glyphTokens.map(t => parseInt(t)).filter(t => !isNaN(t));
                    charTable[charIndex++] = new Glyph(glyphData);
                }
            }
        } while (++i < source.length);
        return i;
    }

    private static ParseProcessTable(processTable: Array<ProcessBlock>, source: string[], i: number): number {
        let block: ProcessBlock | null = null;
        do {
            const line = source[i];
            const tokens = line.split(' ').filter(x => x !== '');
            if (tokens.length > 0) {
                const isNewBlock = line[0] != ' ';
                if (isNewBlock) {
                    block = new ProcessBlock(tokens.shift(), tokens.shift());
                    processTable.push(block);
                }
                block.Commands.push(new Command(tokens.shift(), tokens.map(t => parseInt(t))));
            }
        } while (++i < source.length && source[i] && !source[i].startsWith('------'));
        return i;
    }

    private static ParseResponseTable(responses: Map<string, Map<string, Array<Command>>>, source: string[], i: number): number {
        const line = source[i];
        const tokens = line.split(' ').filter(x => x !== '');
        const nounTable = responses.getOrCreate(tokens[0], () => new Map<string, Array<Command>>());
        const commands = nounTable.getOrCreate(tokens[1], () => new Array<Command>());
        let actionLine = tokens[2] + (tokens.length > 3 ? ' ' + tokens[3] : '');
        do {
            const actionTokens = actionLine.split(' ').filter(x => x !== '');
            commands.push(new Command(actionTokens[0], actionTokens.slice(1).map(t => parseInt(t))));
            actionLine = source[++i];
        } while (i < source.length && actionLine.trim() !== '');
        return i;
    }

    private static ParseObjectWeightAndType(objects: Map<number, GameObject>, line: string): void {
        const tokens = line.split(':');
        if (tokens[0].startsWith('Object')) {
            const objectId = parseInt(tokens[0].substring(6));
            const object = objects.getOrCreate(objectId, () => new GameObject(''));
            const weightTokens = tokens[1].split(' ').filter(x => x !== '');
            if (weightTokens[0] === 'weights') {
                object.Weighs = parseInt(weightTokens[1]);
                object.IsWearable = weightTokens.filter(t => t === 'W').length > 0;
                object.IsContainer = weightTokens.filter(t => t === 'C').length > 0;
            }
            else {
                throw new Error(`Unexpected line in Object Words weights token '${line}'`);
            }
        }
        else {
            throw new Error(`Unexpected line in Object Words section '${line}'`);
        }
    }

    private static ParseObjectWords(objects: Map<number, GameObject>, line: string): void {
        const tokens = line.split(' ').filter(x => x !== '');
        if (tokens[0] === 'Object') {
            const objectId = parseInt(tokens[1]);
            const object = objects.getOrCreate(objectId, () => new GameObject(''));
            for (var p = 2; p < tokens.length - 1; p += 2) {
                if ((tokens[p] !== '_') && (tokens[p + 1] !== '_')) {
                    object.Words.set(tokens[p], parseInt(tokens[p + 1]));
                }
            }
        }
        else {
            throw new Error(`Unexpected line in Object Words section '${line}'`);
        }
    }

    private static ParseConnection(locations: Map<number, GameLocation>, source: string[], i: number): number {
        const line = source[i];
        if (line.startsWith('Location')) {
            const lineTokens = line.split(':');
            const locationId = parseInt(lineTokens[0].substring(8));
            const location = locations.getOrCreate(locationId, () => new GameLocation(''));
            let connection = lineTokens[1];
            do {
                const tokens = connection.split(' ').filter(x => x !== '');
                location.Connections.set(tokens[0], parseInt(tokens[1]));
                connection = source[++i];
            } while (i < source.length && connection.trim() !== '');
        }
        else {
            throw new Error(`Unexpected line in Locations/Connection section '${line}'`);
        }
        return i;
    }

    private static DecodeText(text: string): string {
        // TODO: More characters, compression
        return text
            .replace(/(?<!\\)\^/g, '\n')    // ^   => newline
            .replace(/\{7\}/g, '\n')        // {7} => newline
            .replace(/\\(["^{])/g, '$1');   // \x  => x (for " ^ and {
    }

    private static ParseMessage(prefix: string, map: Map<number, string>, source: string[], i: number): number {
        const line = source[i];
        if (line.startsWith(prefix)) {
            map.set(parseInt(line.substring(prefix.length)), Reader.DecodeText(source[++i]));
        }
        else {
            throw new Error(`Unexpected line in ${prefix} section '${line}'`);
        }
        return i;
    }

    private static ParseKeyedDescription<T1>(map: Map<number, T1>, line: string, description: string, keyLineStart: string, creator: (description: string) => T1): void {
        if (line.startsWith(keyLineStart)) {
            const key = parseInt(line.substring(keyLineStart.length));
            if (description.trim() != '') {
                map.getOrCreate(key, () => creator(Reader.DecodeText(description)));
            }
        } else {
            throw new Error(`Unexpected line in ${keyLineStart} section '${line}'`);
        }
    }

    private static readonly generalSetters = new Map<string, (a: Adventure, v: string) => void>([
        ["Database version", (a, v) => a.Meta.DatabaseVersion = parseInt(v)],
        ["Snapshot type", (a, v) => a.Meta.SnapshotType = v],
        ["Default ink color", (a, v) => a.Defaults.InkColor = parseInt(v)],
        ["Default paper color", (a, v) => a.Defaults.PaperColor = parseInt(v)],
        ["Default border color", (a, v) => a.Defaults.BorderColor = parseInt(v)],
    ]);

    private static ParseGeneralData(adventure: Adventure, line: string): void {
        const parts = line.split('  ').filter(s => s);
        const setter = this.generalSetters.get(parts[0]);
        if (setter)
            setter(adventure, parts[1]);
    }

    private static ParseVocabulary(vocabulary: Map<string, VocabDefinition>, line: string): void {
        const tokens = line.split(' ').filter(t => t != '');
        if (tokens.length != 3)
            throw new Error(`Can't parse Vocabulary line '${line}' - expect 3 parts`);

        const vocabDefinition = new VocabDefinition();
        vocabDefinition.Id = parseInt(tokens[1]);
        vocabDefinition.Type = Reader.GetVocabType(tokens[2]);
        vocabulary.set(tokens[0], vocabDefinition);
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
]);