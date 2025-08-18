import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { RentalOffice } from "../types/rental";

interface MapProps {
  rentalOffices: RentalOffice[];
  onMarkerClick: (office: RentalOffice) => void;
  selectedOffice?: RentalOffice | null;
}

const Map = ({ rentalOffices, onMarkerClick, selectedOffice }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.warn(
          "Google Maps API 키가 설정되지 않았습니다. .env 파일에 VITE_GOOGLE_MAPS_API_KEY를 추가해주세요."
        );
        return;
      }

      const loader = new Loader({
        apiKey,
        version: "weekly",
      });

      try {
        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 36.5, lng: 127.5 }, // 한국 중심
            zoom: 7,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          setMap(mapInstance);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map) return;

    // 기존 마커들 제거
    markers.forEach((marker) => marker.setMap(null));

    // 새 마커들 생성 (lat, lng가 null이 아닌 경우만)
    const newMarkers = rentalOffices
      .filter((office) => office.lat !== null && office.lng !== null)
      .map((office) => {
        const marker = new google.maps.Marker({
          position: { lat: office.lat!, lng: office.lng! },
          map,
          title: office.name,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#059669" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          },
        });

        marker.addListener("click", () => {
          onMarkerClick(office);
        });

        return marker;
      });

    setMarkers(newMarkers);
  }, [map, rentalOffices, onMarkerClick]);

  // 선택된 사무소로 지도 중심 이동
  useEffect(() => {
    if (map && selectedOffice && selectedOffice.lat !== null && selectedOffice.lng !== null) {
      map.panTo({ lat: selectedOffice.lat, lng: selectedOffice.lng });
      map.setZoom(12);
    }
  }, [map, selectedOffice]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            지도를 로드하려면 API 키가 필요합니다
          </h3>
          <p className="text-gray-500 text-sm">
            .env 파일에 VITE_GOOGLE_MAPS_API_KEY를 추가해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
};

export default Map;
