// ============================================================
// ОБЩИЕ СОБЫТИЯ
// ============================================================

import { _supabase } from '../config-module.js';

export const COMMON_EVENTS = [
  { 
    id: 1, 
    title: 'Знаменье Темной Нити', 
    description: 'От судьбы не уйдет никто. Ведь началась Темная Нить и она тянет искателей за собой. Группу ожидает их предназначение.',
    checkInfo: 'Хранитель Узлов получает 1 Кость Проклятья за каждого члена группы.',
    config: {
      type: 'simple',
      description: 'Хранитель Узлов получает 1 Кость Проклятья за каждого члена группы.'
    }
  },
  { 
    id: 2, 
    title: 'Ловушка', 
    description: 'Что-то здесь не так. Вся группа должна совершить бросок роли, выбирая наименьший показатель из своих навыков.',
    checkInfo: 'Вся группа совершает бросок роли, выбирая наименьший показатель из своих навыков.',
    config: {
      type: 'trap',
      table: {
        name: 'traps',
        label: 'Таблица Ловушек',
        fields: ['name', 'description']
      },
      check: {
        label: 'Результаты проверки',
        difficulty: 12,
        bars: {
          type: 'multiple',
          addButton: true,
          min: 1,
          max: 6
        },
        results: [
          { condition: 'all_success', message: 'Группа может либо разрядить ловушку, либо напасть (если это ловушка-встреча) на неё с раундом сюрпризом, либо обойти её тихо.' },
          { condition: 'half_success', message: 'Группа замечает ловушку.' },
          { condition: 'half_fail', message: 'Ловушка срабатывает.' },
          { condition: 'all_fail', message: 'Ловушка срабатывает. Если ловушка не является похищением, вся группа умирает.' }
        ]
      }
    }
  },
  { 
    id: 3, 
    title: 'Древние Руины', 
    description: 'Группа набредает на древнее строение.',
    checkInfo: 'Все в группе совершают Проверку Искры.',
    config: {
      type: 'ruins',
      table: {
        name: 'ruins',
        label: 'Таблица Руин',
        fields: ['name', 'pass_method', 'reward_type']
      },
      check: {
        label: 'Проверка Искры',
        difficulty: 12,
        bars: {
          type: 'multiple',
          addButton: true,
          min: 1,
          max: 6
        },
        results: [
          { condition: 'all_or_half_success', message: 'Группа вдохновляется невероятными строениями древней цивилизации и получает +1 на Прибытие.', effects: { arrival: 1 } },
          { condition: 'half_fail', message: 'Что разрушило строение? Что это за знаки? Что их ждёт дальше? Мораль группы начинает разваливаться, они получают -1 на Прибытие.', effects: { arrival: -1 } },
          { condition: 'all_fail', message: 'Что за кошмары могут обитать в этой местности? Группа начинает в удвоенном темпе сбегать с места. Если же группа решит исследовать руины, ее члены будут считаться Испуганными любыми существами находящимися рядом на все время исследования.' }
        ]
      },
      secondCheck: {
        label: 'Проверка Ловкости рук (Тень Нарара)',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success_5', message: 'Группа находит 2 ценных артефакта:', table: 'artefacts', count: 2 },
          { condition: 'success', message: 'Тень Нарара находит магический предмет:', table: 'artefacts', count: 1 },
          { condition: 'fail', message: 'Группа задерживается и ей приходится совершать отдых у руин, получая эффект проверки Искры повторно.' },
          { condition: 'fail_5', message: 'Тень Нарара задерживается среди руин, а группа привлекает внимание жителей местности.', table: 'opasnost_regional' }
        ]
      }
    }
  },
  { 
    id: 4, 
    title: 'Бескрайние Пейзажи', 
    description: 'Группа проходит невероятные бескрайние пейзажи, они одновременно и величественные, и вдохновляющие, и устрашающие. Глядя на эти пейзажи, группа чувствует себя незначительной песчинкой в этих землях.',
    checkInfo: 'Все в группе совершают Проверку Искры.',
    config: {
      type: 'simple_check',
      check: {
        label: 'Проверка Искры',
        difficulty: 12,
        bars: {
          type: 'multiple',
          addButton: true,
          min: 1,
          max: 6
        },
        results: [
          { condition: 'all_or_half_success', message: 'Путники чувствуют вдохновение от пейзажей и получают +1 на Прибытие и 1 Кость Удачи.', effects: { arrival: 1 } },
          { condition: 'half_fail', message: 'Группа чувствует что она сможет покорить этот край, они получают +1 на Прибытие.', effects: { arrival: 1 } },
          { condition: 'all_fail', message: 'Этот пейзаж угнетает, они получают -1 на Прибытие.', effects: { arrival: -1 } }
        ]
      }
    }
  },
  { 
    id: 5, 
    title: 'Невероятный Оазис', 
    description: 'Группа прибывает в безопасный на вид оазис.',
    checkInfo: 'Все в группе совершают Проверку Искры.',
    config: {
      type: 'oasis',
      table: {
        name: 'oasis_mysteries',
        label: 'Загадки Оазисов',
        fields: ['oasis_type', 'mystery']
      },
      check: {
        label: 'Проверка Искры',
        difficulty: 12,
        bars: {
          type: 'multiple',
          addButton: true,
          min: 1,
          max: 6
        },
        results: [
          { condition: 'all_or_half_success', message: 'Группа понимает, что это идеальное место для отдыха, где не бушуют ветра и Шамас приглядывает с небес. Группа может сделать длинный отдых и каждый из группы получит одну Кость Удачи. Группа замечает тайну оазиса.' },
          { condition: 'half_fail', message: 'Группе место кажется безопасным насколько это возможно здесь. Группа может сделать длинный отдых. Но что-то как будто шепчет в этом странном месте, что-то тут не так. Группа замечает тайну оазиса.' },
          { condition: 'all_fail', message: 'Внешне оазис кажется враждебным и обманчивым. Медленно паранойя начинает подавлять группу. У группы помеха на проверки связанные с Интеллектом до конца фазы Путь.' }
        ]
      }
    }
  },
  { 
    id: 6, 
    title: 'Вмешательство звезд', 
    description: 'Сами боги вмешиваются в судьбу группы, благословляя или показывая свой гнев.',
    checkInfo: 'Все члены группы должны совершить проверку Традиций. Хранитель узлов сравнивает общий результат.',
    config: {
      type: 'total_check',
      check: {
        label: 'Общий результат проверки Традиций',
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'total_80', message: 'Боги благословляют группу и их нити судьбы изгибаются в лучшую сторону. Все негативные эффекты знака из фазы Чтение знаков перестают действовать, а все положительные эффекты удваиваются.' },
          { condition: 'total_60', message: 'Боги в раздумье и посему судьба группы натягивается как струна. Чтец знаков делает еще один бросок по таблице знаков, у группы +1 событие в фазе Путь.' },
          { condition: 'total_40', message: 'Боги недовольны малым поклонением и группу настигает их разочарование. Бросьте по таблице Знаков из фазы Чтение знаков с помехой. У группы также -2 в фазе Прибытие.', effects: { arrival: -2 } }
        ]
      }
    }
  }
];

