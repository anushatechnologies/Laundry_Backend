const fs = require('fs');
const path = require('path');

const uniqueGarments = [
  {
    fileName: 'trouser.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#E2E8F0"/>
        </linearGradient>
        <linearGradient id="trouserGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="50%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Belt waistband -->
        <rect x="120" y="60" width="160" height="24" rx="4" fill="#475569"/>
        <rect x="185" y="64" width="30" height="16" rx="2" fill="#94A3B8"/>
        <!-- Main Trousers Body -->
        <path d="M120 84 L145 340 L190 340 L200 160 L210 340 L255 340 L280 84 Z" fill="url(#trouserGrad)"/>
        <!-- Crease line -->
        <line x1="167" y1="95" x2="167" y2="335" stroke="#475569" stroke-width="2" stroke-dasharray="4,2"/>
        <line x1="233" y1="95" x2="233" y2="335" stroke="#475569" stroke-width="2" stroke-dasharray="4,2"/>
        <!-- Pockets -->
        <path d="M130 90 Q145 120 150 140" stroke="#64748B" stroke-width="2" fill="none"/>
        <path d="M270 90 Q255 120 250 140" stroke="#64748B" stroke-width="2" fill="none"/>
      </g>
    </svg>`
  },
  {
    fileName: 'kurta.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFFBEB"/><stop offset="100%" stop-color="#FEF3C7"/></linearGradient>
        <linearGradient id="kurtaGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#D97706"/><stop offset="50%" stop-color="#B45309"/><stop offset="100%" stop-color="#92400E"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Hanger -->
        <path d="M200 40 Q200 20 185 25 Q170 30 170 45 L110 90 L290 90 Z" fill="none" stroke="#78350F" stroke-width="4"/>
        <!-- Kurta Body -->
        <path d="M140 90 L80 180 L115 195 L145 150 L145 350 L255 350 L255 150 L285 195 L320 180 L260 90 Z" fill="url(#kurtaGrad)"/>
        <!-- Mandarin Collar & Placket -->
        <path d="M175 90 L175 65 Q200 70 225 65 L225 90 Z" fill="#F59E0B"/>
        <rect x="194" y="90" width="12" height="110" fill="#FCD34D" rx="2"/>
        <circle cx="200" cy="110" r="3" fill="#78350F"/>
        <circle cx="200" cy="140" r="3" fill="#78350F"/>
        <circle cx="200" cy="170" r="3" fill="#78350F"/>
        <!-- Gold Brocade Hem -->
        <rect x="145" y="338" width="110" height="12" fill="#FCD34D"/>
        <!-- Side Slits -->
        <line x1="145" y1="260" x2="145" y2="350" stroke="#78350F" stroke-width="2"/>
        <line x1="255" y1="260" x2="255" y2="350" stroke="#78350F" stroke-width="2"/>
      </g>
    </svg>`
  },
  {
    fileName: 'blazer.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F1F5F9"/><stop offset="100%" stop-color="#CBD5E1"/></linearGradient>
        <linearGradient id="blazerGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E3A8A"/><stop offset="100%" stop-color="#0F172A"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.3"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Shirt collar underneath -->
        <polygon points="175,80 200,120 225,80 200,65" fill="#FFFFFF"/>
        <polygon points="195,100 205,100 200,140" fill="#DC2626"/>
        <!-- Main Blazer -->
        <path d="M140 85 L70 190 L110 205 L135 155 L130 330 L270 330 L265 155 L290 205 L330 190 L260 85 Z" fill="url(#blazerGrad)"/>
        <!-- Lapels -->
        <polygon points="140,85 180,210 200,210 160,85" fill="#172554"/>
        <polygon points="260,85 220,210 200,210 240,85" fill="#172554"/>
        <!-- Pocket square -->
        <polygon points="145,160 170,160 165,150 150,150" fill="#FFFFFF"/>
        <!-- Gold Buttons -->
        <circle cx="200" cy="225" r="5" fill="#F59E0B" stroke="#B45309" stroke-width="1"/>
        <circle cx="200" cy="260" r="5" fill="#F59E0B" stroke="#B45309" stroke-width="1"/>
      </g>
    </svg>`
  },
  {
    fileName: 'sweater.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FDF4FF"/><stop offset="100%" stop-color="#FAE8FF"/></linearGradient>
        <linearGradient id="sweaterGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#BE185D"/><stop offset="100%" stop-color="#831843"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Folded Sweater -->
        <rect x="100" y="90" width="200" height="220" rx="18" fill="url(#sweaterGrad)"/>
        <!-- Knit Collar -->
        <ellipse cx="200" cy="90" rx="45" ry="20" fill="#9D174D" stroke="#F472B6" stroke-width="4"/>
        <!-- Cable knit pattern lines -->
        <path d="M140 120 Q145 160 140 200 Q145 240 140 280" stroke="#F472B6" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M170 120 Q175 160 170 200 Q175 240 170 280" stroke="#F472B6" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M200 120 Q205 160 200 200 Q205 240 200 280" stroke="#F472B6" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M230 120 Q235 160 230 200 Q235 240 230 280" stroke="#F472B6" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M260 120 Q265 160 260 200 Q265 240 260 280" stroke="#F472B6" stroke-width="3" fill="none" opacity="0.6"/>
        <!-- Ribbed Cuff Base -->
        <rect x="100" y="295" width="200" height="15" rx="4" fill="#9D174D"/>
      </g>
    </svg>`
  },
  {
    fileName: 'jacket.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EFF6FF"/><stop offset="100%" stop-color="#DBEAFE"/></linearGradient>
        <linearGradient id="jacketGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0284C7"/><stop offset="100%" stop-color="#0369A1"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.3"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Hood -->
        <path d="M160 85 Q200 30 240 85 Z" fill="#075985"/>
        <!-- Fur Trim -->
        <path d="M150 85 Q200 45 250 85" stroke="#E2E8F0" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- Puffer Jacket Body -->
        <path d="M130 95 L65 190 L105 205 L130 160 L125 335 L275 335 L270 160 L295 205 L335 190 L270 95 Z" fill="url(#jacketGrad)"/>
        <!-- Quilted Horizontal Segments -->
        <line x1="128" y1="140" x2="272" y2="140" stroke="#0369A1" stroke-width="3"/>
        <line x1="126" y1="190" x2="274" y2="190" stroke="#0369A1" stroke-width="3"/>
        <line x1="125" y1="240" x2="275" y2="240" stroke="#0369A1" stroke-width="3"/>
        <line x1="125" y1="290" x2="275" y2="290" stroke="#0369A1" stroke-width="3"/>
        <!-- Front Zipper -->
        <line x1="200" y1="95" x2="200" y2="335" stroke="#F1F5F9" stroke-width="4"/>
        <rect x="196" y="150" width="8" height="18" rx="2" fill="#E2E8F0"/>
      </g>
    </svg>`
  },
  {
    fileName: 'saree_cotton.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F0FDF4"/><stop offset="100%" stop-color="#DCFCE7"/></linearGradient>
        <linearGradient id="cottonSaree" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#047857"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Folded Cotton Saree Stack -->
        <rect x="90" y="110" width="220" height="70" rx="12" fill="url(#cottonSaree)"/>
        <rect x="80" y="160" width="240" height="75" rx="12" fill="#047857"/>
        <rect x="70" y="215" width="260" height="85" rx="14" fill="#065F46"/>
        <!-- Gold Pallu Border & Motifs -->
        <rect x="70" y="280" width="260" height="20" fill="#FBBF24" rx="2"/>
        <circle cx="120" cy="290" r="4" fill="#92400E"/>
        <circle cx="160" cy="290" r="4" fill="#92400E"/>
        <circle cx="200" cy="290" r="4" fill="#92400E"/>
        <circle cx="240" cy="290" r="4" fill="#92400E"/>
        <circle cx="280" cy="290" r="4" fill="#92400E"/>
        <!-- Geometric handblock print pattern -->
        <line x1="90" y1="130" x2="310" y2="130" stroke="#A7F3D0" stroke-width="2" stroke-dasharray="6,4"/>
        <line x1="80" y1="185" x2="320" y2="185" stroke="#A7F3D0" stroke-width="2" stroke-dasharray="6,4"/>
        <line x1="70" y1="245" x2="330" y2="245" stroke="#A7F3D0" stroke-width="2" stroke-dasharray="6,4"/>
      </g>
    </svg>`
  },
  {
    fileName: 'blouse.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFF1F2"/><stop offset="100%" stop-color="#FFE4E6"/></linearGradient>
        <linearGradient id="blouseGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E11D48"/><stop offset="100%" stop-color="#9F1239"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Blouse Body -->
        <path d="M125 100 L75 160 L115 180 L135 150 L135 270 L265 270 L265 150 L285 180 L325 160 L275 100 Q200 180 125 100 Z" fill="url(#blouseGrad)"/>
        <!-- Sweetheart Neckline Gold Zari Piping -->
        <path d="M125 100 Q200 180 275 100" stroke="#FBBF24" stroke-width="6" fill="none"/>
        <!-- Back Dori & Latkan Tassels -->
        <path d="M165 95 Q200 130 185 180" stroke="#FBBF24" stroke-width="2" fill="none"/>
        <path d="M235 95 Q200 130 215 180" stroke="#FBBF24" stroke-width="2" fill="none"/>
        <polygon points="180,180 190,180 185,195" fill="#F59E0B"/>
        <polygon points="210,180 220,180 215,195" fill="#F59E0B"/>
        <!-- Embroidered Waistband -->
        <rect x="135" y="258" width="130" height="12" fill="#FBBF24"/>
      </g>
    </svg>`
  },
  {
    fileName: 'salwar.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FAF5FF"/><stop offset="100%" stop-color="#F3E8FF"/></linearGradient>
        <linearGradient id="salwarGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7E22CE"/><stop offset="100%" stop-color="#581C87"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Anarkali Frock Kurti -->
        <path d="M145 90 L85 160 L115 175 L145 140 L100 340 L300 340 L255 140 L285 175 L315 160 L255 90 Q200 130 145 90 Z" fill="url(#salwarGrad)"/>
        <!-- Gold Embroidered Yoke -->
        <path d="M150 90 Q200 130 250 90 L235 170 L165 170 Z" fill="#FBBF24"/>
        <circle cx="200" cy="115" r="4" fill="#581C87"/>
        <circle cx="200" cy="135" r="4" fill="#581C87"/>
        <circle cx="200" cy="155" r="4" fill="#581C87"/>
        <!-- Dupatta Draped over shoulder -->
        <path d="M95 100 Q130 220 120 340" stroke="#EC4899" stroke-width="16" fill="none" opacity="0.85" stroke-linecap="round"/>
        <path d="M295 120 Q265 240 280 340" stroke="#EC4899" stroke-width="12" fill="none" opacity="0.85" stroke-linecap="round"/>
        <!-- Golden Gota Patti Border -->
        <rect x="100" y="328" width="200" height="12" fill="#FBBF24"/>
      </g>
    </svg>`
  },
  {
    fileName: 'gown.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="100%" stop-color="#E2E8F0"/></linearGradient>
        <linearGradient id="gownGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#047857"/><stop offset="50%" stop-color="#064E3B"/><stop offset="100%" stop-color="#022C22"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.3"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Tailored Evening Gown -->
        <path d="M165 70 Q200 110 235 70 L220 150 L310 350 L90 350 L180 150 Z" fill="url(#gownGrad)"/>
        <!-- Fitted Corset Waist -->
        <ellipse cx="200" cy="150" rx="25" ry="8" fill="#10B981" opacity="0.6"/>
        <!-- Sparkling Glitter / Sequins -->
        <circle cx="170" cy="220" r="3" fill="#6EE7B7"/>
        <circle cx="230" cy="240" r="3" fill="#6EE7B7"/>
        <circle cx="190" cy="270" r="3" fill="#6EE7B7"/>
        <circle cx="215" cy="300" r="4" fill="#6EE7B7"/>
        <circle cx="150" cy="320" r="3" fill="#6EE7B7"/>
        <circle cx="260" cy="325" r="3" fill="#6EE7B7"/>
      </g>
    </svg>`
  },
  {
    fileName: 'kid_shirt.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FEF9C3"/><stop offset="100%" stop-color="#FEF08A"/></linearGradient>
        <linearGradient id="kidShirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0EA5E9"/><stop offset="100%" stop-color="#0284C7"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.2"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Kid Polo Shirt -->
        <path d="M140 100 L85 160 L120 180 L145 150 L145 300 L255 300 L255 150 L280 180 L315 160 L260 100 Z" fill="url(#kidShirt)"/>
        <!-- Yellow Polo Collar -->
        <polygon points="140,100 200,140 260,100 200,80" fill="#FACC15"/>
        <!-- Cute Dinosaur / Star Patch -->
        <circle cx="225" cy="185" r="16" fill="#F43F5E"/>
        <polygon points="225,173 229,183 239,183 231,189 234,199 225,193 216,199 219,189 211,183 221,183" fill="#FFFFFF"/>
        <!-- Striped bottom hem -->
        <rect x="145" y="285" width="110" height="15" fill="#FACC15" rx="3"/>
      </g>
    </svg>`
  },
  {
    fileName: 'kid_pant.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ECFCCB"/><stop offset="100%" stop-color="#D9F99D"/></linearGradient>
        <linearGradient id="dungareeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.2"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Kid Dungarees / Shorts -->
        <!-- Shoulder Straps -->
        <rect x="145" y="60" width="20" height="90" fill="#1E40AF" rx="4"/>
        <rect x="235" y="60" width="20" height="90" fill="#1E40AF" rx="4"/>
        <circle cx="155" cy="135" r="5" fill="#FACC15"/>
        <circle cx="245" cy="135" r="5" fill="#FACC15"/>
        <!-- Bib and Shorts -->
        <path d="M135 125 L265 125 L270 310 L215 310 L200 210 L185 310 L130 310 Z" fill="url(#dungareeGrad)"/>
        <!-- Front Pocket -->
        <rect x="165" y="150" width="70" height="45" rx="8" fill="#1E40AF" stroke="#60A5FA" stroke-width="2"/>
        <circle cx="200" cy="170" r="6" fill="#FACC15"/>
      </g>
    </svg>`
  },
  {
    fileName: 'kid_dress.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFF1F2"/><stop offset="100%" stop-color="#FCE7F3"/></linearGradient>
        <linearGradient id="frockGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FB7185"/><stop offset="100%" stop-color="#E11D48"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Kid Princess Frock -->
        <path d="M155 90 L125 140 L160 160 L110 320 L290 320 L240 160 L275 140 L245 90 Q200 120 155 90 Z" fill="url(#frockGrad)"/>
        <!-- Big Pink Bow at waist -->
        <ellipse cx="200" cy="160" rx="16" ry="10" fill="#FDA4AF"/>
        <polygon points="200,160 165,150 165,170" fill="#FDA4AF"/>
        <polygon points="200,160 235,150 235,170" fill="#FDA4AF"/>
        <!-- Polka Dots -->
        <circle cx="140" cy="220" r="6" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="180" cy="200" r="6" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="220" cy="220" r="6" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="260" cy="240" r="6" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="160" cy="270" r="6" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="240" cy="280" r="6" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="200" cy="290" r="6" fill="#FFFFFF" opacity="0.8"/>
        <!-- Ruffle Hem -->
        <path d="M110 320 Q130 335 150 320 Q170 335 190 320 Q210 335 230 320 Q250 335 270 320 Q290 335 300 320" stroke="#FDA4AF" stroke-width="8" fill="none"/>
      </g>
    </svg>`
  },
  {
    fileName: 'uniform.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="100%" stop-color="#E2E8F0"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.2"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Crisp White School Shirt -->
        <path d="M140 85 L85 160 L125 175 L145 140 L145 320 L255 320 L255 140 L275 175 L315 160 L260 85 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <!-- White Collar -->
        <polygon points="140,85 200,120 260,85 200,65" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1"/>
        <!-- Red & Blue Striped School Tie -->
        <polygon points="192,115 208,115 212,240 200,260 188,240" fill="#DC2626"/>
        <line x1="190" y1="140" x2="210" y2="155" stroke="#1E3A8A" stroke-width="4"/>
        <line x1="190" y1="175" x2="210" y2="190" stroke="#1E3A8A" stroke-width="4"/>
        <line x1="190" y1="210" x2="210" y2="225" stroke="#1E3A8A" stroke-width="4"/>
        <!-- School Crest Badge -->
        <path d="M220 155 L240 155 L240 180 L230 190 L220 180 Z" fill="#1E3A8A"/>
        <circle cx="230" cy="170" r="4" fill="#FBBF24"/>
      </g>
    </svg>`
  },
  {
    fileName: 'blanket.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EFF6FF"/><stop offset="100%" stop-color="#DBEAFE"/></linearGradient>
        <linearGradient id="blanketGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3B82F6"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Rolled / Folded Cozy Fleece Blanket -->
        <ellipse cx="200" cy="130" rx="110" ry="40" fill="#1E40AF"/>
        <path d="M90 130 L90 260 Q200 320 310 260 L310 130 Z" fill="url(#blanketGrad)"/>
        <!-- Quilted Diamond Pattern -->
        <path d="M120 170 L200 230 L280 170" stroke="#93C5FD" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M120 220 L200 280 L280 220" stroke="#93C5FD" stroke-width="3" fill="none" opacity="0.6"/>
        <!-- Fluffy Sherpa Fleece Border -->
        <path d="M90 260 Q200 320 310 260" stroke="#FFFFFF" stroke-width="12" fill="none" stroke-linecap="round"/>
      </g>
    </svg>`
  },
  {
    fileName: 'comforter.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FDF2F8"/><stop offset="100%" stop-color="#FCE7F3"/></linearGradient>
        <linearGradient id="comforterGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9333EA"/><stop offset="100%" stop-color="#6B21A8"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Heavy Fluffy Down Rajai / Comforter Stack -->
        <rect x="70" y="100" width="260" height="75" rx="20" fill="url(#comforterGrad)"/>
        <rect x="60" y="160" width="280" height="85" rx="22" fill="#7E22CE"/>
        <rect x="50" y="230" width="300" height="95" rx="25" fill="#6B21A8"/>
        <!-- Puffy Quilt Box Stitching -->
        <circle cx="130" cy="135" r="5" fill="#D8B4FE"/>
        <circle cx="200" cy="135" r="5" fill="#D8B4FE"/>
        <circle cx="270" cy="135" r="5" fill="#D8B4FE"/>
        <circle cx="120" cy="200" r="5" fill="#D8B4FE"/>
        <circle cx="200" cy="200" r="5" fill="#D8B4FE"/>
        <circle cx="280" cy="200" r="5" fill="#D8B4FE"/>
        <circle cx="110" cy="275" r="6" fill="#D8B4FE"/>
        <circle cx="200" cy="275" r="6" fill="#D8B4FE"/>
        <circle cx="290" cy="275" r="6" fill="#D8B4FE"/>
        <!-- Gold Trim -->
        <rect x="50" y="315" width="300" height="10" rx="5" fill="#FBBF24"/>
      </g>
    </svg>`
  },
  {
    fileName: 'curtains.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="100%" stop-color="#E2E8F0"/></linearGradient>
        <linearGradient id="curtainGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0D9488"/><stop offset="50%" stop-color="#14B8A6"/><stop offset="100%" stop-color="#0F766E"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Curtain Rod & Finials -->
        <rect x="40" y="50" width="320" height="12" rx="6" fill="#D97706"/>
        <circle cx="40" cy="56" r="12" fill="#B45309"/>
        <circle cx="360" cy="56" r="12" fill="#B45309"/>
        <!-- Left Panel with Pleats -->
        <path d="M70 62 Q90 200 65 350 L160 350 Q140 200 160 62 Z" fill="url(#curtainGrad)"/>
        <!-- Right Panel with Pleats -->
        <path d="M240 62 Q260 200 240 350 L335 350 Q310 200 330 62 Z" fill="url(#curtainGrad)"/>
        <!-- Tiebacks with Gold Tassels -->
        <rect x="60" y="195" width="85" height="10" rx="3" fill="#FBBF24"/>
        <rect x="255" y="195" width="85" height="10" rx="3" fill="#FBBF24"/>
      </g>
    </svg>`
  },
  {
    fileName: 'towel.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F0FDF4"/><stop offset="100%" stop-color="#DCFCE7"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.2"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Stack of 3 Fluffy Bath Towels -->
        <rect x="90" y="100" width="220" height="60" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <rect x="80" y="150" width="240" height="65" rx="16" fill="#0284C7"/>
        <rect x="70" y="205" width="260" height="75" rx="18" fill="#059669"/>
        <!-- Ribbed texture border on towels -->
        <line x1="90" y1="120" x2="310" y2="120" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="8,4"/>
        <line x1="80" y1="175" x2="320" y2="175" stroke="#38BDF8" stroke-width="4" stroke-dasharray="8,4"/>
        <line x1="70" y1="235" x2="330" y2="235" stroke="#34D399" stroke-width="4" stroke-dasharray="8,4"/>
        <!-- Rolled Washcloth on top -->
        <ellipse cx="200" cy="75" rx="35" ry="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
      </g>
    </svg>`
  },
  {
    fileName: 'formal_shoes.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFFBEB"/><stop offset="100%" stop-color="#FEF3C7"/></linearGradient>
        <linearGradient id="leatherGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#78350F"/><stop offset="50%" stop-color="#451A03"/><stop offset="100%" stop-color="#1C0A00"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.3"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Oxford Handcrafted Leather Shoe -->
        <!-- Sole & Heel -->
        <path d="M70 260 L90 285 L140 285 L150 270 L300 270 Q340 270 330 250 L310 240 L70 240 Z" fill="#1C0A00"/>
        <!-- Upper Body -->
        <path d="M70 240 Q100 160 160 170 Q200 180 250 200 Q300 220 330 250 L300 270 L140 270 L70 240 Z" fill="url(#leatherGrad)"/>
        <!-- Gloss Polish Highlight -->
        <path d="M220 190 Q270 210 300 235" stroke="#D97706" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
        <!-- Brogue Perforations and Eyelets -->
        <circle cx="170" cy="185" r="2.5" fill="#FBBF24"/>
        <circle cx="180" cy="190" r="2.5" fill="#FBBF24"/>
        <circle cx="190" cy="195" r="2.5" fill="#FBBF24"/>
        <circle cx="200" cy="200" r="2.5" fill="#FBBF24"/>
        <!-- Waxed Laces -->
        <line x1="170" y1="185" x2="185" y2="185" stroke="#D97706" stroke-width="2"/>
        <line x1="180" y1="190" x2="195" y2="190" stroke="#D97706" stroke-width="2"/>
        <line x1="190" y1="195" x2="205" y2="195" stroke="#D97706" stroke-width="2"/>
      </g>
    </svg>`
  },
  {
    fileName: 'backpack.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F1F5F9"/><stop offset="100%" stop-color="#E2E8F0"/></linearGradient>
        <linearGradient id="backpackGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0F172A"/><stop offset="100%" stop-color="#334155"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.3"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        <!-- Top Handle -->
        <path d="M160 85 Q200 40 240 85" stroke="#0F172A" stroke-width="12" fill="none" stroke-linecap="round"/>
        <!-- Main Body -->
        <rect x="110" y="85" width="180" height="230" rx="35" fill="url(#backpackGrad)"/>
        <!-- Front Zipper Pocket -->
        <rect x="130" y="195" width="140" height="100" rx="18" fill="#1E293B" stroke="#0284C7" stroke-width="2"/>
        <line x1="140" y1="210" x2="260" y2="210" stroke="#64748B" stroke-width="3"/>
        <circle cx="155" cy="210" r="4" fill="#0284C7"/>
        <!-- Water bottle side mesh -->
        <path d="M100 190 Q90 230 110 270 Z" fill="#475569"/>
        <path d="M300 190 Q310 230 290 270 Z" fill="#475569"/>
      </g>
    </svg>`
  }
];

const destWeb = path.join(__dirname, '../../frontend-web/public/images/garments');
const destAdmin = path.join(__dirname, '../../frontend-admin/public/images/garments');
const destBackend = path.join(__dirname, '../../backend/public/uploads/garments');

[destWeb, destAdmin, destBackend].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

uniqueGarments.forEach(item => {
  fs.writeFileSync(path.join(destWeb, item.fileName), item.svg);
  fs.writeFileSync(path.join(destAdmin, item.fileName), item.svg);
  fs.writeFileSync(path.join(destBackend, item.fileName), item.svg);
  console.log(`Generated distinct visual: ${item.fileName}`);
});

console.log('All unique garment SVG assets created successfully!');
