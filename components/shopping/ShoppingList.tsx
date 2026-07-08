"use client";

import { useEffect, useState } from "react";
import { Check, Circle, Pencil, Save, ShoppingBasket, Trash2, X } from "lucide-react";
import {
  ShoppingItem,
  deleteShoppingItem,
  readShoppingItems,
  subscribeToShoppingItems,
  updateShoppingItemCompleted,
  updateShoppingItemTitle,
} from "@/lib/shopping";
import { getUserDisplayName } from "@/lib/users";

type ShoppingListProps = {
  compact?: boolean;
};

function CreatedByText({ createdBy }: { createdBy?: string }) {
  if (!createdBy) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-stone-400">
      Lagt til av {getUserDisplayName(createdBy)}
    </p>
  );
}

export default function ShoppingList({ compact = false }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    loadItems();

    const unsubscribeFromShopping = subscribeToShoppingItems(loadItems);

    window.addEventListener("project-legacy-shopping-updated", loadItems);
    window.addEventListener("focus", loadItems);

    return () => {
      unsubscribeFromShopping();
      window.removeEventListener("project-legacy-shopping-updated", loadItems);
      window.removeEventListener("focus", loadItems);
    };
  }, []);

  async function loadItems() {
    setIsLoading(true);

    const nextItems = await readShoppingItems();

    setItems(nextItems);
    setIsLoading(false);
  }

  async function toggleItem(item: ShoppingItem) {
    const nextItems = items.map((currentItem) =>
      currentItem.id === item.id
        ? { ...currentItem, completed: !currentItem.completed }
        : currentItem
    );

    setItems(nextItems);

    await updateShoppingItemCompleted(item.id, !item.completed);
  }

  async function removeItem(itemId: string) {
    const nextItems = items.filter((item) => item.id !== itemId);

    setItems(nextItems);

    await deleteShoppingItem(itemId);
  }

  function startEditingItem(item: ShoppingItem) {
    setEditingItemId(item.id);
    setEditingTitle(item.title);
  }

  function cancelEditingItem() {
    setEditingItemId(null);
    setEditingTitle("");
  }

  async function saveItemTitle(item: ShoppingItem) {
    const nextTitle = editingTitle.trim();

    if (!nextTitle) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, title: nextTitle }
          : currentItem
      )
    );
    cancelEditingItem();

    await updateShoppingItemTitle(item.id, nextTitle);
    await loadItems();
  }

  const openItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
            <ShoppingBasket size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Handleliste
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Felles innkjøp
            </h2>

            {!compact && (
              <p className="mt-2 text-sm leading-6 text-stone-600">
                En enkel felles liste for mat, bleier, utstyr og småting.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Gjenstår</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {openItems.length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">
            Henter handlelisten …
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">
            Handlelisten er tom. Legg til varer via <strong>+ Ny</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Å handle
              </h3>

              <p className="text-xs text-stone-400">
                {openItems.length} varer
              </p>
            </div>

            {openItems.length === 0 ? (
              <div className="rounded-2xl bg-[#F7F4EA] p-4">
                <p className="text-sm text-stone-500">
                  Ingenting igjen å handle.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
                {openItems.map((item, index) => {
                  const isEditing = editingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                        index !== openItems.length - 1
                          ? "border-b border-[#ECE3D4]"
                          : ""
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                          <input
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                            className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-[#24312A] outline-none transition focus:border-[#8D846F]"
                            aria-label="Varenavn"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveItemTitle(item)}
                              className="flex items-center gap-1 rounded-2xl bg-[#3F6F35] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:brightness-110"
                            >
                              <Save size={13} strokeWidth={2.25} />
                              Lagre
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditingItem}
                              className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                            >
                              <X size={13} strokeWidth={2.25} />
                              Avbryt
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleItem(item)}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 bg-white text-stone-300">
                              <Circle size={13} strokeWidth={2} />
                            </span>

                            <div>
                              <p className="font-medium text-[#24312A]">
                                {item.title}
                              </p>

                              <CreatedByText createdBy={item.createdBy} />
                            </div>
                          </button>

                          <div className="ml-9 flex items-center gap-2 sm:ml-0">
                            <button
                              type="button"
                              onClick={() => startEditingItem(item)}
                              className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-[#24312A]"
                              aria-label={`Rediger ${item.title}`}
                              title="Rediger vare"
                            >
                              <Pencil size={15} strokeWidth={2} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-red-600"
                              aria-label={`Slett ${item.title}`}
                              title="Slett vare"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {completedItems.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                  Handlet
                </h3>

                <p className="text-xs text-stone-400">
                  {completedItems.length} varer
                </p>
              </div>

              <div className="space-y-2">
                {completedItems.map((item) => {
                  const isEditing = editingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl bg-[#F4F8EF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {isEditing ? (
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                          <input
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                            className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-[#24312A] outline-none transition focus:border-[#8D846F]"
                            aria-label="Varenavn"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveItemTitle(item)}
                              className="flex items-center gap-1 rounded-2xl bg-[#3F6F35] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:brightness-110"
                            >
                              <Save size={13} strokeWidth={2.25} />
                              Lagre
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditingItem}
                              className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                            >
                              <X size={13} strokeWidth={2.25} />
                              Avbryt
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleItem(item)}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-white">
                              <Check size={13} strokeWidth={2.5} />
                            </span>

                            <div>
                              <p className="text-sm font-medium text-[#24312A] line-through decoration-stone-400">
                                {item.title}
                              </p>

                              <CreatedByText createdBy={item.createdBy} />
                            </div>
                          </button>

                          <div className="ml-8 flex items-center gap-2 sm:ml-0">
                            <button
                              type="button"
                              onClick={() => startEditingItem(item)}
                              className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-[#24312A]"
                              aria-label={`Rediger ${item.title}`}
                              title="Rediger vare"
                            >
                              <Pencil size={15} strokeWidth={2} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-red-600"
                              aria-label={`Slett ${item.title}`}
                              title="Slett vare"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