// ============================================================
// СОБЫТИЯ ЧТЕЦА ЗНАКОВ
// ============================================================

export const READER_EVENTS = [
  { 
    id: 1, 
    title: 'Проклятые земли', 
    description: 'Группа забрела в темные земли с бушующими в них неизвестными силами.',
    checkInfo: 'Чтец знаков совершает проверку Традиции.',
    config: {
      type: 'reader_cursed_lands',
      table: {
        name: 'region_curses',
        label: 'Таблица Проклятий области',
        fields: ['name', 'description']
      },
      check: {
        label: 'Проверка Традиции',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success_5', message: 'Чтец замечает следы поверженного зверя, зараженного тьмой, но что-то гораздо больше и сильнее убило его. Видя это поверженное создание тьмы, группа получает преимущество на проверку Искры до конца фазы Путь и +1 на Прибытие.', effects: { arrival: 1 }, table: 'great_beasts' },
          { condition: 'success', message: 'Группа получает +1 на Прибытие, обходя темные земли.', effects: { arrival: 1 } },
          { condition: 'fail', message: 'Группа заходит в темные земли, но успешно замечает это перед тем, как становится слишком поздно, получая -1 на Прибытие.', effects: { arrival: -1 } },
          { condition: 'fail_5', message: 'Группа получает штраф -1 на Прибытие. Они забрели слишком далеко в логово зла, не заметив этого и пробуждая то, что спит в этих землях.', effects: { arrival: -1 }, extraRoll: true }
        ]
      }
    }
  },
  { 
    id: 2, 
    title: 'Преграда', 
    description: 'Что-то мешает группе пройти дальше.',
    checkInfo: 'Чтец Знаков совершает проверку Расследования.',
    config: {
      type: 'reader_obstacle',
      table: {
        name: 'region_obstacles',
        label: 'Таблица Преград Области',
        fields: ['name', 'description']
      },
      check: {
        label: 'Проверка Расследования',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success', message: 'Группа успешно обходит преграду и получает +1 на бросок Прибытия.', effects: { arrival: 1 } },
          { condition: 'fail', message: 'Группа обходит преграду, но с заметными трудностями. Проверка Кремня и -1 на бросок Прибытия.', effects: { arrival: -1 } },
          { condition: 'fail_5', message: 'Группа должна немедленно начать долгий отдых, поскольку путь будет долгим и нужно подготовиться.' }
        ]
      }
    }
  },
  { 
    id: 3, 
    title: 'Поющие Знаки', 
    description: 'Похоже, что нити судьбы пытаются обречь группу на провал.',
    checkInfo: 'Чтец Знаков совершает проверку Традиции.',
    config: {
      type: 'reader_singing_signs',
      check: {
        label: 'Проверка Традиции',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success', message: 'Группа избегает все опасности, верно прочитав знаки, и получает +1 на проверку Прибытия и -1 событие в фазе Путь.', effects: { arrival: 1, events: -1 } },
          { condition: 'fail', message: 'Добавлено новое общее событие в конце.', effects: { events: 1 } },
          { condition: 'fail_5', message: 'Группа начинает видеть знаки во всем вокруг, получает -1 к уровню Искры. Добавлено новое общее событие в конце.', effects: { events: 1 } }
        ]
      }
    }
  }
];

