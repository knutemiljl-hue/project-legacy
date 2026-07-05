"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  Plus,
  ShoppingBasket,
} from "lucide-react";
import {
  CalendarEventType,
  addCalendarEvent,
  getLocalDateKey as getCalendarDateKey,
} from "@/lib/calendar";
import { addShoppingItems } from "@/lib/shopping";
import { addTask, getLocalDateKey } from "@/lib/tasks";

const actions = [
  {
    id: "task",
    title: "Nytt gjøremål",
    description: "Legg til en oppgave for deg eller familien.",
    icon: CheckCircle2,
  },
  {
    id: "shopping",
    title: "Ny handleliste",
    description: "Legg til én eller flere varer familien må kjøpe.",
    icon: ShoppingBasket,
  },
  {
    id: "calendar",
    title: "Ny kalenderoppføring",
    description: "Legg inn en avtale eller hendelse.",
    icon: CalendarDays,
  },
  {
    id: "finance",
    title: "Økonomioppdatering",
    description: "Oppdater fond, buffer, gjeld eller nettoformue.",
    icon: Coins,
  },
];

const calendarTypes: {
  id: CalendarEventType;
  label: string;
}[] = [
  {
    id: "family",
    label: "Familie",
  },
  {
    id: "health",
    label: "Helse",
  },
  {
    id: "home",
    label: "Hjem",
  },
  {
    id: "work",
    label: "Arbeid",
  },
  {
    id: "social",
    label: "Sosialt",
  },
  {
    id: "other",
    label: "Annet",
  },
];

