/**
 * Cheers! — Prague Restaurant & Café Finder
 * Vanilla JS, no dependencies.
 */

// ── Quiz definition ────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'occasion',
    question: 'What are you looking for?',
    options: [
      { label: 'Laptop-friendly cafe',  value: 'cafe'      },
      { label: 'Breakfast',             value: 'breakfast'  },
      { label: 'Lunch',                 value: 'lunch'      },
      { label: 'Dinner',                value: 'dinner'     },
    ],
  },
  {
    id: 'budget',
    question: "What's your vibe?",
    options: [
      { label: 'Budget-friendly',     value: 'budget' },
      { label: 'Casual mid-range',    value: 'mid'    },
      { label: 'Can be fancy',        value: 'fancy'  },
    ],
  },
  {
    id: 'area',
    question: 'Any preference for the area?',
    options: [
      { label: 'Prague 1 & Old Town',       value: 'old-town'          },
      { label: 'Karlín',                    value: 'karlin'            },
      { label: 'Holešovice & Letná',        value: 'holesovice-letna'  },
      { label: 'Vinohrady & Žižkov',        value: 'vinohrady-zizkov'  },
      { label: 'No preference',             value: 'any'               },
    ],
  },
];

// ── Display helpers ────────────────────────────────────────────────────────

const PRICE_DISPLAY = { budget: '€', mid: '€€', fancy: '€€€' };

const NEIGHBOURHOOD_DISPLAY = {
  'old-town':          'Old Town',
  'karlin':            'Karlín',
  'holesovice-letna':  'Holešovice & Letná',
  'vinohrady-zizkov':  'Vinohrady & Žižkov',
};

const TAG_LABELS = {
  'laptop-friendly': 'Laptop-friendly',
  'cowork':          'Good for work',
  'wifi':            'WiFi',
  'breakfast':       'Breakfast',
  'brunch':          'Brunch',
  'lunch':           'Lunch',
  'dinner':          'Dinner',
  'coffee':          'Coffee',
  'specialty':       'Specialty coffee',
  'czech':           'Czech cuisine',
  'italian':         'Italian',
  'mexican':         'Mexican',
  'natural-wine':    'Natural wine',
  'terrace':         'Terrace',
  'historic':        'Historic',
  'grand':           'Grand café',
  'casual':          'Casual',
  'tasting-menu':    'Tasting menu',
  'pub':             'Pub',
  'vegetarian':      'Veggie-friendly',
  'vegan':           'Vegan options',
};

// ── State ──────────────────────────────────────────────────────────────────

let places = [];
let currentStep = 0;
const answers = {}; // { occasion, budget, area }

// ── DOM refs ───────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

const screens = {
  start:  $('screen-start'),
  quiz:   $('screen-quiz'),
  result: $('screen-result'),
  error:  $('screen-error'),
};

// ── Screen transitions ────────────────────────────────────────────────────

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (key === name) {
      el.classList.remove('screen--exit');
      el.classList.add('screen--active');
    } else if (el.classList.contains('screen--active')) {
      el.classList.add('screen--exit');
      el.classList.remove('screen--active');
      // Clean up exit class after transition
      el.addEventListener('transitionend', () => el.classList.remove('screen--exit'), { once: true });
    }
  });
}

// ── Progress indicator ─────────────────────────────────────────────────────

function updateProgress(step) {
  $('progress-label').textContent = `${step + 1} / ${STEPS.length}`;
  document.querySelectorAll('.progress__dot').forEach((dot, i) => {
    dot.classList.toggle('progress__dot--done', i < step);
    dot.classList.toggle('progress__dot--active', i === step);
  });
}

// ── Quiz rendering ─────────────────────────────────────────────────────────

function renderStep(step) {
  const { question, options } = STEPS[step];
  $('quiz-question').textContent = question;

  const list = $('quiz-options');
  list.innerHTML = '';

  options.forEach(({ label, value }) => {
    const li = document.createElement('li');
    li.className = 'quiz__option';
    li.setAttribute('role', 'listitem');

    const btn = document.createElement('button');
    btn.className = 'quiz__option-btn';
    btn.textContent = label;
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', () => handleAnswer(step, value));

    li.appendChild(btn);
    list.appendChild(li);
  });

  updateProgress(step);
}

function handleAnswer(step, value) {
  answers[STEPS[step].id] = value;

  if (step < STEPS.length - 1) {
    currentStep = step + 1;
    renderStep(currentStep);
  } else {
    const result = findMatch();
    renderResult(result);
    showScreen('result');
  }
}

// ── Matching logic ─────────────────────────────────────────────────────────

function matchesOccasion(place, occasion) {
  if (occasion === 'cafe') return place.laptopFriendly === true;
  return Array.isArray(place.mealTypes) && place.mealTypes.includes(occasion);
}

function matchesBudget(place, budget) {
  return place.priceRange === budget;
}

