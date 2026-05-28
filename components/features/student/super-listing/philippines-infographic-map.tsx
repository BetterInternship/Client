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
      [170, 20],
      [590, 740],
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
  const height = tooltipPosition.height ?? 126;
  const sideY = tooltipPosition.y + height * 0.5;

  if (anchor.x < tooltipPosition.x) {
    return {
      x: tooltipPosition.x,
      y: sideY,
    };
  }

  if (anchor.x > tooltipPosition.x + width) {
    return {
      x: tooltipPosition.x + width,
      y: sideY,
    };
  }

  return {
    x: Math.max(
      tooltipPosition.x,
      Math.min(anchor.x, tooltipPosition.x + width),
    ),
    y:
      tooltipPosition.y < anchor.y
        ? tooltipPosition.y + height
        : tooltipPosition.y,
  };
}

function SignalTrace({
  callout,
  layoutName,
}: {
  callout: MapCallout | PositionedCallout;
  layoutName: LayoutName;
}) {
  const { anchor, tooltipPosition } = getCalloutGeometry(callout, layoutName);
  const end = getLineStart(anchor, tooltipPosition);
  const direction = end.x < anchor.x ? -1 : 1;
  const bendX = anchor.x + direction * (layoutName === "mobile" ? 44 : 84);
  const bendY = Math.min(anchor.y - (layoutName === "mobile" ? 22 : 48), end.y);
  const path = `M ${anchor.x} ${anchor.y} L ${bendX} ${bendY} H ${end.x}`;

  return (
    <g aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="rgba(255,211,106,0.7)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.1}
        filter="url(#challengeph-line-glow)"
        opacity={0.22}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="#FFD36A"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        filter="url(#challengeph-line-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.96 }}
        transition={{ duration: 0.48, delay: 0.15, ease: "easeOut" }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="#FFF2B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        strokeDasharray="2 42"
        filter="url(#challengeph-line-glow)"
        initial={{ pathLength: 0, opacity: 0, strokeDashoffset: 0 }}
        animate={{ pathLength: 1, opacity: [0, 0.9, 0], strokeDashoffset: -96 }}
        transition={{ duration: 0.58, delay: 0.16, ease: "easeOut" }}
      />
    </g>
  );
}

function MapTooltip({
  callout,
  isActive: _isActive,
  layoutName,
  onActivate,
  onDeactivate,
}: {
  callout: MapCallout | PositionedCallout;
  isActive: boolean;
  layoutName: LayoutName;
  onActivate?: () => void;
  onDeactivate?: () => void;
}) {
  const { tooltipPosition } = getCalloutGeometry(callout, layoutName);
  const width = tooltipPosition.width ?? 236;
  const height = tooltipPosition.height ?? 122;
  const challenge = challengesById.get(callout.challengeId);
  const title = challenge?.shortTitle ?? "Challenge brief";
  const company = challenge?.host ?? "Challenge PH";
  const summary =
    challenge?.summary ??
    "Design a practical solution for a real Philippine challenge.";
  const amount =
    challenge?.reward.match(/(PHP[\s\d,]+)/i)?.[1]?.trim() ??
    challenge?.reward ??
    "Bounty";

  return (
    <motion.foreignObject
      x={tooltipPosition.x}
      y={tooltipPosition.y}
      width={width}
      height={height}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        overflow: "visible",
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
      transition={{ duration: 0.3, delay: 0.64, ease: "easeOut" }}
    >
      <div
        tabIndex={0}
        className={cn(
          "group relative flex h-full w-full flex-col items-start overflow-hidden rounded-[0.65rem] border border-[#FFC83D]/50 bg-[linear-gradient(135deg,rgba(27,20,9,0.95),rgba(5,20,46,0.94))] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_24px_rgba(255,200,61,0.18),0_20px_60px_rgba(3,18,38,0.42)] outline-none backdrop-blur-2xl transition-all duration-200 focus-visible:ring-4",
          "hover:-translate-y-0.5 hover:border-[#FFC83D]/75 focus-visible:-translate-y-0.5 focus-visible:ring-[#FFC83D]/25",
        )}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        style={{
          ["--callout-color" as string]: callout.color,
          boxShadow:
            "0 0 0 1px rgba(255,200,61,0.16), 0 0 24px rgba(255,200,61,0.18), 0 20px 60px rgba(3,18,38,0.42)",
        }}
        aria-label={`${company}: ${title}`}
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_12%,rgba(255,200,61,0.16),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.045),transparent_48%)] opacity-95" />
        <span className="relative line-clamp-2 [font-family:var(--font-challenge-ph-heading)] text-base font-black leading-[1.08] tracking-[-0.035em] text-[#FFF7E8]">
          {title}
        </span>
        <span className="relative mt-2 line-clamp-3 text-[0.7rem] font-semibold leading-[1.45] text-[#D8CDB5]">
          {summary}
        </span>
        <span className="relative mt-auto [font-family:var(--font-challenge-ph-heading)] text-lg font-black tracking-[-0.035em] text-[#FFC83D] drop-shadow-[0_0_10px_rgba(255,200,61,0.38)]">
          {amount}
        </span>
      </div>
    </motion.foreignObject>
  );
}

