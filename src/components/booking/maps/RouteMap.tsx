import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { MapPin } from "lucide-react";

interface Coords {
  lat: number;
  lng: number;
}

interface RouteMapProps {
  isLoaded?: boolean;
  loadError?: Error | null;
  pickupCoords?: Coords | null;
  dropCoords?: Coords | null;
  userCoords?: Coords | null;
  pickupText?: string;
  dropText?: string;
  routePolyline?: string | null;
  onRouteCalculated?: (distanceKm: number, durationMinutes: number, durationText: string, overviewPolyline?: string) => void;
  onRouteError?: (msg: string) => void;
  className?: string;
}

const defaultCenter: [number, number] = [10.5276, 76.2144]; // Thrissur / Kerala

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

function createCurvedRoute(origin: Coords, destination: Coords): [number, number][] {
  const points: [number, number][] = [];
  const steps = 30;
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const dx = destination.lng - origin.lng;
  const dy = destination.lat - origin.lat;
  const curveFactor = 0.1;
  const controlLat = midLat - dx * curveFactor;
  const controlLng = midLng + dy * curveFactor;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * controlLat + t * t * destination.lat;
    const lng = (1 - t) * (1 - t) * origin.lng + 2 * (1 - t) * t * controlLng + t * t * destination.lng;
    points.push([lat, lng]);
  }
  return points;
}

export function RouteMap({
  pickupCoords,
  dropCoords,
  userCoords,
  pickupText,
  dropText,
  routePolyline,
  className = "",
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = pickupCoords
      ? [pickupCoords.lat, pickupCoords.lng]
      : userCoords
      ? [userCoords.lat, userCoords.lng]
      : defaultCenter;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update markers, polyline and bounds whenever coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const boundsPoints: [number, number][] = [];

    // Pickup Icon (Royal Blue "P")
    const pickupIcon = L.divIcon({
      className: "drivalong-pin",
      html: `
        <div style="
          background:#1E5AE8;
          color:#ffffff;
          width:30px;
          height:30px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:12px;
          border:2.5px solid #ffffff;
          box-shadow:0 4px 14px rgba(30,90,232,0.45);
        ">P</div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // Drop Icon (Amber Gold "D")
    const dropIcon = L.divIcon({
      className: "drivalong-pin",
      html: `
        <div style="
          background:#F59E0B;
          color:#ffffff;
          width:30px;
          height:30px;
          border-radius:7px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:12px;
          border:2.5px solid #ffffff;
          box-shadow:0 4px 14px rgba(245,158,11,0.45);
        ">D</div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // Add Pickup Marker
    if (pickupCoords) {
      const pMarker = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon });
      if (pickupText) {
        pMarker.bindPopup(`<b>Pickup:</b><br/>${pickupText}`);
      }
      pMarker.addTo(group);
      boundsPoints.push([pickupCoords.lat, pickupCoords.lng]);
    } else if (userCoords) {
      const uMarker = L.marker([userCoords.lat, userCoords.lng], { icon: pickupIcon });
      uMarker.bindPopup("Your Location").addTo(group);
      boundsPoints.push([userCoords.lat, userCoords.lng]);
    }

    // Add Drop Marker
    if (dropCoords) {
      const dMarker = L.marker([dropCoords.lat, dropCoords.lng], { icon: dropIcon });
      if (dropText) {
        dMarker.bindPopup(`<b>Destination:</b><br/>${dropText}`);
      }
      dMarker.addTo(group);
      boundsPoints.push([dropCoords.lat, dropCoords.lng]);
    }

    // Draw route path between Pickup and Drop
    if (pickupCoords && dropCoords) {
      let routePoints: [number, number][] = [];

      if (routePolyline && routePolyline.length > 5) {
        try {
          routePoints = decodePolyline(routePolyline);
        } catch {
          routePoints = createCurvedRoute(pickupCoords, dropCoords);
        }
      } else {
        routePoints = createCurvedRoute(pickupCoords, dropCoords);
      }

      if (routePoints.length > 0) {
        // Casing polyline (darker border for contrast)
        L.polyline(routePoints, {
          color: "#0F3DA6",
          weight: 7,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(group);

        // Core polyline (vibrant blue)
        L.polyline(routePoints, {
          color: "#2563EB",
          weight: 4,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(group);
      }
    }

    // Fit map to visible points
    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14, { animate: true });
    } else if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15, animate: true });
    }
  }, [pickupCoords, dropCoords, userCoords, pickupText, dropText, routePolyline]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border shadow-lift ${className}`}
      style={{ minHeight: "340px", height: "100%" }}
    >
      <div ref={containerRef} className="h-full w-full min-h-[340px]" />

      {/* Floating Status Badge */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-primary shadow-soft backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        {pickupCoords && dropCoords ? "Live Route Active" : pickupCoords ? "Pickup Selected" : "Select Locations"}
      </div>
    </div>
  );
}
