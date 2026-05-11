"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Navigation, Layers, Maximize2, Minimize2, Image as ImageIcon } from "lucide-react";

interface MapProps {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onFileDrop?: (file: File, lat: number, lng: number) => void;
}

export default function MapComponent({ position, setPosition, onFileDrop }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix icons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, {
      center: position,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    mapRef.current = map;

    // Click to set position
    map.on('click', (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    });

    // Drag and drop images onto map
    const container = containerRef.current;
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files[0] && onFileDrop) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          const rect = container.getBoundingClientRect();
          const point = map.containerPointToLatLng([e.clientX - rect.left, e.clientY - rect.top]);
          onFileDrop(file, point.lat, point.lng);
        }
      }
    };
    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', handleDrop);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync marker and view when position changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position).addTo(map);
    }

    map.flyTo(position, map.getZoom());
  }, [position]);

  // Sync layers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });

    const url = mapLayer === 'streets' 
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    
    L.tileLayer(url).addTo(map);
  }, [mapLayer]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const results = await response.json();
      if (results && results[0]) {
        setPosition([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
      }
    } catch { /* ignore error */ }
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <div className={`relative h-full w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 ${isFullscreen ? 'fixed inset-0 z-[10000]' : ''}`}>
      <div ref={containerRef} className="h-full w-full z-0" />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 w-64">
        <div className="flex bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 overflow-hidden shadow-lg">
          <input
            type="text"
            placeholder="Search address..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="p-2 hover:bg-slate-50 text-slate-400"><Search className="h-4 w-4" /></button>
        </div>
        <button onClick={locateMe} className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 shadow-lg w-fit"><Navigation className="h-3 w-3 text-primary" /> Locate Me</button>
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 p-1 flex flex-col shadow-lg">
          <button onClick={() => setMapLayer('streets')} className={`p-2 rounded-lg ${mapLayer === 'streets' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}><Layers className="h-4 w-4" /></button>
          <button onClick={() => setMapLayer('satellite')} className={`p-2 rounded-lg ${mapLayer === 'satellite' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}><ImageIcon className="h-4 w-4" /></button>
        </div>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-lg">{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
      </div>
    </div>
  );
}
