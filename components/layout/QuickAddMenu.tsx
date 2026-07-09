"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  Plus,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import {
  CalendarEventType,
  CalendarOwner,
  CalendarRecurrenceFrequency,
  addRecurringCalendarEvents,
  getCalendarOwnerBadgeClass,
  getCalendarOwnerDotClass,
  getCalendarOwnerLabel,
  getCalendarRecurrenceLabel,
  getLocalDateKey as getCalendarDateKey,
} from "@/lib/calendar";
import { addShoppingItems } from "@/lib/shopping";
import {
  RecurrenceFrequency,
  TaskCategory,
  addRecurringTasks,
  getLocalDateKey,
  getRecurrenceLabel,
} from "@/lib/tasks";

type QuickActionId = "task" | "purchase" | "calendar" | "shopping" | "finance";

const primaryActions: {
  id: QuickActionId;
  title: string;
  description: string;
  icon: React.ElementType;
  tone: "green" | "gold" | "blue" | "stone";
}[] = [
  {
    id: "task",
    title: "Vanlig oppgave",
    description: "Gjøremål for i dag eller senere.",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    id: "purchase",
    title: "Større ting / innkjøp",
    description: "Ting som må kjøpes, avklares eller følges opp.",
    icon: ShoppingBag,
    tone: "gold",
  },
  {
    id: "calendar",
    title: "Kalenderavtale",
    description: "Avtale, helsestasjon, jobb eller familieplan.",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    id: "shopping",
    title: "Handlevarer",
    description: "Legg til én eller flere varer på handlelisten.",
    icon: ShoppingBasket,
    tone: "stone",
  },
];

const secondaryActions: {
  id: QuickActionId;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "finance",
    title: "Økonomioppdatering",
    description: "Fond, buffer, gjeld eller nettoformue. Kommer senere.",
    icon: Coins,
  },
];

const calendarTypes: {
  id: CalendarEventType;
  label: string;
}[] = [
  { id: "family", label: "Familie" },
  { id: "health", label: "Helse" },
  { id: "home", label: "Hjem" },
  { id: "work", label: "Arbeid" },
  { id: "social", label: "Sosialt" },
  { id: "other", label: "Annet" },
];

const calendarOwners: CalendarOwner[] = ["knut", "ingrid", "family"];

const taskRecurrenceOptions: RecurrenceFrequency[] = [
  "none",
  "weekly",
  "biweekly",
  "monthly",
];

const calendarRecurrenceOptions: CalendarRecurrenceFrequency[] = [
  "none",
  "weekly",
  "biweekly",
  "monthly",
];

const DEFAULT_CALENDAR_START_TIME = "09:00";
const DEFAULT_CALENDAR_END_TIME = "10:00";

