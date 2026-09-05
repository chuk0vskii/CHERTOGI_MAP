// ============================================================
// ОБЩИЕ СОБЫТИЯ
// ============================================================

import { _supabase } from '../config-module.js';

export const COMMON_EVENTS = [
  { 
    id: 1, 
    title: 'Знаменье Темной Нити', 
    description: 'От судьбы не уйдет никто. Ведь началась Темная Нить и она тянет искателей за собой. Группу ожидает их предназначение.',
    checkInfo: 'Хранитель Узлов получает 1 Кость Проклятья за каждого члена группы. Киньте заново по таблице и выберите наихудший результат.',
    tables: [],
    effects: {
      success: 'Хранитель Узлов получает 1 Кость Проклятья за каждого члена группы.',
      fail: 'Киньте заново по таблице и выберите наихудший результат.',
      crit_success: 'Хранитель Узлов получает 2 Кости Проклятья за каждого члена группы.',
      crit_fail: 'Киньте заново по таблице и выберите наихудший результат. Сложность пути +1.'
    }
  },
  { 
    id: 2, 
    title: 'Ловушка', 
    description: 'Что-то здесь не так. Вся группа должна совершить бросок роли, выбирая наименьший показатель из своих навыков.',
    checkInfo: 'Вся группа совершает бросок роли, выбирая наименьший показатель из своих навыков.',
    tables: [
      {
        id: 'traps',
        name: 'Таблица Ловушек',
        tableName: 'traps',
        trigger: 'always',
        sectionId: 'traps'
      }
    ],
    effects: {
      success: 'Группа может разрядить ловушку или напасть с сюрпризом.',
      fail: 'Ловушка сработает.',
      crit_success: 'Группа не только разряжает ловушку, но и находит ценный ресурс.',
      crit_fail: 'Ловушка срабатывает со всей силой. Проверка Искры для всех.'
    }
  },
  { 
    id: 3, 
    title: 'Древние Руины', 
    description: 'Группа набредает на древнее строение.',
    checkInfo: 'Все в группе совершают Проверку Искры.',
    tables: [
      {
        id: 'ruins',
        name: 'Таблица Руин',
        tableName: 'ruins',
        trigger: 'always',
        sectionId: 'ruins'
      }
    ],
    secondCheckInfo: 'Тень Нарара может совершить проверку Ловкости рук, чтобы быстро исследовать руины.',
    effects: {
      success: 'Группа вдохновляется невероятными строениями древней цивилизации и получает +1 на Прибытие.',
      fail: 'Мораль группы начинает разваливаться, они получают -1 на Прибытие.',
      crit_success: 'Все в группе преуспели! Группа вдохновляется и получает +1 на Прибытие.',
      crit_fail: 'Что за кошмары могут обитать в этой местности. Группа в удвоенном темпе сбегает с места.'
    },
    secondTables: [
      {
        id: 'dangerous_zone',
        name: 'Таблица Опасных Существ Зоны',
        tableName: null, // будет определяться по региону
        trigger: 'fail_5',
        sectionId: null,
        isRegional: true
      }
    ],
    secondEffects: {
      success: 'Тень находит магический предмет редкостью редкий или ниже и будет знать что это за предмет.',
      fail: 'Группа задерживается и ей приходится совершать отдых у руин, получая эффект Сравнения Искры повторно.',
      crit_success: 'Группа находит ценный артефакт (бросок по табл. Ж).',
      crit_fail: 'Тень Нарара задерживается среди руин, а группа привлекает внимание жителей местности. Киньте по таблице Опасных Существ Зоны.',
      needsZoneCreatures: true
    }
  },
  { 
    id: 4, 
    title: 'Бескрайние Пейзажи', 
    description: 'Группа проходит невероятные бескрайние пейзажи. Все совершают Проверку Искры.',
    checkInfo: 'Все в группе совершают Проверку Искры.',
    tables: [],
    effects: {
      success: 'Группа вдохновляется и получает +1 на Прибытие и 1 Кость Удачи.',
      fail: 'Пейзаж угнетает, группа получает -1 на Прибытие.',
      crit_success: 'Группа чувствует величие, получает +2 на Прибытие и 2 Кости Удачи.',
      crit_fail: 'Пейзаж вселяет ужас, группа получает -2 на Прибытие.'
    }
  },
  { 
    id: 5, 
    title: 'Невероятный Оазис', 
    description: 'Группа прибывает в безопасный на вид оазис.',
    checkInfo: 'Все в группе совершают Проверку Искры.',
    tables: [
      {
        id: 'oasis_mysteries',
        name: 'Таблица Загадок Оазисов',
        tableName: 'oasis_mysteries',
        trigger: 'always',
        sectionId: 'oasis_mysteries'
      }
    ],
    effects: {
      success: 'Группа может сделать длинный отдых и каждый получает 1 Кость Удачи.',
      fail: 'Группа может сделать длинный отдых, но что-то шепчет в этом странном месте.',
      crit_success: 'Идеальное место для отдыха. Длинный отдых, 2 Кости Удачи каждому и +1 на Прибытие.',
      crit_fail: 'Оазис кажется враждебным. Помеха на проверки Интеллекта до конца фазы Путь.'
    }
  },
  { 
    id: 6, 
    title: 'Вмешательство звезд', 
    description: 'Сами боги вмешиваются в судьбу группы. Все члены группы должны совершить проверку Традиций.',
    checkInfo: 'Все члены группы совершают проверку Традиций. Хранитель узлов сравнивает общий результат.',
    tables: [],
    effects: {
      success: 'Боги благословляют группу. Все негативные эффекты знака снимаются.',
      fail: 'Боги недовольны. Бросьте по таблице Знаков с помехой.',
      crit_success: 'Боги щедро благословляют. Все негативные эффекты снимаются, положительные удваиваются.',
      crit_fail: 'Боги гневаются. Группа получает -2 на Прибытие и проклятие.'
    }
  }
];

