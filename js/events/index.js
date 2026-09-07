// ============================================================
// ВСЕ СОБЫТИЯ В ОДНОМ ФАЙЛЕ
// ============================================================

// ============================================================
// ОБЩИЕ СОБЫТИЯ
// ============================================================

// 1. Знаменье Темной Нити
const event1 = {
  id: 1,
  title: 'Знаменье Темной Нити',
  description: 'От судьбы не уйдет никто. Ведь началась Темная Нить и она тянет искателей за собой. Группу ожидает их предназначение.',
  checkInfo: 'Хранитель Узлов получает 1 Кость Проклятья за каждого члена группы.',
  type: 'simple',
  
  render: function(event, helpers) {
    return '';
  },
  
  handleCheck: function(event, values, type, difficulty) {
    return null;
  }
};

// 2. Ловушка
const event2 = {
  id: 2,
  title: 'Ловушка',
  description: 'Что-то здесь не так. Вся группа должна совершить бросок роли, выбирая наименьший показатель из своих навыков.',
  checkInfo: 'Вся группа совершает бросок роли, выбирая наименьший показатель из своих навыков.',
  type: 'trap',
  
  tables: {
    'traps': { label: 'Таблица Ловушек', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('traps', event.id, 'main_traps', event);
    html += createMultipleBars(event, 'main', 'Результаты проверки (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_success': 'Группа может либо разрядить ловушку, либо напасть (если это ловушка-встреча) на неё с раундом сюрпризом, либо обойти её тихо.',
        'half_success': 'Группа замечает ловушку.',
        'half_fail': 'Ловушка срабатывает.',
        'all_fail': 'Ловушка срабатывает. Если ловушка не является похищением, вся группа умирает.',
        'crit_success': 'Группа не только разряжает ловушку, но и находит ценный ресурс.',
        'crit_fail': 'Ловушка срабатывает со всей силой. Проверка Искры для всех.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes === total) {
      resultType = 'all_success';
      resultText = 'Все преуспели!';
    } else if (successes >= half) {
      resultType = 'half_success';
      resultText = 'Больше половины преуспели!';
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Больше половины провалили!';
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    const hasCritSuccess = values.some(v => v >= difficulty + 5);
    const hasCritFail = values.some(v => v <= difficulty - 5);
    
    if (hasCritSuccess && (resultType === 'all_success')) {
      resultType = 'crit_success';
      resultText = 'Критический успех!';
    }
    if (hasCritFail && (resultType === 'all_fail')) {
      resultType = 'crit_fail';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 3. Древние Руины
const event3 = {
  id: 3,
  title: 'Древние Руины',
  description: 'Группа набредает на древнее строение.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'ruins',
  
  tables: {
    'ruins': { label: 'Таблица Руин', fields: ['name', 'pass_method', 'reward_type'] }
  },
  
  hasSecondCheck: true,
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('ruins', event.id, 'main_ruins', event);
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_or_half_success': 'Группа вдохновляется невероятными строениями древней цивилизации и получает +1 к Прибытию.',
        'half_fail': 'Что разрушило строение? Что это за знаки? Что их ждёт дальше? Мораль группы начинает разваливаться, они получают -1 к Прибытию.',
        'all_fail': 'Что за кошмары могут обитать в этой местности? Группа начинает в удвоенном темпе сбегать с места. Если же группа решит исследовать руины, ее члены будут считаться Испуганными любыми существами находящимися рядом на все время исследования.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'all_or_half_success') {
        addArrivalBonus(1);
      }
      if (event.result === 'half_fail') {
        addArrivalBonus(-1);
      }
    }
    
    // Вторая проверка
    html += '<div class="second-check-section">';
    html += createSingleBar(event, 'second', 'Проверка Ловкости рук (Тень Нарара) (сложность ' + difficulty + ')', difficulty);
    if (event.secondChecked) {
      html += createResult(event.secondResult, event.secondResultText);
      const secondEffects = {
        'success_5': 'Группа находит 2 ценных артефакта.',
        'success': 'Тень Нарара находит магический предмет.',
        'fail': 'Группа задерживается и ей приходится совершать отдых у руин, получая эффект проверки Искры повторно.',
        'fail_5': 'Тень Нарара задерживается среди руин, а группа привлекает внимание жителей местности.'
      };
      html += createEffect(event.secondResult, secondEffects);
    }
    html += '</div>';
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const isSecond = type === 'second';
    
    if (isSecond) {
      const value = values[0] || 0;
      let resultType = '';
      let resultText = '';
      
      if (value >= difficulty + 5) {
        resultType = 'success_5';
        resultText = 'Критический успех!';
      } else if (value >= difficulty) {
        resultType = 'success';
        resultText = 'Успех!';
      } else if (value >= difficulty - 5) {
        resultType = 'fail';
        resultText = 'Провал...';
      } else {
        resultType = 'fail_5';
        resultText = 'Критический провал!';
      }
      
      return { resultType, resultText };
    }
    
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Провал...';
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    return { resultType, resultText };
  }
};

// 4. Бескрайние Пейзажи
const event4 = {
  id: 4,
  title: 'Бескрайние Пейзажи',
  description: 'Группа проходит невероятные бескрайние пейзажи, они одновременно и величественные, и вдохновляющие, и устрашающие. Глядя на эти пейзажи, группа чувствует себя незначительной песчинкой в этих землях.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'landscapes',
  
  render: function(event, helpers) {
    const { createMultipleBars, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_or_half_success': 'Путники чувствуют вдохновение от пейзажей и получают +1 к Прибытию и 1 Кость Удачи.',
        'half_fail': 'Группа чувствует что она сможет покорить этот край, но потери неизбежны, они получают -1 к Прибытию.',
        'all_fail': 'Этот пейзаж угнетает, они получают -1 к Прибытию.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'all_or_half_success') {
        addArrivalBonus(1);
      }
      if (event.result === 'half_fail' || event.result === 'all_fail') {
        addArrivalBonus(-1);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Провал...';
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    return { resultType, resultText };
  }
};

// 5. Невероятный Оазис
const event5 = {
  id: 5,
  title: 'Невероятный Оазис',
  description: 'Группа прибывает в безопасный на вид оазис.',
  checkInfo: 'Все в группе совершают Проверку Искры.',
  type: 'oasis',
  
  tables: {
    'oasis_mysteries': { label: 'Загадки Оазисов', fields: ['oasis_type', 'mystery'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createMultipleBars, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('oasis_mysteries', event.id, 'main_oasis', event);
    html += createMultipleBars(event, 'main', 'Проверка Искры (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'all_or_half_success': 'Группа понимает, что это идеальное место для отдыха, где не бушуют ветра и Шамас приглядывает с небес. Группа может сделать длинный отдых и каждый из группы получит одну Кость Удачи. Группа замечает тайну оазиса.',
        'half_fail': 'Группе место кажется безопасным насколько это возможно здесь. Группа может сделать длинный отдых. Но что-то как будто шепчет в этом странном месте, что-то тут не так. Группа замечает тайну оазиса.',
        'all_fail': 'Внешне оазис кажется враждебным и обманчивым. Медленно паранойя начинает подавлять группу. У группы помеха на проверки связанные с Интеллектом до конца фазы Путь.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const successes = values.filter(v => v >= difficulty).length;
    const failures = values.filter(v => v < difficulty).length;
    const total = values.length;
    const half = Math.ceil(total / 2);
    
    let resultType = '';
    let resultText = '';
    
    if (successes >= half) {
      resultType = 'all_or_half_success';
      resultText = 'Успех!';
    } else if (failures >= half) {
      resultType = 'half_fail';
      resultText = 'Провал...';
    } else if (failures === total) {
      resultType = 'all_fail';
      resultText = 'Все провалили!';
    }
    
    return { resultType, resultText };
  }
};

// 6. Вмешательство звезд
const event6 = {
  id: 6,
  title: 'Вмешательство звезд',
  description: 'Сами боги вмешиваются в судьбу группы, благословляя или показывая свой гнев.',
  checkInfo: 'Все члены группы должны совершить проверку Традиций. Хранитель узлов сравнивает общий результат.',
  type: 'total_check',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, addArrivalBonus } = helpers;
    let html = '';
    
    html += createSingleBar(event, 'main', 'Общий результат проверки Традиций', 0);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'total_80': 'Боги благословляют группу и их нити судьбы изгибаются в лучшую сторону. Все негативные эффекты знака из фазы Чтение знаков перестают действовать, а все положительные эффекты удваиваются.',
        'total_60': 'Боги в раздумье и посему судьба группы натягивается как струна. Чтец знаков делает еще один бросок по таблице знаков, у группы +1 событие в фазе Путь.',
        'total_40': 'Боги недовольны малым поклонением и группу настигает их разочарование. Бросьте по таблице Знаков из фазы Чтение знаков с помехой. У группы также -2 к Прибытию.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'total_40') {
        addArrivalBonus(-2);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const totalValue = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (totalValue >= 80) {
      resultType = 'total_80';
      resultText = '80 и более — Боги благословляют группу!';
    } else if (totalValue >= 60) {
      resultType = 'total_60';
      resultText = '60 и более — Боги в раздумье!';
    } else {
      resultType = 'total_40';
      resultText = '40 и менее — Боги недовольны!';
    }
    
    return { resultType, resultText };
  }
};

// ============================================================
// СОБЫТИЯ ЧТЕЦА ЗНАКОВ
// ============================================================

// 1. Проклятые земли
const reader1 = {
  id: 1,
  title: 'Проклятые земли',
  description: 'Группа забрела в темные земли с бушующими в них неизвестными силами.',
  checkInfo: 'Чтец знаков совершает проверку Традиции.',
  type: 'cursed_lands',
  
  tables: {
    'region_curses': { label: 'Таблица Проклятий области', fields: ['name', 'description'] },
    'great_beasts': { label: 'Таблица Великих Зверей', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('region_curses', event.id, 'main_curses', event);
    html += createSingleBar(event, 'main', 'Проверка Традиции (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Чтец замечает следы поверженного зверя, зараженного тьмой, но что-то гораздо больше и сильнее убило его. Видя это поверженное создание тьмы, группа получает преимущество на проверку Искры до конца фазы Путь и +1 к Прибытию.',
        'success': 'Группа получает +1 к Прибытию, обходя темные земли.',
        'fail': 'Группа заходит в темные земли, но успешно замечает это перед тем, как становится слишком поздно, получая -1 к Прибытию.',
        'fail_5': 'Группа получает штраф -1 к Прибытию. Они забрели слишком далеко в логово зла, не заметив этого и пробуждая то, что спит в этих землях.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success_5' || event.result === 'success') {
        addArrivalBonus(1);
      }
      if (event.result === 'fail' || event.result === 'fail_5') {
        addArrivalBonus(-1);
      }
      
      if (event.result === 'success_5') {
        html += createTableButton('great_beasts', event.id, 'extra_great_beasts', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 2. Преграда
const reader2 = {
  id: 2,
  title: 'Преграда',
  description: 'Что-то мешает группе пройти дальше.',
  checkInfo: 'Чтец Знаков совершает проверку Расследования.',
  type: 'obstacle',
  
  tables: {
    'region_obstacles': { label: 'Таблица Преград Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('region_obstacles', event.id, 'main_obstacles', event);
    html += createSingleBar(event, 'main', 'Проверка Расследования (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа успешно обходит преграду и получает +1 к Прибытию.',
        'fail': 'Группа обходит преграду, но с заметными трудностями. Проверка Кремня и -1 к Прибытию.',
        'fail_5': 'Группа должна немедленно начать долгий отдых, поскольку путь будет долгим и нужно подготовиться.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success') {
        addArrivalBonus(1);
      }
      if (event.result === 'fail') {
        addArrivalBonus(-1);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 3. Поющие Знаки
const reader3 = {
  id: 3,
  title: 'Поющие Знаки',
  description: 'Похоже, что нити судьбы пытаются обречь группу на провал.',
  checkInfo: 'Чтец Знаков совершает проверку Традиции.',
  type: 'singing_signs',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Традиции (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа избегает все опасности, верно прочитав знаки, и получает +1 к Прибытию и -1 событие в фазе Путь.',
        'fail': 'Добавлено новое общее событие в конце.',
        'fail_5': 'Группа начинает видеть знаки во всем вокруг, получает -1 к уровню Искры. Добавлено новое общее событие в конце.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success') {
        addArrivalBonus(1);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 4. Это должно было произойти!
const reader4 = {
  id: 4,
  title: 'Это должно было произойти!',
  description: 'Нити судьбы были связаны еще перед началом пути. Хранитель узлов выбирает одно событие из списка и оно происходит в любой момент по его выбору.',
  checkInfo: 'Чтец Знаков делает проверку Традиций.',
  type: 'fate',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += '<div style="margin-top: 8px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px;">Выберите событие:</label>';
    html += '<select id="fate-select-' + event.id + '" style="width:100%; padding:8px 12px; margin-top:4px; background:rgba(255,255,255,0.05); border:1px solid #4a0e0e; border-radius:6px; color:#ffffff; font-family:\'Philosopher\', sans-serif;">';
    html += '<option value="1">Знаменье Темной Нити</option>';
    html += '<option value="2">Ловушка</option>';
    html += '<option value="3">Древние Руины</option>';
    html += '<option value="4">Бескрайние Пейзажи</option>';
    html += '<option value="5">Невероятный Оазис</option>';
    html += '<option value="6">Вмешательство звезд</option>';
    html += '</select>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Традиций (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Чтец знаков узнает о событии и может подготовить группу к нему. Выбранное событие отображается с пометкой "Известно заранее".',
        'success': 'Чтец знаков узнает о том, что будет еще какое-то событие, но не знает какое именно. Отображается сообщение о неизвестном будущем событии.',
        'fail': 'Чтец знаков путается в чтении и совершает повторный бросок по таблице из фазы Чтение знаков.',
        'fail_5': 'Чтец знаков невольно нарушает нити судьбы, что приводит к еще одному событию в фазе Путь на выбор Хранителя узлов. Добавьте событие из списка.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 5. Ложные Нити
const reader5 = {
  id: 5,
  title: 'Ложные Нити',
  description: 'Иллюзия судьбы в виде удачных путей, поиска провизии и безопасного места ведёт группу в неверном направлении и к опасности.',
  checkInfo: 'Чтец Знаков бросает проверку Расследования.',
  type: 'false_threads',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, createTableButton, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Расследования (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Чтец распознает обман и находит истинный путь. Группа получает +1 к Прибытию.',
        'fail': 'Группа отклоняется от маршрута. +1 событие в фазе Путь.',
        'fail_5': 'Группа оказывается в враждебной зоне.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success') {
        addArrivalBonus(1);
      }
      
      if (event.result === 'fail_5') {
        html += createTableButton('zone_conflicts', event.id, 'extra_zone_conflicts', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 6. Шепчущий обо
const reader6 = {
  id: 6,
  title: 'Шепчущий обо',
  description: 'Группа останавливается у древнего обо, на котором вырезаны знаки или развиваются узлы с посланием.',
  checkInfo: 'Чтец Знаков совершает проверку Традиций, чтобы понять, кому принадлежит обо и что это может раскрыть в пути.',
  type: 'whispering_obo',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Традиций (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Знаки предвещают важную истину. +1 к Прибытию и 1 кость удачи.',
        'success': 'Группа получает +1 к Прибытию.',
        'fail': 'Чтение сбивает Чтеца с толку — он теряет -1 к Искре.',
        'fail_5': 'Группа принимает знак за проклятие. Проверка Искры, и +1 событие в фазе Путь.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success_5' || event.result === 'success') {
        addArrivalBonus(1);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// ============================================================
// СОБЫТИЯ ТЕНИ НАРАРА
// ============================================================

// 1. Опасная Встреча
const shadow1 = {
  id: 1,
  title: 'Опасная Встреча',
  description: 'Что-то есть на вашем пути.',
  checkInfo: 'Тень Нарара совершает проверку Скрытности.',
  type: 'dangerous_meeting',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликт Зоны', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('zone_conflicts', event.id, 'main_zone_conflicts', event);
    html += createSingleBar(event, 'main', 'Проверка Скрытности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа может обойти встречу на безопасной дистанции.',
        'fail': 'Группа замечена.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
    }
    
    return { resultType, resultText };
  }
};

// 2. Плачь Вуали
const shadow2 = {
  id: 2,
  title: 'Плачь Вуали',
  description: 'Движение вуали в регионе привлекает существ вуали. Тень Нарара обнаруживает их, как будто эти существа появились из воздуха.',
  checkInfo: 'Тень Нарара совершает проверку Скрытности.',
  type: 'veil_cry',
  
  tables: {
    'veil_children': { label: 'Таблица Дети Вуали', fields: ['name', 'description'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createTableButton('veil_children', event.id, 'main_veil_children', event);
    html += createSingleBar(event, 'main', 'Проверка Скрытности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Тень может ускользнуть от них и провести группу безопасно.',
        'fail': 'Тень успевает вернуться к группе перед тем, как начнется сражение.',
        'fail_5': 'Тень Нарара на 1 раунд оказывается один на один с этими существами.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 3. Безопасный Ночлег
const shadow3 = {
  id: 3,
  title: 'Безопасный Ночлег',
  description: 'Группа в поисках безопасного ночлега.',
  checkInfo: 'Тень Нарара совершает проверку Расследования.',
  type: 'safe_camp',
  
  tables: {
    'opasnost_regional': { label: 'Таблица Опасных Существ Зоны', fields: ['name'], isCreature: true }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Расследования (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'Группа находит отличное место для стоянки. +1 к Прибытию и может восстановить 2 уровня Искры или Кремня или по 1 каждый.',
        'success': '+1 уровень Кремня или +1 Искры.',
        'fail': 'Группа не может уснуть из-за постоянного ощущения, что кто-то наблюдает за ними.',
        'fail_5': 'Ваш лагерь расположен прямо в логове монстра.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success_5') {
        addArrivalBonus(1);
      }
      
      if (event.result === 'fail_5') {
        html += createTableButton('opasnost_regional', event.id, 'extra_opasnost', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 4. Пролом реальности
const shadow4 = {
  id: 4,
  title: 'Пролом реальности',
  description: 'Группа наблюдает, как реальность изламывается и рвется, словно некая сила пытается проникнуть в мир.',
  checkInfo: 'Тень Нарара совершает проверку Скрытности.',
  type: 'reality_tear',
  
  render: function(event, helpers) {
    const { createSingleBar, createResult, createEffect, getCurrentDifficulty } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += '<div style="margin-top: 8px;">';
    html += '<button class="btn-reality-tear" data-event-id="' + event.id + '" style="background: transparent; border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 4px 14px; border-radius: 6px; cursor: pointer; font-family: \'Philosopher\', sans-serif; font-size: 13px;">';
    html += 'Определить природу пролома';
    html += '</button>';
    html += '<div id="reality-result-' + event.id + '" style="margin-top: 6px; display: none;"></div>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Проверка Скрытности (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Группа скрытно наблюдает за разломом, не привлекая ненужного внимания.',
        'fail': 'Группа видит приходящих из пролома существ, и они тоже видят группу.'
      };
      html += createEffect(event.result, effects);
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else {
      resultType = 'fail';
      resultText = 'Провал...';
    }
    
    return { resultType, resultText };
  }
};

// 5. Следопыты
const shadow5 = {
  id: 5,
  title: 'Следопыты',
  description: 'Тень замечает следы другого отряда или неизвестных существ.',
  checkInfo: 'Тень совершает проверку Скрытности или Ловкости рук (на выбор).',
  type: 'trackers',
  
  tables: {
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += '<div style="margin-top: 8px;">';
    html += '<label style="color: rgba(255,255,255,0.5); font-size: 13px;">Выберите навык:</label>';
    html += '<select id="skill-select-' + event.id + '" style="width:100%; padding:8px 12px; margin-top:4px; background:rgba(255,255,255,0.05); border:1px solid #4a0e0e; border-radius:6px; color:#ffffff; font-family:\'Philosopher\', sans-serif;">';
    html += '<option value="скрытность">Скрытность</option>';
    html += '<option value="ловкость">Ловкость рук</option>';
    html += '</select>';
    html += '</div>';
    
    html += createSingleBar(event, 'main', 'Результат проверки (сложность ' + difficulty + ')', difficulty);
    html += createTableButton('zone_conflicts', event.id, 'main_zone_conflicts', event);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success': 'Тень прослеживает путь этих существ и избегает контакта — группа получает +1 к Прибытию.',
        'fail': 'Незнакомцы замечают группу.',
        'fail_5': 'Группа заходит в засаду. Начинается бой с раундом сюрприза.'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success') {
        addArrivalBonus(1);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// 6. Потайной тайник
const shadow6 = {
  id: 6,
  title: 'Потайной тайник',
  description: 'Тень замечает остатки укрытого схрона — возможно, брошенного искателями или погибшими кочевниками.',
  checkInfo: 'Тень совершает проверку Ловкости рук.',
  type: 'secret_cache',
  
  tables: {
    'artefacts': { label: 'Таблица Артефактов', fields: ['name', 'description'] },
    'zone_conflicts': { label: 'Таблица Конфликтов Области', fields: ['name', 'description'] }
  },
  
  render: function(event, helpers) {
    const { createTableButton, createSingleBar, createResult, createEffect, getCurrentDifficulty, addArrivalBonus } = helpers;
    const difficulty = getCurrentDifficulty();
    let html = '';
    
    html += createSingleBar(event, 'main', 'Проверка Ловкости рук (сложность ' + difficulty + ')', difficulty);
    
    if (event.checked) {
      html += createResult(event.result, event.resultText);
      const effects = {
        'success_5': 'В тайнике обнаружено ценное. Группа также получает +1 к Искре.',
        'success': 'Найдены редкие ресурсы — куб провизии восстанавливается на 1 уровень, и группа получает +1 к Прибытию.',
        'fail': 'Тень случайно заставляет сработать ловушку, тень Нарара получает 5к6 урона с любым типом на усмотрение Хранителя узлов.',
        'fail_5': 'Тайник оказался приманкой. Срабатывает событие «Опасная встреча».'
      };
      html += createEffect(event.result, effects);
      
      if (event.result === 'success') {
        addArrivalBonus(1);
      }
      
      if (event.result === 'success_5' || event.result === 'success') {
        html += createTableButton('artefacts', event.id, 'extra_artefacts', event);
        if (event.result === 'success_5') {
          html += createTableButton('artefacts', event.id, 'extra_artefacts_2', event, 2);
        }
      }
      
      if (event.result === 'fail_5') {
        html += createTableButton('zone_conflicts', event.id, 'extra_zone_conflicts', event);
      }
    }
    
    return html;
  },
  
  handleCheck: function(event, values, type, difficulty) {
    const value = values[0] || 0;
    let resultType = '';
    let resultText = '';
    
    if (value >= difficulty + 5) {
      resultType = 'success_5';
      resultText = 'Критический успех!';
    } else if (value >= difficulty) {
      resultType = 'success';
      resultText = 'Успех!';
    } else if (value >= difficulty - 5) {
      resultType = 'fail';
      resultText = 'Провал...';
    } else {
      resultType = 'fail_5';
      resultText = 'Критический провал!';
    }
    
    return { resultType, resultText };
  }
};

// ============================================================
// ЭКСПОРТЫ
// ============================================================

export const COMMON_EVENTS_MODULES = {
  1: event1,
  2: event2,
  3: event3,
  4: event4,
  5: event5,
  6: event6
};

export const READER_EVENTS_MODULES = {
  1: reader1,
  2: reader2,
  3: reader3,
  4: reader4,
  5: reader5,
  6: reader6
};

export const SHADOW_EVENTS_MODULES = {
  1: shadow1,
  2: shadow2,
  3: shadow3,
  4: shadow4,
  5: shadow5,
  6: shadow6
};

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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

export function getRegionalTableName(terrainType) {
  const mapping = {
    'пустыня': 'opasnost_pustini',
    'степи': 'opasnost_stepi',
    'горы': 'opasnost_gor',
    'джунгли': 'opasnost_jungle'
  };
  return mapping[terrainType] || null;
}

export function getEventModule(id, type) {
  if (type === 'Общее' || type === 'Общее (бонусное)') {
    return COMMON_EVENTS_MODULES[id];
  }
  if (type === 'Чтец_Знаков') {
    return READER_EVENTS_MODULES[id];
  }
  if (type === 'Тень_Нарара') {
    return SHADOW_EVENTS_MODULES[id];
  }
  return null;
}
