"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FileText,
  Trophy,
} from "lucide-react";

import { challengePhChallenges } from "@/app/student/challenges/data";
import { cn } from "@/lib/utils";

type ProvinceProperties = {
  adm1_psgc?: number;
  adm2_psgc?: number;
  adm2_en?: string;
  geo_level?: string;
};

type ProvinceFeature = Feature<Geometry, ProvinceProperties> & {
  id?: string | number;
};

type LayoutName = "desktop" | "mobile";

type Point = {
  x: number;
  y: number;
};

type TooltipPosition = Point & {
  width?: number;
  height?: number;
};

type PositionedCallout = MapCallout & {
  resolvedAnchor: Point;
};

export type MapCallout = {
  id: string;
  provinceName: string;
  psgc?: string;
  challengeId: string;
  color: string;
  anchor: Point;
  tooltipPosition: TooltipPosition;
  mobileAnchor?: Point;
  mobileTooltipPosition?: TooltipPosition;
};

const TOPOJSON_FILES = [
  "provdists-region-100000000.topo.0.001.json",
  "provdists-region-200000000.topo.0.001.json",
  "provdists-region-300000000.topo.0.001.json",
  "provdists-region-400000000.topo.0.001.json",
  "provdists-region-500000000.topo.0.001.json",
  "provdists-region-600000000.topo.0.001.json",
  "provdists-region-700000000.topo.0.001.json",
  "provdists-region-800000000.topo.0.001.json",
  "provdists-region-900000000.topo.0.001.json",
  "provdists-region-1000000000.topo.0.001.json",
  "provdists-region-1100000000.topo.0.001.json",
  "provdists-region-1200000000.topo.0.001.json",
  "provdists-region-1300000000.topo.0.001.json",
  "provdists-region-1400000000.topo.0.001.json",
  "provdists-region-1600000000.topo.0.001.json",
  "provdists-region-1700000000.topo.0.001.json",
  "provdists-region-1900000000.topo.0.001.json",
] as const;

const TOPOJSON_BASE_PATH = "/student/ph-topojson";

const LAYOUTS = {
  desktop: {
    width: 760,
    height: 760,
    projectionExtent: [
      [330, 20],
      [750, 740],
    ] as [[number, number], [number, number]],
  },
  mobile: {
    width: 390,
    height: 720,
    projectionExtent: [
      [118, 64],
      [272, 486],
    ] as [[number, number], [number, number]],
  },
} as const;

export const mapCallouts: MapCallout[] = [
  {
    id: "northern-talent",
    provinceName: "Benguet",
    psgc: "1401100000",
    challengeId: "agri-cold-chain",
    color: "#2563EB",
    anchor: { x: 432, y: 282 },
    tooltipPosition: { x: 22, y: 50, width: 238, height: 124 },
    mobileAnchor: { x: 178, y: 214 },
    mobileTooltipPosition: { x: 18, y: 24, width: 158, height: 118 },
  },
  {
    id: "metro-adjacent",
    provinceName: "Cavite",
    psgc: "402100000",
    challengeId: "flood-ready-commutes",
    color: "#7C3AED",
    anchor: { x: 436, y: 347 },
    tooltipPosition: { x: 22, y: 182, width: 238, height: 124 },
    mobileAnchor: { x: 181, y: 252 },
    mobileTooltipPosition: { x: 16, y: 430, width: 170, height: 118 },
  },
  {
    id: "central-visayas",
    provinceName: "Cebu",
    psgc: "702200000",
    challengeId: "jeepney-demand-dashboard",
    color: "#0891B2",
    anchor: { x: 514, y: 454 },
    tooltipPosition: { x: 22, y: 314, width: 238, height: 124 },
    mobileAnchor: { x: 227, y: 316 },
    mobileTooltipPosition: { x: 208, y: 24, width: 164, height: 118 },
  },
  {
    id: "western-visayas",
    provinceName: "Iloilo",
    psgc: "603000000",
    challengeId: "sari-sari-stockouts",
    color: "#16A34A",
    anchor: { x: 483, y: 436 },
    tooltipPosition: { x: 22, y: 446, width: 238, height: 124 },
    mobileAnchor: { x: 208, y: 305 },
    mobileTooltipPosition: { x: 108, y: 570, width: 174, height: 118 },
  },
  {
    id: "mindanao-product",
    provinceName: "Davao del Sur",
    psgc: "1102400000",
    challengeId: "barangay-health-queues",
    color: "#EA580C",
    anchor: { x: 556, y: 545 },
    tooltipPosition: { x: 22, y: 578, width: 238, height: 124 },
    mobileAnchor: { x: 252, y: 370 },
    mobileTooltipPosition: { x: 204, y: 430, width: 168, height: 118 },
  },
];

