import { useState } from 'react';
import { MapPin, Globe, CheckCircle2 } from 'lucide-react';

export interface MapNode {
  id: string;
  name: string;
  sublabel?: string;
  country: string;
  type: string;
  xPercent: number;
  yPercent: number;
  xSvg: number;
  ySvg: number;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  isHQ?: boolean;
}

export const GLOBAL_NODES: MapNode[] = [
  {
    id: 'us',
    name: 'Kumkang America',
    country: 'United States',
    type: 'North American Distribution Hub & Client Engineering',
    xPercent: 16.0,
    yPercent: 37.5,
    xSvg: 160,
    ySvg: 195,
    labelPosition: 'top',
  },
  {
    id: 'ke',
    name: 'Kumkang Kind East Africa',
    sublabel: 'Kenya',
    country: 'Kenya (KKEA)',
    type: 'Regional Operations, Sales & Project Monitoring Center',
    xPercent: 55.5,
    yPercent: 56.7,
    xSvg: 555,
    ySvg: 295,
    labelPosition: 'bottom',
  },
  {
    id: 'in',
    name: 'Kumkang Kind India',
    country: 'India (KKI)',
    type: 'Manufacturing, Engineering & Distribution Center',
    xPercent: 67.5,
    yPercent: 47.1,
    xSvg: 675,
    ySvg: 245,
    labelPosition: 'top',
  },
  {
    id: 'kr',
    name: 'Kumkang Kind',
    sublabel: 'South Korea',
    country: 'South Korea (HQ)',
    type: 'Global Corporate Headquarters & Formwork R&D Hub',
    xPercent: 81.5,
    yPercent: 37.5,
    xSvg: 815,
    ySvg: 195,
    labelPosition: 'right',
    isHQ: true,
  },
  {
    id: 'vn',
    name: 'Kumkang Kind Vietnam',
    country: 'Vietnam (KKV)',
    type: 'Aluminum Formwork Extrusion & Fabrication Plant',
    xPercent: 75.0,
    yPercent: 51.0,
    xSvg: 750,
    ySvg: 265,
    labelPosition: 'right',
  },
  {
    id: 'my',
    name: 'Kumkang Kind Malaysia',
    country: 'Malaysia',
    type: 'Regional Engineering Design & Technical Services',
    xPercent: 74.5,
    yPercent: 57.7,
    xSvg: 745,
    ySvg: 300,
    labelPosition: 'right',
  },
  {
    id: 'id',
    name: 'Kumkang Kind Indonesia',
    country: 'Indonesia',
    type: 'Supply Chain Depot & Field Operations Center',
    xPercent: 78.0,
    yPercent: 63.5,
    xSvg: 780,
    ySvg: 330,
    labelPosition: 'bottom',
  },
];

interface Props {
  selectedNodeId?: string;
  onSelectNode?: (node: MapNode) => void;
  className?: string;
}

