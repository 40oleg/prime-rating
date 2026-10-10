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
    id: 'orbit',
    name: 'Траектория',
    description: 'Зелёный минимализм · центрированная композиция',
    layout: 'center',
    scheme: 'dark',
    font: sans,
    heroFont: sans,
    colors: {
      bg: '#151914',
      surface: '#1c241b',
      ink: '#f0f1e6',
      accent: '#c6e8aa',
      muted: '#a3ad9b',
      line: '#394432',
      fall: '#dfa99a',
      buttonInk: '#172014',
    },
  },
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
    id: 'nord',
    name: 'Север',
    description: 'Ледяной свет · асимметрия и синий акцент',
    layout: 'reverse',
    scheme: 'light',
    font: sans,
    heroFont: sans,
    colors: {
      bg: '#edf3f8',
      surface: '#ffffff',
      ink: '#17344c',
      accent: '#2158a9',
      muted: '#526980',
      line: '#c6d5e3',
      fall: '#986041',
      buttonInk: '#ffffff',
    },
  },
  {
    id: 'paper',
    name: 'Газета',
    description: 'Чёрный на бумаге · строгая газетная сетка',
    layout: 'newspaper',
    scheme: 'light',
    font: serif,
    heroFont: serif,
    colors: {
      bg: '#f7f5ee',
      surface: '#f7f5ee',
      ink: '#22221f',
      accent: '#33332b',
      muted: '#65655c',
      line: '#aaa99e',
      fall: '#8e4938',
      buttonInk: '#fffef8',
    },
  },
  {
    id: 'terminal',
    name: 'Терминал',
    description: 'Фосфорный экран · моноширинная телеметрия',
    layout: 'terminal',
    scheme: 'dark',
    font: mono,
    heroFont: mono,
    colors: {
      bg: '#07130d',
      surface: '#0d1e14',
      ink: '#d4f6de',
      accent: '#80ec9f',
      muted: '#8aae95',
      line: '#315d3d',
      fall: '#e8c781',
      buttonInk: '#082410',
    },
  },
  {
    id: 'sunset',
    name: 'Закат',
    description: 'Тёплое свечение · выразительная диагональ',
    layout: 'split',
    scheme: 'dark',
    font: sans,
    heroFont: serif,
    colors: {
      bg: '#26151c',
      surface: '#39202a',
      ink: '#fff1e8',
      accent: '#ffc08c',
      muted: '#d4adb8',
      line: '#61434d',
      fall: '#e89cae',
      buttonInk: '#3e2016',
    },
  },
  {
    id: 'ocean',
    name: 'Глубина',
    description: 'Морская бирюза · ореол и спокойный ритм',
    layout: 'halo',
    scheme: 'dark',
    font: sans,
    heroFont: sans,
    colors: {
      bg: '#071e27',
      surface: '#103340',
      ink: '#e6fafb',
      accent: '#7ce4da',
      muted: '#99bec7',
      line: '#2a5361',
      fall: '#ffbb91',
      buttonInk: '#073b37',
    },
  },
  {
    id: 'brutal',
    name: 'Брутализм',
    description: 'Жёлтый и чёрный · жёсткие блоки и контраст',
    layout: 'blocks',
    scheme: 'light',
    font: sans,
    heroFont: sans,
    colors: {
      bg: '#f4db4d',
      surface: '#fff0a0',
      ink: '#171711',
      accent: '#171711',
      muted: '#4c4a27',
      line: '#29291c',
      fall: '#894228',
      buttonInk: '#fff0a0',
    },
  },
  {
    id: 'lavender',
    name: 'Лаванда',
    description: 'Светлая пастель · мягкий постер',
    layout: 'poster',
    scheme: 'light',
    font: sans,
    heroFont: serif,
    colors: {
      bg: '#f0ebf8',
      surface: '#faf7ff',
      ink: '#3a2b52',
      accent: '#74549d',
      muted: '#746382',
      line: '#d5c9e4',
      fall: '#a15160',
      buttonInk: '#ffffff',
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
  {
    id: 'sand',
    name: 'Дюна',
    description: 'Песок и терракота · горизонтальная композиция',
    layout: 'banner',
    scheme: 'light',
    font: sans,
    heroFont: serif,
    colors: {
      bg: '#eae0d2',
      surface: '#f7f0e6',
      ink: '#48362b',
      accent: '#955538',
      muted: '#776555',
      line: '#cbbbaa',
      fall: '#846444',
      buttonInk: '#fff8ef',
    },
  },
  {
    id: 'mono',
    name: 'Моно',
    description: 'Чистый чёрный · типографика без украшений',
    layout: 'minimal',
    scheme: 'dark',
    font: sans,
    heroFont: sans,
    colors: {
      bg: '#111111',
      surface: '#1c1c1c',
      ink: '#f3f3f3',
      accent: '#eeeeee',
      muted: '#aeaeae',
      line: '#404040',
      fall: '#c7c7c7',
      buttonInk: '#151515',
    },
  },
  {
    id: 'copper',
    name: 'Медь',
    description: 'Тёмная бронза · угловатая приборная рамка',
    layout: 'angular',
    scheme: 'dark',
    font: sans,
    heroFont: serif,
    colors: {
      bg: '#201a17',
      surface: '#302620',
      ink: '#f6eadb',
      accent: '#eab98a',
      muted: '#bfaa96',
      line: '#5b483b',
      fall: '#d89181',
      buttonInk: '#392315',
    },
  },
  {
    id: 'mint',
    name: 'Мята',
    description: 'Свежий свет · округлые карточки',
    layout: 'cards',
    scheme: 'light',
    font: sans,
    heroFont: sans,
    colors: {
      bg: '#e5f2eb',
      surface: '#fafffc',
      ink: '#203e32',
      accent: '#276d4d',
      muted: '#5a7868',
      line: '#b9d8c7',
      fall: '#985649',
      buttonInk: '#ffffff',
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
