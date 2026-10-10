// ============================================================
// УЧИМСЯ ИГРАЯ — 1-4 КЛАСС
// Разработала Шуинова Софья
// ============================================================

const state = {
  classNum: 1,
  subject: null,
  topic: null,
  game: null,
  gameState: null,
  _buildWordsQueue: null
};

// ================== НАВИГАЦИЯ ==================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectClass(n) {
  state.classNum = n;
  document.getElementById('current-class-label').textContent = n + ' класс';
  renderSubjects();
  showScreen('screen-subject');
}

function goToClasses() { showScreen('screen-class'); }
function goToSubjects() { renderSubjects(); showScreen('screen-subject'); }
function goToTopics() { renderTopics(); showScreen('screen-topics'); }
function goToGames() { renderGames(); showScreen('screen-games'); }

function selectSubject(subj) {
  state.subject = subj;
  const labels = {
    literacy: 'Обучение грамоте',
    russian: 'Русский язык',
    reading: 'Чтение',
    math: 'Математика',
    world: 'Окружающий мир'
  };
  document.getElementById('current-subject-label').textContent = labels[subj];
  document.getElementById('topics-title').textContent = labels[subj];
  renderTopics();
  showScreen('screen-topics');
}

function selectTopic(topicId) {
  state.topic = topicId;
  const topic = TOPICS[state.subject][state.classNum].find(t => t.id === topicId);
  document.getElementById('current-topic-label').textContent = topic ? topic.title : 'Тема';
  document.getElementById('games-title').textContent = topic ? topic.title : 'Игры';
  renderGames();
  showScreen('screen-games');
}

function startGame(gameId) {
  state.game = gameId;
  state.gameState = { score: 0, total: 0, locked: false };
  document.getElementById('play-score').textContent = '0';
  document.getElementById('play-total').textContent = '0';
  document.getElementById('play-progress').style.width = '0%';
  document.getElementById('play-title').textContent = GAMES[gameId].title;
  document.getElementById('play-area').innerHTML = '';
  showScreen('screen-play');
  GAMES[gameId].start();
}

function restartGame() { if (state.game) startGame(state.game); }