// ============================================================
// СПИСОК РОЛЕЙ
// ============================================================

export const ROLES = ['Чтец_Знаков', 'Тень_Нарара', 'Коготь_Акрепы', 'Глаза_Звезд', 'Длань_Батрины'];

// ============================================================
// ЗАГРУЗКА ВЕЛИКИХ СТРАНСТВУЮЩИХ ЗВЕРЕЙ
// ============================================================

let greatBeastsCache = [];

export async function loadGreatBeasts() {
  try {
    if (greatBeastsCache.length > 0) {
      return greatBeastsCache;
    }
    
    const { data, error } = await _supabase
      .from('great_beasts')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Ошибка загрузки великих зверей:', error);
      return [];
    }
    
    greatBeastsCache = data || [];
    console.log('Загружено ' + greatBeastsCache.length + ' великих зверей');
    return greatBeastsCache;
  } catch (err) {
    console.error('Критическая ошибка загрузки великих зверей:', err);
    return [];
  }
}

export function getRandomGreatBeast() {
  if (greatBeastsCache.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * greatBeastsCache.length);
  return greatBeastsCache[randomIndex];
}

// ============================================================
// ГЕНЕРАЦИЯ ВСТРЕЧ ПО ТИПАМ МЕСТНОСТИ
// ============================================================