function MapProvince({
  name,
  path,
  index = 0,
  variant = "interactive",
}: {
  name: string;
  path: string;
  index?: number;
  variant?: "interactive" | "background";
}) {
  const isBackground = variant === "background";
  const provinceShade = 0.74 + (index % 5) * 0.045;

  return (
    <path
      d={path}
      aria-label={name}
      className="pointer-events-none transition-colors duration-300"
      vectorEffect="non-scaling-stroke"
      fill={
        isBackground
          ? "rgba(140, 200, 255, 0.20)"
          : `rgba(185, 222, 255, ${provinceShade})`
      }
      stroke={
        isBackground ? "rgba(140, 200, 255, 0.45)" : "rgba(255, 255, 255, 0.72)"
      }
      strokeWidth={isBackground ? 0.7 : 0.68}
      opacity={isBackground ? 0.78 : 1}
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
  const isWarmSignal = isActive;
  const coreColor = isWarmSignal ? "#FF9D3D" : "#0D6BFF";
  const ringColor = isWarmSignal ? "#FFD36A" : "#8CC8FF";
  const glowFill = isWarmSignal
    ? "rgba(255,157,61,0.24)"
    : "rgba(45,125,255,0.18)";
  const glowFilter = isWarmSignal
    ? "url(#challengeph-warm-node-glow)"
    : "url(#challengeph-node-glow)";

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
      <circle
        cx={anchor.x}
        cy={anchor.y}
        r={18}
        fill="transparent"
        pointerEvents="all"
      />
      <motion.circle
        cx={anchor.x}
        cy={anchor.y}
        r={8}
        fill="none"
        stroke={ringColor}
        strokeWidth={2}
        pointerEvents="none"
        initial={false}
        animate={
          isActive
            ? { r: [8, 34], opacity: [0.9, 0] }
            : { r: [7, 24], opacity: [0.35, 0] }
        }
        transition={
          isActive
            ? { repeat: Infinity, duration: 1.35, ease: "easeOut" }
            : { repeat: Infinity, duration: 2.4, ease: "easeOut" }
        }
      />
      <circle
        cx={anchor.x}
        cy={anchor.y}
        r={isWarmSignal ? 15 : 12}
        fill={glowFill}
        filter={glowFilter}
        pointerEvents="none"
      />
      <circle
        cx={anchor.x}
        cy={anchor.y}
        r={isWarmSignal ? 24 : 18}
        fill="none"
        stroke={ringColor}
        strokeOpacity={isWarmSignal ? 0.18 : 0.12}
        strokeWidth={1}
        pointerEvents="none"
      />
      <motion.circle
        cx={anchor.x}
        cy={anchor.y}
        r={5.5}
        fill={coreColor}
        stroke="#EAF6FF"
        strokeWidth={2.2}
        filter={glowFilter}
        pointerEvents="none"
        initial={false}
        animate={{ r: isActive ? 7 : 5.5 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </g>
  );
}

function PhilippinesMap({
  provinceFeatures,
  layoutName,
  variant = "interactive",
}: {
  provinceFeatures: ProvinceFeature[];
  layoutName: LayoutName;
  variant?: "interactive" | "background";
}) {
  const isBackground = variant === "background";
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
    if (isBackground || isDotInteracting || positionedCallouts.length === 0) {
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
    }, 6000);

    return () => window.clearInterval(interval);
  }, [isBackground, isDotInteracting, positionedCallouts]);

  const activeCallout =
    positionedCallouts.find((callout) => callout.id === activeCalloutId) ??
    positionedCallouts[0];

  const dynamicActiveCallout = (() => {
    if (!activeCallout) return null;
    const anchor =
      layoutName === "mobile"
        ? (activeCallout.mobileAnchor ?? activeCallout.resolvedAnchor)
        : activeCallout.resolvedAnchor;
    const cardWidth = layoutName === "mobile" ? 188 : 252;
    const cardHeight = layoutName === "mobile" ? 132 : 140;
    const margin = layoutName === "mobile" ? 12 : 18;
    const gap = layoutName === "mobile" ? 42 : 86;
    const shouldPlaceRight = anchor.x < layout.width / 2;
    const rightX = anchor.x + gap;
    const leftX = anchor.x - cardWidth - gap;
    const preferredX = shouldPlaceRight ? rightX : leftX;
    const fallbackX = shouldPlaceRight ? leftX : rightX;
    const fitsPreferred =
      preferredX >= margin && preferredX + cardWidth <= layout.width - margin;
    const newX = Math.max(
      margin,
      Math.min(
        fitsPreferred ? preferredX : fallbackX,
        layout.width - cardWidth - margin,
      ),
    );
    const newY = Math.max(
      margin,
      Math.min(
        anchor.y - cardHeight * 0.76,
        layout.height - cardHeight - margin,
      ),
    );
    if (layoutName === "mobile") {
      return {
        ...activeCallout,
        mobileTooltipPosition: {
          ...(activeCallout.mobileTooltipPosition ??
            activeCallout.tooltipPosition),
          x: newX,
          y: newY,
          width: cardWidth,
          height: cardHeight,
        },
      };
    }
    return {
      ...activeCallout,
      tooltipPosition: {
        ...activeCallout.tooltipPosition,
        x: newX,
        y: newY,
        width: cardWidth,
        height: cardHeight,
      },
    };
  })();

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={cn(
        "h-auto w-full",
        isBackground &&
          "text-[#66c2ff] drop-shadow-[0_0_18px_rgba(102,194,255,0.22)]",
      )}
      role={isBackground ? undefined : "img"}
      aria-hidden={isBackground ? true : undefined}
      aria-labelledby={
        isBackground
          ? undefined
          : `philippines-map-title-${layoutName} philippines-map-description-${layoutName}`
      }
    >
      {isBackground ? null : (
        <>
          <title id={`philippines-map-title-${layoutName}`}>
            Philippines province infographic map
          </title>
          <desc id={`philippines-map-description-${layoutName}`}>
            A custom SVG map of Philippine provinces with challenge locations
            and rotating challenge cards.
          </desc>
        </>
      )}
      <defs>
        <filter
          id="challengeph-map-glow"
          x="-45%"
          y="-45%"
          width="190%"
          height="190%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="2.5"
            floodColor="#EAF6FF"
            floodOpacity="0.34"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="6"
            floodColor="#2D7DFF"
            floodOpacity="0.58"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="18"
            floodColor="#2D7DFF"
            floodOpacity="0.22"
          />
        </filter>
        <filter
          id="challengeph-node-glow"
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="5"
            floodColor="#2D7DFF"
            floodOpacity="0.95"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="12"
            floodColor="#8CC8FF"
            floodOpacity="0.35"
          />
        </filter>
        <filter
          id="challengeph-line-glow"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="3"
            floodColor="#8CC8FF"
            floodOpacity="0.7"
          />
        </filter>
        <filter
          id="challengeph-warm-node-glow"
          x="-90%"
          y="-90%"
          width="280%"
          height="280%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="5"
            floodColor="#FF9D3D"
            floodOpacity="0.95"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="15"
            floodColor="#FFD36A"
            floodOpacity="0.46"
          />
        </filter>
      </defs>
      <g filter={isBackground ? undefined : "url(#challengeph-map-glow)"}>
        {projectedProvinces.map(({ feature: province, path }, index) => {
          const provinceName = getProvinceName(province);

          return (
            <MapProvince
              key={getProvinceKey(province)}
              name={provinceName}
              path={path}
              index={index}
              variant={variant}
            />
          );
        })}
      </g>

      {isBackground ? null : (
        <>
          <g>
            {dynamicActiveCallout ? (
              <SignalTrace
                key={dynamicActiveCallout.id}
                callout={dynamicActiveCallout}
                layoutName={layoutName}
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
                onActivate={() => setIsDotInteracting(true)}
                onDeactivate={() => setIsDotInteracting(false)}
              />
            ) : null}
          </g>
        </>
      )}
    </svg>
  );
}

