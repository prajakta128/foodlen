// Saved products & scan history — persisted from real user actions (localStorage),
// not seeded mock data. Nothing here is fabricated; it only ever contains products
// the user actually looked up or explicitly saved.

export interface SavedProductEntry {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  score?: number;
  savedAt: string; // ISO date
}

export interface ScanHistoryEntry {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  score?: number;
  viewedAt: string; // ISO date
}

const SAVED_KEY = 'foodlens_saved_products';
const HISTORY_KEY = 'foodlens_scan_history';
const HISTORY_LIMIT = 50;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export const savedItemsService = {
  list: (): SavedProductEntry[] =>
    read<SavedProductEntry>(SAVED_KEY).sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ),

  isSaved: (barcode: string): boolean =>
    read<SavedProductEntry>(SAVED_KEY).some((p) => p.barcode === barcode),

  save: (entry: Omit<SavedProductEntry, 'savedAt'>) => {
    const items = read<SavedProductEntry>(SAVED_KEY).filter((p) => p.barcode !== entry.barcode);
    items.push({ ...entry, savedAt: new Date().toISOString() });
    write(SAVED_KEY, items);
  },

  remove: (barcode: string) => {
    write(
      SAVED_KEY,
      read<SavedProductEntry>(SAVED_KEY).filter((p) => p.barcode !== barcode)
    );
  },

  toggle: (entry: Omit<SavedProductEntry, 'savedAt'>): boolean => {
    if (savedItemsService.isSaved(entry.barcode)) {
      savedItemsService.remove(entry.barcode);
      return false;
    }
    savedItemsService.save(entry);
    return true;
  },
};

export const scanHistoryService = {
  list: (): ScanHistoryEntry[] =>
    read<ScanHistoryEntry>(HISTORY_KEY).sort(
      (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
    ),

  log: (entry: Omit<ScanHistoryEntry, 'viewedAt'>) => {
    const items = read<ScanHistoryEntry>(HISTORY_KEY).filter((p) => p.barcode !== entry.barcode);
    items.unshift({ ...entry, viewedAt: new Date().toISOString() });
    write(HISTORY_KEY, items.slice(0, HISTORY_LIMIT));
  },

  clear: () => write(HISTORY_KEY, []),
};

const RECENT_SEARCHES_KEY = 'foodlens_recent_searches';
const RECENT_SEARCHES_LIMIT = 8;

export const recentSearchesService = {
  list: (): string[] => read<string>(RECENT_SEARCHES_KEY),

  add: (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const items = read<string>(RECENT_SEARCHES_KEY).filter(
      (t) => t.toLowerCase() !== clean.toLowerCase()
    );
    items.unshift(clean);
    write(RECENT_SEARCHES_KEY, items.slice(0, RECENT_SEARCHES_LIMIT));
  },

  clear: () => write(RECENT_SEARCHES_KEY, []),
};

// Dietary preferences the user has actually entered themselves — never pre-seeded.
const ALLERGIES_KEY = 'foodlens_pref_allergies';
const DIETARY_KEY = 'foodlens_pref_dietary';

export const dietaryPreferencesService = {
  getAllergies: (): string[] => read<string>(ALLERGIES_KEY),
  addAllergy: (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const items = read<string>(ALLERGIES_KEY);
    if (!items.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      write(ALLERGIES_KEY, [...items, clean]);
    }
  },
  removeAllergy: (name: string) => {
    write(ALLERGIES_KEY, read<string>(ALLERGIES_KEY).filter((a) => a !== name));
  },

  getDietaryTags: (): string[] => read<string>(DIETARY_KEY),
  addDietaryTag: (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const items = read<string>(DIETARY_KEY);
    if (!items.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      write(DIETARY_KEY, [...items, clean]);
    }
  },
  removeDietaryTag: (name: string) => {
    write(DIETARY_KEY, read<string>(DIETARY_KEY).filter((a) => a !== name));
  },
};