export const ENCOUNTER_TABLES = {
  'пустыня': [
    { 
      range: [1, 2],
      text: 'Аймак - Двуглавый песчаный змей',
      creatures: [
        { name: 'Аймак - Двуглавый песчаный змей', table: 'opasnost_pustini' }
      ],
      extra: '4d8+4 гигантских ядовитых змей [Giant poisonous snake]',
      extraCreatures: [
        { name: 'Гигантская ядовитая змея', table: 'opasnost_jungle' }
      ]
    },
    { 
      range: [3, 4],
      text: '1d6+2 Канов',
      creatures: [
        { name: 'Кан', table: 'insectoids' }
      ]
    },
    { 
      range: [5, 6],
      text: 'Ондра, Львиный Гнев',
      creatures: [
        { name: 'Ондра, Львиный Гнев', table: 'opasnost_pustini' }
      ],
      extra: '2d4 пятнистых львов [Spotted Lion]',
      extraCreatures: [
        { name: 'Пятнистый лев', table: 'opasnost_pustini' }
      ]
    },
    { 
      range: [7, 8],
      text: 'Хозяин зыбучих песков краб Каракша',
      creatures: [
        { name: 'Каракша', table: 'opasnost_pustini' }
      ],
      extra: 'Гигантский краб [Giant crab]',
      extraCreatures: [
        { name: 'Гигантский краб', table: 'opasnost_pustini' }
      ]
    },
    { 
      range: [9, 10],
      text: 'Ал - Падальщик',
      creatures: [
        { name: 'Ал - Падальщик', table: 'opasnost_pustini' }
      ],
      extra: '3d6+3 Гигантских гиен [Giant hyena] или вдвое больше обычных гиен [Hyena]',
      extraCreatures: [
        { name: 'Гигантская гиена', table: 'opasnost_pustini' },
        { name: 'Гиена', table: 'opasnost_pustini' }
      ]
    }
  ],
  'степи': [
    { 
      range: [1, 2],
      text: 'Аташар - трехглавый айур мутант',
      creatures: [
        { name: 'Аташар - трехглавый айур мутант', table: 'opasnost_stepi' }
      ],
      extra: 'стадо из 4d4 безумных от голода айуров',
      extraCreatures: [
        { name: 'Аюр', table: 'opasnost_stepi' }
      ]
    },
    { 
      range: [3, 4],
      text: 'Золотой айур Батрины - Оншоха',
      creatures: [
        { name: 'Оншоха', table: 'opasnost_stepi' }
      ],
      extra: '4d4 бешеных айуров',
      extraCreatures: [
        { name: 'Аюр', table: 'opasnost_stepi' }
      ]
    },
    { 
      range: [5, 6],
      text: 'Алакрус - Зверь Нарара',
      creatures: [
        { name: 'Алакрус - Зверь Нарара', table: 'opasnost_stepi' }
      ],
      extra: '4 воздушных элементалей [Air Elemental] в виде гепардов',
      extraCreatures: [
        { name: 'Воздушный элементаль', table: 'opasnost_stepi' }
      ]
    },
    { 
      range: [7, 8],
      text: 'Чинга - Око степей',
      creatures: [
        { name: 'Чинга - Око степей', table: 'opasnost_stepi' }
      ],
      extra: '2d10 ястребов разорителей [Harrow Hawk]',
      extraCreatures: [
        { name: 'Ястреб разорителей', table: 'opasnost_stepi' }
      ]
    },
    { 
      range: [9, 10],
      text: 'Вожак всех стай - Лавгаш',
      creatures: [
        { name: 'Лавгаш', table: 'opasnost_stepi' }
      ],
      extra: '3d4 лютых волков [Dire wolf]',
      extraCreatures: [
        { name: 'Лютый волк', table: 'opasnost_stepi' }
      ]
    }
  ],
  'горы': [
    { 
      range: [1, 2],
      text: 'Каменная черепаха',
      creatures: [
        { name: 'Каменная черепаха', table: 'opasnost_gor' }
      ],
      extra: '3d4 гигантских щелкающих черепах [Giant snapping turtle]',
      extraCreatures: [
        { name: 'Гигантская щёлкающая черепаха', table: 'opasnost_gor' }
      ]
    },
    { 
      range: [3, 4],
      text: 'Ястреб Чинхау - охотник вершин',
      creatures: [
        { name: 'Ястреб Чинхау - охотник вершин', table: 'opasnost_gor' }
      ],
      extra: '4 Гигантских орла [Giant eagle] и 8 Кровавых ястребов [Blood Hawk]',
      extraCreatures: [
        { name: 'Гигантский орёл', table: 'opasnost_gor' },
        { name: 'Кровавый ястреб', table: 'opasnost_gor' }
      ]
    },
    { 
      range: [5, 6],
      text: 'Слепец Урари - хозяин пещер',
      creatures: [
        { name: 'Урари', table: 'opasnost_gor' }
      ],
      extra: '2d4 Грияров',
      extraCreatures: [
        { name: 'Грияр', table: 'opasnost_gor' }
      ]
    },
    { 
      range: [7, 8],
      text: 'Ашока - страж хребтов',
      creatures: [
        { name: 'Ашока - страж хребтов', table: 'opasnost_gor' }
      ],
      extra: '1d8+4 тура [Aurochs]',
      extraCreatures: [
        { name: 'Тур', table: 'opasnost_gor' }
      ]
    },
    { 
      range: [9, 10],
      text: 'Варакша - роющая норы',
      creatures: [
        { name: 'Варакша - роющая норы', table: 'opasnost_gor' }
      ],
      extra: '4 панцирницы [Bulette]',
      extraCreatures: [
        { name: 'Панцирница', table: 'opasnost_gor' }
      ]
    }
  ],
  'джунгли': [
    { 
      range: [1, 2],
      text: 'Король всех жаб Вэнсдар',
      creatures: [
        { name: 'Вэнсдар', table: 'opasnost_jungle' }
      ],
      extra: '3d4 гигантских лягушек [Giant frog] или 5 роев ядовитых змей [Swarm of poisonous snakes]',
      extraCreatures: [
        { name: 'Гигантская лягушка', table: 'opasnost_jungle' },
        { name: 'Рой ядовитых змей', table: 'opasnost_jungle' }
      ]
    },
    { 
      range: [3, 4],
      text: 'Цареубийца Уцк',
      creatures: [
        { name: 'Уцк', table: 'opasnost_jungle' }
      ],
      extra: '2d6 гигантских ядовитых змей [Giant poisonous snake]',
      extraCreatures: [
        { name: 'Гигантская ядовитая змея', table: 'opasnost_jungle' }
      ]
    },
    { 
      range: [5, 6],
      text: 'Феникс [Phoenix]',
      creatures: [
        { name: 'Феникс', table: 'opasnost_jungle' }
      ]
    },
    { 
      range: [7, 8],
      text: 'Окига - сокрытый зуб',
      creatures: [
        { name: 'Окига - сокрытый зуб', table: 'opasnost_jungle' }
      ],
      extra: '4d4 крокодила [Crocodile] или 4 гигантских крокодила [Giant crocodile]',
      extraCreatures: [
        { name: 'Крокодил', table: 'opasnost_jungle' },
        { name: 'Гигантский крокодил', table: 'opasnost_jungle' }
      ]
    },
    { 
      range: [9, 10],
      text: 'Хибачи - алый рой',
      creatures: [
        { name: 'Хибачи - алый рой', table: 'opasnost_jungle' }
      ],
      extra: '8 роев насекомых [Swarm of insects] (комары/москиты)',
      extraCreatures: [
        { name: 'Рой насекомых', table: 'opasnost_jungle' }
      ]
    }
  ]
};

