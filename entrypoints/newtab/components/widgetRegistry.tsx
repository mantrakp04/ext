import { useAtom } from 'jotai';
import { settingsAtom } from '../store/settings';
import { TimeWidget } from './TimeWidget';
import { NotesWidget } from './NotesWidget';
import { WeatherWidgetSquare } from './WeatherWidgetSquare';
import { Widget } from './Widgets';

export function useWidgetRegistry(): Widget[] {
  const [settings] = useAtom(settingsAtom);

  return [
    {
      id: 'time',
      type: 'square',
      component: <TimeWidget />,
      isVisible: () => settings.showDateTime,
    },
    {
      id: 'notes',
      type: 'rectangle',
      component: <NotesWidget />,
      isVisible: () => settings.showNotes,
    },
    {
      id: 'weather',
      type: 'square',
      component: <WeatherWidgetSquare />,
      isVisible: () => settings.showWeather,
    },
  ];
}
