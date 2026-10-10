export interface Design {
  id: string;
  name: string;
  description: string;
  layout: string;
  scheme: 'dark' | 'light';
  font: string;
  heroFont: string;
  colors: {
    bg: string;
    surface: string;
    ink: string;
    accent: string;
    muted: string;
    line: string;
    fall: string;
    buttonInk: string;
  };
}
const sans = "'Segoe UI', Arial, sans-serif";
const serif = 'Georgia, serif';
const mono = 'Consolas, monospace';
export const DESIGNS: readonly Design[] = [
  {
    id: 'studio',
    name: 'Ателье',
    description: 'Тёплый журнал · крупная антиква',
    layout: 'editorial',
    scheme: 'light',
    font: sans,
    heroFont: serif,
    colors: {
      bg: '#f4f0e7',
      surface: '#fffaf1',
      ink: '#282a27',
      accent: '#a34b36',
      muted: '#676b60',
      line: '#d8d8cb',
      fall: '#79634e',
      buttonInk: '#fffaf1',
    },
  },
  {
    id: 'console',
    name: 'Телеметрия',
    description: 'Приборная панель · круговой индикатор',
    layout: 'instrument',
    scheme: 'dark',
    font: sans,
    heroFont: mono,
    colors: {
      bg: '#0e101b',
      surface: '#181c2c',
      ink: '#f1f1ff',
      accent: '#b0a5ff',
      muted: '#aaaec5',
      line: '#30364b',
      fall: '#e8aa91',
      buttonInk: '#141329',
    },
  },
  {
    id: 'blueprint',
    name: 'Чертёж',
    description: 'Синяя инженерная сетка · точные линии',
    layout: 'blueprint',
    scheme: 'dark',
    font: mono,
    heroFont: mono,
    colors: {
      bg: '#0d2c62',
      surface: '#123770',
      ink: '#eff6ff',
      accent: '#9fd5ff',
      muted: '#b2c8e3',
      line: '#446695',
      fall: '#ffd3a3',
      buttonInk: '#092653',
    },
  },
];

export function findDesign(id: string | null): Design | undefined {
  return DESIGNS.find((design) => design.id === id);
}
export function initialDesign(): Design {
  const query = findDesign(new URLSearchParams(window.location.search).get('design'));
  if (query) return query;
  try {
    const saved = findDesign(localStorage.getItem('prime-design:v1'));
    if (saved) return saved;
  } catch {
    /* Optional preference must not block the app. */
  }
  return findDesign('console')!;
}
