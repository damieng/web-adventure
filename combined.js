var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class GameLocation {
}
class GameObject {
}
class GameMessage {
}
class PawAdventureDefinition {
    constructor() {
        this.Messages = new Map();
        this.Meta = new Meta();
        this.Defaults = new Defaults();
        this.Vocabulary = new Map();
    }
}
var VocabType;
(function (VocabType) {
    VocabType[VocabType["RESERVED"] = 0] = "RESERVED";
    VocabType[VocabType["Adjective"] = 1] = "Adjective";
    VocabType[VocabType["Adverb"] = 2] = "Adverb";
    VocabType[VocabType["Conjunction"] = 3] = "Conjunction";
    VocabType[VocabType["Noun"] = 4] = "Noun";
    VocabType[VocabType["Pronoun"] = 5] = "Pronoun";
    VocabType[VocabType["Preposition"] = 6] = "Preposition";
    VocabType[VocabType["Verb"] = 7] = "Verb";
})(VocabType || (VocabType = {}));
class VocabDefinition {
}
class Defaults {
}
class Meta {
}
var SourceSection;
(function (SourceSection) {
    SourceSection[SourceSection["Preamble"] = 0] = "Preamble";
    SourceSection[SourceSection["GeneralData"] = 1] = "GeneralData";
    SourceSection[SourceSection["Vocabulary"] = 2] = "Vocabulary";
    SourceSection[SourceSection["Messages"] = 3] = "Messages";
    SourceSection[SourceSection["SystemMessages"] = 4] = "SystemMessages";
    SourceSection[SourceSection["Locations"] = 5] = "Locations";
    SourceSection[SourceSection["Connections"] = 6] = "Connections";
    SourceSection[SourceSection["ObjectNames"] = 7] = "ObjectNames";
    SourceSection[SourceSection["ObjectWords"] = 8] = "ObjectWords";
    SourceSection[SourceSection["InitiallyAt"] = 9] = "InitiallyAt";
    SourceSection[SourceSection["ObjectWeightAndType"] = 10] = "ObjectWeightAndType";
    SourceSection[SourceSection["ResponseTable"] = 11] = "ResponseTable";
    SourceSection[SourceSection["Process"] = 12] = "Process";
    SourceSection[SourceSection["GraphicsData"] = 13] = "GraphicsData";
    SourceSection[SourceSection["Charset"] = 14] = "Charset";
})(SourceSection || (SourceSection = {}));
const sectionHeadings = new Map([
    ["General data", SourceSection.GeneralData],
    ["Vocabulary", SourceSection.Vocabulary],
    ["Messages", SourceSection.Messages],
    ["System messages", SourceSection.SystemMessages],
    ["Locations", SourceSection.Locations],
    ["Connections", SourceSection.Connections],
    ["Object names", SourceSection.ObjectNames],
    ["Object words", SourceSection.ObjectWords],
    ["Initially at", SourceSection.InitiallyAt],
    ["Object weight and type", SourceSection.ObjectWeightAndType],
    ["Response table", SourceSection.ResponseTable],
    ["Process", SourceSection.Process],
    ["Graphics data", SourceSection.GraphicsData],
    ["Charset", SourceSection.Charset]
]);
class PawReader {
    static Parse(source) {
        return __awaiter(this, void 0, void 0, function* () {
            const adventure = new PawAdventureDefinition();
            let section = SourceSection.Preamble;
            for (let i = 0; i < source.length; i++) {
                let line = source[i].trim();
                if (line == '' || line.startsWith('-----'))
                    continue;
                const newSection = sectionHeadings.get(line);
                if (newSection) {
                    section = newSection;
                    continue;
                }
                switch (section) {
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
        });
    }
    static ParsePreamble(adventure, line) {
        if (line.startsWith('Extracted by'))
            adventure.Meta.Extractor = line.substring(13).trim();
    }
    static ParseGeneralData(adventure, line) {
        if (line.startsWith('Database version'))
            adventure.Meta.DatabaseVersion = parseInt(line.substring(16));
        if (line.startsWith('Snapshot type'))
            adventure.Meta.SnapshotType = line.substring(13).trim();
    }
    static ParseVocabulary(adventure, line) {
        const tokens = line.split(' ').filter(t => t != '');
        if (tokens.length != 3)
            throw new Error(`Can't parse vocabulary line '${line}' - expect 3 parts`);
        const vocab = new VocabDefinition();
        vocab.Id = parseInt(tokens[1]),
            vocab.Type = PawReader.GetVocabType(tokens[2]);
        adventure.Vocabulary[tokens[0]] = vocab;
    }
    static GetVocabType(input) {
        switch (input) {
            case 'RESERVED': return VocabType.RESERVED;
            case 'Adjective': return VocabType.Adjective;
            case 'Adverb': return VocabType.Adverb;
            case 'Noun': return VocabType.Noun;
            case 'Pronoun': return VocabType.Pronoun;
            case 'Preposition': return VocabType.Preposition;
            case 'Verb': return VocabType.Verb;
            default:
                throw new Error(`Unknown vocabulary type '${input}'`);
        }
    }
    static GetSource(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new Request(uri, {
                headers: new Headers({ 'Content-Type': 'text/plain' })
            });
            const response = yield fetch(request);
            return response.text();
        });
    }
}
//# sourceMappingURL=combined.js.map