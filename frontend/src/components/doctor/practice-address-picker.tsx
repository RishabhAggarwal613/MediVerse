"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PracticeLocationValue = {
  formatted: string;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
};

/** India-centered default when no coordinates yet */
const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };

type Props = {
  apiKey: string;
  /** Bump when loading profile from the server so the input re-hydrates safely with Places. */
  remountKey: number;
  inputId: string;
  label: string;
  value: PracticeLocationValue;
  onChange: (v: PracticeLocationValue) => void;
  disabled?: boolean;
};

/**
 * Google Places Autocomplete plus an interactive map: pick a suggestion, or click/drag on the map
 * to reverse-geocode into a formatted address with coordinates.
 */
export function PracticeAddressPicker({
  apiKey,
  remountKey,
  inputId,
  label,
  value,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const [loadError, setLoadError] = useState<string | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [geoPending, setGeoPending] = useState(false);
  /** Map-init sets this so “current location” can reuse the same reverse-geocode path as map clicks. */
  const applyCoordsRef = useRef<((lat: number, lng: number) => void) | null>(null);
  /** Skip one external value sync (we just emitted from map / place). Avoids duplicate geocode loops. */
  const skipExtrinsicPanRef = useRef(false);

  useEffect(() => {
    if (!apiKey || disabled) return;

    let cancelled = false;
    setLoadError(null);

    try {
      setOptions({
        key: apiKey,
        v: "weekly",
        libraries: ["places"],
      });
    } catch {
      setLoadError("Could not configure Google Maps options.");
      return undefined;
    }

    void (async () => {
      try {
        await Promise.all([
          importLibrary("places"),
          importLibrary("maps"),
          importLibrary("geocoding"),
        ]);
        if (cancelled || !inputRef.current || !mapContainerRef.current) return;

        const geocoder = new google.maps.Geocoder();

        const starting =
          valueRef.current.lat != null && valueRef.current.lng != null
            ? { lat: valueRef.current.lat, lng: valueRef.current.lng }
            : DEFAULT_CENTER;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: starting,
          zoom: valueRef.current.lat != null ? 15 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        if (cancelled) return;
        mapRef.current = map;

        const marker = new google.maps.Marker({
          map,
          draggable: true,
          visible: valueRef.current.lat != null && valueRef.current.lng != null,
          ...(valueRef.current.lat != null && valueRef.current.lng != null
            ? { position: { lat: valueRef.current.lat, lng: valueRef.current.lng } }
            : {}),
        });
        if (cancelled) return;
        markerRef.current = marker;

        const applyCoordinates = (lat: number, lng: number) => {
          marker.setPosition({ lat, lng });
          marker.setVisible(true);
          map.panTo({ lat, lng });
          map.setZoom(15);
          skipExtrinsicPanRef.current = true;
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (cancelled) return;
            const labelCoords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            if (status === "OK" && results?.[0]) {
              const r = results[0];
              onChangeRef.current({
                formatted: (r.formatted_address ?? "").trim() || labelCoords,
                lat,
                lng,
                placeId: r.place_id ?? null,
              });
            } else {
              onChangeRef.current({
                formatted: labelCoords,
                lat,
                lng,
                placeId: null,
              });
            }
          });
        };

        applyCoordsRef.current = applyCoordinates;

        if (cancelled) return;
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          applyCoordinates(e.latLng.lat(), e.latLng.lng());
        });

        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          if (!p) return;
          applyCoordinates(p.lat(), p.lng());
        });

        if (cancelled) return;
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "place_id"],
          types: ["establishment", "geocode"],
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const loc = place.geometry?.location;
          const formatted = place.formatted_address?.trim() ?? "";
          if (!formatted || !loc) return;
          const lat = loc.lat();
          const lng = loc.lng();
          marker.setPosition({ lat, lng });
          marker.setVisible(true);
          map.panTo({ lat, lng });
          map.setZoom(15);
          skipExtrinsicPanRef.current = true;
          onChangeRef.current({
            formatted,
            lat,
            lng,
            placeId: place.place_id ?? null,
          });
        });

        acRef.current = ac;
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load Google Maps (check API key, Places/Maps APIs, billing).");
        }
      }
    })();

    return () => {
      cancelled = true;
      applyCoordsRef.current = null;
      if (acRef.current) {
        google.maps.event.clearInstanceListeners(acRef.current);
        acRef.current = null;
      }
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  }, [apiKey, disabled, remountKey]);

  /** Sync map marker when coordinates change externally (profile load). */
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (skipExtrinsicPanRef.current) {
      skipExtrinsicPanRef.current = false;
      return;
    }

    if (value.lat == null || value.lng == null) {
      marker.setVisible(false);
      map.setZoom(5);
      map.panTo(DEFAULT_CENTER);
      return;
    }

    marker.setPosition({ lat: value.lat, lng: value.lng });
    marker.setVisible(true);
    map.panTo({ lat: value.lat, lng: value.lng });
    map.setZoom(15);
  }, [value.lat, value.lng]);

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        key={remountKey}
        ref={inputRef}
        id={inputId}
        disabled={disabled}
        value={value.formatted}
        onChange={(e) => {
          const t = e.target.value;
          onChange({
            formatted: t,
            lat: null,
            lng: null,
            placeId: null,
          });
        }}
        placeholder="Start typing an address or clinic name…"
        autoComplete="off"
        className="h-11 rounded-xl border-border bg-background text-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
      />
      <p className="text-xs text-muted-foreground">
        Choose a suggestion to pin coordinates,{" "}
        <span className="font-medium text-foreground">use your current location</span>, or{" "}
        <span className="font-medium text-foreground">click / drag on the map</span> below. Manual typing
        keeps a text-only address (directions still work from the text).
      </p>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-foreground">Map</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !!loadError || geoPending}
            className="h-8 rounded-full border-teal-200/80 text-xs dark:border-teal-800/60"
            onClick={() => {
              setGeoHint(null);
              if (!applyCoordsRef.current) {
                setGeoHint("Map is still loading — try again in a moment.");
                return;
              }
              if (typeof navigator === "undefined" || !navigator.geolocation) {
                setGeoHint("Your browser does not support location.");
                return;
              }
              setGeoPending(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setGeoPending(false);
                  setGeoHint(null);
                  applyCoordsRef.current?.(pos.coords.latitude, pos.coords.longitude);
                },
                (err: GeolocationPositionError) => {
                  setGeoPending(false);
                  if (err.code === err.PERMISSION_DENIED) {
                    setGeoHint("Location blocked — allow access in your browser settings.");
                  } else if (err.code === err.POSITION_UNAVAILABLE) {
                    setGeoHint("Could not read your position.");
                  } else if (err.code === err.TIMEOUT) {
                    setGeoHint("Location request timed out.");
                  } else {
                    setGeoHint("Could not get your location.");
                  }
                },
                { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
              );
            }}
          >
            <LocateFixed className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {geoPending ? "Locating…" : "Use current location"}
          </Button>
        </div>
        {geoHint ? <p className="text-xs text-destructive">{geoHint}</p> : null}
        <div
          ref={mapContainerRef}
          className="h-56 w-full overflow-hidden rounded-xl border border-border bg-muted/40 dark:border-white/15"
          role="application"
          aria-label="Practice location map. Click or drag marker to set address."
        />
      </div>

      {value.lat != null && value.lng != null && (
        <p className="text-xs font-medium text-teal-800 dark:text-teal-300">
          Pinned: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
      {loadError ? <p className="text-xs text-destructive">{loadError}</p> : null}
    </div>
  );
}
