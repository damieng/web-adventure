import { Reader } from './PAW/Reader';
import { InteractWeb } from './PAW/InteractWeb';

const byId = (id: string) => document.getElementById(id);

export async function startAdventure(): Promise<void> {
    const sourceUrl = (byId('sourceUrl') as HTMLInputElement).value;
    const source = await getPlainText(sourceUrl);
    const adventure = await Reader.Parse(source.split('\n'));
    const interact = new InteractWeb(adventure, byId('screen'));
    interact.Start();
}