"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

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

export type MapCallout = {
  id: string;
  provinceName: string;
  psgc?: string;
  stat: string;
  title: string;
  body: string;
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
    width: 920,
    height: 760,
    projectionExtent: [
      [330, 80],
      [590, 690],
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
    stat: "64%",
    title: "Northern talent hubs",
    body: "Students are clustering around design, analytics, and software work.",
    color: "#2563EB",
    anchor: { x: 432, y: 282 },
    tooltipPosition: { x: 86, y: 112, width: 236, height: 126 },
    mobileAnchor: { x: 178, y: 214 },
    mobileTooltipPosition: { x: 18, y: 24, width: 158, height: 118 },
  },
  {
    id: "metro-adjacent",
    provinceName: "Cavite",
    psgc: "402100000",
    stat: "71%",
    title: "Metro-adjacent demand",
    body: "Hybrid roles keep expanding near major business corridors.",
    color: "#7C3AED",
    anchor: { x: 436, y: 347 },
    tooltipPosition: { x: 78, y: 324, width: 242, height: 126 },
    mobileAnchor: { x: 181, y: 252 },
    mobileTooltipPosition: { x: 16, y: 430, width: 170, height: 118 },
  },
  {
    id: "central-visayas",
    provinceName: "Cebu",
    psgc: "702200000",
    stat: "58%",
    title: "Central Visayas growth",
    body: "Operations and product internships are rising across regional teams.",
    color: "#0891B2",
    anchor: { x: 514, y: 454 },
    tooltipPosition: { x: 646, y: 228, width: 238, height: 126 },
    mobileAnchor: { x: 227, y: 316 },
    mobileTooltipPosition: { x: 208, y: 24, width: 164, height: 118 },
  },
  {
    id: "western-visayas",
    provinceName: "Iloilo",
    psgc: "603000000",
    stat: "42%",
    title: "Emerging operators",
    body: "More students are pursuing business, support, and content tracks.",
    color: "#16A34A",
    anchor: { x: 483, y: 436 },
    tooltipPosition: { x: 94, y: 540, width: 244, height: 126 },
    mobileAnchor: { x: 208, y: 305 },
    mobileTooltipPosition: { x: 108, y: 570, width: 174, height: 118 },
  },
  {
    id: "mindanao-product",
    provinceName: "Davao del Sur",
    psgc: "1102400000",
    stat: "53%",
    title: "Mindanao builders",
    body: "Technical and creative submissions show strong regional momentum.",
    color: "#EA580C",
    anchor: { x: 556, y: 545 },
    tooltipPosition: { x: 646, y: 498, width: 238, height: 126 },
    mobileAnchor: { x: 252, y: 370 },
    mobileTooltipPosition: { x: 204, y: 430, width: 168, height: 118 },
  },
];

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

function getCalloutGeometry(callout: MapCallout, layoutName: LayoutName) {
  return {
    anchor:
      layoutName === "mobile"
        ? (callout.mobileAnchor ?? callout.anchor)
        : callout.anchor,
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
  callout: MapCallout;
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
  callout: MapCallout;
  isActive: boolean;
  layoutName: LayoutName;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const { tooltipPosition } = getCalloutGeometry(callout, layoutName);
  const width = tooltipPosition.width ?? 236;
  const height = tooltipPosition.height ?? 126;

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
      <button
        type="button"
        className={cn(
          "group flex h-full w-full flex-col items-start rounded-[18px] border border-slate-200/80 bg-white px-4 py-3 text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] outline-none transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.14)] focus-visible:-translate-y-0.5 focus-visible:ring-4",
        )}
        style={{
          ["--callout-color" as string]: callout.color,
          ["--tw-ring-color" as string]: `${callout.color}33`,
          boxShadow: isActive
            ? `0 22px 48px ${callout.color}26`
            : "0 14px 34px rgba(15, 23, 42, 0.08)",
        }}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        aria-label={`${callout.provinceName}: ${callout.stat}, ${callout.title}`}
      >
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105"
          style={{ backgroundColor: callout.color }}
        >
          {callout.provinceName}
        </span>
        <span className="mt-2 text-[24px] font-black leading-none tracking-normal text-slate-950">
          {callout.stat}
        </span>
        <span className="mt-1 text-[13px] font-bold leading-tight text-slate-900">
          {callout.title}
        </span>
        <span className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">
          {callout.body}
        </span>
      </button>
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
        {mapCallouts.map((callout) => (
          <LeaderLine
            key={callout.id}
            callout={callout}
            layoutName={layoutName}
            isActive={activeCalloutId === callout.id}
          />
        ))}
      </g>

      <g>
        {mapCallouts.map((callout) => (
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
    <section className="min-h-screen bg-white px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-center">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Super Listings
            </p>
            <h1 className="mt-2 max-w-2xl text-4xl font-black leading-[0.98] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              Philippines opportunity map
            </h1>
          </div>
          <p className="max-w-sm text-sm font-semibold leading-6 text-slate-500 sm:text-right">
            Sample internship signals by province, rendered from the local
            TopoJSON boundaries.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          {loadError ? (
            <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
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
            <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
              Loading province boundaries...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
