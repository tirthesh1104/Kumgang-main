import { useEffect, useRef, useState } from 'react';
import { Globe, CheckCircle2, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapNode {
  id: string;
  name: string;
  sublabel?: string;
  country: string;
  type: string;
  xPercent: number; // kept for legacy compatibility
  yPercent: number; // kept for legacy compatibility
  xSvg: number;    // kept for legacy compatibility
  ySvg: number;    // kept for legacy compatibility
  lat: number;
  lng: number;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  isHQ?: boolean;
}

// Verified geographic coordinates for all Kumkang locations
// oxlint-disable-next-line react/only-export-components
export const GLOBAL_NODES: MapNode[] = [
  {
    id: 'us',
    name: 'Kumkang America',
    country: 'United States',
    type: 'North American Distribution Hub & Client Engineering',
    xPercent: 16.0, yPercent: 37.5, xSvg: 160, ySvg: 195,
    lat: 37.09024,
    lng: -95.71289,
    labelPosition: 'top',
  },
  {
    id: 'ke',
    name: 'Kumkang Kind East Africa',
    sublabel: 'Kenya',
    country: 'Kenya (KKEA)',
    type: 'Regional Operations, Sales & Project Monitoring Center',
    xPercent: 55.5, yPercent: 56.7, xSvg: 555, ySvg: 295,
    lat: -1.2921,
    lng: 36.8219,
    labelPosition: 'bottom',
  },
  {
    id: 'in',
    name: 'Kumkang Kind India',
    country: 'India (KKI)',
    type: 'Manufacturing, Engineering & Distribution Center',
    xPercent: 67.5, yPercent: 47.1, xSvg: 675, ySvg: 245,
    lat: 18.5204,
    lng: 73.8567,
    labelPosition: 'top',
  },
  {
    id: 'kr',
    name: 'Kumkang Kind',
    sublabel: 'South Korea',
    country: 'South Korea (HQ)',
    type: 'Global Corporate Headquarters & Formwork R&D Hub',
    xPercent: 81.5, yPercent: 37.5, xSvg: 815, ySvg: 195,
    lat: 37.5665,
    lng: 126.9780,
    labelPosition: 'right',
    isHQ: true,
  },
  {
    id: 'vn',
    name: 'Kumkang Kind Vietnam',
    country: 'Vietnam (KKV)',
    type: 'Aluminum Formwork Extrusion & Fabrication Plant',
    xPercent: 75.0, yPercent: 51.0, xSvg: 750, ySvg: 265,
    lat: 21.0278,
    lng: 105.8342,
    labelPosition: 'right',
  },
  {
    id: 'my',
    name: 'Kumkang Kind Malaysia',
    country: 'Malaysia',
    type: 'Regional Engineering Design & Technical Services',
    xPercent: 74.5, yPercent: 57.7, xSvg: 745, ySvg: 300,
    lat: 3.1390,
    lng: 101.6869,
    labelPosition: 'right',
  },
  {
    id: 'id',
    name: 'Kumkang Kind Indonesia',
    country: 'Indonesia',
    type: 'Supply Chain Depot & Field Operations Center',
    xPercent: 78.0, yPercent: 63.5, xSvg: 780, ySvg: 330,
    lat: -6.2088,
    lng: 106.8456,
    labelPosition: 'bottom',
  },
];

// Supply chain connections (pairs of node IDs)
const CONNECTIONS: [string, string][] = [
  ['ke', 'in'],   // Kenya → India
  ['in', 'kr'],   // India → South Korea
  ['kr', 'vn'],   // South Korea → Vietnam
  ['vn', 'my'],   // Vietnam → Malaysia
  ['my', 'id'],   // Malaysia → Indonesia
  ['kr', 'us'],   // South Korea → America (Pacific)
];

interface Props {
  selectedNodeId?: string;
  onSelectNode?: (node: MapNode) => void;
  className?: string;
}

// Custom Leaflet icon for Kumkang nodes
function createNodeIcon(isHQ: boolean, isSelected: boolean) {
  const size = isHQ ? 16 : 12;
  const color = isSelected ? '#F59E0B' : (isHQ ? '#0E4E8A' : '#0284C7');
  const pulseColor = isSelected ? '#FDE68A' : (isHQ ? '#BFDBFE' : '#BAE6FD');

  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size + 12}px;height:${size + 12}px;">
      <span style="
        position:absolute;
        width:${size + 8}px;height:${size + 8}px;
        border-radius:50%;
        background:${pulseColor};
        opacity:0.4;
        animation:pulse 2s infinite;
      "></span>
      <span style="
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${color};
        border:2.5px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:block;
        position:relative;
        z-index:10;
      "></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
  });
}

