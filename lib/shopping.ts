import { supabase } from "@/lib/supabase";
import { notifyShoppingItemsCreatedByPush } from "@/lib/push-events";
import { LegacyUserId, readActiveUser } from "@/lib/users";

export type ShoppingItem = {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  createdBy?: LegacyUserId;
};

type ShoppingItemRow = {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  created_by: LegacyUserId | null;
  created_at: string;
};

function mapShoppingItem(row: ShoppingItemRow): ShoppingItem {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
  };
}

function capitalizeShoppingTitle(title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return "";
  }

  return trimmedTitle.charAt(0).toLocaleUpperCase("nb-NO") + trimmedTitle.slice(1);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isBeforeToday(dateString?: string) {
  if (!dateString) {
    return false;
  }

  return getLocalDateKey(new Date(dateString)) < getLocalDateKey();
}

export function notifyShoppingUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("project-legacy-shopping-updated"));
}

export async function readShoppingItems(): Promise<ShoppingItem[]> {
  await deleteCompletedShoppingItemsFromPreviousDays();

  const { data, error } = await supabase
    .from("legacy_shopping_items")
    .select("id, title, completed, completed_at, created_by, created_at")
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
    .map((title) => capitalizeShoppingTitle(title))
    .filter(Boolean);

  if (titles.length === 0) {
    return;
  }

  const activeUser = readActiveUser();

  const rows = titles.map((title) => ({
    title,
    completed: false,
    completed_at: null,
    created_by: activeUser.id,
  }));

  const { error } = await supabase.from("legacy_shopping_items").insert(rows);

  if (error) {
    console.error("Kunne ikke legge til varer:", error);
    return;
  }

  notifyShoppingUpdated();
  notifyShoppingItemsCreatedByPush(titles);
}

export async function updateShoppingItemCompleted(
  itemId: string,
  completed: boolean
) {
  const { error } = await supabase
    .from("legacy_shopping_items")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", itemId);

  if (error) {
    console.error("Kunne ikke oppdatere vare:", error);
    return;
  }

  notifyShoppingUpdated();
}

export async function deleteCompletedShoppingItemsFromPreviousDays() {
  const { data, error } = await supabase
    .from("legacy_shopping_items")
    .select("id, completed_at")
    .eq("completed", true)
    .not("completed_at", "is", null);

  if (error) {
    console.error("Kunne ikke hente fullførte handlevarer:", error);
    return;
  }

  const oldItemIds = (data ?? [])
    .filter((item) => isBeforeToday(item.completed_at as string | undefined))
    .map((item) => item.id as string);

  if (oldItemIds.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("legacy_shopping_items")
    .delete()
    .in("id", oldItemIds);

  if (deleteError) {
    console.error("Kunne ikke rydde fullførte handlevarer:", deleteError);
  }
}

export async function updateShoppingItemTitle(itemId: string, title: string) {
  const trimmedTitle = capitalizeShoppingTitle(title);

  if (!trimmedTitle) {
    return;
  }

  const { error } = await supabase
    .from("legacy_shopping_items")
    .update({ title: trimmedTitle })
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