export function generateEncounter(terrainType) {
  const table = ENCOUNTER_TABLES[terrainType];
  if (!table) return null;
  
  const roll = Math.floor(Math.random() * 10) + 1;
  
  for (var i = 0; i < table.length; i++) {
    const entry = table[i];
    if (roll >= entry.range[0] && roll <= entry.range[1]) {
      return {
        roll: roll,
        entry: entry,
        terrainType: terrainType
      };
    }
  }
  return null;
}

// ============================================================
// МАППИНГ ТАБЛИЦ → РАЗДЕЛЫ БЕСТИАРИЯ
// ============================================================

export const TABLE_TO_SECTION = {
  'traps': 'traps',
  'ruins': 'ruins',
  'oasis_mysteries': 'oasis_mysteries',
  'region_curses': 'region_curses',
  'region_obstacles': 'region_obstacles',
  'great_beasts': 'great_beasts',
  'zone_conflicts': 'zone_conflicts',
  'veil_children': 'veil_aberrations',
  'reality_tears': 'reality_tears',
  'parasitic_creatures': 'parasitic_creatures',
  'slaughter_zones': 'slaughter_zones',
  'storm_eyes': 'storm_eyes',
  'deadly_encounters': 'deadly_encounters',
  'opasnost_pustini': 'dangerous_desert',
  'opasnost_stepi': 'dangerous_steppes',
  'opasnost_gor': 'dangerous_mountains',
  'opasnost_jungle': 'dangerous_swamps'
};

// ============================================================
// СОБЫТИЯ ПО РОЛЯМ
// ============================================================