export function GlobalFootprintMap({ selectedNodeId, onSelectNode, className = '' }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const linesRef = useRef<L.Polyline[]>([]);
  const [activeNode, setActiveNode] = useState<MapNode>(
    GLOBAL_NODES.find(n => n.id === selectedNodeId) || GLOBAL_NODES[2]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    // Wider bounds so all seven nodes — Americas (US), East Africa (Kenya),
    // South Asia (India), East Asia (Korea), and Southeast Asia (Vietnam, Malaysia,
    // Indonesia) — are visible in the initial view without label collisions.
    // We use fitBounds with generous padding so the map engine picks the best zoom
    // for the container width rather than forcing a fixed zoom level.
    const GLOBAL_BOUNDS: L.LatLngBoundsExpression = [
      [45.0, -130.0],  // NW corner (northern US / Canada latitude for comfortable headroom)
      [-15.0, 160.0],  // SE corner (south of Indonesia / Java Sea)
    ];
    const map = L.map(mapContainerRef.current, {
      center: [15.0, 30.0],   // centred slightly north of the equator, over Indian Ocean
      zoom: 2,
      minZoom: 1,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });

    // Frame the initial view to include every known node comfortably.
    // maxZoom:3 prevents the map from zooming in too close on narrow containers.
    map.fitBounds(GLOBAL_BOUNDS, { padding: [56, 56], maxZoom: 3 });

    // Use OpenStreetMap (light/clean tile layer)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Draw animated dashed connection lines
    CONNECTIONS.forEach(([fromId, toId]) => {
      const from = GLOBAL_NODES.find(n => n.id === fromId);
      const to = GLOBAL_NODES.find(n => n.id === toId);
      if (!from || !to) return;

      const line = L.polyline(
        [[from.lat, from.lng], [to.lat, to.lng]],
        {
          color: '#0284C7',
          weight: 1.8,
          opacity: 0.7,
          dashArray: '6, 5',
          className: 'kumkang-route-line',
        }
      ).addTo(map);
      linesRef.current.push(line);
    });

    // Add markers for each node
    GLOBAL_NODES.forEach(node => {
      const isSelected = node.id === (selectedNodeId || 'in');
      const marker = L.marker([node.lat, node.lng], {
        icon: createNodeIcon(node.isHQ || false, isSelected),
        title: node.name,
      }).addTo(map);

      // Compact, readable tooltip. Only the HQ node shows a permanent label to
      // avoid East Africa / Southeast Asia cluster collisions. All other nodes
      // show their name on hover/click so testers can identify each location
      // without fighting overlapping text.
      marker.bindTooltip(
        `<div style="font-size:11px;font-weight:800;color:#0E4E8A;white-space:nowrap;">${node.name}${node.sublabel ? '<br><span style="font-size:10px;color:#0284C7;">' + node.sublabel + '</span>' : ''}</div>`,
        {
          permanent: node.isHQ || false,
          direction: 'top',
          className: 'kumkang-map-tooltip',
          offset: [0, -10],
          sticky: false,
        }
      );

      marker.on('click', () => {
        setActiveNode(node);
        onSelectNode?.(node);
        // Update all marker icons
        markersRef.current.forEach((m, id) => {
          const n = GLOBAL_NODES.find(gn => gn.id === id);
          if (n) m.setIcon(createNodeIcon(n.isHQ || false, id === node.id));
        });
      });

      markersRef.current.set(node.id, marker);
    });

    mapInstanceRef.current = map;

    // Capture ref values in local variables for cleanup — prevents stale .current access.
    const capturedMarkers = markersRef.current;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      capturedMarkers.clear();
      linesRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when selectedNodeId changes externally.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const node = GLOBAL_NODES.find(n => n.id === selectedNodeId);
    if (!node) return;
    // Capture refs locally so the closure is stable for the effect's lifetime
    const markers = markersRef.current;
    setActiveNode(prev => (prev.id === node.id ? prev : node));
    markers.forEach((m, id) => {
      const n = GLOBAL_NODES.find(gn => gn.id === id);
      if (n) m.setIcon(createNodeIcon(n.isHQ || false, id === selectedNodeId));
    });
  }, [selectedNodeId]);

  return (
    <div className={`relative w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Map sub-header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#0E4E8A]" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
            Global Footprint &amp; Supply Chain Network
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>7 Active Corporate Nodes</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="relative w-full" style={{ height: '400px' }}>
        {/* CSS animation for pulsing markers */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.6); opacity: 0.15; }
          }
          .kumkang-map-tooltip {
            background: white !important;
            border: 1px solid #BFDBFE !important;
            border-radius: 6px !important;
            padding: 3px 7px !important;
            font-family: sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
          }
          .kumkang-map-tooltip::before {
            border-top-color: #BFDBFE !important;
          }
          .kumkang-route-line {
            animation: dash 30s linear infinite;
          }
          .leaflet-control-attribution {
            font-size: 9px !important;
          }
        `}</style>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Bottom node info strip */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#0E4E8A]/10 text-[#0E4E8A]">
            <MapPin size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-xs">
                {activeNode.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-sky-100 text-[#0E4E8A] border border-sky-200">
                {activeNode.country}
              </span>
              {activeNode.isHQ && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  HQ
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {activeNode.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
          <CheckCircle2 size={13} />
          <span>Verified Operational Node</span>
        </div>
      </div>
    </div>
  );
}