const challengesById = new Map(
  challengePhChallenges.map((challenge) => [challenge.id, challenge]),
);

function normalizeProvinceName(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bprovince\b/g, "")
    .trim();
}

function getProvinceKey(feature: ProvinceFeature) {
  return String(feature.properties.adm2_psgc ?? feature.id ?? "");
}

function getProvinceName(feature: ProvinceFeature) {
  return feature.properties.adm2_en ?? `Province ${getProvinceKey(feature)}`;
}

function getCalloutProvinceKey(
  callout: MapCallout,
  provinceFeatures: ProvinceFeature[],
) {
  const psgcMatch = provinceFeatures.find((province) => {
    const featurePsgc = String(
      province.properties.adm2_psgc ?? province.id ?? "",
    );

    return featurePsgc === callout.psgc;
  });

  if (psgcMatch) {
    return getProvinceKey(psgcMatch);
  }

  const normalizedCalloutName = normalizeProvinceName(callout.provinceName);
  const nameMatch = provinceFeatures.find((province) => {
    const normalizedProvinceName = normalizeProvinceName(
      getProvinceName(province),
    );

    return (
      normalizedProvinceName === normalizedCalloutName ||
      normalizedProvinceName.includes(normalizedCalloutName) ||
      normalizedCalloutName.includes(normalizedProvinceName)
    );
  });

  return nameMatch ? getProvinceKey(nameMatch) : null;
}

async function loadProvinceFeatures() {
  const topologies = await Promise.all(
    TOPOJSON_FILES.map(async (fileName) => {
      const response = await fetch(`${TOPOJSON_BASE_PATH}/${fileName}`);

      if (!response.ok) {
        throw new Error(`Unable to load ${fileName}`);
      }

      return (await response.json()) as Topology;
    }),
  );

  return topologies.flatMap((topology) => {
    const objectName = Object.keys(topology.objects)[0];
    const geometryCollection = topology.objects[
      objectName
    ] as GeometryCollection;
    const collection = feature(
      topology,
      geometryCollection,
    ) as unknown as FeatureCollection<Geometry, ProvinceProperties>;

    return collection.features as ProvinceFeature[];
  });
}

function buildProjectedProvinces(
  provinceFeatures: ProvinceFeature[],
  layout: (typeof LAYOUTS)[LayoutName],
) {
  const collection: FeatureCollection<Geometry, ProvinceProperties> = {
    type: "FeatureCollection",
    features: provinceFeatures,
  };

  const projection = geoMercator().fitExtent(
    layout.projectionExtent,
    collection,
  );
  const pathGenerator = geoPath(projection);

  return provinceFeatures
    .map((province) => {
      const path = pathGenerator(province);

      if (!path) {
        return null;
      }

      const [centroidX, centroidY] = pathGenerator.centroid(province);

      return {
        feature: province,
        path,
        centroid: { x: centroidX, y: centroidY },
      };
    })
    .filter(Boolean) as Array<{
    feature: ProvinceFeature;
    path: string;
    centroid: Point;
  }>;
}

function getCalloutGeometry(
  callout: MapCallout | PositionedCallout,
  layoutName: LayoutName,
) {
  const desktopAnchor =
    "resolvedAnchor" in callout ? callout.resolvedAnchor : callout.anchor;

  return {
    anchor:
      layoutName === "mobile"
        ? (callout.mobileAnchor ?? callout.anchor)
        : desktopAnchor,
    tooltipPosition:
      layoutName === "mobile"
        ? (callout.mobileTooltipPosition ?? callout.tooltipPosition)
        : callout.tooltipPosition,
  };
}

