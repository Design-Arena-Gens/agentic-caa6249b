"use client";

import { useMemo, useState } from "react";
import {
  analyzeAmenities,
  type AmenityAnalysis,
  type AmenitySuggestion,
} from "@/lib/amenities";

const DEFAULT_PMG = `Gym
Yoga Studio
Swimming Pool
24/7 Security
Concierge Desk
Rooftop Garden
Pet Spa
Study Lounge
Theatre Room
Housekeeping Services
High-Speed WiFi
Laundry Service
Parking Garage
Bike Storage
Package Room
Outdoor Grill Zone`;

const DEFAULT_AMBER = `Gym
Swimming Pool
Security 24x7
Concierge
Roof Top Garden
Pet Spa
Study Lounge
Mini Theatre
House Keeping
High Speed Wifi
Laundry Services
Parking
Bike Storage
Package Room
Package room
Private Cinema`;

export default function Home() {
  const [pmgInput, setPmgInput] = useState(DEFAULT_PMG);
  const [amberInput, setAmberInput] = useState(DEFAULT_AMBER);

  const analysis = useMemo<AmenityAnalysis>(
    () => analyzeAmenities(pmgInput, amberInput),
    [pmgInput, amberInput],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:px-12">
        <header className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            Amenity QA Agent
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Keep PMG amenities and Amber listings in sync without manual
            spreadsheets.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Paste the amenity exports from PMG and Amber. The agent continuously
            highlights missing items, duplicates, and spelling discrepancies,
            suggesting the most likely matches to fix.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-slate-100 sm:text-xl">
                Paste raw amenities
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                Changes auto-refresh the analysis.
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 md:gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pmg"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  PMG Source
                </label>
                <textarea
                  id="pmg"
                  value={pmgInput}
                  onChange={(event) => setPmgInput(event.target.value)}
                  className="min-h-[220px] resize-y rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/60"
                  placeholder="Paste amenities scraped from PMG"
                />
                <button
                  type="button"
                  onClick={() => setPmgInput("")}
                  className="self-start text-xs font-medium text-indigo-300 underline-offset-4 hover:underline"
                >
                  Clear PMG list
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="amber"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  Amber Platform
                </label>
                <textarea
                  id="amber"
                  value={amberInput}
                  onChange={(event) => setAmberInput(event.target.value)}
                  className="min-h-[220px] resize-y rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="Paste amenities currently on Amber"
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAmberInput("")}
                    className="font-medium text-indigo-300 underline-offset-4 hover:underline"
                  >
                    Clear Amber list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPmgInput(DEFAULT_PMG);
                      setAmberInput(DEFAULT_AMBER);
                    }}
                    className="font-medium text-slate-400 underline-offset-4 hover:underline"
                  >
                    Load sample data
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-medium text-slate-100 sm:text-xl">
              Coverage snapshot
            </h2>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <Stat
                label="PMG total entries"
                value={analysis.totals.pmgTotal.toString()}
              />
              <Stat
                label="Amber total entries"
                value={analysis.totals.amberTotal.toString()}
              />
              <Stat
                label="Unique PMG"
                value={analysis.totals.pmgUnique.toString()}
              />
              <Stat
                label="Unique Amber"
                value={analysis.totals.amberUnique.toString()}
              />
              <Stat
                label="Exact overlaps"
                value={analysis.totals.overlap.toString()}
              />
              <Stat
                label="Coverage"
                value={`${Math.round(analysis.totals.coverage * 100)}%`}
                tone={analysis.totals.coverage > 0.85 ? "positive" : "warn"}
              />
            </div>
            <p className="text-xs text-slate-400">
              Coverage tracks the share of PMG amenities that have a perfect
              match in Amber after normalisation. Aim for 95%+ to keep listings
              consistent.
            </p>
          </aside>
        </main>

        <section className="grid gap-6 pb-12 xl:grid-cols-3">
          <AnalysisPanel
            title="Missing from Amber"
            emptyMessage="All PMG amenities are represented on Amber."
            items={analysis.missingFromAmber.map((item) => ({
              id: item.normalized,
              primary: item.variants[0],
              secondary:
                item.variants.length > 1
                  ? `PMG variations: ${item.variants.join(", ")}`
                  : undefined,
              hint: formatSuggestion(item.suggestion),
            }))}
            highlight="warn"
          />

          <AnalysisPanel
            title="Unexpected on Amber"
            emptyMessage="Amber amenities all map back to PMG."
            items={analysis.unexpectedInAmber.map((item) => ({
              id: item.normalized,
              primary: item.variants[0],
              secondary:
                item.variants.length > 1
                  ? `Amber variations: ${item.variants.join(", ")}`
                  : undefined,
              hint: formatSuggestion(item.suggestion),
            }))}
            highlight="neutral"
          />

          <AnalysisPanel
            title="Duplicate entries"
            emptyMessage="No duplicates were detected."
            items={[
              ...analysis.duplicatesInPmg.map((item) => ({
                id: `pmg-${item.normalized}`,
                primary: item.variants[0],
                secondary: `PMG duplicates: ${item.variants.slice(1).join(", ")}`,
                badge: "PMG",
              })),
              ...analysis.duplicatesInAmber.map((item) => ({
                id: `amber-${item.normalized}`,
                primary: item.variants[0],
                secondary: `Amber duplicates: ${item.variants
                  .slice(1)
                  .join(", ")}`,
                badge: "Amber",
              })),
            ]}
            highlight="error"
          />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-slate-100 sm:text-xl">
              Spelling & naming suggestions
            </h2>
            <span className="text-xs text-slate-400">
              Sorted by confidence (similarity score).
            </span>
          </div>
          {analysis.potentialTypos.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              No near matches found. Great job!
            </p>
          ) : (
            <div className="grid gap-3">
              {analysis.potentialTypos.map((item) => (
                <div
                  key={`${item.direction}-${item.source}-${item.target}`}
                  className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                      {item.direction === "pmg→amber"
                        ? "PMG missing"
                        : "Amber entry"}
                      <span className="rounded-full bg-slate-800 px-2 py-[2px] text-[10px] text-slate-300">
                        {Math.round(item.similarity * 100)}% match
                      </span>
                    </div>
                    <p className="text-base font-medium text-slate-100">
                      {item.source}
                    </p>
                    <p className="text-xs text-slate-400">
                      Suggested match:{" "}
                      <span className="text-slate-200">{item.target}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    Edit in Amber
                    <span className="h-6 w-px bg-slate-800" />
                    Distance {item.distance}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type HighlightTone = "positive" | "warn" | "error" | "neutral";

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: HighlightTone;
}) {
  const toneClasses: Record<HighlightTone, string> = {
    positive: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    warn: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    error: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    neutral: "bg-slate-800/60 text-slate-200 border-slate-700",
  };

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 ${toneClasses[tone]}`}
    >
      <span className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function AnalysisPanel({
  title,
  emptyMessage,
  items,
  highlight = "neutral",
}: {
  title: string;
  emptyMessage: string;
  highlight?: HighlightTone;
  items: {
    id: string;
    primary: string;
    secondary?: string;
    hint?: string | null;
    badge?: string;
  }[];
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-slate-100 sm:text-xl">
          {title}
        </h2>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {items.length} issues
        </span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-slate-100">
                    {item.primary}
                  </span>
                  {item.secondary ? (
                    <span className="text-xs text-slate-400">
                      {item.secondary}
                    </span>
                  ) : null}
                </div>
                {item.badge ? (
                  <span className={badgeTone(highlight)}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {item.hint ? (
                <p className="mt-3 text-xs text-slate-400">{item.hint}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function badgeTone(tone: HighlightTone) {
  switch (tone) {
    case "error":
      return "rounded-full border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-200";
    case "warn":
      return "rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200";
    case "positive":
      return "rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200";
    default:
      return "rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200";
  }
}

function formatSuggestion(suggestion: AmenitySuggestion | null) {
  if (!suggestion) {
    return null;
  }

  const variant = suggestion.variants[0];
  return `Closest match: "${variant}" (${Math.round(
    suggestion.similarity * 100,
  )}% similarity)`;
}