export function GlobalFootprintMap({ selectedNodeId, onSelectNode, className = '' }: Props) {
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  const activeNode = hoveredNode || GLOBAL_NODES.find(n => n.id === selectedNodeId) || GLOBAL_NODES[2]; // Default India

  return (
    <div className={`relative w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Map Sub-Header matching Image 4 */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#0E4E8A]" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
            Global Footprint & Supply Chain Network
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>7 Active Corporate Nodes</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[16/9] min-h-[340px] sm:min-h-[380px] bg-white flex items-center justify-center p-2 select-none">
        <svg
          viewBox="0 0 1000 520"
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Kumkang Global Network World Map"
        >
          <defs>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0E4E8A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Realistic High-Fidelity SVG World Continents Silhouette (Light Grey #CBD5E1 on White) */}
          <g fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" strokeLinejoin="round" opacity="0.85">
            {/* North America & Alaska */}
            <path d="M 60,75 L 85,60 L 115,65 L 145,55 L 175,70 L 210,65 L 240,80 L 260,110 L 235,130 L 225,160 L 250,175 L 245,210 L 220,230 L 195,250 L 170,225 L 150,215 L 135,170 L 120,150 L 90,135 L 75,100 Z" />
            {/* Canada Arctic Islands */}
            <path d="M 180,45 L 215,35 L 230,50 L 210,60 Z" />
            <path d="M 235,40 L 265,30 L 280,50 L 255,60 Z" />
            {/* Greenland */}
            <path d="M 320,40 L 375,30 L 390,75 L 350,95 L 325,70 Z" />
            
            {/* Central America & Caribbean */}
            <path d="M 195,250 L 210,270 L 230,290 L 235,310 L 225,305 L 205,275 Z" />
            <circle cx="255" cy="265" r="4" />
            <circle cx="270" cy="275" r="3" />

            {/* South America */}
            <path d="M 230,305 L 265,310 L 295,330 L 340,360 L 335,410 L 295,450 L 270,490 L 260,505 L 250,470 L 240,410 L 225,360 L 220,325 Z" />

            {/* Europe (Scandinavia, UK, Continental, Iberia, Italy, Balkans) */}
            <path d="M 440,80 L 465,65 L 485,90 L 475,130 L 460,140 L 440,115 Z" /> {/* Scandinavia */}
            <path d="M 425,120 L 440,110 L 445,135 L 430,145 Z" /> {/* UK */}
            <circle cx="418" cy="130" r="4" /> {/* Ireland */}
            <path d="M 450,140 L 495,135 L 530,145 L 525,175 L 490,185 L 465,190 L 450,180 L 440,155 Z" /> {/* West & Central Europe */}
            <path d="M 430,180 L 455,180 L 445,215 L 425,205 Z" /> {/* Spain / Portugal */}
            <path d="M 480,185 L 495,205 L 485,220 L 475,200 Z" /> {/* Italy */}

            {/* Africa (North, West, Horn, East, South, Madagascar) */}
            <path d="M 435,225 L 480,220 L 535,225 L 565,260 L 585,280 L 565,335 L 540,390 L 515,440 L 495,430 L 475,370 L 465,320 L 420,290 L 415,250 Z" />
            <path d="M 580,380 L 595,395 L 585,435 L 575,415 Z" /> {/* Madagascar */}

            {/* Eurasia / Russia / Middle East */}
            <path d="M 530,145 L 610,120 L 710,105 L 810,110 L 880,130 L 890,175 L 840,190 L 780,180 L 710,195 L 640,190 L 570,185 L 535,175 Z" />
            <path d="M 535,225 L 565,220 L 590,250 L 575,280 L 545,270 Z" /> {/* Arabia */}

            {/* Indian Subcontinent & Sri Lanka */}
            <path d="M 640,215 L 675,220 L 710,240 L 690,290 L 670,310 L 650,280 L 640,240 Z" />
            <circle cx="682" cy="322" r="4" /> {/* Sri Lanka */}

            {/* East Asia / China / Korea / Japan */}
            <path d="M 710,195 L 795,190 L 815,225 L 775,270 L 725,265 L 705,230 Z" /> {/* China */}
            <path d="M 808,190 L 820,190 L 820,210 L 810,205 Z" /> {/* Korean Peninsula */}
            <path d="M 835,175 L 855,185 L 850,215 L 830,225 Z" /> {/* Japan */}

            {/* Southeast Asia (Indochina, Malay Peninsula) */}
            <path d="M 735,250 L 765,260 L 755,290 L 735,305 L 730,270 Z" />

            {/* Maritime SE Asia & Indonesia Archipelago */}
            <path d="M 725,325 L 755,340 L 740,350 Z" /> {/* Sumatra */}
            <path d="M 755,345 L 795,350 L 775,355 Z" /> {/* Java */}
            <path d="M 760,315 L 785,310 L 785,335 L 765,335 Z" /> {/* Borneo */}
            <path d="M 795,310 L 815,310 L 805,335 Z" /> {/* Sulawesi */}
            <path d="M 790,270 L 805,265 L 800,295 Z" /> {/* Philippines */}

            {/* Australia, Papua & New Zealand */}
            <path d="M 810,340 L 860,345 L 840,360 Z" /> {/* Papua New Guinea */}
            <path d="M 790,390 L 870,380 L 890,430 L 840,470 L 780,450 L 765,410 Z" /> {/* Australia */}
            <circle cx="845" cy="485" r="4" /> {/* Tasmania */}
            <path d="M 915,460 L 930,475 L 920,500 Z" /> {/* NZ South */}
            <path d="M 925,440 L 940,455 L 930,465 Z" /> {/* NZ North */}
          </g>

          {/* DOTTED LOGISTICS CONNECTING ROUTES matching image 4 */}
          {/* Main East Africa (Kenya 555,295) -> India (675,245) */}
          <path
            d="M 555,295 Q 615,255 675,245"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.2"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* India (675,245) -> South Korea (815,195) */}
          <path
            d="M 675,245 Q 745,200 815,195"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.2"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* South Korea (815,195) -> Vietnam (750,265) */}
          <path
            d="M 815,195 Q 785,225 750,265"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.8"
            strokeDasharray="5 4"
          />

          {/* Vietnam (750,265) -> Malaysia (745,300) */}
          <path
            d="M 750,265 Q 745,282 745,300"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.8"
            strokeDasharray="5 4"
          />

          {/* Malaysia (745,300) -> Indonesia (780,330) */}
          <path
            d="M 745,300 Q 762,315 780,330"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />

          {/* America Node (160,195) subtle Pacific route */}
          <path
            d="M 160,195 Q 80,180 0,185"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <path
            d="M 1000,185 Q 910,180 815,195"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* SVG PINS & PULSING CIRCLES */}
          {GLOBAL_NODES.map(node => {
            const isHovered = activeNode.id === node.id;
            return (
              <g
                key={node.id}
                onClick={() => onSelectNode?.(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all"
              >
                {/* Outer animated halo */}
                <circle
                  cx={node.xSvg}
                  cy={node.ySvg}
                  r={isHovered ? 12 : 7}
                  fill="#0284C7"
                  opacity={isHovered ? 0.35 : 0.2}
                />
                {/* Center marker dot */}
                <circle
                  cx={node.xSvg}
                  cy={node.ySvg}
                  r={isHovered ? 5.5 : 4}
                  fill={node.isHQ ? '#0E4E8A' : '#0284C7'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* HTML OVERLAY LABELS - EXACT BLUE TYPOGRAPHY MATCHING SCREENSHOT 4 */}
        {GLOBAL_NODES.map(node => {
          const isHovered = activeNode.id === node.id;
          const isSelected = selectedNodeId === node.id;

          // Compute label offset positions
          let offsetClasses = 'top-2.5 left-1/2 -translate-x-1/2';
          if (node.labelPosition === 'bottom') {
            offsetClasses = 'top-3 left-1/2 -translate-x-1/2';
          } else if (node.labelPosition === 'top') {
            offsetClasses = '-top-7 left-1/2 -translate-x-1/2';
          } else if (node.labelPosition === 'right') {
            offsetClasses = 'top-1/2 -translate-y-1/2 left-3';
          } else if (node.labelPosition === 'left') {
            offsetClasses = 'top-1/2 -translate-y-1/2 right-3';
          }

          return (
            <div
              key={`label-${node.id}`}
              style={{
                left: `${node.xPercent}%`,
                top: `${node.yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-20"
              onClick={() => onSelectNode?.(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div
                className={`absolute whitespace-nowrap text-left transition-all ${offsetClasses} ${
                  isHovered || isSelected ? 'scale-105 z-30' : 'opacity-95'
                }`}
              >
                <div className="font-extrabold text-[10px] sm:text-[11px] leading-tight text-[#0E4E8A] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] flex items-center gap-1">
                  <span>{node.name}</span>
                </div>
                {node.sublabel && (
                  <div className="text-[9px] font-bold text-[#0284C7] leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                    {node.sublabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM NODE INFO STRIP */}
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
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-sky-100 text-[#0E4E8A] border border-sky-200">
                {activeNode.country}
              </span>
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