// ============================================================
// СОБЫТИЯ ТЕНИ НАРАРА
// ============================================================

export const SHADOW_EVENTS = [
  { 
    id: 1, 
    title: 'Опасная Встреча', 
    description: 'Что-то есть на вашем пути.',
    checkInfo: 'Тень Нарара совершает проверку Скрытности.',
    config: {
      type: 'shadow_dangerous_meeting',
      table: {
        name: 'zone_conflicts',
        label: 'Таблица Конфликт Зоны',
        fields: ['name', 'description']
      },
      check: {
        label: 'Проверка Скрытности',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success', message: 'Группа может обойти встречу на безопасной дистанции.' },
          { condition: 'fail', message: 'Группа замечена.' }
        ]
      }
    }
  },
  { 
    id: 2, 
    title: 'Плачь Вуали', 
    description: 'Движение вуали в регионе привлекает существ вуали. Тень Нарара обнаруживает их, как будто эти существа появились из воздуха.',
    checkInfo: 'Тень Нарара совершает проверку Скрытности.',
    config: {
      type: 'shadow_veil_cry',
      table: {
        name: 'veil_children',
        label: 'Таблица Дети Вуали',
        fields: ['name', 'description'],
        isCreature: true,
        sectionId: 'veil_aberrations'
      },
      check: {
        label: 'Проверка Скрытности',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success', message: 'Тень может ускользнуть от них и провести группу безопасно.' },
          { condition: 'fail', message: 'Тень успевает вернуться к группе перед тем, как начнется сражение.' },
          { condition: 'fail_5', message: 'Тень Нарара на 1 раунд оказывается один на один с этими существами.' }
        ]
      }
    }
  },
  { 
    id: 3, 
    title: 'Безопасный Ночлег', 
    description: 'Группа в поисках безопасного ночлега.',
    checkInfo: 'Тень Нарара совершает проверку Расследования.',
    config: {
      type: 'shadow_safe_camp',
      check: {
        label: 'Проверка Расследования',
        difficulty: 12,
        bars: {
          type: 'single'
        },
        results: [
          { condition: 'success_5', message: 'Группа находит отличное место для стоянки. +1 на Прибытие и может восстановить 2 уровня Искры или Кремня или по 1 каждый.', effects: { arrival: 1 } },
          { condition: 'success', message: '+1 уровень Кремня или +1 Искры.' },
          { condition: 'fail', message: 'Группа не может уснуть из-за постоянного ощущения, что кто-то наблюдает за ними.' },
          { condition: 'fail_5', message: 'Ваш лагерь расположен прямо в логове монстра.', table: 'opasnost_regional' }
        ]
      }
    }
  }
];

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

export function getRegionalTableName(terrainType) {
  const mapping = {
    'пустыня': 'opasnost_pustini',
    'степи': 'opasnost_stepi',
    'горы': 'opasnost_gor',
    'джунгли': 'opasnost_jungle'
  };
  return mapping[terrainType] || null;
}

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
