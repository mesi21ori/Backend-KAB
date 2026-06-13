const STORAGE_KEY = "letter-reference-counters";

interface ReferenceCounter {
  code: string;
  year: number;
  counter: number;
}

interface ReferenceCounters {
  [key: string]: ReferenceCounter; // key format: "{code}-{year}"
}

function getStorageKey(code: string, year: number): string {
  return `${code.toUpperCase()}-${year}`;
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getAllCounters(): ReferenceCounters {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ReferenceCounters;
    }
  } catch (error) {
    console.error("Error loading reference counters from localStorage:", error);
  }

  return {};
}

function saveCounters(counters: ReferenceCounters): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
  } catch (error) {
    console.error("Error saving reference counters to localStorage:", error);
  }
}

/**
 * Get the next reference number for a given code
 * Format: {code}-{year}/{number} (e.g., "LTR-2025/0001")
 */
export function getNextReferenceNumber(code: string): string {
  if (!code || code.trim() === "") {
    throw new Error("Reference code cannot be empty");
  }

  const normalizedCode = code.toUpperCase().trim();
  const year = getCurrentYear();
  const key = getStorageKey(normalizedCode, year);

  const counters = getAllCounters();
  let counter = counters[key];

  if (!counter || counter.year !== year) {
    // Initialize or reset for new year
    counter = {
      code: normalizedCode,
      year,
      counter: 0,
    };
  }

  // Increment counter
  counter.counter += 1;
  counters[key] = counter;
  saveCounters(counters);

  // Format: LTR-2025/0001
  const numberStr = counter.counter.toString().padStart(4, "0");
  return `${normalizedCode}-${year}/${numberStr}`;
}

/**
 * Get the current counter value without incrementing
 */
export function getCurrentCounter(code: string): number {
  if (!code || code.trim() === "") {
    return 0;
  }

  const normalizedCode = code.toUpperCase().trim();
  const year = getCurrentYear();
  const key = getStorageKey(normalizedCode, year);

  const counters = getAllCounters();
  const counter = counters[key];

  if (!counter || counter.year !== year) {
    return 0;
  }

  return counter.counter;
}

/**
 * Get the next reference number that would be generated (preview) without incrementing
 */
export function getNextReferenceNumberPreview(code: string): string {
  if (!code || code.trim() === "") {
    return "";
  }

  const normalizedCode = code.toUpperCase().trim();
  const year = getCurrentYear();
  const currentCounter = getCurrentCounter(normalizedCode);
  const nextCounter = currentCounter + 1;

  const numberStr = nextCounter.toString().padStart(4, "0");
  return `${normalizedCode}-${year}/${numberStr}`;
}

/**
 * Reset the counter for a specific code and year
 */
export function resetCounter(code: string, year?: number): void {
  if (!code || code.trim() === "") {
    return;
  }

  const normalizedCode = code.toUpperCase().trim();
  const targetYear = year || getCurrentYear();
  const key = getStorageKey(normalizedCode, targetYear);

  const counters = getAllCounters();
  delete counters[key];
  saveCounters(counters);
}

/**
 * Reset all counters (use with caution)
 */
export function resetAllCounters(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error resetting all reference counters:", error);
  }
}

