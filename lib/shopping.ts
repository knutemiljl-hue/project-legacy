export const SHOPPING_ITEMS_KEY = "project-legacy-shopping-items";

export type ShoppingItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function notifyShoppingUpdated() {
  if (!canUseStorage()) {
    return;
  }

  window.setTimeout(() => {
    window.dispatchEvent(new Event("project-legacy-shopping-updated"));
  }, 0);
}

export function readShoppingItems(): ShoppingItem[] {
  return readJson<ShoppingItem[]>(SHOPPING_ITEMS_KEY, []);
}

export function saveShoppingItems(items: ShoppingItem[]) {
  writeJson(SHOPPING_ITEMS_KEY, items);
  notifyShoppingUpdated();
}

export function addShoppingItem(title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return;
  }

  const existingItems = readShoppingItems();

  const newItem: ShoppingItem = {
    id: `shopping-${Date.now()}`,
    title: trimmedTitle,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  saveShoppingItems([...existingItems, newItem]);
}