// ================== РЕНДЕР ПРЕДМЕТОВ ==================
function renderSubjects() {
  const subjects = [
    { id: 'literacy', emoji: '📖', title: 'Обучение грамоте', desc: 'Звуки, слоги, буквы', cls: 'literacy' },
    { id: 'russian',  emoji: '✏️', title: 'Русский язык',      desc: 'Звуки, буквы, слова', cls: 'russian' },
    { id: 'reading',  emoji: '📚', title: 'Чтение',            desc: 'Слоги, слова, предложения', cls: 'reading' },
    { id: 'math',     emoji: '🔢', title: 'Математика',        desc: 'Числа, примеры, фигуры', cls: 'math' },
    { id: 'world',    emoji: '🌍', title: 'Окружающий мир',    desc: 'Природа, животные, космос', cls: 'world' }
  ];
  const grid = document.getElementById('subject-grid');
  grid.innerHTML = subjects.map(s => `
    <div class="subject-card ${s.cls}" onclick="selectSubject('${s.id}')">
      <span class="emoji">${s.emoji}</span>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// ================== РЕНДЕР ТЕМ ==================
function renderTopics() {
  const topics = (TOPICS[state.subject] && TOPICS[state.subject][state.classNum]) || [];
  const grid = document.getElementById('topics-grid');
  if (!topics.length) {
    grid.innerHTML = '<p style="text-align:center; color:#888; font-weight:700;">Для этого класса тем пока нет</p>';
    return;
  }
  grid.innerHTML = topics.map((t, i) => `
    <div class="topic-card" onclick="selectTopic('${t.id}')">
      <div class="topic-num">${i + 1}</div>
      <div class="topic-info">
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
        <p class="topic-count">🎮 ${t.games.length} ${pluralGames(t.games.length)}</p>
      </div>
    </div>
  `).join('');
}

function pluralGames(n) {
  if (n === 1) return 'игра';
  if (n >= 2 && n <= 4) return 'игры';
  return 'игр';
}

// ================== РЕНДЕР ИГР ==================
function renderGames() {
  const grid = document.getElementById('games-grid');
  const topics = (TOPICS[state.subject] && TOPICS[state.subject][state.classNum]) || [];
  const topic = topics.find(t => t.id === state.topic);
  if (!topic) {
    grid.innerHTML = '<p style="text-align:center; color:#888; font-weight:700;">Игры не найдены</p>';
    return;
  }
  grid.innerHTML = topic.games.map(gId => {
    const g = GAMES[gId];
    if (!g) return '';
    return `
      <div class="game-card" onclick="startGame('${gId}')">
        <span class="emoji">${g.emoji || '🎮'}</span>
        <h3>${g.title}</h3>
        <p>${g.desc || ''}</p>
      </div>
    `;
  }).join('');
}

// ================== ПОМОЩНИКИ ==================
const TOTAL_QUESTIONS = 10;

function updateProgress() {
  const gs = state.gameState;
  document.getElementById('play-score').textContent = gs.score;
  document.getElementById('play-total').textContent = gs.total;
  document.getElementById('play-progress').style.width =
    Math.min(100, (gs.total / TOTAL_QUESTIONS) * 100) + '%';
}

function endGame() {
  const gs = state.gameState;
  document.getElementById('win-score').textContent = gs.score;
  document.getElementById('win-total').textContent = gs.total;
  let msg = '';
  if (gs.score === gs.total) msg = '🌟 Идеальный результат!';
  else if (gs.score >= gs.total * 0.7) msg = '😊 Хороший результат!';
  else msg = '💪 Попробуй ещё раз!';
  document.getElementById('win-message').textContent = msg;
  showScreen('screen-win');
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let audioCtx = null;
function playSound(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    } else {
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch(e) {}
}

function askSimple({ render, options, correct, afterAnswer }) {
  const gs = state.gameState;
  gs.locked = false;
  const area = document.getElementById('play-area');
  area.innerHTML = render();

  const answersDiv = document.createElement('div');
  answersDiv.className = 'answers';
  const shuffled = shuffle(options);
  shuffled.forEach(opt => {
    const val = typeof opt === 'object' ? opt.value : opt;
    const lbl = typeof opt === 'object' ? opt.label : opt;
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = lbl;
    btn.dataset.value = val;
    btn.onclick = () => {
      if (gs.locked) return;
      gs.locked = true;
      gs.total++;
      answersDiv.querySelectorAll('button').forEach(b => b.disabled = true);
      const isCorrect = String(val) === String(correct);
      if (isCorrect) {
        btn.classList.add('correct');
        gs.score++;
        playSound('correct');
      } else {
        btn.classList.add('wrong');
        answersDiv.querySelectorAll('button').forEach(b => {
          if (String(b.dataset.value) === String(correct)) b.classList.add('correct');
        });
        playSound('wrong');
      }
      updateProgress();
      if (afterAnswer) afterAnswer(isCorrect);
      setTimeout(() => {
        if (gs.total >= TOTAL_QUESTIONS) return endGame();
        GAMES[state.game].start();
      }, 1300);
    };
    answersDiv.appendChild(btn);
  });
  area.appendChild(answersDiv);
}

// ============================================================
// ДАННЫЕ
// ============================================================
const WORDS = [
  { w: 'МАМА', s: 2, first: 'М', pic: '👩' },
  { w: 'ПАПА', s: 2, first: 'П', pic: '👨' },
  { w: 'РУКА', s: 2, first: 'Р', pic: '✋' },
  { w: 'НОГА', s: 2, first: 'Н', pic: '🦶' },
  { w: 'КОЗА', s: 2, first: 'К', pic: '🐐' },
  { w: 'РОЗА', s: 2, first: 'Р', pic: '🌹' },
  { w: 'ЛИСА', s: 2, first: 'Л', pic: '🦊' },
  { w: 'ЛУНА', s: 2, first: 'Л', pic: '🌙' },
  { w: 'РЫБА', s: 2, first: 'Р', pic: '🐟' },
  { w: 'ЗИМА', s: 2, first: 'З', pic: '❄️' },
  { w: 'ВОДА', s: 2, first: 'В', pic: '💧' },
  { w: 'ГОРА', s: 2, first: 'Г', pic: '⛰️' },
  { w: 'КАША', s: 2, first: 'К', pic: '🥣' },
  { w: 'МУХА', s: 2, first: 'М', pic: '🪰' },
  { w: 'КОТ', s: 1, first: 'К', pic: '🐱' },
  { w: 'ДОМ', s: 1, first: 'Д', pic: '🏠' },
  { w: 'СЫН', s: 1, first: 'С', pic: '👦' },
  { w: 'МЯЧ', s: 1, first: 'М', pic: '⚽' }
];

const SENTENCES_PICTURES = [
  { pic: '🐱🥛', words: ['Кошка', 'пьёт', 'молоко'], correct: 'Кошка пьёт молоко' },
  { pic: '👦📖', words: ['Мальчик', 'читает', 'книгу'], correct: 'Мальчик читает книгу' },
  { pic: '🐶🏃', words: ['Собака', 'бежит', 'по', 'двору'], correct: 'Собака бежит по двору' },
  { pic: '☀️🌳', words: ['Солнце', 'светит', 'ярко'], correct: 'Солнце светит ярко' },
  { pic: '🐦🌳', words: ['Птица', 'сидит', 'на', 'дереве'], correct: 'Птица сидит на дереве' },
  { pic: '👧🌸', words: ['Девочка', 'рвала', 'цветы'], correct: 'Девочка рвала цветы' }
];

const PICTURE_WORDS = [
  { word: 'МАМА', correct: '👩', options: ['👩','🐶','🌳','🚗'] },
  { word: 'СОБАКА', correct: '🐶', options: ['🐱','🐶','🐭','🐸'] },
  { word: 'ДОМ', correct: '🏠', options: ['🏠','🌲','☀️','🌙'] },
  { word: 'КОТ', correct: '🐱', options: ['🐶','🐱','🐰','🐻'] },
  { word: 'СОЛНЦЕ', correct: '☀️', options: ['🌙','⭐','☀️','☁️'] },
  { word: 'ЛУНА', correct: '🌙', options: ['☀️','🌙','⭐','☁️'] },
  { word: 'РЫБА', correct: '🐟', options: ['🐠','🐟','🐬','🐳'] },
  { word: 'ЯБЛОКО', correct: '🍎', options: ['🍌','🍎','🍇','🍊'] }
];

// ============================================================
// ТЕМЫ
// ============================================================
const TOPICS = {
  literacy: {
    1: [
      { id: 'l1-sounds', title: 'Звуки и буквы', desc: 'Гласные и согласные', games: ['soundType','firstSound'] },
      { id: 'l1-syll', title: 'Слоги в словах', desc: 'Считаем слоги', games: ['syllableCount'] }
    ],
    2: [
      { id: 'l2-sounds', title: 'Звуки и буквы', desc: 'Гласные и согласные', games: ['soundType','firstSound'] },
      { id: 'l2-syll', title: 'Слоги в словах', desc: 'Считаем слоги', games: ['syllableCount'] }
    ],
    3: [
      { id: 'l3-syll', title: 'Слоги', desc: 'Сколько слогов', games: ['syllableCount'] },
      { id: 'l3-sound', title: 'Первый звук', desc: 'Определи звук', games: ['firstSound'] }
    ],
    4: []
  },

  russian: {
    1: [
      { id: 'r1-letter-s', title: 'Буква С, звук [с] и [с\u2019]', desc: 'Где стоит звук, твёрдый или мягкий', games: ['sPlaceInWord','sHardSoft','sWordsWithS'] }
    ],
    2: [
      { id: 'r2-letter-s', title: 'Буква С, звук [с] и [с\u2019]', desc: 'Повторяем звуки и слова', games: ['sPlaceInWord','sHardSoft','sWordsWithS'] }
    ],
    3: [
      { id: 'r3-sound', title: 'Звуки в словах', desc: 'Место звука в слове', games: ['sPlaceInWord'] }
    ],
    4: [
      { id: 'r4-sound', title: 'Звуки в словах', desc: 'Место звука в слове', games: ['sPlaceInWord'] }
    ]
  },

  reading: {
    1: [
      { id: 'rd1-merge', title: 'Слияние слогов', desc: 'Из букв — в слог', games: ['mergeSyllables'] },
      { id: 'rd1-build', title: 'Слова из слогов', desc: 'Собери слово', games: ['buildWord'] },
      { id: 'rd1-pic', title: 'Слова и картинки', desc: 'Подбери пару', games: ['pictureMatch'] },
      { id: 'rd1-sent', title: 'Предложения по картинке', desc: 'Составь предложение', games: ['sentencePicture'] }
    ],
    2: [
      { id: 'rd2-build', title: 'Слова из слогов', desc: 'Собери слово', games: ['buildWord'] },
      { id: 'rd2-pic', title: 'Слова и картинки', desc: 'Подбери пару', games: ['pictureMatch'] },
      { id: 'rd2-sent', title: 'Предложения по картинке', desc: 'Составь предложение', games: ['sentencePicture'] },
      { id: 'rd2-read', title: 'Читаем слова', desc: 'Найди такое же слово', games: ['wordReading'] }
    ],
    3: [
      { id: 'rd3-sent', title: 'Предложения по картинке', desc: 'Составь предложение', games: ['sentencePicture'] },
      { id: 'rd3-read', title: 'Читаем слова', desc: 'Найди такое же слово', games: ['wordReading'] }
    ],
    4: [
      { id: 'rd4-read', title: 'Читаем слова', desc: 'Найди такое же слово', games: ['wordReading'] }
    ]
  },

  math: {
    1: [
      { id: 'm1-cards',   title: 'Карточки с примерами', desc: 'Реши пример до 5', games: ['mathCards'] },
      { id: 'm1-numbers', title: 'Числа от 1 до 10', desc: 'Соседи и порядок чисел', games: ['numberNeighbors','prevNext','numberComposition'] },
      { id: 'm1-add5',    title: 'Сложение до 5', desc: 'Примеры на плюс', games: ['addUpTo5'] },
      { id: 'm1-sub5',    title: 'Вычитание до 5', desc: 'Примеры на минус', games: ['subUpTo5'] },
      { id: 'm1-add10',   title: 'Сложение до 10', desc: 'Примеры на плюс', games: ['addUpTo10'] },
      { id: 'm1-sub10',   title: 'Вычитание до 10', desc: 'Примеры на минус', games: ['subUpTo10'] },
      { id: 'm1-lines',   title: 'Линии', desc: 'Прямая, кривая, луч, отрезок', games: ['lines'] },
      { id: 'm1-shapes',  title: 'Геометрические фигуры', desc: 'Узнай фигуру', games: ['shapes'] },
      { id: 'm1-task',    title: 'Задачи по картинке', desc: 'Реши задачку', games: ['taskPicture'] }
    ],
    2: [
      { id: 'm2-cards',   title: 'Карточки с примерами', desc: 'Реши пример до 10 и 20', games: ['mathCards'] },
      { id: 'm2-numbers', title: 'Числа до 100', desc: 'Соседи и состав', games: ['numberNeighbors','numberComposition'] },
      { id: 'm2-add',     title: 'Сложение до 100', desc: 'Примеры на плюс', games: ['addUpTo100'] },
      { id: 'm2-sub',     title: 'Вычитание до 100', desc: 'Примеры на минус', games: ['subUpTo100'] },
      { id: 'm2-lines',   title: 'Линии', desc: 'Прямая, кривая, луч, отрезок', games: ['lines'] },
      { id: 'm2-shapes',  title: 'Геометрические фигуры', desc: 'Узнай фигуру', games: ['shapes'] },
      { id: 'm2-task',    title: 'Задачи по картинке', desc: 'Реши задачку', games: ['taskPicture'] }
    ],
    3: [
      { id: 'm3-cards',  title: 'Карточки с примерами', desc: 'Примеры до 100 и умножение', games: ['mathCards'] },
      { id: 'm3-add',    title: 'Сложение до 100', desc: 'Примеры на плюс', games: ['addUpTo100'] },
      { id: 'm3-sub',    title: 'Вычитание до 100', desc: 'Примеры на минус', games: ['subUpTo100'] },
      { id: 'm3-shapes', title: 'Геометрические фигуры', desc: 'Узнай фигуру', games: ['shapes'] },
      { id: 'm3-task',   title: 'Задачи по картинке', desc: 'Реши задачку', games: ['taskPicture'] }
    ],
    4: [
      { id: 'm4-cards',  title: 'Карточки с примерами', desc: 'Примеры до 1000, × и ÷', games: ['mathCards'] },
      { id: 'm4-add',    title: 'Сложение до 100', desc: 'Примеры на плюс', games: ['addUpTo100'] },
      { id: 'm4-sub',    title: 'Вычитание до 100', desc: 'Примеры на минус', games: ['subUpTo100'] },
      { id: 'm4-shapes', title: 'Геометрические фигуры', desc: 'Узнай фигуру', games: ['shapes'] }
    ]
  },

  world: {
    1: [
      { id: 'w1-animals', title: 'Животные', desc: 'Домашние и дикие', games: ['animalsHome'] },
      { id: 'w1-seasons', title: 'Времена года', desc: 'Когда это бывает', games: ['seasons'] },
      { id: 'w1-plants',  title: 'Растения', desc: 'Что где растёт', games: ['whereGrows'] },
      { id: 'w1-safety',  title: 'Безопасность', desc: 'Как поступать правильно', games: ['safetyRules'] }
    ],
    2: [
      { id: 'w2-living',  title: 'Живое и неживое', desc: 'Отличия природы', games: ['livingNonliving'] },
      { id: 'w2-space',   title: 'Космос', desc: 'Планеты и звёзды', games: ['space'] },
      { id: 'w2-nature',  title: 'Явления природы', desc: 'Дождь, снег, радуга', games: ['naturePhenomena'] },
      { id: 'w2-city',    title: 'Город и деревня', desc: 'Найди отличия', games: ['cityVillage'] }
    ],
    3: [
      { id: 'w3-kingdoms', title: 'Царства природы', desc: 'Растения, животные, грибы', games: ['natureKingdoms'] },
      { id: 'w3-water',    title: 'Круговорот воды', desc: 'Путешествие воды', games: ['waterCycle'] },
      { id: 'w3-sides',    title: 'Стороны света', desc: 'Север, юг, запад, восток', games: ['cardinalDirections'] },
      { id: 'w3-body',     title: 'Организм человека', desc: 'Органы и их работа', games: ['humanBody'] }
    ],
    4: [
      { id: 'w4-zones',    title: 'Природные зоны', desc: 'Тундра, тайга, пустыня', games: ['natureZones'] },
      { id: 'w4-cont',     title: 'Материки и океаны', desc: 'Где что находится', games: ['continents'] },
      { id: 'w4-minerals', title: 'Полезные ископаемые', desc: 'Что добывают из земли', games: ['minerals'] },
      { id: 'w4-eco',      title: 'Экология', desc: 'Как беречь природу', games: ['ecology'] }
    ]
  }
};

// ============================================================
// ИГРЫ
// ============================================================
const GAMES = {

  // ---------- ГРАМОТА ----------
  soundType: {
    title: 'Гласный или согласный',
    emoji: '🔊',
    desc: 'Определи тип звука',
    start() {
      const letter = pick(['А','О','У','И','Э','Ы','М','П','Б','Д','Т','Н','К','Л','Р','С']);
      const isVowel = 'АОУИЭЫ'.includes(letter);
      const correct = isVowel ? 'vowel' : 'consonant';
      askSimple({
        render: () => `
          <div class="sound-letter">${letter}</div>
          <p class="hint">Какой это звук?</p>
        `,
        options: [
          { value: 'vowel', label: 'Гласный' },
          { value: 'consonant', label: 'Согласный' }
        ],
        correct
      });
    }
  },

  syllableCount: {
    title: 'Сколько слогов?',
    emoji: '👏',
    desc: 'Посчитай слоги',
    start() {
      const word = pick(WORDS);
      const correct = word.s;
      askSimple({
        render: () => `
          <div class="word-display">${word.w}</div>
          <p class="hint">Сколько слогов в слове?</p>
        `,
        options: [1, 2, 3],
        correct
      });
    }
  },

  firstSound: {
    title: 'Первый звук',
    emoji: '🎯',
    desc: 'С какого звука слово',
    start() {
      const word = pick(WORDS);
      const correct = word.first;
      const letters = ['А','Б','В','Г','Д','К','Л','М','Н','П','Р','С','Т','З'];
      const opts = shuffle([correct, ...shuffle(letters.filter(l => l !== correct)).slice(0, 3)]);
      askSimple({
        render: () => `
          <div class="word-display">${word.w}</div>
          <p class="hint">С какого звука начинается слово?</p>
        `,
        options: opts,
        correct
      });
    }
  },

  // ---------- РУССКИЙ ЯЗЫК ----------
  sPlaceInWord: {
    title: 'Где звук [с] или [с\u2019]?',
    emoji: '📍',
    desc: 'Начало, середина или конец',
    start() {
      const wordsData = [
        { word: 'СЫН',        place: 'начало'  },
        { word: 'СОК',        place: 'начало'  },
        { word: 'САД',        place: 'начало'  },
        { word: 'САНКИ',      place: 'начало'  },
        { word: 'СОБАКА',     place: 'начало'  },
        { word: 'СОЛНЦЕ',     place: 'начало'  },
        { word: 'СИЛА',       place: 'начало'  },
        { word: 'СЕНО',       place: 'начало'  },
        { word: 'ОСА',        place: 'середина' },
        { word: 'КОСА',       place: 'середина' },
        { word: 'ЛОСЬ',       place: 'конец'   },
        { word: 'ЛЕС',        place: 'конец'   },
        { word: 'НОС',        place: 'конец'   },
        { word: 'РИС',        place: 'конец'   },
        { word: 'УС',         place: 'конец'   },
        { word: 'ВЕС',        place: 'конец'   },
        { word: 'ПЁС',        place: 'конец'   }
      ];
      const item = pick(wordsData);
      askSimple({
        render: () => `
          <div class="word-big">${item.word}</div>
          <p class="hint">Где слышится звук [с] или [с\u2019]?</p>
        `,
        options: ['начало', 'середина', 'конец'],
        correct: item.place
      });
    }
  },

  sHardSoft: {
    title: 'Твёрдый или мягкий?',
    emoji: '🔉',
    desc: '[с] или [с\u2019]',
    start() {
      const items = [
        { word: 'СЫН',   sound: 'твёрдый [с]' },
        { word: 'СОК',   sound: 'твёрдый [с]' },
        { word: 'САД',   sound: 'твёрдый [с]' },
        { word: 'СУП',   sound: 'твёрдый [с]' },
        { word: 'СОМ',   sound: 'твёрдый [с]' },
        { word: 'САНКИ', sound: 'твёрдый [с]' },
        { word: 'СИЛА',  sound: 'мягкий [с\u2019]' },
        { word: 'СЕНО',  sound: 'мягкий [с\u2019]' },
        { word: 'СЕЛО',  sound: 'мягкий [с\u2019]' },
        { word: 'СЕМЬ',  sound: 'мягкий [с\u2019]' },
        { word: 'СИНИЙ', sound: 'мягкий [с\u2019]' },
        { word: 'СЕТКА', sound: 'мягкий [с\u2019]' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div class="word-big">${item.word}</div>
          <p class="hint">Какой звук [с] в этом слове?</p>
        `,
        options: [
          { value: 'твёрдый [с]', label: 'Твёрдый' },
          { value: 'мягкий [с\u2019]', label: 'Мягкий' }
        ],
        correct: item.sound
      });
    }
  },

  sWordsWithS: {
    title: 'Слова с буквой С',
    emoji: '🔤',
    desc: 'Найди слово на букву С',
    start() {
      const withS = ['СЫН','СОК','САД','СУП','СОМ','САНКИ','СОБАКА','СОЛНЦЕ','СИЛА','СЕНО','САХАР','СОЛЬ','СТОЛ','СТУЛ','СНЕГ'];
      const withoutS = ['КОТ','ДОМ','МАМА','ПАПА','ЛУНА','РЫБА','НОГА','РУКА','ГОРА','ВОДА','МЯЧ','ДЫМ'];
      const correctWord = pick(withS.filter(w => w[0] === 'С'));
      const wrongs = shuffle(withoutS.filter(w => w[0] !== 'С')).slice(0, 3);
      const opts = shuffle([correctWord, ...wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:80px; text-align:center;">🔤</div>
          <p class="hint">Найди слово, которое начинается на букву <b>С</b></p>
        `,
        options: opts,
        correct: correctWord
      });
    }
  },

  // ---------- ЧТЕНИЕ ----------
  mergeSyllables: {
    title: 'Слияние слогов',
    emoji: '🔤',
    desc: 'Из букв — в слог',
    start() {
      const consonants = ['М','П','Б','Д','Т','Н','К','Л','Р','С','В','Г','З'];
      const vowels = ['А','О','У','Ы','И','Э'];
      const c = pick(consonants), v = pick(vowels);
      const correct = c + v;
      const opts = new Set([correct]);
      while (opts.size < 4) opts.add(pick(consonants) + pick(vowels));
      askSimple({
        render: () => `
          <div class="syllables-merge">
            <div class="letter">${c}</div>
            <div class="merge-arrow">+</div>
            <div class="letter vowel">${v}</div>
            <div class="merge-arrow">=</div>
            <div class="result-word">?</div>
          </div>
          <p class="hint">Какой слог получится?</p>
        `,
        options: [...opts],
        correct
      });
    }
  },

  buildWord: {
    title: 'Собери слово',
    emoji: '🧩',
    desc: 'Из слогов составь слово',
    start() {
      // Очередь без повторов
      if (!state._buildWordsQueue || state._buildWordsQueue.length === 0) {
        state._buildWordsQueue = shuffle(WORDS.filter(w => w.s === 2));
      }
      const word = state._buildWordsQueue.pop();

      const syl = splitIntoSyllables(word.w);
      const extra = ['МА','ПА','КА','ЗА','НА','РА','СА','ТА','ВА','ЛА','ДА','ГА','РО','ЛО','НО','КО','ВО','МУ','ХА','ЛИ','ЛУ','РЫ','ГО','ДУ','ЖИ','ШИ'];
      const wrong = shuffle(extra.filter(s => !syl.includes(s))).slice(0, 2);
      const pool = shuffle([...syl, ...wrong]);

      const gs = state.gameState;
      const area = document.getElementById('play-area');
      area.innerHTML = '';

      // Локальные переменные для этого слова
      let placed = [];
      let answered = false;

      // 1. Подсказка
      const hintEl = document.createElement('p');
      hintEl.className = 'hint';
      hintEl.style.fontSize = '18px';
      hintEl.style.color = '#4a90d9';
      hintEl.textContent = '💡 Подсказка: ' + word.pic;
      area.appendChild(hintEl);

      // 2. Ячейки
      const slotsDiv = document.createElement('div');
      slotsDiv.className = 'word-slots';
      area.appendChild(slotsDiv);

      const slotEls = [];
      syl.forEach(() => {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slotsDiv.appendChild(slot);
        slotEls.push(slot);
      });

      // 3. Подсказка про отмену
      const undoHint = document.createElement('p');
      undoHint.className = 'hint';
      undoHint.textContent = 'Нажми на слог в ячейке, чтобы вернуть обратно';
      area.appendChild(undoHint);

      // 4. Пул слогов
      const poolDiv = document.createElement('div');
      poolDiv.className = 'syllable-pool';
      area.appendChild(poolDiv);

      // 5. Кнопка
      const actionBtn = document.createElement('button');
      actionBtn.className = 'btn-next';
      actionBtn.textContent = 'Проверить';
      actionBtn.style.display = 'none';
      area.appendChild(actionBtn);

      function refreshSlots() {
        slotEls.forEach((slot, i) => {
          if (i < placed.length) {
            slot.textContent = placed[i].syl;
            slot.classList.add('filled');
            slot.onclick = () => undoPlaced(i);
          } else {
            slot.textContent = '';
            slot.classList.remove('filled');
            slot.classList.remove('correct-slot');
            slot.classList.remove('wrong-slot');
            slot.onclick = null;
          }
        });
        actionBtn.style.display =
          (placed.length === syl.length && !answered) ? 'inline-block' : 'none';
      }

      function placeSyl(chipEl, sylText) {
        if (answered) return;
        if (chipEl.disabled) return;
        if (placed.length >= syl.length) return;
        chipEl.disabled = true;
        placed.push({ syl: sylText, chipEl: chipEl });
        refreshSlots();
      }

      function undoPlaced(index) {
        if (answered) return;
        const item = placed[index];
        if (!item) return;
        item.chipEl.disabled = false;
        placed.splice(index, 1);
        refreshSlots();
      }

      // Чипы слогов
      pool.forEach(sylText => {
        const chip = document.createElement('button');
        chip.className = 'syllable-chip';
        chip.textContent = sylText;
        chip.onclick = () => placeSyl(chip, sylText);
        poolDiv.appendChild(chip);
      });

      // Кнопка "Проверить"
      actionBtn.onclick = () => {
        if (answered) return;
        if (placed.length !== syl.length) return;
        answered = true;
        gs.total++;

        const placedWord = placed.map(p => p.syl).join('');
        const correctWord = syl.join('');
        const isCorrect = placedWord === correctWord;

        poolDiv.querySelectorAll('button').forEach(b => b.disabled = true);
        actionBtn.disabled = true;

        if (isCorrect) {
          slotEls.forEach(s => s.classList.add('correct-slot'));
          gs.score++;
          playSound('correct');
        } else {
          slotEls.forEach(s => s.classList.add('wrong-slot'));
          playSound('wrong');
          setTimeout(() => {
            slotEls.forEach((s, i) => { s.textContent = syl[i]; });
          }, 600);
        }

        updateProgress();

        // Меняем кнопку на "Дальше →"
        actionBtn.textContent = 'Дальше →';
        actionBtn.disabled = false;
        actionBtn.style.display = 'inline-block';

        actionBtn.onclick = () => {
          if (gs.total >= TOTAL_QUESTIONS) return endGame();
          GAMES.buildWord.start();
        };
      };
    }
  },

  pictureMatch: {
    title: 'Найди картинку',
    emoji: '🖼️',
    desc: 'Подбери рисунок к слову',
    start() {
      const item = pick(PICTURE_WORDS);
      const opts = shuffle(item.options);
      const area = document.getElementById('play-area');
      area.innerHTML = `
        <div class="word-display">${item.word}</div>
        <p class="hint">Выбери подходящую картинку</p>
        <div class="picture-grid" id="pic-grid"></div>
      `;
      const grid = document.getElementById('pic-grid');
      const gs = state.gameState;
      gs.locked = false;
      opts.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'picture-card';
        card.textContent = emoji;
        card.onclick = () => {
          if (gs.locked) return;
          gs.locked = true;
          gs.total++;
          grid.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'none');
          if (emoji === item.correct) {
            card.classList.add('correct'); gs.score++; playSound('correct');
          } else {
            card.classList.add('wrong');
            grid.querySelectorAll('.picture-card').forEach(c => {
              if (c.textContent === item.correct) c.classList.add('correct');
            });
            playSound('wrong');
          }
          updateProgress();
          setTimeout(() => {
            if (gs.total >= TOTAL_QUESTIONS) return endGame();
            GAMES.pictureMatch.start();
          }, 1300);
        };
        grid.appendChild(card);
      });
    }
  },

  sentencePicture: {
    title: 'Предложение по картинке',
    emoji: '📝',
    desc: 'Составь предложение',
    start() {
      const item = pick(SENTENCES_PICTURES);
      const gs = state.gameState;
      gs.locked = false;
      const area = document.getElementById('play-area');
      area.innerHTML = `
        <div class="task-picture">${item.pic}</div>
        <p class="hint">Выбери правильное предложение</p>
      `;
      const answers = document.createElement('div');
      answers.className = 'answers';
      const wrongs = generateWrongSentences(item);
      const opts = shuffle([item.correct, ...wrongs]);
      opts.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.style.fontSize = '15px';
        btn.style.padding = '16px';
        btn.textContent = text;
        btn.onclick = () => {
          if (gs.locked) return;
          gs.locked = true;
          gs.total++;
          answers.querySelectorAll('button').forEach(b => b.disabled = true);
          if (text === item.correct) {
            btn.classList.add('correct'); gs.score++; playSound('correct');
          } else {
            btn.classList.add('wrong');
            answers.querySelectorAll('button').forEach(b => {
              if (b.textContent === item.correct) b.classList.add('correct');
            });
            playSound('wrong');
          }
          updateProgress();
          setTimeout(() => {
            if (gs.total >= TOTAL_QUESTIONS) return endGame();
            GAMES.sentencePicture.start();
          }, 1300);
        };
        answers.appendChild(btn);
      });
      area.appendChild(answers);
    }
  },

  wordReading: {
    title: 'Прочитай слово',
    emoji: '📖',
    desc: 'Найди такое же слово',
    start() {
      const word = pick(WORDS).w;
      const letters = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЫЭЮЯ';
      const opts = new Set([word]);
      while (opts.size < 4) {
        let w = '';
        for (let i = 0; i < word.length; i++) w += pick(letters.split(''));
        opts.add(w);
      }
      askSimple({
        render: () => `
          <div class="word-display">${word}</div>
          <p class="hint">Найди такое же слово</p>
        `,
        options: [...opts],
        correct: word
      });
    }
  },

  // ---------- МАТЕМАТИКА ----------
  mathCards: {
    title: 'Карточки с примерами',
    emoji: '🃏',
    desc: 'Реши пример на карточке',
    start() {
      const cls = state.classNum;
      let max, allowMul = false, allowDiv = false;

      if (cls === 1) {
        max = 5;
      } else if (cls === 2) {
        max = Math.random() < 0.5 ? 10 : 20;
      } else if (cls === 3) {
        max = 100;
        allowMul = true;
      } else if (cls === 4) {
        max = 1000;
        allowMul = true;
        allowDiv = true;
      }

      const types = ['add', 'sub'];
      if (allowMul) types.push('mul');
      if (allowDiv) types.push('div');
      const type = pick(types);

      let a, b, correct, symbol;

      if (type === 'add') {
        a = randInt(1, max - 1);
        b = randInt(1, max - a);
        correct = a + b;
        symbol = '+';
      } else if (type === 'sub') {
        a = randInt(2, max);
        b = randInt(1, a - 1);
        correct = a - b;
        symbol = '−';
      } else if (type === 'mul') {
        const multMax = cls === 3 ? 10 : 12;
        a = randInt(2, multMax);
        b = randInt(2, multMax);
        correct = a * b;
        symbol = '×';
      } else {
        const divMax = cls === 3 ? 10 : 12;
        b = randInt(2, divMax);
        correct = randInt(2, divMax);
        a = b * correct;
        symbol = '÷';
      }

      const opts = new Set([correct]);
      let attempts = 0;
      while (opts.size < 4 && attempts < 100) {
        let wrong;
        if (type === 'mul' || type === 'div') {
          wrong = correct + randInt(-5, 5);
          if (wrong === correct) wrong += 1;
        } else {
          wrong = correct + randInt(-3, 3);
        }
        if (wrong >= 0 && wrong !== correct) opts.add(wrong);
        attempts++;
      }
      while (opts.size < 4) opts.add(correct + opts.size);

      askSimple({
        render: () => `
          <div class="math-card">
            <div class="math-card-badge">Пример</div>
            <div class="math-card-body">
              <span class="math-num">${a}</span>
              <span class="math-op">${symbol}</span>
              <span class="math-num">${b}</span>
              <span class="math-op">=</span>
              <span class="math-answer-box">?</span>
            </div>
            <p class="hint">Сколько получится?</p>
          </div>
        `,
        options: [...opts],
        correct
      });
    }
  },

  numberNeighbors: {
    title: 'Соседи числа',
    emoji: '🏘️',
    desc: 'Кто стоит рядом',
    start() {
      const n = randInt(2, 9);
      askSimple({
        render: () => `
          <div class="number-line">
            <div class="num-box empty">?</div>
            <div class="num-box">${n}</div>
            <div class="num-box empty">?</div>
          </div>
          <p class="hint">Назови соседей числа ${n}</p>
        `,
        options: [
          `${n-1} и ${n+1}`,
          `${n-2} и ${n+2}`,
          `${n-1} и ${n+3}`,
          `${n+1} и ${n+2}`
        ],
        correct: `${n-1} и ${n+1}`
      });
    }
  },

  prevNext: {
    title: 'Предыдущее и следующее',
    emoji: '⏭️',
    desc: 'Что до и после',
    start() {
      const n = randInt(2, 9);
      const mode = Math.random() < 0.5 ? 'prev' : 'next';
      if (mode === 'prev') {
        askSimple({
          render: () => `
            <div class="number-line">
              <div class="num-box empty">?</div>
              <div class="num-box">${n}</div>
            </div>
            <p class="hint">Какое число стоит перед ${n}?</p>
          `,
          options: [n-1, n+1, n-2, n+2].filter(x => x >= 1),
          correct: n-1
        });
      } else {
        askSimple({
          render: () => `
            <div class="number-line">
              <div class="num-box">${n}</div>
              <div class="num-box empty">?</div>
            </div>
            <p class="hint">Какое число стоит после ${n}?</p>
          `,
          options: [n-1, n+1, n-2, n+2].filter(x => x >= 1),
          correct: n+1
        });
      }
    }
  },

  numberComposition: {
    title: 'Состав числа',
    emoji: '🎯',
    desc: 'Собери число из двух',
    start() {
      const total = randInt(3, 9);
      const part = randInt(1, total - 1);
      const correct = total - part;
      const opts = new Set([correct]);
      while (opts.size < 4) {
        const x = randInt(1, total - 1);
        opts.add(x);
      }
      askSimple({
        render: () => `
          <div class="house">
            <div class="house-roof">🏠 Домик числа</div>
            <div class="house-number">${total}</div>
            <div class="house-floors">
              <div class="house-floor">
                <div class="num-box">${part}</div>
                <div>+</div>
                <div class="num-box empty">?</div>
              </div>
            </div>
          </div>
          <p class="hint">Сколько нужно добавить к ${part}, чтобы получить ${total}?</p>
        `,
        options: [...opts],
        correct
      });
    }
  },

  addUpTo5:   { title: 'Сложение до 5',  emoji: '➕', desc: 'Реши пример', start() { arithmetic(5, 'add'); } },
  subUpTo5:   { title: 'Вычитание до 5', emoji: '➖', desc: 'Реши пример', start() { arithmetic(5, 'sub'); } },
  addUpTo10:  { title: 'Сложение до 10', emoji: '🔟', desc: 'Реши пример', start() { arithmetic(10, 'add'); } },
  subUpTo10:  { title: 'Вычитание до 10',emoji: '🔟', desc: 'Реши пример', start() { arithmetic(10, 'sub'); } },
  addUpTo100: { title: 'Сложение до 100',emoji: '➕', desc: 'Реши пример', start() { arithmetic(100, 'add'); } },
  subUpTo100: { title: 'Вычитание до 100',emoji: '➖', desc: 'Реши пример', start() { arithmetic(100, 'sub'); } },

  lines: {
    title: 'Линии',
    emoji: '📐',
    desc: 'Прямая, кривая, луч, отрезок',
    start() {
      const items = [
        { id: 'line', name: 'Прямая', svg: '<line x1="20" y1="90" x2="160" y2="90" stroke="#4a90d9" stroke-width="6"/>' },
        { id: 'ray', name: 'Луч', svg: '<line x1="20" y1="90" x2="160" y2="90" stroke="#4a90d9" stroke-width="6"/><circle cx="20" cy="90" r="8" fill="#ff9ec4"/>' },
        { id: 'segment', name: 'Отрезок', svg: '<line x1="30" y1="90" x2="150" y2="90" stroke="#4a90d9" stroke-width="6"/><circle cx="30" cy="90" r="8" fill="#ff9ec4"/><circle cx="150" cy="90" r="8" fill="#ff9ec4"/>' },
        { id: 'curve', name: 'Кривая', svg: '<path d="M 20 90 Q 60 20 90 90 T 160 90" fill="none" stroke="#4a90d9" stroke-width="6"/>' },
        { id: 'broken', name: 'Ломаная', svg: '<polyline points="20,120 60,50 100,110 140,40 170,90" fill="none" stroke="#4a90d9" stroke-width="6"/>' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div class="shape-display">
            <svg class="shape-svg" viewBox="0 0 180 180">${item.svg}</svg>
          </div>
          <p class="hint">Что это за линия?</p>
        `,
        options: items.map(i => i.name),
        correct: item.name
      });
    }
  },

  shapes: {
    title: 'Геометрические фигуры',
    emoji: '🔺',
    desc: 'Узнай фигуру',
    start() {
      const items = [
        { name: 'Круг', svg: '<circle cx="90" cy="90" r="70" fill="#b8dcfa" stroke="#4a90d9" stroke-width="5"/>' },
        { name: 'Квадрат', svg: '<rect x="25" y="25" width="130" height="130" fill="#ffc9dd" stroke="#d1748e" stroke-width="5"/>' },
        { name: 'Треугольник', svg: '<polygon points="90,20 165,155 15,155" fill="#c6ead0" stroke="#4b9660" stroke-width="5"/>' },
        { name: 'Прямоугольник', svg: '<rect x="20" y="50" width="140" height="90" fill="#ffe2a8" stroke="#c99b1a" stroke-width="5"/>' },
        { name: 'Овал', svg: '<ellipse cx="90" cy="90" rx="80" ry="55" fill="#f0e5fb" stroke="#9270d1" stroke-width="5"/>' },
        { name: 'Ромб', svg: '<polygon points="90,20 160,90 90,160 20,90" fill="#ffd6da" stroke="#d1748e" stroke-width="5"/>' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div class="shape-display">
            <svg class="shape-svg" viewBox="0 0 180 180">${item.svg}</svg>
          </div>
          <p class="hint">Что это за фигура?</p>
        `,
        options: items.map(i => i.name),
        correct: item.name
      });
    }
  },

  taskPicture: {
    title: 'Задача по картинке',
    emoji: '🍎',
    desc: 'Реши задачку',
    start() {
      const tasks = [
        { pic: '🍎🍎🍎 ➕ 🍎🍎', q: 'Сколько яблок стало?', a: 5 },
        { pic: '🐟🐟🐟🐟 ➖ 🐟', q: 'Сколько рыбок осталось?', a: 3 },
        { pic: '🌷🌷 ➕ 🌷🌷🌷', q: 'Сколько цветов стало?', a: 5 },
        { pic: '🐦🐦🐦🐦🐦 ➖ 🐦🐦', q: 'Сколько птиц осталось?', a: 3 },
        { pic: '⭐ ➕ ⭐⭐⭐', q: 'Сколько звёзд стало?', a: 4 },
        { pic: '🍬🍬🍬🍬 ➖ 🍬🍬', q: 'Сколько конфет осталось?', a: 2 },
        { pic: '🐰🐰🐰 ➕ 🐰🐰🐰🐰', q: 'Сколько зайцев стало?', a: 7 }
      ];
      const t = pick(tasks);
      const opts = new Set([t.a]);
      while (opts.size < 4) {
        const x = randInt(1, 10);
        if (x !== t.a) opts.add(x);
      }
      askSimple({
        render: () => `
          <div class="task-picture">${t.pic}</div>
          <p class="task-question">${t.q}</p>
        `,
        options: [...opts],
        correct: t.a
      });
    }
  },

  // ---------- ОКРУЖАЮЩИЙ МИР ----------
  animalsHome: {
    title: 'Домашние и дикие',
    emoji: '🐾',
    desc: 'Раздели животных',
    start() {
      const items = [
        { emoji: '🐶', name: 'собака', type: 'Домашнее' },
        { emoji: '🐱', name: 'кошка', type: 'Домашнее' },
        { emoji: '🐮', name: 'корова', type: 'Домашнее' },
        { emoji: '🐷', name: 'свинья', type: 'Домашнее' },
        { emoji: '🐔', name: 'курица', type: 'Домашнее' },
        { emoji: '🐴', name: 'лошадь', type: 'Домашнее' },
        { emoji: '🐑', name: 'овца', type: 'Домашнее' },
        { emoji: '🐰', name: 'кролик', type: 'Домашнее' },
        { emoji: '🐺', name: 'волк', type: 'Дикое' },
        { emoji: '🦊', name: 'лиса', type: 'Дикое' },
        { emoji: '🐻', name: 'медведь', type: 'Дикое' },
        { emoji: '🦁', name: 'лев', type: 'Дикое' },
        { emoji: '🐯', name: 'тигр', type: 'Дикое' },
        { emoji: '🐘', name: 'слон', type: 'Дикое' },
        { emoji: '🦌', name: 'олень', type: 'Дикое' },
        { emoji: '🐗', name: 'кабан', type: 'Дикое' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">Это ${item.name}. Какое это животное?</p>
        `,
        options: [
          { value: 'Домашнее', label: 'Домашнее' },
          { value: 'Дикое', label: 'Дикое' }
        ],
        correct: item.type
      });
    }
  },

  seasons: {
    title: 'Времена года',
    emoji: '🌱',
    desc: 'Когда это бывает',
    start() {
      const items = [
        { name: 'Зима',  emoji: '❄️', hints: ['Снег', 'Мороз', 'Санки'] },
        { name: 'Весна', emoji: '🌸', hints: ['Капель', 'Подснежники', 'Ручьи'] },
        { name: 'Лето',  emoji: '☀️', hints: ['Жара', 'Купание', 'Ягоды'] },
        { name: 'Осень', emoji: '🍁', hints: ['Листопад', 'Дожди', 'Урожай'] }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">${item.emoji}</div>
          <p class="hint">Когда бывает: ${item.hints.join(', ')}?</p>
        `,
        options: items.map(i => i.name),
        correct: item.name
      });
    }
  },

  whereGrows: {
    title: 'Что где растёт',
    emoji: '🍎',
    desc: 'Овощ, фрукт или ягода',
    start() {
      const items = [
        { emoji: '🥕', name: 'морковь', type: 'Овощ' },
        { emoji: '🥒', name: 'огурец', type: 'Овощ' },
        { emoji: '🍅', name: 'помидор', type: 'Овощ' },
        { emoji: '🥔', name: 'картофель', type: 'Овощ' },
        { emoji: '🍎', name: 'яблоко', type: 'Фрукт' },
        { emoji: '🍐', name: 'груша', type: 'Фрукт' },
        { emoji: '🍌', name: 'банан', type: 'Фрукт' },
        { emoji: '🍊', name: 'апельсин', type: 'Фрукт' },
        { emoji: '🍓', name: 'земляника', type: 'Ягода' },
        { emoji: '🍒', name: 'вишня', type: 'Ягода' },
        { emoji: '🍇', name: 'виноград', type: 'Ягода' },
        { emoji: '🫐', name: 'голубика', type: 'Ягода' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">${item.name[0].toUpperCase() + item.name.slice(1)} — это...</p>
        `,
        options: ['Овощ', 'Фрукт', 'Ягода'],
        correct: item.type
      });
    }
  },

  safetyRules: {
    title: 'Правила безопасности',
    emoji: '🚦',
    desc: 'Как поступать правильно',
    start() {
      const items = [
        { q: 'Можно ли играть со спичками?', correct: 'Нет, это опасно', wrongs: ['Да, это весело','Только со взрослыми можно играть','Да, если осторожно'] },
        { q: 'Что делать, если незнакомец зовёт с собой?', correct: 'Не идти и рассказать взрослым', wrongs: ['Пойти с ним','Спросить, куда идём','Позвать друга с собой'] },
        { q: 'Как переходить дорогу?', correct: 'На зелёный свет по переходу', wrongs: ['На красный, если нет машин','В любом месте','Бегом'] },
        { q: 'Можно ли трогать розетку?', correct: 'Нет, никогда', wrongs: ['Да, если сухие руки','Да, если выключить свет','Только пальцем'] },
        { q: 'Что делать при пожаре?', correct: 'Звонить 101 и выходить на улицу', wrongs: ['Спрятаться под кровать','Открыть окна','Продолжать играть'] },
        { q: 'Можно ли есть немытые фрукты?', correct: 'Нет, надо помыть', wrongs: ['Да, они вкусные','Да, если с дерева','Да, если обтереть'] }
      ];
      const item = pick(items);
      const opts = shuffle([item.correct, ...item.wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:70px; text-align:center;">🚦</div>
          <p class="task-question">${item.q}</p>
        `,
        options: opts,
        correct: item.correct
      });
    }
  },

  livingNonliving: {
    title: 'Живое и неживое',
    emoji: '🌍',
    desc: 'Отличи признаки',
    start() {
      const items = [
        { emoji: '🐱', name: 'кошка', type: 'Живое' },
        { emoji: '🌳', name: 'дерево', type: 'Живое' },
        { emoji: '🍄', name: 'гриб', type: 'Живое' },
        { emoji: '🐦', name: 'птица', type: 'Живое' },
        { emoji: '🐟', name: 'рыба', type: 'Живое' },
        { emoji: '🌻', name: 'цветок', type: 'Живое' },
        { emoji: '🪨', name: 'камень', type: 'Неживое' },
        { emoji: '☁️', name: 'облако', type: 'Неживое' },
        { emoji: '🌊', name: 'вода', type: 'Неживое' },
        { emoji: '⛰️', name: 'гора', type: 'Неживое' },
        { emoji: '☀️', name: 'солнце', type: 'Неживое' },
        { emoji: '🌙', name: 'луна', type: 'Неживое' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">${item.name[0].toUpperCase() + item.name.slice(1)} — это...</p>
        `,
        options: ['Живое', 'Неживое'],
        correct: item.type
      });
    }
  },

  space: {
    title: 'Планеты и космос',
    emoji: '🪐',
    desc: 'Что мы знаем о космосе',
    start() {
      const items = [
        { q: 'На какой планете мы живём?', correct: 'Земля', wrongs: ['Марс','Луна','Солнце'] },
        { q: 'Что светит днём на небе?', correct: 'Солнце', wrongs: ['Луна','Звезда','Лампа'] },
        { q: 'Что видно ночью на небе?', correct: 'Луна и звёзды', wrongs: ['Солнце','Радуга','Облака'] },
        { q: 'Как называют людей, летающих в космос?', correct: 'Космонавты', wrongs: ['Пилоты','Моряки','Учёные'] },
        { q: 'Сколько планет в Солнечной системе?', correct: '8', wrongs: ['5','10','3'] },
        { q: 'Какая планета красного цвета?', correct: 'Марс', wrongs: ['Земля','Венера','Юпитер'] },
        { q: 'Что больше: Солнце или Земля?', correct: 'Солнце', wrongs: ['Земля','Они одинаковые','Луна'] }
      ];
      const item = pick(items);
      const opts = shuffle([item.correct, ...item.wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">🪐</div>
          <p class="task-question">${item.q}</p>
        `,
        options: opts,
        correct: item.correct
      });
    }
  },

  naturePhenomena: {
    title: 'Явления природы',
    emoji: '🌦️',
    desc: 'Дождь, снег, радуга',
    start() {
      const items = [
        { emoji: '🌧️', name: 'Дождь' },
        { emoji: '❄️', name: 'Снег' },
        { emoji: '⛈️', name: 'Гроза' },
        { emoji: '🌈', name: 'Радуга' },
        { emoji: '🌪️', name: 'Смерч' },
        { emoji: '🌫️', name: 'Туман' },
        { emoji: '☀️', name: 'Солнечно' },
        { emoji: '☁️', name: 'Облачно' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">Что это за явление?</p>
        `,
        options: items.map(i => i.name),
        correct: item.name
      });
    }
  },

  cityVillage: {
    title: 'Город и деревня',
    emoji: '🏙️',
    desc: 'Найди отличия',
    start() {
      const items = [
        { emoji: '🏢', name: 'многоэтажный дом', place: 'Город' },
        { emoji: '🚇', name: 'метро', place: 'Город' },
        { emoji: '🏭', name: 'завод', place: 'Город' },
        { emoji: '🚦', name: 'светофор', place: 'Город' },
        { emoji: '🏬', name: 'торговый центр', place: 'Город' },
        { emoji: '🐔', name: 'курятник', place: 'Деревня' },
        { emoji: '🌾', name: 'поле пшеницы', place: 'Деревня' },
        { emoji: '🐄', name: 'пасущаяся корова', place: 'Деревня' },
        { emoji: '🏡', name: 'небольшой домик', place: 'Деревня' },
        { emoji: '🚜', name: 'трактор', place: 'Деревня' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">${item.name[0].toUpperCase() + item.name.slice(1)} — где это можно увидеть?</p>
        `,
        options: ['Город', 'Деревня'],
        correct: item.place
      });
    }
  },

  natureKingdoms: {
    title: 'Царства природы',
    emoji: '🌿',
    desc: 'Растения, животные, грибы',
    start() {
      const items = [
        { emoji: '🌻', name: 'подсолнух', type: 'Растения' },
        { emoji: '🌳', name: 'дуб', type: 'Растения' },
        { emoji: '🌿', name: 'папоротник', type: 'Растения' },
        { emoji: '🐻', name: 'медведь', type: 'Животные' },
        { emoji: '🐦', name: 'воробей', type: 'Животные' },
        { emoji: '🐝', name: 'пчела', type: 'Животные' },
        { emoji: '🍄', name: 'подберёзовик', type: 'Грибы' },
        { emoji: '🍄', name: 'лисичка', type: 'Грибы' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">${item.name[0].toUpperCase() + item.name.slice(1)} — это царство...</p>
        `,
        options: ['Растения', 'Животные', 'Грибы'],
        correct: item.type
      });
    }
  },

  waterCycle: {
    title: 'Круговорот воды',
    emoji: '💧',
    desc: 'Как путешествует вода',
    start() {
      const items = [
        { q: 'Что происходит с водой при нагревании?', correct: 'Испаряется', wrongs: ['Замерзает','Исчезает навсегда','Превращается в снег'] },
        { q: 'Что образуется из пара в небе?', correct: 'Облака', wrongs: ['Снег','Солнце','Ветер'] },
        { q: 'Что падает из облаков?', correct: 'Дождь и снег', wrongs: ['Песок','Листья','Камни'] },
        { q: 'Куда попадает дождевая вода?', correct: 'В реки, моря, землю', wrongs: ['В космос','В облака','В Солнце'] },
        { q: 'Как называется движение воды по кругу в природе?', correct: 'Круговорот воды', wrongs: ['Таяние','Испарение','Листопад'] },
        { q: 'При какой температуре вода замерзает?', correct: '0°C', wrongs: ['+10°C','+100°C','-50°C'] }
      ];
      const item = pick(items);
      const opts = shuffle([item.correct, ...item.wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">💧</div>
          <p class="task-question">${item.q}</p>
        `,
        options: opts,
        correct: item.correct
      });
    }
  },

  cardinalDirections: {
    title: 'Стороны света',
    emoji: '🧭',
    desc: 'Север, юг, запад, восток',
    start() {
      const items = [
        { q: 'Куда указывает красная стрелка компаса?', correct: 'Север', wrongs: ['Юг','Запад','Восток'] },
        { q: 'Где встаёт солнце?', correct: 'На востоке', wrongs: ['На западе','На севере','На юге'] },
        { q: 'Где садится солнце?', correct: 'На западе', wrongs: ['На востоке','На севере','На юге'] },
        { q: 'Сколько основных сторон света?', correct: '4', wrongs: ['2','3','6'] },
        { q: 'Как называется прибор для определения сторон света?', correct: 'Компас', wrongs: ['Термометр','Часы','Линейка'] }
      ];
      const item = pick(items);
      const opts = shuffle([item.correct, ...item.wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">🧭</div>
          <p class="task-question">${item.q}</p>
        `,
        options: opts,
        correct: item.correct
      });
    }
  },

  humanBody: {
    title: 'Организм человека',
    emoji: '🫀',
    desc: 'Органы и их работа',
    start() {
      const items = [
        { emoji: '🧠', name: 'мозг', role: 'Думает и управляет телом' },
        { emoji: '❤️', name: 'сердце', role: 'Качает кровь' },
        { emoji: '🫁', name: 'лёгкие', role: 'Помогают дышать' },
        { emoji: '🦴', name: 'скелет', role: 'Опора тела' },
        { emoji: '💪', name: 'мышцы', role: 'Помогают двигаться' },
        { emoji: '👁️', name: 'глаза', role: 'Помогают видеть' },
        { emoji: '👂', name: 'уши', role: 'Помогают слышать' },
        { emoji: '👃', name: 'нос', role: 'Помогает чувствовать запахи' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">Какую работу выполняет ${item.name}?</p>
        `,
        options: items.map(i => i.role),
        correct: item.role
      });
    }
  },

  natureZones: {
    title: 'Природные зоны',
    emoji: '🌏',
    desc: 'Тундра, тайга, пустыня',
    start() {
      const items = [
        { emoji: '❄️', name: 'Тундра', hint: 'Холодно, мхи и лишайники, олени' },
        { emoji: '🌲', name: 'Тайга', hint: 'Хвойные леса, медведи, волки' },
        { emoji: '🌳', name: 'Смешанный лес', hint: 'Ели, берёзы, много животных' },
        { emoji: '🌾', name: 'Степь', hint: 'Травы, нет деревьев, суслики' },
        { emoji: '🏜️', name: 'Пустыня', hint: 'Жарко, песок, верблюды' },
        { emoji: '🌴', name: 'Тропики', hint: 'Жарко и влажно, много растений' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">${item.emoji}</div>
          <p class="hint">${item.hint}. Какая это природная зона?</p>
        `,
        options: items.map(i => i.name),
        correct: item.name
      });
    }
  },

  continents: {
    title: 'Материки и океаны',
    emoji: '🗺️',
    desc: 'Где что находится',
    start() {
      const items = [
        { q: 'Сколько материков на Земле?', correct: '6', wrongs: ['4','5','7'] },
        { q: 'Сколько океанов на Земле?', correct: '4', wrongs: ['3','5','6'] },
        { q: 'Самый большой материк?', correct: 'Евразия', wrongs: ['Африка','Австралия','Антарктида'] },
        { q: 'Самый маленький материк?', correct: 'Австралия', wrongs: ['Евразия','Африка','Антарктида'] },
        { q: 'На каком материке живут пингвины?', correct: 'Антарктида', wrongs: ['Африка','Евразия','Австралия'] },
        { q: 'Самый жаркий материк?', correct: 'Африка', wrongs: ['Евразия','Северная Америка','Австралия'] },
        { q: 'Самый большой океан?', correct: 'Тихий', wrongs: ['Атлантический','Индийский','Северный Ледовитый'] }
      ];
      const item = pick(items);
      const opts = shuffle([item.correct, ...item.wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">🗺️</div>
          <p class="task-question">${item.q}</p>
        `,
        options: opts,
        correct: item.correct
      });
    }
  },

  minerals: {
    title: 'Полезные ископаемые',
    emoji: '⚖️',
    desc: 'Что добывают из земли',
    start() {
      const items = [
        { emoji: '⛽', name: 'нефть', use: 'Топливо для машин' },
        { emoji: '🔥', name: 'газ', use: 'Топливо для плиты' },
        { emoji: '⚫', name: 'уголь', use: 'Топливо для заводов' },
        { emoji: '🪨', name: 'гранит', use: 'Строительство' },
        { emoji: '💎', name: 'алмаз', use: 'Украшения' },
        { emoji: '🏅', name: 'золото', use: 'Украшения, монеты' },
        { emoji: '🔨', name: 'железная руда', use: 'Изготовление металла' },
        { emoji: '🧂', name: 'соль', use: 'Еда и консервы' }
      ];
      const item = pick(items);
      askSimple({
        render: () => `
          <div style="font-size:120px; text-align:center;">${item.emoji}</div>
          <p class="hint">Для чего используют ${item.name}?</p>
        `,
        options: items.map(i => i.use),
        correct: item.use
      });
    }
  },

  ecology: {
    title: 'Экология',
    emoji: '🌳',
    desc: 'Как беречь природу',
    start() {
      const items = [
        { q: 'Куда выбрасывать мусор?', correct: 'В урну или контейнер', wrongs: ['На землю','В воду','В лесу под куст'] },
        { q: 'Что делать с батарейками?', correct: 'Сдать в специальный пункт', wrongs: ['Выбросить в мусор','Зарыть в землю','Сжечь'] },
        { q: 'Как экономить воду?', correct: 'Закрывать кран', wrongs: ['Оставлять открытым','Поливать всех прохожих','Пить меньше'] },
        { q: 'Что делать с бумагой, чтобы сберечь деревья?', correct: 'Сдавать в макулатуру', wrongs: ['Сжигать','Выбрасывать','Рвать на праздник'] },
        { q: 'Можно ли ломать ветки деревьев в лесу?', correct: 'Нет', wrongs: ['Да, для костра','Да, если не жалко','Да, но немного'] },
        { q: 'Что делать с редкими животными?', correct: 'Охранять', wrongs: ['Ловить','Продавать','Кормить конфетами'] }
      ];
      const item = pick(items);
      const opts = shuffle([item.correct, ...item.wrongs]);
      askSimple({
        render: () => `
          <div style="font-size:100px; text-align:center;">🌳</div>
          <p class="task-question">${item.q}</p>
        `,
        options: opts,
        correct: item.correct
      });
    }
  }
};

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function arithmetic(max, type) {
  let a, b, correct;
  if (type === 'add') {
    a = randInt(1, max - 1);
    b = randInt(1, max - a);
    correct = a + b;
  } else {
    a = randInt(2, max);
    b = randInt(1, a - 1);
    correct = a - b;
  }
  const symbol = type === 'add' ? '+' : '−';
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const x = randInt(0, max);
    if (x !== correct) opts.add(x);
  }
  askSimple({
    render: () => `
      <div class="math-expression">
        <span>${a}</span>
        <span>${symbol}</span>
        <span>${b}</span>
        <span>=</span>
        <span class="box">?</span>
      </div>
      <p class="hint">Сколько получится?</p>
    `,
    options: [...opts],
    correct
  });
}

function splitIntoSyllables(word) {
  const parts = [];
  for (let i = 0; i < word.length; i += 2) parts.push(word.slice(i, i + 2));
  return parts;
}

function generateWrongSentences(item) {
  const words = item.correct.split(' ');
  const wrongs = new Set();
  let attempts = 0;
  while (wrongs.size < 2 && attempts < 50) {
    const shuffled = shuffle(words).join(' ');
    if (shuffled !== item.correct) wrongs.add(shuffled);
    attempts++;
  }
  while (wrongs.size < 2) wrongs.add(shuffle(words).join(' ') + '.');
  return [...wrongs];
}
