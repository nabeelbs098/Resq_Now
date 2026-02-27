import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const emergencyIcon = new L.DivIcon({
  html: `<div style="background:hsl(0,85%,50%);width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(220,38,38,0.5)"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type MapViewProps = {
  markers: { lat: number; lng: number; label?: string; id?: string }[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  className?: string;
};

export default function MapView({ markers, center, zoom = 12, onMarkerClick, className = "" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const defaultCenter: [number, number] = center || 
      (markers.length > 0 ? [markers[0].lat, markers[0].lng] : [20.5937, 78.9629]);

    mapInstance.current = L.map(mapRef.current).setView(defaultCenter, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: emergencyIcon })
        .addTo(mapInstance.current!);
      
      if (m.label) {
        marker.bindPopup(m.label);
      }
      if (m.id && onMarkerClick) {
        marker.on("click", () => onMarkerClick(m.id!));
      }
    });

    if (markers.length > 0 && !center) {
      const group = L.featureGroup(
        markers.map((m) => L.marker([m.lat, m.lng]))
      );
      mapInstance.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [markers, center, onMarkerClick]);

  return <div ref={mapRef} className={`h-64 w-full rounded-lg ${className}`} />;
}
