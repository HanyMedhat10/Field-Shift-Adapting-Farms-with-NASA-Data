"use client";

import { Switch } from "@heroui/react";
import { Crosshair, Layers, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

interface FarmMapProps {
  lat: number;
  lon: number;
  governorateNameAr: string;
  ndviValue: number;
  onSelectLocation: (lat: number, lon: number) => void;
}

const NASA_GIBS_NDVI_URL =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2024-05-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png";

const ESRI_WORLD_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function MapViewportSync({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom() < 11 ? 12 : map.getZoom(), {
      duration: 0.75,
    });
  }, [lat, lon, map]);
  return null;
}

function MapClickHandler({
  onSelectLocation,
}: {
  onSelectLocation: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function FarmMap({
  lat,
  lon,
  governorateNameAr,
  ndviValue,
  onSelectLocation,
}: FarmMapProps) {
  const [showNdviLayer, setShowNdviLayer] = useState(true);

  // Small polygon representing ~1 feddan boundary centered on active coordinates
  const dLat = 0.0022;
  const dLon = 0.0026;
  const fieldBounds: [number, number][] = [
    [lat + dLat, lon - dLon],
    [lat + dLat, lon + dLon],
    [lat - dLat, lon + dLon],
    [lat - dLat, lon - dLon],
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 rounded-lg bg-[#090f1b] border border-slate-800 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">طبقة NASA GIBS MODIS NDVI</span>
        </div>
        <Switch
          size="sm"
          color="success"
          isSelected={showNdviLayer}
          onValueChange={setShowNdviLayer}
          aria-label="تفعيل طبقة الغطاء النباتي من ناسا"
        />
      </div>

      <div className="relative h-[240px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#05080f]">
        <MapContainer
          center={[lat, lon]}
          zoom={12}
          minZoom={5}
          maxZoom={17}
          className="h-full w-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution="Esri World Imagery"
            url={ESRI_WORLD_IMAGERY_URL}
          />
          {showNdviLayer && (
            <TileLayer
              attribution="NASA GIBS MODIS Terra NDVI 8-Day"
              url={NASA_GIBS_NDVI_URL}
              opacity={0.62}
              maxNativeZoom={9}
            />
          )}
          <MapViewportSync lat={lat} lon={lon} />
          <MapClickHandler onSelectLocation={onSelectLocation} />

          <Polygon
            positions={fieldBounds}
            pathOptions={{
              color: "#10b981",
              weight: 2,
              fillColor: "#10b981",
              fillOpacity: 0.16,
            }}
          />

          <CircleMarker
            center={[lat, lon]}
            radius={7}
            pathOptions={{
              color: "#38bdf8",
              weight: 2,
              fillColor: "#10b981",
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={false}>
              <div className="text-xs font-semibold">
                {governorateNameAr} | NDVI: {ndviValue}
              </div>
            </Tooltip>
          </CircleMarker>
        </MapContainer>

        <div className="pointer-events-none absolute bottom-2 right-2 z-[400] flex items-center gap-1.5 rounded-md bg-[#070b12]/90 border border-slate-700/80 px-2.5 py-1 text-[11px] text-slate-200 tabular-telemetry">
          <Crosshair className="h-3.5 w-3.5 text-sky-400" />
          <span>اضغط على أي حقل لتحديث قراءات ناسا</span>
        </div>

        <div className="pointer-events-none absolute top-2 right-2 z-[400] flex items-center gap-1.5 rounded-md bg-[#070b12]/90 border border-slate-700/80 px-2 py-1 text-[11px] text-emerald-300 tabular-telemetry">
          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

