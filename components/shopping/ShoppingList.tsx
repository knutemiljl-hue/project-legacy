"use client";

import { useEffect, useState } from "react";
import {
  ShoppingItem,
  readShoppingItems,
  saveShoppingItems,
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

  useEffect(() => {
    loadItems();

    window.addEventListener("project-legacy-shopping-updated", loadItems);
    window.addEventListener("storage", loadItems);

    return () => {
      window.removeEventListener("project-legacy-shopping-updated", loadItems);
      window.removeEventListener("storage", loadItems);
    };
  }, []);

  function loadItems() {
    setItems(readShoppingItems());
  }

  function toggleItem(itemId: string) {
    const nextItems = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    setItems(nextItems);
    saveShoppingItems(nextItems);
  }

  function deleteItem(itemId: string) {
    const nextItems = items.filter((item) => item.id !== itemId);

    setItems(nextItems);
    saveShoppingItems(nextItems);
  }

  const openItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-lg text-[#4F773D]">
            ♧
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

      {items.length === 0 ? (
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
                {openItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 ${
                      index !== openItems.length - 1
                        ? "border-b border-[#ECE3D4]"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 bg-white" />

                      <div>
                        <p className="font-medium text-[#24312A]">
                          {item.title}
                        </p>

                        <CreatedByText createdBy={item.createdBy} />
                      </div>
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="rounded-full px-3 py-1 text-sm font-medium text-stone-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Slett ${item.title}`}
                      title="Slett vare"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F8EF] px-4 py-3"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-xs text-white">
                        ✓
                      </span>

                      <div>
                        <p className="text-sm font-medium text-[#24312A] line-through decoration-stone-400">
                          {item.title}
                        </p>

                        <CreatedByText createdBy={item.createdBy} />
                      </div>
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="rounded-full px-3 py-1 text-sm font-medium text-stone-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Slett ${item.title}`}
                      title="Slett vare"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}