function getLineStart(anchor: Point, tooltipPosition: TooltipPosition) {
  const width = tooltipPosition.width ?? 236;
  const height = tooltipPosition.height ?? 126;
  const verticalPadding = Math.min(28, height / 2 - 12);
  const exitsRight = tooltipPosition.x + width / 2 < anchor.x;
  const x = exitsRight ? tooltipPosition.x + width : tooltipPosition.x;
  const y = Math.max(
    tooltipPosition.y + verticalPadding,
    Math.min(anchor.y, tooltipPosition.y + height - verticalPadding),
  );

  return { x, y };
}

function LeaderLine({
  callout,
  isActive,
  layoutName,
}: {
  callout: MapCallout | PositionedCallout;
  isActive: boolean;
  layoutName: LayoutName;
}) {
  const { anchor, tooltipPosition } = getCalloutGeometry(callout, layoutName);
  const start = getLineStart(anchor, tooltipPosition);
  const controlX = start.x + (anchor.x - start.x) * 0.55;
  const controlY = start.y + (anchor.y - start.y) * 0.1;
  const path = `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${anchor.x} ${anchor.y}`;

  return (
    <g aria-hidden="true">
      <motion.path
        d={path}
        fill="none"
        stroke={callout.color}
        strokeLinecap="round"
        initial={false}
        animate={{
          opacity: isActive ? 0.92 : 0.42,
          pathLength: isActive ? 1 : 0.96,
          strokeWidth: isActive ? 2.6 : 1.4,
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
      <motion.circle
        cx={anchor.x}
        cy={anchor.y}
        r={isActive ? 5.4 : 3.6}
        fill={callout.color}
        initial={false}
        animate={{
          opacity: isActive ? 0.95 : 0.68,
          scale: isActive ? 1.12 : 1,
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
    </g>
  );
}

function MapTooltip({
  callout,
  isActive,
  layoutName,
  onActivate,
  onDeactivate,
}: {
  callout: MapCallout | PositionedCallout;
  isActive: boolean;
  layoutName: LayoutName;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const { tooltipPosition } = getCalloutGeometry(callout, layoutName);
  const width = tooltipPosition.width ?? 236;
  const height = tooltipPosition.height ?? 126;
  const challenge = challengesById.get(callout.challengeId);
  const title = challenge?.shortTitle ?? "Challenge brief";
  const company = challenge?.host ?? "Challenge PH";
  const href = challenge
    ? `/challenges/${challenge.id}`
    : "/super-listing/search";

  return (
    <motion.foreignObject
      x={tooltipPosition.x}
      y={tooltipPosition.y}
      width={width}
      height={height}
      initial={false}
      animate={{
        scale: isActive ? 1.045 : 1,
        filter: isActive ? "brightness(1.05)" : "brightness(1)",
      }}
      style={{
        overflow: "visible",
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div
        tabIndex={0}
        className={cn(
          "group flex h-full w-full flex-col items-start rounded-[0.33em] border border-[#dbe6f5] bg-white/95 px-4 py-3 text-left shadow-[0_20px_58px_-50px_rgba(8,26,58,0.7)] outline-none backdrop-blur transition-all duration-200 focus-visible:ring-4",
          "hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_28px_80px_-56px_rgba(8,26,58,0.9)] focus-visible:-translate-y-0.5 focus-visible:ring-4",
        )}
        style={{
          ["--callout-color" as string]: callout.color,
          ["--tw-ring-color" as string]: `${callout.color}33`,
          boxShadow: isActive
            ? `0 26px 72px ${callout.color}30`
            : "0 20px 58px -50px rgba(8, 26, 58, 0.7)",
        }}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        onFocusCapture={onActivate}
        onBlurCapture={onDeactivate}
        aria-label={`${company}: ${title}`}
      >
        <span
          className="rounded-[0.33em] px-2.5 py-1 [font-family:var(--font-challenge-ph-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105"
          style={{ backgroundColor: callout.color }}
        >
          {company}
        </span>
        <span className="mt-2 line-clamp-2 [font-family:var(--font-challenge-ph-heading)] text-[16px] font-black leading-[1.05] tracking-[-0.04em] text-[#081A3A]">
          {title}
        </span>
        <span className="mt-auto inline-flex items-center gap-1 [font-family:var(--font-challenge-ph-heading)] text-xs font-bold text-[#0D6BFF]">
          <Link href={href} className="inline-flex items-center gap-1">
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </span>
      </div>
    </motion.foreignObject>
  );
}

function MapProvince({
  name,
  path,
  centroid,
  glowFilterId,
  isActive,
  onActivate,
  onDeactivate,
}: {
  name: string;
  path: string;
  centroid: Point;
  glowFilterId: string;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <motion.path
      d={path}
      tabIndex={0}
      role="img"
      aria-label={name}
      className="cursor-pointer outline-none"
      vectorEffect="non-scaling-stroke"
      initial={false}
      animate={{
        fill: isActive ? "#9AA4B2" : "#DDE2E8",
        stroke: isActive ? "#64748B" : "#FFFFFF",
        strokeWidth: isActive ? 1.8 : 1.05,
        scale: isActive ? 1.018 : 1,
      }}
      style={{
        filter: isActive ? `url(#${glowFilterId})` : "none",
        transformBox: "view-box",
        transformOrigin: `${centroid.x}px ${centroid.y}px`,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <title>{name}</title>
    </motion.path>
  );
}

function PhilippinesMap({
  provinceFeatures,
  layoutName,
}: {
  provinceFeatures: ProvinceFeature[];
  layoutName: LayoutName;
}) {
  const [activeCalloutId, setActiveCalloutId] = useState<string | null>(
    mapCallouts[0]?.id ?? null,
  );
  const [activeProvinceKey, setActiveProvinceKey] = useState<string | null>(
    null,
  );
  const layout = LAYOUTS[layoutName];
  const glowFilterId = `province-glow-${layoutName}`;

  const projectedProvinces = useMemo(
    () => buildProjectedProvinces(provinceFeatures, layout),
    [layout, provinceFeatures],
  );

  const calloutProvinceKeys = useMemo(() => {
    return new Map(
      mapCallouts.map((callout) => [
        callout.id,
        getCalloutProvinceKey(callout, provinceFeatures),
      ]),
    );
  }, [provinceFeatures]);

  const provinceCentroidsByKey = useMemo(() => {
    return new Map(
      projectedProvinces.map(({ feature: province, centroid }) => [
        getProvinceKey(province),
        centroid,
      ]),
    );
  }, [projectedProvinces]);

  const positionedCallouts = useMemo<PositionedCallout[]>(() => {
    return mapCallouts.map((callout) => {
      const provinceKey = calloutProvinceKeys.get(callout.id);
      const resolvedAnchor = provinceKey
        ? (provinceCentroidsByKey.get(provinceKey) ?? callout.anchor)
        : callout.anchor;

      return {
        ...callout,
        resolvedAnchor,
      };
    });
  }, [calloutProvinceKeys, provinceCentroidsByKey]);

  const activeLinkedProvinceKey = activeCalloutId
    ? calloutProvinceKeys.get(activeCalloutId)
    : null;

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className="h-auto w-full"
      role="img"
      aria-labelledby={`philippines-map-title-${layoutName} philippines-map-description-${layoutName}`}
    >
      <title id={`philippines-map-title-${layoutName}`}>
        Philippines province infographic map
      </title>
      <desc id={`philippines-map-description-${layoutName}`}>
        A custom SVG map of Philippine provinces with always-visible statistics
        callouts.
      </desc>
      <defs>
        <filter
          id={glowFilterId}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="5"
            floodColor="#64748B"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      <g>
        {projectedProvinces.map(({ feature: province, path, centroid }) => {
          const provinceKey = getProvinceKey(province);
          const provinceName = getProvinceName(province);
          const isActive =
            activeProvinceKey === provinceKey ||
            activeLinkedProvinceKey === provinceKey;

          return (
            <MapProvince
              key={provinceKey}
              name={provinceName}
              path={path}
              centroid={centroid}
              glowFilterId={glowFilterId}
              isActive={isActive}
              onActivate={() => setActiveProvinceKey(provinceKey)}
              onDeactivate={() => setActiveProvinceKey(null)}
            />
          );
        })}
      </g>

      <g>
        {positionedCallouts.map((callout) => (
          <LeaderLine
            key={callout.id}
            callout={callout}
            layoutName={layoutName}
            isActive={activeCalloutId === callout.id}
          />
        ))}
      </g>

      <g>
        {positionedCallouts.map((callout) => (
          <MapTooltip
            key={callout.id}
            callout={callout}
            layoutName={layoutName}
            isActive={activeCalloutId === callout.id}
            onActivate={() => setActiveCalloutId(callout.id)}
            onDeactivate={() => setActiveCalloutId(null)}
          />
        ))}
      </g>
    </svg>
  );
}

const guideSteps = [
  {
    icon: FileText,
    eyebrow: "1. Pick a brief",
    title: "Start with a real Philippine problem.",
    body: "Each Challenge PH brief frames a concrete issue, the people affected, the reward, and the kind of output reviewers want to see.",
  },
  {
    icon: Compass,
    eyebrow: "2. Build the proof",
    title: "Show how you think, not where you studied.",
    body: "Submit a prototype, workflow, analysis, demo, or implementation plan. Strong entries make tradeoffs clear and work within local constraints.",
  },
  {
    icon: Trophy,
    eyebrow: "3. Get noticed",
    title: "Win bounties, pilots, or internship paths.",
    body: "Hosts review the work directly. The best submissions can lead to cash rewards, showcases, shortlist opportunities, or follow-up projects.",
  },
] as const;

const entranceTransition = {
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1],
} as const;

const entranceViewport = {
  once: true,
  margin: "-80px",
} as const;

function GuideSection() {
  return (
    <section className="relative bg-[#f7fbff] px-4 py-14 text-[#081A3A] sm:px-6 sm:py-18 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(13,107,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,107,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-60 [mask-image:linear-gradient(to_bottom,#000_0%,transparent_78%)]" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={entranceViewport}
          transition={entranceTransition}
        >
          <div>
            <p className="[font-family:var(--font-challenge-ph-mono)] text-xs font-semibold uppercase tracking-[0.14em] text-[#0D6BFF]">
              Guide
            </p>
            <h2 className="mt-3 [font-family:var(--font-challenge-ph-heading)] text-[clamp(2rem,5vw,4.5rem)] font-black leading-[0.98] tracking-[-0.06em]">
              How Challenge PH works
            </h2>
          </div>
          <p className="max-w-2xl text-sm font-semibold leading-7 text-[#28466f] sm:text-base sm:leading-8">
            Challenge PH is for students and early-career builders who want to
            prove they can solve real problems. Instead of starting with a
            resume screen, you start with a brief and submit useful work.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {guideSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.eyebrow}
                className="rounded-[0.33em] border border-[#dbe6f5] bg-white/92 p-5 shadow-[0_24px_70px_-60px_rgba(8,26,58,0.72)] backdrop-blur"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={entranceViewport}
                transition={{
                  ...entranceTransition,
                  delay: index * 0.08,
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[0.33em] bg-[#eef7ff] text-[#0D6BFF]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 [font-family:var(--font-challenge-ph-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-[#28466f]/58">
                  {step.eyebrow}
                </p>
                <h3 className="mt-2 [font-family:var(--font-challenge-ph-heading)] text-xl font-black leading-tight tracking-[-0.04em] text-[#081A3A]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#28466f]">
                  {step.body}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          className="mt-5 rounded-[0.33em] border border-[#0D6BFF]/20 bg-[#eef7ff] p-5"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={entranceViewport}
          transition={entranceTransition}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#0D6BFF]" />
                <h3 className="[font-family:var(--font-challenge-ph-heading)] text-xl font-black tracking-[-0.035em] text-[#081A3A]">
                  Built for practical, local execution.
                </h3>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#28466f]">
                You can join solo or with a small team. The goal is not a
                perfect startup pitch; it is clear thinking, useful output, and
                a solution that could survive real Philippine conditions.
              </p>
            </div>
            <Link
              href="/super-listing/search"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[0.33em] bg-[#0D6BFF] px-4 [font-family:var(--font-challenge-ph-heading)] text-sm font-bold text-white transition-colors hover:bg-[#0A56CC]"
            >
              Browse briefs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <motion.footer
      className="relative isolate flex min-h-[50vh] items-start overflow-hidden border-t border-white/10 bg-black bg-[url('/super-listings/bg4.png')] bg-cover bg-bottom px-4 pb-12 pt-14 text-white sm:px-6 sm:pt-16 lg:px-8 lg:pt-18"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={entranceViewport}
      transition={entranceTransition}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="[font-family:var(--font-challenge-ph-heading)] text-3xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
            Challenge PH
          </p>
          <p className="mt-4 text-base font-semibold leading-7 text-white/78 sm:text-lg">
            Real briefs for students building practical Philippine solutions.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 [font-family:var(--font-challenge-ph-heading)] text-sm font-bold text-white/72"
          aria-label="Footer navigation"
        >
          <Link href="/super-listing/search" className="hover:text-white">
            Browse briefs
          </Link>
          <Link href="/PrivacyPolicy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/TermsConditions" className="hover:text-white">
            Terms
          </Link>
        </nav>
      </div>
    </motion.footer>
  );
}

export default function PhilippinesInfographicMap() {
  const [provinceFeatures, setProvinceFeatures] = useState<ProvinceFeature[]>(
    [],
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadProvinceFeatures()
      .then((features) => {
        if (isMounted) {
          setProvinceFeatures(features);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load province boundaries.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <section className="grid min-h-screen overflow-hidden bg-white lg:grid-cols-2">
        <motion.div
          className="relative isolate flex min-h-[55rem] flex-col overflow-hidden bg-black px-4 pb-10 pt-5 text-[#FFF7E8] sm:px-6 lg:min-h-screen lg:px-10 xl:px-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={entranceTransition}
        >
          <div className="pointer-events-none absolute inset-0 bg-[url('/super-listings/bg.png')] bg-cover bg-center opacity-[0.9]" />

          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <div className="flex flex-1 items-center py-16 sm:py-20 lg:py-12">
              <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                <p className="mx-auto inline-flex rounded-[0.33em] border border-white/35 bg-black/28 px-3 py-1 [font-family:var(--font-challenge-ph-mono)] text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_34px_-26px_rgba(255,255,255,0.55)] backdrop-blur lg:mx-0">
                  Bounties for real Philippine problems
                </p>
                <h1
                  className="mt-5 [font-family:var(--font-challenge-ph-heading)] text-[clamp(3.3rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.06em] text-white"
                  style={{ textShadow: "0 5px 22px rgba(0, 0, 0, 0.55)" }}
                >
                  Challenge PH
                </h1>
                <p
                  className="mx-auto mt-5 max-w-lg text-balance text-sm font-bold leading-6 text-white/90 sm:text-lg sm:leading-8 lg:mx-0"
                  style={{ textShadow: "0 3px 14px rgba(0, 0, 0, 0.45)" }}
                >
                  Pick a real-world problem, study the brief, and build a
                  solution that can earn a bounty, pilot opportunity, or
                  internship path.
                </p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    href="/super-listing/search"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[0.33em] bg-[#0D6BFF] px-5 [font-family:var(--font-challenge-ph-heading)] text-sm font-bold text-white shadow-[0_18px_54px_-40px_rgba(13,107,255,0.8)] transition-colors hover:bg-[#0A56CC] sm:w-auto"
                  >
                    See all challenges
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative flex min-h-[620px] items-center justify-center overflow-hidden bg-white px-0 py-6 lg:min-h-screen"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...entranceTransition, delay: 0.12 }}
        >
          <div className="w-[112%] max-w-[58rem] -translate-x-[1.5%] md:w-[104%] lg:w-[112%] xl:w-[108%]">
            {loadError ? (
              <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-sm font-semibold text-[#28466f]">
                {loadError}
              </div>
            ) : provinceFeatures.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <PhilippinesMap
                    provinceFeatures={provinceFeatures}
                    layoutName="desktop"
                  />
                </div>
                <div className="md:hidden">
                  <PhilippinesMap
                    provinceFeatures={provinceFeatures}
                    layoutName="mobile"
                  />
                </div>
              </>
            ) : (
              <div className="flex min-h-[520px] items-center justify-center px-6 text-center [font-family:var(--font-challenge-ph-mono)] text-xs font-semibold uppercase tracking-[0.14em] text-[#28466f]/70">
                Loading province boundaries...
              </div>
            )}
          </div>
        </motion.div>
      </section>
      <GuideSection />
      <LandingFooter />
    </>
  );
}