function matchesArea(place, area) {
  if (area === 'any') return true;
  return place.neighbourhood === area;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function findMatch() {
  const { occasion, budget, area } = answers;

  // Full match: all three criteria
  let candidates = places.filter(p =>
    matchesOccasion(p, occasion) &&
    matchesBudget(p, budget) &&
    matchesArea(p, area)
  );

  if (candidates.length > 0) {
    return { place: pickRandom(candidates), fallback: false };
  }

  // Relax budget filter
  candidates = places.filter(p =>
    matchesOccasion(p, occasion) &&
    matchesArea(p, area)
  );

  if (candidates.length > 0) {
    return { place: pickRandom(candidates), fallback: 'budget' };
  }

  // Relax area filter too
  candidates = places.filter(p => matchesOccasion(p, occasion));

  if (candidates.length > 0) {
    return { place: pickRandom(candidates), fallback: 'area' };
  }

  // Last resort: anything
  return { place: pickRandom(places), fallback: 'all' };
}

// ── Result rendering ───────────────────────────────────────────────────────

function renderResult({ place, fallback }) {
  const eyebrow = fallback ? "We couldn't find an exact match, but…" : 'Your pick';
  $('result-eyebrow').textContent = eyebrow;
  $('result-name').textContent = place.name;
  $('result-description').textContent = place.description;

  $('result-price').textContent = PRICE_DISPLAY[place.priceRange] ?? place.priceRange;
  $('result-price').setAttribute('aria-label', `Price range: ${PRICE_DISPLAY[place.priceRange]}`);

  $('result-neighbourhood').textContent = NEIGHBOURHOOD_DISPLAY[place.neighbourhood] ?? place.neighbourhood;

  const link = $('result-maps-link');
  link.href = place.googleMapsUrl || '#';
  if (!place.googleMapsUrl) link.setAttribute('aria-disabled', 'true');

  // Occasion tags (combine mealTypes + selected tags)
  const tagsEl = $('result-tags');
  tagsEl.innerHTML = '';

  const displayTags = new Set();

  // Show laptop-friendly if relevant
  if (place.laptopFriendly) displayTags.add('laptop-friendly');

  // Show mealTypes as tags
  (place.mealTypes || []).forEach(t => displayTags.add(t));

  // Show a few KML tags if informative
  const informativeTags = ['brunch', 'terrace', 'natural-wine', 'tasting-menu', 'historic', 'grand',
    'czech', 'italian', 'mexican', 'vegetarian', 'vegan', 'pub', 'specialty'];
  (place.tags || []).forEach(t => { if (informativeTags.includes(t)) displayTags.add(t); });

  displayTags.forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'pill pill--tag';
    pill.textContent = TAG_LABELS[tag] ?? tag;
    tagsEl.appendChild(pill);
  });

  // Optionally show a fallback note inside the card
  const existing = document.querySelector('.result__fallback-note');
  if (existing) existing.remove();

  if (fallback) {
    let note = '';
    if (fallback === 'budget')  note = 'We couldn\'t find an exact budget match, but you might love this one.';
    if (fallback === 'area')    note = 'Nothing matched your area, but this place is worth the trip.';
    if (fallback === 'all')     note = 'We stretched our criteria a bit — trust us, this is good.';

    const noteEl = document.createElement('p');
    noteEl.className = 'result__fallback-note';
    noteEl.textContent = note;
    document.querySelector('.result__card').appendChild(noteEl);
  }
}

// ── Navigation ─────────────────────────────────────────────────────────────

$('btn-start').addEventListener('click', () => {
  currentStep = 0;
  renderStep(0);
  showScreen('quiz');
});

$('btn-back').addEventListener('click', () => {
  if (currentStep === 0) {
    showScreen('start');
  } else {
    currentStep -= 1;
    renderStep(currentStep);
  }
});

$('btn-retry').addEventListener('click', () => {
  currentStep = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  renderStep(0);
  showScreen('quiz');
});

$('btn-reload').addEventListener('click', () => location.reload());

// ── Data loading ───────────────────────────────────────────────────────────

async function loadPlaces() {
  try {
    const res = await fetch('places.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    places = data.places;
    if (!Array.isArray(places) || places.length === 0) {
      throw new Error('places.json is empty or malformed.');
    }
  } catch (err) {
    console.error('[Cheers!] Failed to load places:', err);
    $('error-message').textContent = `Could not load places data. (${err.message})`;
    showScreen('error');
    return false;
  }
  return true;
}

// ── PWA service worker ─────────────────────────────────────────────────────

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('[Cheers!] SW registration failed:', err);
    });
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────

async function init() {
  registerSW();
  const ok = await loadPlaces();
  if (ok) {
    // Start screen is already visible via CSS (.screen--active on #screen-start in HTML)
    // Nothing else to do until the user clicks "Find my place"
  }
}

init();