export function SuperListingMapBackground({
  className,
}: {
  className?: string;
}) {
  const [provinceFeatures, setProvinceFeatures] = useState<ProvinceFeature[]>(
    [],
  );

  useEffect(() => {
    let isMounted = true;

    loadProvinceFeatures()
      .then((features) => {
        if (isMounted) {
          setProvinceFeatures(features);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProvinceFeatures([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (provinceFeatures.length === 0) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      <PhilippinesMap
        provinceFeatures={provinceFeatures}
        layoutName="desktop"
        variant="background"
      />
    </div>
  );
}

export function ChallengePhSignalMap({ className }: { className?: string }) {
  const [provinceFeatures, setProvinceFeatures] = useState<ProvinceFeature[]>(
    [],
  );

  useEffect(() => {
    let isMounted = true;

    loadProvinceFeatures()
      .then((features) => {
        if (isMounted) {
          setProvinceFeatures(features);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProvinceFeatures([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <div className="absolute inset-0 rounded-full bg-[#0D6BFF]/16 blur-3xl" />
      <div className="absolute inset-8 rounded-full bg-[#8CC8FF]/10 blur-2xl" />
      {provinceFeatures.length > 0 ? (
        <PhilippinesMap
          provinceFeatures={provinceFeatures}
          layoutName="desktop"
          variant="background"
        />
      ) : (
        <div className="h-full w-full animate-pulse rounded-[2rem] bg-white/[0.04]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_28%,rgba(45,125,255,0.35),transparent_0.8rem),radial-gradient(circle_at_58%_28%,rgba(45,125,255,0.22),transparent_2.8rem),radial-gradient(circle_at_66%_48%,rgba(45,125,255,0.38),transparent_0.8rem),radial-gradient(circle_at_66%_48%,rgba(45,125,255,0.18),transparent_2.8rem),radial-gradient(circle_at_74%_64%,rgba(45,125,255,0.35),transparent_0.8rem),radial-gradient(circle_at_74%_64%,rgba(45,125,255,0.18),transparent_2.8rem)]" />
    </div>
  );
}

export function ChallengePhInteractiveMap({
  className,
}: {
  className?: string;
}) {
  const [provinceFeatures, setProvinceFeatures] = useState<ProvinceFeature[]>(
    [],
  );

  useEffect(() => {
    let isMounted = true;

    loadProvinceFeatures()
      .then((features) => {
        if (isMounted) {
          setProvinceFeatures(features);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProvinceFeatures([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="pointer-events-none absolute inset-[-8%] bg-[radial-gradient(circle_at_64%_48%,rgba(13,107,255,0.34),transparent_46%),radial-gradient(circle_at_72%_70%,rgba(140,200,255,0.16),transparent_24%),radial-gradient(circle_at_50%_50%,transparent_0%,rgba(3,18,38,0.18)_78%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[#0D6BFF]/24 blur-3xl" />
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[#8CC8FF]/12 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_54%,rgba(3,18,38,0.22)_100%)]" />
      {provinceFeatures.length > 0 ? (
        <PhilippinesMap
          provinceFeatures={provinceFeatures}
          layoutName="desktop"
        />
      ) : null}
    </div>
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
      className="relative isolate flex min-h-[50vh] items-start overflow-hidden border-t border-white/10 bg-[#001138] px-4 pb-12 pt-14 text-white sm:px-6 sm:pt-16 lg:px-8 lg:pt-18"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={entranceViewport}
      transition={entranceTransition}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(102,194,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(102,194,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-45 [mask-image:linear-gradient(to_bottom,#000_0%,transparent_86%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(35,136,255,0.24),transparent_24rem),radial-gradient(circle_at_88%_88%,rgba(102,194,255,0.12),transparent_24rem)]" />
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
          className="relative isolate flex min-h-[55rem] flex-col overflow-hidden bg-[#001138] px-4 pb-10 pt-5 text-[#FFF7E8] sm:px-6 lg:min-h-screen lg:px-10 xl:px-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={entranceTransition}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(102,194,255,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(102,194,255,0.09)_1px,transparent_1px)] bg-[size:38px_38px] opacity-55 [mask-image:radial-gradient(circle_at_42%_48%,#000_0%,transparent_78%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(116deg,transparent_0%,rgba(35,136,255,0.14)_38%,transparent_68%),radial-gradient(circle_at_26%_22%,rgba(35,136,255,0.28),transparent_25rem),radial-gradient(circle_at_86%_80%,rgba(102,194,255,0.13),transparent_22rem)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#001138] to-transparent" />

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
                    <strong className="block text-[1.6rem] font-black leading-none text-white [font-family:var(--font-challenge-ph-heading)]">
                      8
                    </strong>
                    <span className="mt-2 block text-[13px] leading-tight text-[#9aa8c7]">
                      open challenges
                    </span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/[0.12] bg-white/[0.045] p-4 backdrop-blur">
                    <strong className="block text-[1.6rem] font-black leading-none text-white [font-family:var(--font-challenge-ph-heading)]">
                      12
                    </strong>
                    <span className="mt-2 block text-[13px] leading-tight text-[#9aa8c7]">
                      pinned locations
                    </span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/[0.12] bg-white/[0.045] p-4 backdrop-blur">
                    <strong className="block text-[1.6rem] font-black leading-none text-white [font-family:var(--font-challenge-ph-heading)]">
                      Free
                    </strong>
                    <span className="mt-2 block text-[13px] leading-tight text-[#9aa8c7]">
                      to participate
                    </span>
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