export default function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubtitle, setTaskSubtitle] = useState("");
  const [taskDate, setTaskDate] = useState(getLocalDateKey());
  const [taskTime, setTaskTime] = useState("");
  const [taskScope, setTaskScope] = useState<"personal" | "family">("personal");

  const [shoppingInput, setShoppingInput] = useState("");

  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarDate, setCalendarDate] = useState(getCalendarDateKey());
  const [calendarTime, setCalendarTime] = useState("");
  const [calendarLocation, setCalendarLocation] = useState("");
  const [calendarType, setCalendarType] =
    useState<CalendarEventType>("family");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function closeModal() {
    setIsOpen(false);
    setActiveAction(null);

    setTaskTitle("");
    setTaskSubtitle("");
    setTaskDate(getLocalDateKey());
    setTaskTime("");
    setTaskScope("personal");

    setShoppingInput("");

    setCalendarTitle("");
    setCalendarDate(getCalendarDateKey());
    setCalendarTime("");
    setCalendarLocation("");
    setCalendarType("family");
  }

  async function saveTask() {
    if (!taskTitle.trim()) {
      return;
    }

    await addTask({
      title: taskTitle,
      subtitle: taskSubtitle,
      date: taskDate,
      time: taskTime,
      scope: taskScope,
    });

    closeModal();
  }

  async function saveShoppingItems() {
    if (!shoppingInput.trim()) {
      return;
    }

    await addShoppingItems(shoppingInput);
    closeModal();
  }

  async function saveCalendarEvent() {
    if (!calendarTitle.trim()) {
      return;
    }

    await addCalendarEvent({
      title: calendarTitle,
      date: calendarDate,
      time: calendarTime,
      location: calendarLocation,
      type: calendarType,
    });

    closeModal();
  }

  const modal =
    isOpen && isMounted
      ? createPortal(
          <div
            onPointerUp={closeModal}
            className="fixed inset-0 z-[999999] bg-black/70 sm:bg-black/75"
          >
            <div className="flex min-h-dvh items-end justify-center sm:items-start sm:px-6 sm:pt-28">
              <div
                onPointerUp={(event) => event.stopPropagation()}
                className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-stone-200 bg-white p-5 shadow-2xl sm:max-h-[82vh] sm:max-w-xl sm:rounded-3xl sm:p-6"
              >
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200 sm:hidden" />

                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#8D846F]">
                      Legg til nytt
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                      {activeAction === "task"
                        ? "Nytt gjøremål"
                        : activeAction === "shopping"
                          ? "Legg til varer"
                          : activeAction === "calendar"
                            ? "Ny kalenderoppføring"
                            : "Hva vil du opprette?"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onPointerUp={closeModal}
                    className="rounded-full bg-[#F7F4EA] px-3 py-1 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                  >
                    Lukk
                  </button>
                </div>

                {!activeAction && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {actions.map((action) => {
                      const Icon = action.icon;

                      return (
                        <button
                          type="button"
                          key={action.id}
                          onPointerUp={() => setActiveAction(action.id)}
                          className="rounded-2xl bg-[#F7F4EA] p-4 text-left transition hover:brightness-95"
                        >
                          <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#4F773D]">
                            <Icon size={20} strokeWidth={2} />
                          </div>

                          <p className="font-semibold text-[#24312A]">
                            {action.title}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {action.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeAction === "task" && (
                  <div className="space-y-4 pb-4 sm:pb-0">
                    <div>
                      <span className="text-sm font-medium text-[#24312A]">
                        Type oppgave
                      </span>

                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onPointerUp={() => setTaskScope("personal")}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            taskScope === "personal"
                              ? "border-[#8EB069] bg-[#EEF5E8] text-[#24312A]"
                              : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                          }`}
                        >
                          Egen oppgave
                        </button>

                        <button
                          type="button"
                          onPointerUp={() => setTaskScope("family")}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            taskScope === "family"
                              ? "border-[#8EB069] bg-[#EEF5E8] text-[#24312A]"
                              : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                          }`}
                        >
                          Familieoppgave
                        </button>
                      </div>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-[#24312A]">
                        Tittel
                      </span>

                      <input
                        value={taskTitle}
                        onChange={(event) => setTaskTitle(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F] sm:text-sm"
                        placeholder="F.eks. Bestill dåpsgave"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-[#24312A]">
                        Beskrivelse
                      </span>

                      <input
                        value={taskSubtitle}
                        onChange={(event) =>
                          setTaskSubtitle(event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F] sm:text-sm"
                        placeholder="F.eks. Familie / praktisk"
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Dato
                        </span>

                        <input
                          type="date"
                          value={taskDate}
                          onChange={(event) => setTaskDate(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Klokkeslett
                        </span>

                        <input
                          type="time"
                          value={taskTime}
                          onChange={(event) => setTaskTime(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onPointerUp={() => setActiveAction(null)}
                        className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                      >
                        Tilbake
                      </button>

                      <button
                        type="button"
                        onPointerUp={saveTask}
                        className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                      >
                        Lagre gjøremål
                      </button>
                    </div>
                  </div>
                )}

                {activeAction === "shopping" && (
                  <div className="space-y-4 pb-4 sm:pb-0">
                    <label className="block">
                      <span className="text-sm font-medium text-[#24312A]">
                        Varer
                      </span>

                      <textarea
                        value={shoppingInput}
                        onChange={(event) =>
                          setShoppingInput(event.target.value)
                        }
                        className="mt-2 min-h-36 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F] sm:min-h-32 sm:text-sm"
                        placeholder={`F.eks.\nMelk\nKaffe\nBleier\n\nEller: melk, kaffe, bleier`}
                      />
                    </label>

                    <p className="text-sm leading-6 text-stone-500">
                      Skriv én vare per linje, eller skill dem med komma.
                    </p>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onPointerUp={() => setActiveAction(null)}
                        className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                      >
                        Tilbake
                      </button>

                      <button
                        type="button"
                        onPointerUp={saveShoppingItems}
                        className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                      >
                        Legg til varer
                      </button>
                    </div>
                  </div>
                )}

                {activeAction === "calendar" && (
                  <div className="space-y-4 pb-4 sm:pb-0">
                    <label className="block">
                      <span className="text-sm font-medium text-[#24312A]">
                        Tittel
                      </span>

                      <input
                        value={calendarTitle}
                        onChange={(event) =>
                          setCalendarTitle(event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F] sm:text-sm"
                        placeholder="F.eks. Helsestasjon"
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Dato
                        </span>

                        <input
                          type="date"
                          value={calendarDate}
                          onChange={(event) =>
                            setCalendarDate(event.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Klokkeslett
                        </span>

                        <input
                          type="time"
                          value={calendarTime}
                          onChange={(event) =>
                            setCalendarTime(event.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-[#24312A]">
                        Sted
                      </span>

                      <input
                        value={calendarLocation}
                        onChange={(event) =>
                          setCalendarLocation(event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F] sm:text-sm"
                        placeholder="F.eks. Bergen sentrum"
                      />
                    </label>

                    <div>
                      <span className="text-sm font-medium text-[#24312A]">
                        Type
                      </span>

                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {calendarTypes.map((type) => (
                          <button
                            type="button"
                            key={type.id}
                            onPointerUp={() => setCalendarType(type.id)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              calendarType === type.id
                                ? "border-[#8EB069] bg-[#EEF5E8] text-[#24312A]"
                                : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onPointerUp={() => setActiveAction(null)}
                        className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                      >
                        Tilbake
                      </button>

                      <button
                        type="button"
                        onPointerUp={saveCalendarEvent}
                        className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                      >
                        Lagre avtale
                      </button>
                    </div>
                  </div>
                )}

                {activeAction &&
                  activeAction !== "task" &&
                  activeAction !== "shopping" &&
                  activeAction !== "calendar" && (
                    <div className="rounded-2xl bg-[#F7F4EA] p-5">
                      <p className="font-semibold text-[#24312A]">
                        Kommer snart
                      </p>

                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        Denne funksjonen bygger vi senere.
                      </p>

                      <button
                        type="button"
                        onPointerUp={() => setActiveAction(null)}
                        className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                      >
                        Tilbake
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onPointerUp={() => setIsOpen(true)}
        className="flex touch-manipulation items-center gap-2 rounded-2xl bg-[#3F6F35] px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110"
      >
        <Plus size={17} strokeWidth={2.25} />
        Ny
      </button>

      {modal}
    </>
  );
}