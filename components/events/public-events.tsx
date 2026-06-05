"use client";

import { useState } from "react";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex-helpers/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ImageIcon,
  Users,
  Zap,
  Heart,
} from "lucide-react";
import { getMonth, parseDate } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type Event = Doc<"events">;
type EventType = "social" | "fundraiser" | "workshop" | "others";
type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  EventType,
  {
    label: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    bg: string;
    accent: string;
  }
> = {
  social: {
    label: "Social",
    icon: ({ className }) => <Users className={className} />,
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    accent: "from-blue-400 to-blue-600",
  },
  fundraiser: {
    label: "Fundraiser",
    icon: ({ className }) => <Heart className={className} />,
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    accent: "from-rose-400 to-rose-600",
  },
  workshop: {
    label: "Workshop",
    icon: ({ className }) => <Zap className={className} />,
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    accent: "from-amber-400 to-amber-600",
  },
  others: {
    label: "Others",
    icon: ({ className }) => <Calendar className={className} />,
    color: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800/50",
    accent: "from-slate-400 to-slate-600",
  },
};

const STATUS_STYLES: Record<EventStatus, string> = {
  upcoming:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800",
  ongoing:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800",
  completed:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700",
  cancelled:
    "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800",
};

const ALL_TYPES: EventType[] = ["social", "fundraiser", "workshop", "others"];

// ─── Motion Variants ──────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.97, y: 10, transition: { duration: 0.16 } },
};

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onClick }: Readonly<{ event: Event; onClick: () => void }>) {
  const cfg = TYPE_CONFIG[event.type as EventType] ?? TYPE_CONFIG.others;
  const TypeIcon = cfg.icon;
  const coverImage = event.media?.find((m) => m.type === "image")?.url;
  const day = event.startDate.split("-")[2];
  const month = getMonth(event.startDate);
  const mediaCount = event.media?.length ?? 0;

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* ── Cover ── */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={event.title}
            width={500}
            height={500}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-linear-to-br ${cfg.accent} opacity-10`}
          >
            <TypeIcon className="w-14 h-14 text-foreground opacity-30" />
          </div>
        )}

        {/* gradient scrim so text on image is readable */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

        {/* Date pill — top left */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow px-3 py-1.5 text-center min-w-12">
          <div className="text-lg font-black text-orange-500 leading-none">
            {day}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
            {month}
          </div>
        </div>

        {/* Status — top right */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[event.status as EventStatus]}`}
          >
            {event.status}
          </span>
        </div>

        {/* Media count — bottom right */}
        {mediaCount > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            <ImageIcon className="w-2.5 h-2.5" />
            {mediaCount}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Type chip */}
        <span
          className={`self-start inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
        >
          <TypeIcon className="w-3 h-3" />
          {cfg.label}
        </span>

        <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
          {event.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {event.description}
        </p>

        <div className="mt-auto pt-2.5 border-t border-border space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0 text-orange-400" />
            {event.startTime}
            {event.endTime ? ` – ${event.endTime}` : ""}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0 text-orange-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ media }: Readonly<{ media: NonNullable<Event["media"]> }>) {
  const [idx, setIdx] = useState(0);
  const images = media.filter((m) => m.type === "image" && m.url);
  if (!images.length) return null;

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={images[idx].url?? ''}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setIdx((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-1.5 backdrop-blur-sm transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-1.5 backdrop-blur-sm transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white scale-125" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === idx
                  ? "border-orange-500"
                  : "border-transparent opacity-50 hover:opacity-90"
              }`}
            >
              <Image
                src={img.url??''}
                alt={img.url??''}
                width={500}
                height={500}
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Event Modal ──────────────────────────────────────────────────────────────

function EventModal({ event, onClose }: Readonly<{ event: Event; onClose: () => void }>) {
  const cfg = TYPE_CONFIG[event.type as EventType] ?? TYPE_CONFIG.others;
  const TypeIcon = cfg.icon;
  const day = event.startDate.split("-")[2];
  const month = getMonth(event.startDate);
  const year = event.startDate.split("-")[0];

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-full flex flex-col bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-muted hover:bg-muted/70 rounded-full p-2 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 pr-8">
              <div className="shrink-0 bg-orange-500 text-white rounded-2xl px-4 py-3 text-center shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                <div className="text-3xl font-black leading-none">{day}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-90 mt-0.5">
                  {month}
                </div>
                <div className="text-[10px] opacity-70 mt-0.5">{year}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[event.status as EventStatus]}`}
                  >
                    {event.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold leading-snug">
                  {event.title}
                </h2>
              </div>
            </div>

            {/* Gallery */}
            {(event.media?.length ?? 0) > 0 && (
              <ImageGallery media={event.media!} />
            )}

            {/* Description */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                About
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {event.description}
              </p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/60">
                <Clock className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                    Time
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {event.startTime}
                    {event.endTime ? ` – ${event.endTime}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/60">
                <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {event.location}
                  </p>
                </div>
              </div>
              {event.endDate && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/60 col-span-2">
                  <Calendar className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                      Ends
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      {event.endDate.split("-").reverse().join(" / ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Minutes */}
            {event.minutes && (
              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Minutes / Notes
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                  {event.minutes}
                </p>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground text-right">
              Created {parseDate(event.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventType | "all">("all");

  // ⚠️  Pass an empty object (or your real args) — NOT status:'completed'
  // so all event types come through; we filter client-side to exclude meetings.
  const {
    results: events,
    loadMore,
    status,
  } = usePaginatedQuery(api.events.getEvents, {}, { initialNumItems: 12 });

  const isLoading = status === "LoadingFirstPage";
  const nonMeeting = (events ?? []).filter((e) => e.type !== "meeting");

  const filtered = nonMeeting.filter((e) => {
    if (activeFilter !== "all" && e.type !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = ALL_TYPES.reduce(
    (acc, t) => {
      acc[t] = nonMeeting.filter((e) => e.type === t).length;
      return acc;
    },
    {} as Record<EventType, number>,
  );

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading…"
              : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl"
          />
        </div>
      </motion.div>

      {/* ── Filter pills ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setActiveFilter("all")}
          className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 ${
            activeFilter === "all"
              ? "bg-orange-500 text-white border-orange-500 shadow-md"
              : "border-border bg-background text-foreground hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          All ({nonMeeting.length})
        </button>

        {ALL_TYPES.map((t) => {
          const c = TYPE_CONFIG[t];
          const TypeIcon = c.icon;
          const active = activeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 ${
                active
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "border-border bg-background text-foreground hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {c.label} ({counts[t]})
            </button>
          );
        })}
      </motion.div>

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_,i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-border bg-card animate-pulse"
            >
              <div className="h-44 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-20 bg-muted rounded-full" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Grid or empty state ── */}
      {!isLoading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <Calendar className="w-9 h-9 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold text-lg">No events found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter.
            </p>
          </div>
          {search && (
            <Button variant="outline" size="sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          )}
        </motion.div>
      )}

      {!isLoading && filtered.length > 0 && (
        <motion.div
          key="grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filtered.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </motion.div>
      )}

      {/* ── Load more ── */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => loadMore(12)}
            className="rounded-full px-8"
          >
            Load more
          </Button>
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