export const ROLE_EVENTS = {
  'Чтец_Знаков': [
    { 
      id: 1, 
      title: 'Проклятые земли', 
      description: 'Группа забрела в темные земли с бушующими в них неизвестными силами.',
      checkInfo: 'Чтец знаков совершает проверку Традиции.',
      tables: [
        {
          id: 'region_curses',
          name: 'Таблица Проклятий области',
          tableName: 'region_curses',
          trigger: 'always',
          sectionId: 'region_curses'
        }
      ],
      effects: {
        success: 'Группа получает +1 на Прибытие, обходя темные земли.',
        fail: 'Группа заходит в темные земли, получая -1 на Прибытие.',
        crit_success: 'Группа замечает следы поверженного зверя. +1 на Прибытие и преимущество на Проверку Искры.',
        crit_fail: 'Группа забредает в логово зла. Смертельная Встреча.'
      }
    },
    { 
      id: 2, 
      title: 'Преграда', 
      description: 'Что-то мешает группе пройти дальше.',
      checkInfo: 'Чтец Знаков совершает проверку Расследования.',
      tables: [
        {
          id: 'region_obstacles',
          name: 'Таблица Преград Области',
          tableName: 'region_obstacles',
          trigger: 'always',
          sectionId: 'region_obstacles'
        }
      ],
      effects: {
        success: 'Группа обходит преграду и получает +1 на Прибытие.',
        fail: 'Группа обходит преграду с трудом. Проверка Кремня и -1 на Прибытие.',
        crit_success: 'Группа находит тайный проход. +2 на Прибытие.',
        crit_fail: 'Группа должна начать долгий отдых, чтобы подготовиться.'
      }
    },
    { 
      id: 3, 
      title: 'Поющие Знаки', 
      description: 'Похоже, что нити судьбы пытаются обречь группу на провал.',
      checkInfo: 'Чтец Знаков совершает проверку Традиции.',
      tables: [],
      effects: {
        success: 'Группа избегает опасностей и получает +1 на Прибытие и -1 событие в фазе Путь.',
        fail: 'Происходит событие Опасная Встреча.',
        crit_success: 'Группа не только избегает опасностей, но и находит короткий путь. +2 на Прибытие.',
        crit_fail: 'Чтец видит знаки во всем. -1 к Искре и событие "Они Пришли за Вами!".'
      }
    },
    { 
      id: 4, 
      title: 'Это должно было произойти!', 
      description: 'Нити судьбы были связаны еще перед началом пути.',
      checkInfo: 'Чтец Знаков делает проверку Традиций.',
      tables: [],
      effects: {
        success: 'Чтец узнает о грядущем событии и может подготовить группу.',
        fail: 'Чтец путается в чтении. Повторный бросок по таблице Знаков.',
        crit_success: 'Чтец видит все нити судьбы. Группа получает преимущество на все проверки в фазе Путь.',
        crit_fail: 'Чтец нарушает нити судьбы. +1 событие в фазе Путь.'
      }
    },
    { 
      id: 5, 
      title: 'Ложные Нити', 
      description: 'Иллюзия судьбы в виде удачных путей ведёт группу в неверном направлении.',
      checkInfo: 'Чтец Знаков бросает проверку Расследования.',
      tables: [],
      effects: {
        success: 'Чтец распознает обман и находит истинный путь. +1 к Прибытию.',
        fail: 'Группа отклоняется от маршрута. +1 событие в фазе Путь.',
        crit_success: 'Чтец не только находит истинный путь, но и видит ловушки. +2 к Прибытию.',
        crit_fail: 'Группа оказывается в враждебной зоне. Конфликт Зоны.'
      }
    },
    { 
      id: 6, 
      title: 'Шепчущий обо', 
      description: 'Группа останавливается у древнего обо, на котором вырезаны знаки.',
      checkInfo: 'Чтец Знаков совершает проверку Традиций.',
      tables: [],
      effects: {
        success: 'Группа получает +1 к Прибытию.',
        fail: 'Чтение сбивает Чтеца с толку. -1 к Искре.',
        crit_success: 'Знаки предвещают важную истину. +1 к Прибытию и 1 кость удачи.',
        crit_fail: 'Группа принимает знак за проклятие. Проверка Искры и +1 событие.'
      }
    }
  ],
  'Тень_Нарара': [
    { 
      id: 1, 
      title: 'Опасная Встреча', 
      description: 'Что-то есть на вашем пути.',
      checkInfo: 'Тень Нарара совершает проверку Скрытности.',
      tables: [
        {
          id: 'zone_conflicts',
          name: 'Таблица Конфликт Зоны',
          tableName: 'zone_conflicts',
          trigger: 'always',
          sectionId: 'zone_conflicts'
        }
      ],
      effects: {
        success: 'Группа обходит опасность на безопасной дистанции.',
        fail: 'Группа замечена.',
        crit_success: 'Тень не только проводит группу, но и находит ресурсы. +1 к Провизии.',
        crit_fail: 'Встреча оборачивается засадой. Бой с раундом сюрприза.'
      }
    },
    { 
      id: 2, 
      title: 'Плачь Вуали', 
      description: 'Движение вуали в регионе привлекает существ вуали.',
      checkInfo: 'Тень Нарара совершает проверку Скрытности.',
      tables: [
        {
          id: 'veil_children',
          name: 'Таблица Дети Вуали',
          tableName: 'veil_children',
          trigger: 'always',
          sectionId: 'veil_aberrations'
        }
      ],
      effects: {
        success: 'Тень ускользает и проводит группу безопасно.',
        fail: 'Сражение неизбежно.',
        crit_success: 'Тень использует силы Вуали и скрывает группу полностью.',
        crit_fail: 'Тень оказывается один на один с существами на 1 раунд.'
      }
    },
    { 
      id: 3, 
      title: 'Безопасный Ночлег', 
      description: 'Группа в поисках безопасного ночлега.',
      checkInfo: 'Тень Нарара совершает проверку Расследования.',
      tables: [],
      effects: {
        success: 'Группа находит место для ночлега. +1 уровень Кремня или Искры.',
        fail: 'Группа не может уснуть. Проверка Кремня и Проверка Искры.',
        crit_success: 'Отличное место для стоянки. +1 на Прибытие и восстановление 2 уровней Искры или Кремня.',
        crit_fail: 'Лагерь расположен в логове монстра. Опасная встреча.',
        needsZoneCreatures: true
      }
    },
    { 
      id: 4, 
      title: 'Пролом реальности', 
      description: 'Реальность изламывается. Киньте по Таблице Пролома чтобы определить его природу.',
      checkInfo: 'Тень Нарара совершает проверку Скрытности.',
      tables: [
        {
          id: 'reality_tears',
          name: 'Таблица Пролома реальности',
          tableName: 'reality_tears',
          trigger: 'always',
          sectionId: 'reality_tears'
        }
      ],
      effects: {
        success: 'Группа скрытно наблюдает за разломом.',
        fail: 'Существа замечают группу.',
        crit_success: 'Тень находит способ использовать пролом. +1 к Искре.',
        crit_fail: 'Пролом привлекает внимание могущественного существа. Смертельная встреча.'
      }
    },
    { 
      id: 5, 
      title: 'Следопыты', 
      description: 'Тень замечает следы другого отряда или неизвестных существ.',
      checkInfo: 'Тень совершает проверку Скрытности или Ловкости рук.',
      tables: [
        {
          id: 'zone_conflicts',
          name: 'Таблица Конфликтов Области',
          tableName: 'zone_conflicts',
          trigger: 'always',
          sectionId: 'zone_conflicts'
        }
      ],
      effects: {
        success: 'Тень прослеживает путь и избегает контакта. +1 к Прибытию.',
        fail: 'Незнакомцы замечают группу. Смертельная встреча.',
        crit_success: 'Тень находит ценный след и безопасный проход. +2 к Прибытию.',
        crit_fail: 'Группа заходит в засаду. Бой с раундом сюрприза.'
      }
    },
    { 
      id: 6, 
      title: 'Потайной тайник', 
      description: 'Тень замечает остатки укрытого схрона.',
      checkInfo: 'Тень совершает проверку Ловкости рук.',
      tables: [],
      effects: {
        success: 'Найдены ресурсы. Куб провизии восстанавливается на 1 уровень.',
        fail: 'Тень срабатывает на ловушку. Проверка Искры.',
        crit_success: 'Найден ценный артефакт. +1 к Искре.',
        crit_fail: 'Тайник оказался приманкой. Опасная встреча.'
      }
    }
  ],
  'Коготь_Акрепы': [
    { 
      id: 1, 
      title: 'Духи пожирание', 
      description: 'Провизия кончается быстро.',
      checkInfo: 'Коготь Акрепы совершает проверку Выживание.',
      tables: [],
      effects: {
        success: 'Провизия расходуется обычно.',
        fail: 'Группа теряет 2 уровня провизии. Проверка Кремня.',
        crit_success: 'Коготь находит дополнительный источник пищи. +1 уровень Провизии.',
        crit_fail: 'Группа теряет 2 уровня провизии и натыкается на опасность. Конфликт Зоны.'
      }
    },
    { 
      id: 2, 
      title: 'Золотая Добыча', 
      description: 'Группа натыкается на кучу следов великой добычи.',
      checkInfo: 'Коготь Акрепы совершает проверку Выживание.',
      tables: [],
      effects: {
        success: '+1 уровень Кремня и +1 уровень Искры.',
        fail: 'Группа тратит время. Проверка Кремня.',
        crit_success: 'Группа пирует. +1 уровень Кремня, +1 Искры и +1 на Прибытие.',
        crit_fail: 'Группа сходит с тропы. Проверка Кремня и -1 на Прибытие.'
      }
    },
    { 
      id: 3, 
      title: 'Следы Великих', 
      description: 'Группа наталкивается на огромные следы.',
      checkInfo: 'Коготь Акрепы совершает проверку Выживание.',
      tables: [
        {
          id: 'great_beasts',
          name: 'Таблица Великих Странствующих Зверей',
          tableName: 'great_beasts',
          trigger: 'always',
          sectionId: 'great_beasts',
          isGreatBeast: true
        }
      ],
      effects: {
        success: 'Можно выследить зверя и узнать, что это за зверь. Группа получает +1 к Искре.',
        fail: 'Группа видит зверя вдалеке, но не знает что это.',
        crit_success: 'Группа не только выслеживает, но и находит безопасное укрытие. +1 к Искре.',
        crit_fail: 'Группа натыкается на враждебного зверя. Смертельная встреча.'
      }
    },
    { 
      id: 4, 
      title: 'Ядовитая трапеза', 
      description: 'Охота удачна, но мясо оказывается ядовитым.',
      checkInfo: 'Коготь Акрепы совершает проверку Природы.',
      tables: [
        {
          id: 'parasitic_creatures',
          name: 'Таблица Паразитов',
          tableName: 'parasitic_creatures',
          trigger: 'always',
          sectionId: 'parasitic_creatures'
        }
      ],
      effects: {
        success: 'Коготь замечает отравление до готовки. +1 к Провизии.',
        fail: 'Вся группа отравлена до конца фазы Путь.',
        crit_success: 'Коготь использует яд в своих целях. +1 к Провизии и 1 колба с ядом.',
        crit_fail: 'Заражение проникает во всю еду. Провизия заканчивается.'
      }
    },
    { 
      id: 5, 
      title: 'Засада на охоте', 
      description: 'Во время охоты Коготь попадает в засаду.',
      checkInfo: 'Коготь Акрепы совершает проверку Выживания.',
      tables: [],
      effects: {
        success: 'Коготь сбегает, но добычу приходится оставить.',
        fail: 'Коготь приводит опасность к группе. Смертельная Встреча.',
        crit_success: 'Коготь ускользает и даже находит ресурсы. +1 к Провизии.',
        crit_fail: 'Битва неизбежна. Враг ходит первый.'
      }
    },
    { 
      id: 6, 
      title: 'Запретное место', 
      description: 'Коготь следует за добычей и приходит к странному месту.',
      checkInfo: 'Коготь Акрепы совершает проверку Выживания.',
      tables: [
        {
          id: 'slaughter_zones',
          name: 'Таблица Бойня области',
          tableName: 'slaughter_zones',
          trigger: 'always',
          sectionId: 'slaughter_zones'
        }
      ],
      effects: {
        success: 'Добыча не замечает Когтя. +1 к Провизии.',
        fail: 'Добыча теряется в месте.',
        crit_success: 'Коготь находит не только добычу, но и ценный ресурс. +2 к Провизии.',
        crit_fail: 'Коготь попадает в запретное место. Происходит случайное событие.'
      }
    }
  ],
  'Глаза_Звезд': [
    { 
      id: 1, 
      title: 'Смертельная схватка', 
      description: 'Слишком тихо в неизведанных землях.',
      checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
      tables: [],
      effects: {
        success: 'Группа может подготовиться к схватке.',
        fail: 'Сражение начинается прямо сейчас.',
        crit_success: 'Группа замечает опасность заранее и обходит её.',
        crit_fail: 'Противник застаёт группу врасплох с раундом сюрприза.'
      }
    },
    { 
      id: 2, 
      title: 'Они Пришли за Вами!', 
      description: 'Что-то опасное двигается прямо в вашу сторону.',
      checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
      tables: [
        {
          id: 'dangerous_zone',
          name: 'Таблица Опасных Существ Зоны',
          tableName: null,
          trigger: 'fail_5',
          sectionId: null,
          isRegional: true
        }
      ],
      effects: {
        success: 'Группа замечает опасность и может совершить 1 действие.',
        fail: 'Бой начинается сразу.',
        crit_success: 'Группа замечает опасность и успевает подготовить засаду.',
        crit_fail: 'Группу застали врасплох с раундом сюрприза.',
        needsZoneCreatures: true
      }
    },
    { 
      id: 3, 
      title: 'Испытание на Горизонте', 
      description: 'Группа проходит около событий конфликта местности.',
      checkInfo: 'Глаз Звезд совершает проверку Внимательности.',
      tables: [
        {
          id: 'slaughter_zones',
          name: 'Таблица Бойня Области',
          tableName: 'slaughter_zones',
          trigger: 'always',
          sectionId: 'slaughter_zones'
        }
      ],
      effects: {
        success: 'Группа остаётся скрытой.',
        fail: 'Группу замечают.',
        crit_success: 'Глаз находит путь обойти конфликт. +1 к Прибытию.',
        crit_fail: 'Группа оказывается в центре конфликта. Смертельная встреча.'
      }
    },
    { 
      id: 4, 
      title: 'Смертельная погода', 
      description: 'Что-то назревает на горизонте.',
      checkInfo: 'Глаз Звезд совершает проверку Внимательности.',
      tables: [
        {
          id: 'storm_eyes',
          name: 'Таблица Око Штормов Области',
          tableName: 'storm_eyes',
          trigger: 'fail_5',
          sectionId: 'storm_eyes'
        }
      ],
      effects: {
        success: 'Группа избегает плохой погоды. +1 на Прибытие.',
        fail: 'Группа попадает в смертельную погоду. Проверка Кремня и -1 на Прибытие.',
        crit_success: 'Группа находит укрытие от погоды. +1 к Искре и +1 на Прибытие.',
        crit_fail: 'Группа в оке шторма. Проверка Кремня, Искры и -2 на Прибытие.'
      }
    },
    { 
      id: 5, 
      title: 'Свет среди тьмы', 
      description: 'Глаза замечают странное сияние вдали.',
      checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
      tables: [
        {
          id: 'traps',
          name: 'Таблица Ловушки',
          tableName: 'traps',
          trigger: 'always',
          sectionId: 'traps'
        }
      ],
      effects: {
        success: 'Группа находит ценный предмет.',
        fail: 'Это оказывается ловушкой.',
        crit_success: 'Группа находит магический предмет.',
        crit_fail: 'Свет привлекает опасность. Смертельная встреча.'
      }
    },
    { 
      id: 6, 
      title: 'Движение теней', 
      description: 'Глаза замечают странные тени.',
      checkInfo: 'Глаза Звезд совершает проверку Внимательности.',
      tables: [
        {
          id: 'veil_children',
          name: 'Таблица Дети Вуали',
          tableName: 'veil_children',
          trigger: 'always',
          sectionId: 'veil_aberrations'
        }
      ],
      effects: {
        success: 'Группа избегает встречи.',
        fail: 'Происходит событие Дети Вуали.',
        crit_success: 'Глаза замечает Детей Вуали, но они обходят группу стороной.',
        crit_fail: 'Группа не успевает подготовиться. Дети Вуали ходят первыми.'
      }
    }
  ],
  'Длань_Батрины': [
    { 
      id: 1, 
      title: 'Бешенство', 
      description: 'С животными что-то не так.',
      checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
      tables: [
        {
          id: 'parasitic_creatures',
          name: 'Таблица Паразиты Чертог',
          tableName: 'parasitic_creatures',
          trigger: 'fail_5',
          sectionId: 'parasitic_creatures'
        }
      ],
      effects: {
        success: 'Длань спасает животных от бешенства.',
        fail: 'Животное умирает.',
        crit_success: 'Длань не только спасает, но и укрепляет связь с животными. +1 к Искре.',
        crit_fail: 'Животное нападает на группу. Паразит начинает охоту.'
      }
    },
    { 
      id: 2, 
      title: 'Нарушенный Баланс', 
      description: 'Что-то не так вокруг с животными.',
      checkInfo: 'Длань Батрины совершает проверку Ухода за Животными.',
      tables: [
        {
          id: 'deadly_encounters',
          name: 'Таблица Смертельная Встреча',
          tableName: 'deadly_encounters',
          trigger: 'always',
          sectionId: 'deadly_encounters',
          isDeadlyEncounter: true
        }
      ],
      effects: {
        success: 'Длань определяет что обитает в этих землях и есть возможность обойти опасность.',
        fail: 'Тревожность сказывается на группе. Проверка Искры.',
        crit_success: 'Длань находит способ восстановить баланс. +1 к Искре и +1 на Прибытие.',
        crit_fail: 'Группа слишком поздно понимает что за ними охотятся. Смертельная встреча.'
      }
    },
    { 
      id: 3, 
      title: 'Страх стада', 
      description: 'Животные группы в ужасе останавливаются.',
      checkInfo: 'Длань Батрины совершает проверку Ухода за Животными.',
      tables: [
        {
          id: 'dangerous_zone',
          name: 'Таблица Опасных Существ Зоны',
          tableName: null,
          trigger: 'fail_5',
          sectionId: null,
          isRegional: true
        }
      ],
      effects: {
        success: 'Животные успокаиваются. +1 к Прибытию.',
        fail: 'Животные с трудом идут дальше. -1 на Прибытие.',
        crit_success: 'Длань укрепляет связь со стадом. +1 на Прибытие и преимущество на Внимательность.',
        crit_fail: 'Звери намертво застыли от страха. Опасные существа нападают.',
        needsZoneCreatures: true
      }
    },
    { 
      id: 4, 
      title: 'Исчезновение', 
      description: 'Животное группы исчезает ночью.',
      checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
      tables: [
        {
          id: 'dangerous_zone',
          name: 'Таблица Опасных Существ',
          tableName: null,
          trigger: 'fail',
          sectionId: null,
          isRegional: true
        }
      ],
      effects: {
        success: 'Длань находит животное раненым.',
        fail: 'Животное утащено тварью.',
        crit_success: 'Длань находит не только животное, но и следы похитителя.',
        crit_fail: 'Исчезновение было отвлекающим манёвром. Опасная встреча.'
      }
    },
    { 
      id: 5, 
      title: 'Обострение чувств', 
      description: 'Животное ощущает опасность заранее.',
      checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
      tables: [],
      effects: {
        success: 'Животное предупреждает группу вовремя. Преимущество на Внимательность.',
        fail: 'Группа отвлекается на поведение животного. +1 событие, -1 к Прибытию.',
        crit_success: 'Животное предупреждает о конкретной опасности. Группа получает +1 к Прибытию.',
        crit_fail: 'Паника животного дезориентирует группу. -2 к Прибытию.'
      }
    },
    { 
      id: 6, 
      title: 'Дары Сумуга', 
      description: 'Одно из животных начинает рожать.',
      checkInfo: 'Длань Батрины совершает проверку Ухода за животными.',
      tables: [],
      effects: {
        success: 'Пополнение в стаде поднимает дух. +1 к Искре.',
        fail: 'Животное или дитя умирает. Проверка Искры.',
        crit_success: 'Здоровое потомство вдохновляет группу. +2 к Искре и +1 на Прибытие.',
        crit_fail: 'Рождение привлекает хищников. Смертельная встреча.'
      }
    }
  ]
};
