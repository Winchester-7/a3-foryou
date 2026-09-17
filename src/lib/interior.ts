import type { InteriorCategory } from './types';

export const interiorCategories: InteriorCategory[] = [
  {
    slug: 'divany',
    title: 'Диваны',
    menuTitle: 'Диваны',
    tagline: 'Модульные системы и глубокие посадки для гостиных',
    description:
      'Диваны в нейтральной палитре под наши коллекции керамогранита: букле, лён, полуанилиновая кожа. Модульная геометрия для открытых пространств.',
    bannerSeed: 'a3-int-sofa',
    items: [
      { slug: 'modena-modular', name: 'Modena Modular', brand: 'Atelier Nord', material: 'Букле, дерево бука', imageSeed: 'sofa-modena', note: 'Модульная система, 4 конфигурации' },
      { slug: 'lido-lounge', name: 'Lido Lounge', brand: 'Atelier Nord', material: 'Лён, перо/пух', imageSeed: 'sofa-lido', note: 'Глубина посадки 720 мм' },
      { slug: 'quadro-3', name: 'Quadro 3', brand: 'Forma Casa', material: 'Микрофибра', imageSeed: 'sofa-quadro', note: 'Трёхместный, съёмные чехлы' },
      { slug: 'nero-leather', name: 'Nero Leather', brand: 'Forma Casa', material: 'Полуанилиновая кожа', imageSeed: 'sofa-nero', note: 'Каркас — массив ясеня' },
      { slug: 'sabbia-corner', name: 'Sabbia Corner', brand: 'Studio Terra', material: 'Шенилл песочный', imageSeed: 'sofa-sabbia', note: 'Угловой, реверсивный' },
      { slug: 'piano-daybed', name: 'Piano Daybed', brand: 'Studio Terra', material: 'Велюр', imageSeed: 'sofa-piano', note: 'Кушетка для зоны отдыха' },
    ],
  },
  {
    slug: 'dveri',
    title: 'Двери',
    menuTitle: 'Двери',
    tagline: 'Скрытый монтаж, шпон и эмаль в тон стенам',
    description:
      'Межкомнатные двери высотой до 2700 мм, системы скрытого монтажа, отделка под покраску и натуральный шпон. Кромка «в уровень» со стеной.',
    bannerSeed: 'a3-int-door',
    items: [
      { slug: 'invisible-27', name: 'Invisible 2700', brand: 'LineaPorte', material: 'Алюминий, под покраску', imageSeed: 'door-invisible', note: 'Скрытая коробка, обратное открывание' },
      { slug: 'rovere-flush', name: 'Rovere Flush', brand: 'LineaPorte', material: 'Шпон дуба', imageSeed: 'door-rovere', note: 'Гладкое полотно, магнитный замок' },
      { slug: 'vetro-pivot', name: 'Vetro Pivot', brand: 'LineaPorte', material: 'Закалённое стекло', imageSeed: 'door-vetro', note: 'Поворотная ось, доводчик' },
      { slug: 'nero-matt', name: 'Nero Matt', brand: 'Officina Doors', material: 'Эмаль RAL 9005', imageSeed: 'door-nero', note: 'Матовое покрытие, кромка ABS' },
      { slug: 'sliding-pocket', name: 'Sliding Pocket', brand: 'Officina Doors', material: 'МДФ + пенал', imageSeed: 'door-pocket', note: 'Раздвижная в стену' },
      { slug: 'bianco-classic', name: 'Bianco Classic', brand: 'Officina Doors', material: 'Эмаль белая', imageSeed: 'door-bianco', note: 'Скрытые петли, фрезеровка' },
    ],
  },
  {
    slug: 'rakoviny',
    title: 'Раковины',
    menuTitle: 'Раковины',
    tagline: 'Накладные чаши и столешницы из камня и керамики',
    description:
      'Раковины из литьевого мрамора, тонкостенной керамики и керамогранита — в единой геометрии с плиткой для ванной. Накладные, встраиваемые и консольные модели.',
    bannerSeed: 'a3-int-basin',
    items: [
      { slug: 'onda-stone', name: 'Onda Stone', brand: 'Aqua Studio', material: 'Литьевой мрамор', imageSeed: 'basin-onda', note: 'Накладная, 600 мм' },
      { slug: 'piatto-slim', name: 'Piatto Slim', brand: 'Aqua Studio', material: 'Тонкая керамика', imageSeed: 'basin-piatto', note: 'Толщина борта 8 мм' },
      { slug: 'gres-top', name: 'Gres Top 1200', brand: 'Aqua Studio', material: 'Керамогранит', imageSeed: 'basin-grestop', note: 'Столешница с интегрированной чашей' },
      { slug: 'round-matt', name: 'Round Matt', brand: 'Ceramica Bagno', material: 'Матовая керамика', imageSeed: 'basin-round', note: 'Ø 380 мм, чёрный мат' },
      { slug: 'console-nero', name: 'Console Nero', brand: 'Ceramica Bagno', material: 'Керамика + сталь', imageSeed: 'basin-console', note: 'С полотенцедержателем' },
      { slug: 'double-vela', name: 'Double Vela', brand: 'Ceramica Bagno', material: 'Литьевой камень', imageSeed: 'basin-double', note: 'Двойная, 1400 мм' },
    ],
  },
  {
    slug: 'smesiteli',
    title: 'Смесители',
    menuTitle: 'Смесители',
    tagline: 'PVD-покрытия: чёрный мат, брашированная латунь, никель',
    description:
      'Смесители для раковины, ванны и душевые системы с прогрессивными картриджами. Долговечные PVD-покрытия, устойчивые к известковому налёту.',
    bannerSeed: 'a3-int-tap',
    items: [
      { slug: 'stelo-black', name: 'Stelo Black', brand: 'Rubinetto', material: 'Латунь, PVD чёрный мат', imageSeed: 'tap-stelo', note: 'Картридж 35 мм, аэратор Neoperl' },
      { slug: 'arco-brass', name: 'Arco Brass', brand: 'Rubinetto', material: 'Брашированная латунь', imageSeed: 'tap-arco', note: 'Высокий излив, поворот 360°' },
      { slug: 'piano-nickel', name: 'Piano Nickel', brand: 'Rubinetto', material: 'Никель сатин', imageSeed: 'tap-piano', note: 'Скрытый монтаж' },
      { slug: 'rain-system', name: 'Rain System', brand: 'Idro', material: 'Нержавеющая сталь', imageSeed: 'tap-rain', note: 'Верхний душ 300 мм + гарнитур' },
      { slug: 'kitchen-pull', name: 'Kitchen Pull', brand: 'Idro', material: 'Латунь, чёрный мат', imageSeed: 'tap-kitchen', note: 'Выдвижной излив-душ' },
      { slug: 'bath-floor', name: 'Bath Floor', brand: 'Idro', material: 'Латунь, никель', imageSeed: 'tap-floor', note: 'Напольный, для отдельностоящей ванны' },
    ],
  },
  {
    slug: 'mebel-dlya-vannoy',
    title: 'Мебель для ванной',
    menuTitle: 'Мебель для ванной',
    tagline: 'Подвесные тумбы, зеркала с подсветкой, пеналы',
    description:
      'Влагостойкие тумбы под раковину, зеркальные шкафы с сенсорной подсветкой и антизапотеванием, высокие пеналы. Отделка шпоном и матовым лаком.',
    bannerSeed: 'a3-int-vanity',
    items: [
      { slug: 'sospesa-1200', name: 'Sospesa 1200', brand: 'Bagno Forma', material: 'МДФ, матовый лак', imageSeed: 'vanity-sospesa', note: 'Два ящика push-to-open' },
      { slug: 'rovere-vanity', name: 'Rovere Vanity', brand: 'Bagno Forma', material: 'Шпон дуба', imageSeed: 'vanity-rovere', note: 'Со столешницей из керамогранита' },
      { slug: 'mirror-halo', name: 'Mirror Halo', brand: 'Bagno Forma', material: 'Зеркало, LED', imageSeed: 'vanity-mirror', note: 'Контурная подсветка 4000K' },
      { slug: 'cabinet-touch', name: 'Cabinet Touch', brand: 'Linea Bagno', material: 'Алюминий, зеркало', imageSeed: 'vanity-cabinet', note: 'Антизапотевание, розетка' },
      { slug: 'column-tall', name: 'Column Tall', brand: 'Linea Bagno', material: 'МДФ, матовый лак', imageSeed: 'vanity-column', note: 'Пенал 1800 мм, реверсивные петли' },
      { slug: 'bench-teak', name: 'Bench Teak', brand: 'Linea Bagno', material: 'Массив тика', imageSeed: 'vanity-bench', note: 'Банкетка с нижней полкой' },
    ],
  },
];

export function getInteriorCategory(slug: string): InteriorCategory | undefined {
  return interiorCategories.find((c) => c.slug === slug);
}
