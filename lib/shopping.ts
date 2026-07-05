import { supabase } from "@/lib/supabase";
import { LegacyUserId, readActiveUser } from "@/lib/users";

export type ShoppingItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  createdBy?: LegacyUserId;
};

type ShoppingItemRow = {
  id: string;
  title: string;
  completed: boolean;
  created_by: LegacyUserId | null;
  created_at: string;
};

function mapShoppingItem(row: ShoppingItemRow): ShoppingItem {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
  };
}

export function notifyShoppingUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("project-legacy-shopping-updated"));
}

export async function readShoppingItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from("legacy_shopping_items")
    .select("id, title, completed, created_by, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Kunne ikke hente handleliste:", error);
    return [];
  }

  return (data ?? []).map((item) => mapShoppingItem(item as ShoppingItemRow));
}

export async function addShoppingItem(title: string) {
  await addShoppingItems(title);
}

export async function addShoppingItems(input: string) {
  const titles = input
    .split(/\n|,/)
    .map((title) => title.trim())
    .filter(Boolean);

  if (titles.length === 0) {
    return;
  }

  const activeUser = readActiveUser();

  const rows = titles.map((title) => ({
    title,
    completed: false,
    created_by: activeUser.id,
  }));

  const { error } = await supabase.from("legacy_shopping_items").insert(rows);

  if (error) {
    console.error("Kunne ikke legge til varer:", error);
    return;
  }

  notifyShoppingUpdated();
}

export async function updateShoppingItemCompleted(
  itemId: string,
  completed: boolean
) {
  const { error } = await supabase
    .from("legacy_shopping_items")
    .update({ completed })
    .eq("id", itemId);

  if (error) {
    console.error("Kunne ikke oppdatere vare:", error);
    return;
  }

  notifyShoppingUpdated();
}

export async function deleteShoppingItem(itemId: string) {
  const { error } = await supabase
    .from("legacy_shopping_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Kunne ikke slette vare:", error);
    return;
  }

  notifyShoppingUpdated();
}

export function subscribeToShoppingItems(onChange: () => void) {
  const channel = supabase
    .channel("legacy-shopping-items")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "legacy_shopping_items",
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}