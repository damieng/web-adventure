import { Reader } from './PAW/Reader';
import { InteractWeb } from './PAW/InteractWeb';
import { Runner } from './PAW/Runner';
import { Adventure } from './PAW/Adventure';

const byId = (id: string) => document.getElementById(id);

export async function startAdventure(): Promise<void> {
    const sourceUrl = (byId('sourceUrl') as HTMLInputElement).value;
    const source = await getPlainText(sourceUrl);
    const adventure = await Reader.Parse(source.split('\n'));
    const interact = new InteractWeb(adventure, byId('screen'));
    setupDebugging(interact.runner, adventure);
    interact.Start();
}

function setupDebugging(runner: Runner, adventure: Adventure): void {
    const locationSelect = byId('locations') as HTMLSelectElement;

    locationSelect.onchange = () => {
        runner.setLocation(parseInt(locationSelect.selectedOptions[0].value));
    };

    clearOptions(locationSelect);
    for(let location of adventure.Locations)
        locationSelect.options.add(createOption(location['0'].toString(), location['0'].toString()));
}

function createOption(value: string, label: string): HTMLOptionElement {
    const option = <HTMLOptionElement>document.createElement('option');
    option.value = value;
    option.innerText = label;
    return option;
}

function clearOptions(select: HTMLSelectElement): void {
    while (select.options.length > 0)
        select.options.remove(select.options.length - 1);
}