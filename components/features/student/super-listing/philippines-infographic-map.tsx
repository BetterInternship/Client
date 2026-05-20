"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { ArrowRight } from "lucide-react";

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
    id: "cagayan-ofw",
    provinceName: "Cagayan",
    psgc: "201500000",
    challengeId: "ofw-remittance-helper",
    color: "#2388ff",
    anchor: { x: 540, y: 146 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 202, y: 156 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "benguet-agri",
    provinceName: "Benguet",
    psgc: "1401100000",
    challengeId: "agri-cold-chain",
    color: "#2388ff",
    anchor: { x: 495, y: 215 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 178, y: 214 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "pangasinan-skills",
    provinceName: "Pangasinan",
    psgc: "105500000",
    challengeId: "shs-skills-mapper",
    color: "#2388ff",
    anchor: { x: 477, y: 240 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 174, y: 232 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "cavite-flood",
    provinceName: "Cavite",
    psgc: "402100000",
    challengeId: "flood-ready-commutes",
    color: "#2388ff",
    anchor: { x: 501, y: 318 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 181, y: 252 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "albay-health",
    provinceName: "Albay",
    psgc: "500500000",
    challengeId: "barangay-health-queues",
    color: "#2388ff",
    anchor: { x: 620, y: 365 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 222, y: 268 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "palawan-plastic",
    provinceName: "Palawan",
    psgc: "1705300000",
    challengeId: "coastal-plastic-recovery",
    color: "#2388ff",
    anchor: { x: 409, y: 508 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 160, y: 342 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "iloilo-stockout",
    provinceName: "Iloilo",
    psgc: "603000000",
    challengeId: "sari-sari-stockouts",
    color: "#2388ff",
    anchor: { x: 576, y: 462 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 208, y: 305 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "cebu-jeepney",
    provinceName: "Cebu",
    psgc: "702200000",
    challengeId: "jeepney-demand-dashboard",
    color: "#2388ff",
    anchor: { x: 626, y: 491 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 227, y: 316 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "leyte-plastic",
    provinceName: "Leyte",
    psgc: "803700000",
    challengeId: "coastal-plastic-recovery",
    color: "#2388ff",
    anchor: { x: 669, y: 464 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 240, y: 306 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "bukidnon-agri",
    provinceName: "Bukidnon",
    psgc: "1001300000",
    challengeId: "agri-cold-chain",
    color: "#2388ff",
    anchor: { x: 680, y: 593 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 247, y: 350 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "zamboanga-stockout",
    provinceName: "Zamboanga del Sur",
    psgc: "907300000",
    challengeId: "sari-sari-stockouts",
    color: "#2388ff",
    anchor: { x: 593, y: 608 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 214, y: 360 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
  },
  {
    id: "davao-health",
    provinceName: "Davao del Sur",
    psgc: "1102400000",
    challengeId: "barangay-health-queues",
    color: "#2388ff",
    anchor: { x: 695, y: 637 },
    tooltipPosition: { x: 36, y: 70, width: 238, height: 124 },
    mobileAnchor: { x: 252, y: 370 },
    mobileTooltipPosition: { x: 18, y: 24, width: 170, height: 118 },
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
  return { x: tooltipPosition.x + width, y: anchor.y };
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
  const path = `M ${start.x} ${start.y} L ${anchor.x} ${anchor.y}`;

  return (
    <motion.g
      aria-hidden="true"
      style={{
        transformBox: "view-box",
        transformOrigin: `${anchor.x}px ${anchor.y}px`,
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <path
        d={path}
        fill="none"
        stroke={callout.color}
        strokeLinecap="round"
        strokeDasharray="2 7"
        strokeWidth={2}
        opacity={0.88}
      />
    </motion.g>
  );
}

function MapTooltip({
  callout,
  isActive,
  layoutName,
}: {
  callout: MapCallout | PositionedCallout;
  isActive: boolean;
  layoutName: LayoutName;
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        overflow: "visible",
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
      transition={{ duration: 0.22, delay: 0.36, ease: "easeOut" }}
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
          boxShadow: `0 26px 72px ${callout.color}30`,
        }}
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
        <span className="mt-auto inline-flex items-center gap-1 [font-family:var(--font-challenge-ph-heading)] text-xs font-bold text-[#2388ff]">
          <Link href={href} className="inline-flex items-center gap-1">
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </span>
      </div>
    </motion.foreignObject>
  );
}

function MapProvince({ name, path }: { name: string; path: string }) {
  return (
    <path
      d={path}
      aria-label={name}
      className="pointer-events-none"
      vectorEffect="non-scaling-stroke"
      fill="#DDE2E8"
      stroke="#FFFFFF"
      strokeWidth={1.05}
    >
      <title>{name}</title>
    </path>
  );
}

function MapDot({
  callout,
  layoutName,
  isActive,
  onActivate,
  onDeactivate,
}: {
  callout: PositionedCallout;
  layoutName: LayoutName;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const { anchor } = getCalloutGeometry(callout, layoutName);
  const challenge = challengesById.get(callout.challengeId);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={
        challenge ? `${challenge.host}: ${challenge.shortTitle}` : "Challenge"
      }
      className="cursor-pointer outline-none"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <motion.circle
        cx={anchor.x}
        cy={anchor.y}
        r={5}
        fill="none"
        stroke="#66c2ff"
        strokeWidth={2}
        initial={false}
        animate={
          isActive
            ? { r: [5, 18], opacity: [0.7, 0] }
            : { r: 5, opacity: 0 }
        }
        transition={
          isActive
            ? { repeat: Infinity, duration: 1.1, ease: "easeOut" }
            : { duration: 0.15 }
        }
      />
      <motion.circle
        cx={anchor.x}
        cy={anchor.y}
        r={4}
        fill={callout.color}
        stroke="#FFFFFF"
        strokeWidth={2}
        initial={false}
        animate={{ r: isActive ? 5.3 : 4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </g>
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
  const [isDotInteracting, setIsDotInteracting] = useState(false);
  const layout = LAYOUTS[layoutName];

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

  useEffect(() => {
    if (isDotInteracting || positionedCallouts.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveCalloutId((currentId) => {
        const currentIndex = positionedCallouts.findIndex(
          (callout) => callout.id === currentId,
        );
        const nextIndex = (currentIndex + 1) % positionedCallouts.length;

        return positionedCallouts[nextIndex].id;
      });
    }, 2500);

    return () => window.clearInterval(interval);
  }, [isDotInteracting, positionedCallouts]);

  const activeCallout =
    positionedCallouts.find((callout) => callout.id === activeCalloutId) ??
    positionedCallouts[0];

  const dynamicActiveCallout = (() => {
    if (!activeCallout) return null;
    const anchor =
      layoutName === "mobile"
        ? (activeCallout.mobileAnchor ?? activeCallout.resolvedAnchor)
        : activeCallout.resolvedAnchor;
    const tooltipPos =
      layoutName === "mobile"
        ? (activeCallout.mobileTooltipPosition ?? activeCallout.tooltipPosition)
        : activeCallout.tooltipPosition;
    const cardHeight = tooltipPos.height ?? 124;
    const margin = 20;
    const newY = Math.max(
      margin,
      Math.min(anchor.y - cardHeight / 2, layout.height - cardHeight - margin),
    );
    if (layoutName === "mobile") {
      return {
        ...activeCallout,
        mobileTooltipPosition: {
          ...(activeCallout.mobileTooltipPosition ?? activeCallout.tooltipPosition),
          y: newY,
        },
      };
    }
    return {
      ...activeCallout,
      tooltipPosition: { ...activeCallout.tooltipPosition, y: newY },
    };
  })();

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
        A custom SVG map of Philippine provinces with challenge locations and
        rotating challenge cards.
      </desc>
      <g>
        {projectedProvinces.map(({ feature: province, path }) => {
          const provinceName = getProvinceName(province);

          return (
            <MapProvince
              key={getProvinceKey(province)}
              name={provinceName}
              path={path}
            />
          );
        })}
      </g>

      <g>
        {dynamicActiveCallout ? (
          <LeaderLine
            key={dynamicActiveCallout.id}
            callout={dynamicActiveCallout}
            layoutName={layoutName}
            isActive
          />
        ) : null}
      </g>

      <g>
        {positionedCallouts.map((callout) => (
          <MapDot
            key={callout.id}
            callout={callout}
            layoutName={layoutName}
            isActive={activeCalloutId === callout.id}
            onActivate={() => {
              setIsDotInteracting(true);
              setActiveCalloutId(callout.id);
            }}
            onDeactivate={() => setIsDotInteracting(false)}
          />
        ))}
      </g>

      <g>
        {dynamicActiveCallout ? (
          <MapTooltip
            key={dynamicActiveCallout.id}
            callout={dynamicActiveCallout}
            layoutName={layoutName}
            isActive
          />
        ) : null}
      </g>
    </svg>
  );
}

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
    <section className="relative bg-white text-[#081A3A] mt-12">
      <div className="pointer-events-none absolute inset-0 bg-[size:44px_44px] opacity-60 [mask-image:linear-gradient(to_bottom,#000_0%,transparent_78%)]" />
      <div className="relative w-full p-0">
        {/* <motion.div
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={entranceViewport}
          transition={entranceTransition}
        > */}
        {/* <div>
            <p className="[font-family:var(--font-challenge-ph-mono)] text-xs font-semibold uppercase tracking-[0.14em] text-[#2388ff]">
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
          </p> */}
        <img
          src="/images/how.png"
          className="w-full h-full object-contain"
        ></img>
        {/* </motion.div> */}

        {/* <div className="mt-8 grid gap-4 md:grid-cols-3">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-[0.33em] bg-[#eef7ff] text-[#2388ff]">
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
        </div> */}

        {/* <motion.div
          className="mt-5 rounded-[0.33em] border border-[#0D6BFF]/20 bg-[#eef7ff] p-5"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={entranceViewport}
          transition={entranceTransition}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#2388ff]" />
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
        </motion.div> */}
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
                <p className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-2 [font-family:var(--font-challenge-ph-mono)] text-xs font-bold uppercase tracking-[0.08em] text-[#66c2ff] backdrop-blur lg:mx-0">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#2388ff] shadow-[0_0_18px_#2388ff]" />
                  Bounties for real Philippine problems
                </p>
                <h1 className="mt-6 [font-family:var(--font-challenge-ph-heading)] text-[clamp(3.3rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.06em]">
                  <span className="bg-gradient-to-r from-white via-[#8cd3ff] to-[#2388ff] bg-clip-text text-transparent">
                    Challenge PH
                  </span>
                </h1>
                <p className="mx-auto mt-5 max-w-lg text-balance text-[clamp(15px,1.4vw,18px)] font-semibold leading-[1.72] text-[#9aa8c7] lg:mx-0">
                  Pick a real-world problem, study the brief, and build a
                  solution that can earn a bounty, pilot opportunity, or
                  internship path.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
                  <Link
                    href="/super-listing/search"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-white via-[#79caff] to-[#2388ff] px-5 [font-family:var(--font-challenge-ph-heading)] text-sm font-extrabold text-[#06111f] shadow-[0_18px_48px_rgba(35,136,255,0.34)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(35,136,255,0.46)]"
                  >
                    See all challenges
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/super-listing/search"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.045] px-5 [font-family:var(--font-challenge-ph-heading)] text-sm font-bold text-white backdrop-blur transition-[background,border-color] hover:border-white/[0.24] hover:bg-white/[0.09]"
                  >
                    View the map
                  </Link>
                </div>
                <div className="mx-auto mt-10 grid max-w-[540px] grid-cols-3 gap-3 lg:mx-0">
                  <div className="rounded-[1.25rem] border border-white/[0.12] bg-white/[0.045] p-4 backdrop-blur">
                    <strong className="block text-[1.6rem] font-black leading-none text-white [font-family:var(--font-challenge-ph-heading)]">8</strong>
                    <span className="mt-2 block text-[13px] leading-tight text-[#9aa8c7]">open challenges</span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/[0.12] bg-white/[0.045] p-4 backdrop-blur">
                    <strong className="block text-[1.6rem] font-black leading-none text-white [font-family:var(--font-challenge-ph-heading)]">12</strong>
                    <span className="mt-2 block text-[13px] leading-tight text-[#9aa8c7]">pinned locations</span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/[0.12] bg-white/[0.045] p-4 backdrop-blur">
                    <strong className="block text-[1.6rem] font-black leading-none text-white [font-family:var(--font-challenge-ph-heading)]">Free</strong>
                    <span className="mt-2 block text-[13px] leading-tight text-[#9aa8c7]">to participate</span>
                  </div>
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
