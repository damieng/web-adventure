// WebAdventure - Copyright (c) Damien Guard. All rights reserved.

import { Adventure, GameLocation } from './Adventure';
import { LiteEvent } from '../Common/LiteEvent';

export class Runner {
    public Response: string;

    constructor(private adventure: Adventure, private output: (s: string) => void) {
    }

    public Start(): void {
        this.Initialize();
    }

    public Process(command: string): void {
        this.Response = `I don't know how to ${command}`;
    }

    public Initialize(): void {
        this.resetFlags();
    }

    public readonly LocationChanged = new LiteEvent<GameLocation>();

    public setLocation(id: number): void {
        if (this.flags[FlagIndex.PlayerLocation] !== id) {
            this.flags[FlagIndex.PlayerLocation] = id;
            this.LocationChanged.trigger(this.adventure.Locations.get(id));
        }
    }

    public getFlag(index: number): number {
        return this.flags[index];
    }

    public setFlag(index: number, value: number): void {
        if (this.getFlag(index) === value) return;

        switch (index) {
            case FlagIndex.PlayerLocation: {
                this.setLocation(value);
                break;
            }
            default: {
                this.flags[index] = value;
            }
        }
    }

    private describeCurrentLocation(): void {
        this.decrementFlag(FlagIndex.LocationDescribed);

        if (this.getFlag(FlagIndex.ScreenMode) != 1)
            this.clearScreen();

        if (this.isDark()) {
            this.decrementLocationDarkFlags();
            this.output(this.adventure.SystemMessages.get(SystemMessageIndex.DarkLocationDescription));
        } else {
            // Draw location
            this.output(this.adventure.Locations.get(this.getFlag(FlagIndex.PlayerLocation)).Description);
        }
    }

    private hasNoLight = () => this.objectIsAbsent(0);
    private isDark = () => this.getFlag(FlagIndex.IsDark);

    private processPhrase(phrase: string): void {
        this.decrementFrameFlags();
        if (phrase.trim() === "") {
            this.displayPrompt();
            return;
        }
    }

    private getRandomPromptIndex(): number {
        const randomPrompt = randomIntFromRange(1, 10);
        switch (randomPrompt) {
            case 1:
            case 2:
            case 3:
                return 2;
            case 4:
            case 5:
            case 6:
                return 3;
            case 7:
            case 8:
            case 9:
                return 4;
            default:
                return 5;
        };
    }

    private displayPrompt(): void {
        let promptIndex = this.getFlag(FlagIndex.PromptSystemMessageId);
        if (promptIndex === 0)
            promptIndex = this.getRandomPromptIndex();

        this.output(this.adventure.SystemMessages.get(promptIndex));
    }

    private clearScreen(): void {
        // No-op for now as we're scrolling but maybe in the future
    }

    private decrementLocationDarkFlags(): void {
        this.decrementFlag(FlagIndex.LocationDescribedDark);
        if (this.hasNoLight())
            this.decrementFlag(FlagIndex.LocationDescribedDarkNoLight);
    }

    private decrementFrameFlags(): void {
        this.decrementFlag(FlagIndex.DecrementFrame5);
        this.decrementFlag(FlagIndex.DecrementFrame6);
        this.decrementFlag(FlagIndex.DecrementFrame7);
        this.decrementFlag(FlagIndex.DecrementFrame8);
        if (this.isDark()) {
            this.decrementFlag(FlagIndex.DecrementFrameDark);
            if (this.hasNoLight())
                this.decrementFlag(FlagIndex.DecementFrameDarkNoLight);
        }
    }

    private objectIsAbsent(objectIndex: number): boolean {
        // Held in inventory?
        // Worn?
        // At this location?
        return true;
    }

    private decrementFlag(flagIndex: FlagIndex): void {
        const flagValue = this.getFlag(flagIndex);
        if (flagValue > 0)
            this.setFlag(flagIndex, flagValue - 1);
    }

    private resetFlags(): void {
        for (let i = 0; i < 255; i++)
            this.setFlag(i, 0);

        this.setFlag(FlagIndex.ConveyableObjectCount, 4);
        this.setFlag(FlagIndex.ConveyableObjectMaxWeight, 10);
        this.setFlag(FlagIndex.CurrentPronounNoun, 255);
        this.setFlag(FlagIndex.CurrentPronounAdjective, 255);
    }

    private flags: Array<number> = new Array<number>(255);
}

enum FlagIndex {
    IsDark = 0,
    // Auto decremented when non-zero
    LocationDescribed = 2,
    LocationDescribedDark = 3,
    LocationDescribedDarkNoLight = 4,
    // Auto decremented every time frame
    DecrementFrame5 = 5,
    DecrementFrame6 = 6,
    DecrementFrame7 = 7,
    DecrementFrame8 = 8,
    DecrementFrameDark = 9,
    DecementFrameDarkNoLight = 10,

    InventoryCount = 1,
    PlayerLocation = 38,
    Score = 30,
    TurnCountLSB = 31,
    TurnCountMSB = 32,

    CurrentLogicalVerb = 33,
    CurrentLogicalNoun = 34,
    CurrentLogicalAdjective = 35,
    CurrentLogicalAdverb = 36,
    CurrentLogicalPreposition = 43,
    CurrentLogicalNoun2 = 44,
    CurrentLogicalAdjective2 = 45,

    CurrentPronounNoun = 46,
    CurrentPronounAdjective = 47,

    ConveyableObjectCount = 37,
    ConveyableObjectMaxWeight = 52,

    PictureControl = 29, // bit 7=look draw, bit 6=pics on, bit 5=pics off
    TopLineOfScreen = 39,
    ScreenMode = 40, // Set with MODE
    ScreenSplitLine = 41,
    PromptSystemMessageId = 42,

    TimeoutDurationRequired = 48,
    TimeoutControlFlags = 49,

    LocationForDoAll = 50,
    LastObjectReferenced = 51,
    PlayerStrengths = 52,
    ObjectPrintFlags = 53,

    ReferencedObjectLocation = 54,
    ReferencedObjectWeight = 55,
    ReferencedObjectIsContainer = 56,
    ReferencedObjectIsWearable = 57
}

enum SystemMessageIndex {
    DarkLocationDescription = 0,
    ObjectList,
    InputPrompt1,
    InputPrompt2,
    InputPrompt3,
    InputPrompt4,
    ParserExhausted,
    NoActionLowVerb,
    NoActionHighVerb,
    End1,
    End2,
    End3,
    Quit,
    End4,
    End5,
    OK,
    AnyKey,
    Turns1,
    Turns2,
    Turns3,
    Turns4,
    Score1,
    Score2,
    PositiveExpected = 30,
    NegativeExpected,
    FullScreen,
    InputMarker,
    Cursor,
    Timeout,
    ObjectListLink = 46,
    ObjectListLinkFinal,
    ObjectListTermination,
    ObjectA,
    ObjectB,
    CompoundTermination,
    FinalObjectMessage,
    NoObjects
}