function parseSubtaskInput(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getActionToneClasses(tone: "green" | "gold" | "blue" | "stone") {
  const classes = {
    green: {
      icon: "bg-[#EEF5E8] text-[#4F773D]",
      active: "group-hover:border-[#B8D3A2] group-hover:bg-[#F6FAF2]",
    },
    gold: {
      icon: "bg-[#FFF5D6] text-[#8D6D1F]",
      active: "group-hover:border-[#EAD58B] group-hover:bg-[#FFF9E7]",
    },
    blue: {
      icon: "bg-sky-50 text-sky-700",
      active: "group-hover:border-sky-200 group-hover:bg-sky-50",
    },
    stone: {
      icon: "bg-[#F7F4EA] text-[#8D846F]",
      active: "group-hover:border-[#E2D8C7] group-hover:bg-[#FBF8F0]",
    },
  };

  return classes[tone];
}

function ActionCard({
  title,
  description,
  icon: Icon,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  tone: "green" | "gold" | "blue" | "stone";
  onClick: () => void;
}) {
  const toneClasses = getActionToneClasses(tone);

  return (
    <button
      type="button"
      onPointerUp={onClick}
      className={`group rounded-3xl border border-[#ECE3D4] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClasses.active}`}
    >
      <div
        className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${toneClasses.icon}`}
      >
        <Icon size={21} strokeWidth={2.25} />
      </div>

      <p className="font-semibold text-[#24312A]">{title}</p>

      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </button>
  );
}

function SecondaryActionCard({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onPointerUp={onClick}
      className="flex items-center gap-3 rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] px-4 py-3 text-left transition hover:bg-white"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#8D846F]">
        <Icon size={19} strokeWidth={2.25} />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#24312A]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-stone-500">
          {description}
        </p>
      </div>
    </button>
  );
}

export default function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<QuickActionId | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubtitle, setTaskSubtitle] = useState("");
  const [taskDate, setTaskDate] = useState(getLocalDateKey());
  const [taskEndDate, setTaskEndDate] = useState(getLocalDateKey());
  const [taskTime, setTaskTime] = useState("");
  const [taskScope, setTaskScope] = useState<"personal" | "family">("personal");
  const [taskCategory, setTaskCategory] = useState<TaskCategory>("task");
  const [taskSubtasksInput, setTaskSubtasksInput] = useState("");
  const [taskRecurrenceFrequency, setTaskRecurrenceFrequency] =
    useState<RecurrenceFrequency>("none");
  const [taskRecurrenceUntil, setTaskRecurrenceUntil] = useState("");

  const [shoppingInput, setShoppingInput] = useState("");

  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarDate, setCalendarDate] = useState(getCalendarDateKey());
  const [calendarEndDate, setCalendarEndDate] = useState(getCalendarDateKey());
  const [calendarStartTime, setCalendarStartTime] = useState(
    DEFAULT_CALENDAR_START_TIME
  );
  const [calendarEndTime, setCalendarEndTime] = useState(
    DEFAULT_CALENDAR_END_TIME
  );
  const [calendarLocation, setCalendarLocation] = useState("");
  const [calendarType, setCalendarType] =
    useState<CalendarEventType>("family");
  const [calendarOwner, setCalendarOwner] =
    useState<CalendarOwner>("family");
  const [calendarRecurrenceFrequency, setCalendarRecurrenceFrequency] =
    useState<CalendarRecurrenceFrequency>("none");
  const [calendarRecurrenceUntil, setCalendarRecurrenceUntil] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function openCalendarAdd(event: Event) {
      const detail = (event as CustomEvent<{ date?: unknown }>).detail;
      const selectedDate = isDateKey(detail?.date)
        ? detail.date
        : getCalendarDateKey();

      setIsOpen(true);
      setActiveAction("calendar");
      setCalendarTitle("");
      setCalendarDate(selectedDate);
      setCalendarEndDate(selectedDate);
      setCalendarStartTime(DEFAULT_CALENDAR_START_TIME);
      setCalendarEndTime(DEFAULT_CALENDAR_END_TIME);
      setCalendarLocation("");
      setCalendarType("family");
      setCalendarOwner("family");
      setCalendarRecurrenceFrequency("none");
      setCalendarRecurrenceUntil(selectedDate);
    }

    window.addEventListener(
      "project-legacy-open-calendar-add",
      openCalendarAdd
    );

    return () => {
      window.removeEventListener(
        "project-legacy-open-calendar-add",
        openCalendarAdd
      );
    };
  }, []);

  function resetFormState() {
    setActiveAction(null);

    setTaskTitle("");
    setTaskSubtitle("");
    setTaskDate(getLocalDateKey());
    setTaskEndDate(getLocalDateKey());
    setTaskTime("");
    setTaskScope("personal");
    setTaskCategory("task");
    setTaskSubtasksInput("");
    setTaskRecurrenceFrequency("none");
    setTaskRecurrenceUntil("");

    setShoppingInput("");

    setCalendarTitle("");
    setCalendarDate(getCalendarDateKey());
    setCalendarEndDate(getCalendarDateKey());
    setCalendarStartTime(DEFAULT_CALENDAR_START_TIME);
    setCalendarEndTime(DEFAULT_CALENDAR_END_TIME);
    setCalendarLocation("");
    setCalendarType("family");
    setCalendarOwner("family");
    setCalendarRecurrenceFrequency("none");
    setCalendarRecurrenceUntil("");
  }

  function closeModal() {
    setIsOpen(false);
    resetFormState();
  }

  function openAction(actionId: QuickActionId) {
    if (actionId === "task") {
      setTaskCategory("task");
    }

    if (actionId === "purchase") {
      setTaskCategory("purchase");
    }

    setActiveAction(actionId);
  }

  function goBackToMenu() {
    setActiveAction(null);
  }

  async function saveTask() {
    if (!taskTitle.trim()) {
      return;
    }

    await addRecurringTasks({
      title: taskTitle,
      subtitle: taskSubtitle,
      date: taskDate,
      endDate: taskEndDate,
      time: taskTime,
      scope: taskScope,
      category: taskCategory,
      subtasks: parseSubtaskInput(taskSubtasksInput),
      recurrenceFrequency: taskRecurrenceFrequency,
      recurrenceUntil: taskRecurrenceUntil,
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

    if (calendarEndDate < calendarDate) {
      return;
    }

    if (
      calendarDate === calendarEndDate &&
      calendarEndTime < calendarStartTime
    ) {
      return;
    }

    await addRecurringCalendarEvents({
      title: calendarTitle,
      startDate: calendarDate,
      endDate: calendarEndDate,
      startTime: calendarStartTime,
      endTime: calendarEndTime,
      location: calendarLocation,
      type: calendarType,
      calendarOwner,
      recurrenceFrequency: calendarRecurrenceFrequency,
      recurrenceUntil: calendarRecurrenceUntil,
    });

    closeModal();
  }

  const isTaskFlow = activeAction === "task" || activeAction === "purchase";
  const isPurchaseFlow = activeAction === "purchase";
  const calendarHasInvalidRange =
    calendarEndDate < calendarDate ||
    (calendarDate === calendarEndDate && calendarEndTime < calendarStartTime);

  const modalTitle =
    activeAction === "task"
      ? "Vanlig oppgave"
      : activeAction === "purchase"
        ? "Større ting / innkjøp"
        : activeAction === "shopping"
          ? "Handlevarer"
          : activeAction === "calendar"
            ? "Kalenderavtale"
            : activeAction === "finance"
              ? "Økonomioppdatering"
              : "Hva vil du legge til?";

  const modalSubtitle =
    activeAction === "task"
      ? "Legg inn et gjøremål for deg selv eller familien."
      : activeAction === "purchase"
        ? "Legg inn større ting som må kjøpes, avklares eller følges opp."
        : activeAction === "shopping"
          ? "Legg til én eller flere varer på handlelisten."
          : activeAction === "calendar"
            ? "Legg inn avtaler, hendelser eller faste planer."
            : activeAction === "finance"
              ? "Denne kommer vi tilbake til senere."
              : "Velg hva du vil opprette i Project Legacy.";

  const modal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            onPointerUp={closeModal}
            className="fixed inset-0 z-[999999] bg-black/70 sm:bg-black/75"
          >
            <div className="flex min-h-dvh items-end justify-center sm:items-start sm:px-6 sm:pt-28">
              <div
                onPointerUp={(event) => event.stopPropagation()}
                className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-stone-200 bg-white p-5 shadow-2xl sm:max-h-[82vh] sm:max-w-2xl sm:rounded-3xl sm:p-6"
              >
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200 sm:hidden" />

                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#8D846F]">
                      Legg til nytt
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                      {modalTitle}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      {modalSubtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onPointerUp={closeModal}
                    className="shrink-0 rounded-full bg-[#F7F4EA] px-3 py-1 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                  >
                    Lukk
                  </button>
                </div>

                {!activeAction && (
                  <div className="space-y-5">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles
                          size={15}
                          strokeWidth={2.25}
                          className="text-[#4F773D]"
                        />
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                          Mest brukt
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {primaryActions.map((action) => (
                          <ActionCard
                            key={action.id}
                            title={action.title}
                            description={action.description}
                            icon={action.icon}
                            tone={action.tone}
                            onClick={() => openAction(action.id)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                        Senere
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        {secondaryActions.map((action) => (
                          <SecondaryActionCard
                            key={action.id}
                            title={action.title}
                            description={action.description}
                            icon={action.icon}
                            onClick={() => openAction(action.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isTaskFlow && (
                  <div className="space-y-4 pb-4 sm:pb-0">
                    <div>
                      <span className="text-sm font-medium text-[#24312A]">
                        Gjelder
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
                          Egen
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
                          Familie
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
                        placeholder={
                          isPurchaseFlow
                            ? "F.eks. Kjøpe stellebord eller ordne barnerom"
                            : "F.eks. Bestill dåpsgave"
                        }
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
                        placeholder={
                          isPurchaseFlow
                            ? "F.eks. Litt større ting som må følges opp"
                            : "F.eks. Familie / praktisk"
                        }
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Første dato
                        </span>

                        <input
                          type="date"
                          value={taskDate}
                          onChange={(event) => {
                            const nextDate = event.target.value;

                            setTaskDate(nextDate);

                            if (!taskEndDate || taskEndDate === taskDate) {
                              setTaskEndDate(nextDate);
                            }
                          }}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Sluttdato
                        </span>

                        <input
                          type="date"
                          value={taskEndDate}
                          min={taskDate}
                          onChange={(event) =>
                            setTaskEndDate(event.target.value)
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
                          value={taskTime}
                          onChange={(event) => setTaskTime(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-[#24312A]">
                        Underpunkter
                      </span>

                      <textarea
                        value={taskSubtasksInput}
                        onChange={(event) =>
                          setTaskSubtasksInput(event.target.value)
                        }
                        className="mt-2 min-h-28 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F] sm:text-sm"
                        placeholder={
                          isPurchaseFlow
                            ? "F.eks.\nMåle rommet\nSjekke pris\nBestille"
                            : "F.eks.\nRing\nSend skjema\nFølg opp"
                        }
                      />
                    </label>

                    <div>
                      <span className="text-sm font-medium text-[#24312A]">
                        Gjentas
                      </span>

                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {taskRecurrenceOptions.map((frequency) => (
                          <button
                            type="button"
                            key={frequency}
                            onPointerUp={() =>
                              setTaskRecurrenceFrequency(frequency)
                            }
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              taskRecurrenceFrequency === frequency
                                ? "border-[#8EB069] bg-[#EEF5E8] text-[#24312A]"
                                : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                            }`}
                          >
                            {getRecurrenceLabel(frequency)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {taskRecurrenceFrequency !== "none" && (
                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Frem til
                        </span>

                        <input
                          type="date"
                          value={taskRecurrenceUntil}
                          onChange={(event) =>
                            setTaskRecurrenceUntil(event.target.value)
                          }
                          min={taskDate}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />

                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Lager maks 52 forekomster. Hvis dato ikke velges,
                          lagres bare én oppføring.
                        </p>
                      </label>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onPointerUp={goBackToMenu}
                        className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                      >
                        Tilbake
                      </button>

                      <button
                        type="button"
                        onPointerUp={saveTask}
                        className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                      >
                        {isPurchaseFlow ? "Lagre større ting" : "Lagre oppgave"}
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
                        onPointerUp={goBackToMenu}
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
                          Startdato
                        </span>

                        <input
                          type="date"
                          value={calendarDate}
                          onChange={(event) => {
                            const nextDate = event.target.value;

                            setCalendarDate(nextDate);

                            if (calendarEndDate < nextDate) {
                              setCalendarEndDate(nextDate);
                            }
                          }}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Sluttdato
                        </span>

                        <input
                          type="date"
                          value={calendarEndDate}
                          min={calendarDate}
                          onChange={(event) =>
                            setCalendarEndDate(event.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Starttidspunkt
                        </span>

                        <input
                          type="time"
                          value={calendarStartTime}
                          onChange={(event) =>
                            setCalendarStartTime(event.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Sluttidspunkt
                        </span>

                        <input
                          type="time"
                          value={calendarEndTime}
                          min={
                            calendarDate === calendarEndDate
                              ? calendarStartTime
                              : undefined
                          }
                          onChange={(event) =>
                            setCalendarEndTime(event.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />
                      </label>
                    </div>

                    {calendarHasInvalidRange && (
                      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                        Slutt må være etter start.
                      </p>
                    )}

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
                        Gjelder
                      </span>

                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {calendarOwners.map((owner) => (
                          <button
                            type="button"
                            key={owner}
                            onPointerUp={() => setCalendarOwner(owner)}
                            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              calendarOwner === owner
                                ? getCalendarOwnerBadgeClass(owner)
                                : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${getCalendarOwnerDotClass(owner)}`}
                            />
                            {getCalendarOwnerLabel(owner)}
                          </button>
                        ))}
                      </div>
                    </div>

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

                    <div>
                      <span className="text-sm font-medium text-[#24312A]">
                        Gjentas
                      </span>

                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {calendarRecurrenceOptions.map((frequency) => (
                          <button
                            type="button"
                            key={frequency}
                            onPointerUp={() =>
                              setCalendarRecurrenceFrequency(frequency)
                            }
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              calendarRecurrenceFrequency === frequency
                                ? "border-[#8EB069] bg-[#EEF5E8] text-[#24312A]"
                                : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                            }`}
                          >
                            {getCalendarRecurrenceLabel(frequency)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {calendarRecurrenceFrequency !== "none" && (
                      <label className="block">
                        <span className="text-sm font-medium text-[#24312A]">
                          Frem til
                        </span>

                        <input
                          type="date"
                          value={calendarRecurrenceUntil}
                          onChange={(event) =>
                            setCalendarRecurrenceUntil(event.target.value)
                          }
                          min={calendarDate}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition focus:border-[#8D846F] sm:text-sm"
                        />

                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Lager maks 52 forekomster. Hvis dato ikke velges,
                          lagres bare én avtale.
                        </p>
                      </label>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onPointerUp={goBackToMenu}
                        className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                      >
                        Tilbake
                      </button>

                      <button
                        type="button"
                        onPointerUp={saveCalendarEvent}
                        disabled={calendarHasInvalidRange}
                        className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Lagre avtale
                      </button>
                    </div>
                  </div>
                )}

                {activeAction === "finance" && (
                  <div className="rounded-3xl bg-[#F7F4EA] p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#8D846F] shadow-sm">
                      <Coins size={22} strokeWidth={2.25} />
                    </div>

                    <p className="mt-4 font-semibold text-[#24312A]">
                      Kommer snart
                    </p>

                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Økonomioppdatering kan vi koble på senere med egne felter
                      for fond, buffer, gjeld og nettoformue.
                    </p>

                    <button
                      type="button"
                      onPointerUp={goBackToMenu}
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
