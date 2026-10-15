const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Master SVG Logo with deep editorial and news emblem design
const masterSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient (Rich Crimson / Indonesian Merah) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DC2626" />
      <stop offset="45%" stop-color="#B91C1C" />
      <stop offset="85%" stop-color="#991B1B" />
      <stop offset="100%" stop-color="#7F1D1D" />
    </linearGradient>

    <!-- Luxury Gold Gradient for Emblems & Borders -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="25%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="75%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>

    <!-- Inner Shield Slate Gradient -->
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- Clean White Paper Gradient -->
    <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>

    <!-- Drop Shadows for 3D depth -->
    <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.45" />
    </filter>

    <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base Squircle (App Icon / Launcher rounded rect) -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Double Gold Filigree Border -->
  <rect x="18" y="18" width="476" height="476" rx="98" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-opacity="0.85" />
  <rect x="26" y="26" width="460" height="460" rx="90" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="8 4" />

  <!-- Circular Heraldic Inner Shield -->
  <circle cx="256" cy="235" r="150" fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="4" filter="url(#shadowFilter)" />

  <!-- Subtle Radial Glow behind emblem -->
  <circle cx="256" cy="235" r="140" fill="url(#goldGrad)" opacity="0.08" />

  <!-- Newspaper / Citizen Journalism Motif -->
  <g filter="url(#shadowFilter)" transform="translate(0, -6)">
    <!-- Back Newspaper Page -->
    <rect x="180" y="130" width="160" height="150" rx="10" fill="#E2E8F0" opacity="0.7" transform="rotate(-6 260 205)" />
    <!-- Main Newspaper Page (Front) -->
    <rect x="175" y="138" width="165" height="152" rx="10" fill="url(#paperGrad)" stroke="#CBD5E1" stroke-width="2" />
    <!-- Indonesian Red & White Masthead Header -->
    <rect x="185" y="148" width="145" height="18" rx="4" fill="#DC2626" />
    <rect x="185" y="162" width="145" height="4" fill="#FFFFFF" opacity="0.9" />
    <!-- Mini Headline bars inside newspaper -->
    <rect x="185" y="176" width="70" height="6" rx="3" fill="#1E293B" />
    <rect x="185" y="186" width="60" height="4" rx="2" fill="#64748B" />
    <rect x="185" y="193" width="65" height="4" rx="2" fill="#64748B" />
    <rect x="185" y="200" width="55" height="4" rx="2" fill="#94A3B8" />
    <!-- Newspaper Column Right -->
    <rect x="265" y="176" width="65" height="42" rx="4" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
    <rect x="270" y="182" width="55" height="4" rx="2" fill="#475569" />
    <rect x="270" y="189" width="45" height="3" rx="1.5" fill="#94A3B8" />
    <rect x="270" y="195" width="50" height="3" rx="1.5" fill="#94A3B8" />
    <rect x="270" y="201" width="40" height="3" rx="1.5" fill="#94A3B8" />
  </g>

  <!-- Golden Megaphone / Voice of the People (Toa Suara Rakyat) -->
  <g filter="url(#shadowFilter)">
    <!-- Megaphone Cone Body -->
    <path d="M 170 285 L 285 220 L 285 320 Z" fill="url(#goldGrad)" stroke="#92400E" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Megaphone Rear Housing -->
    <rect x="135" y="260" width="45" height="50" rx="10" fill="#F59E0B" stroke="#92400E" stroke-width="3" />
    <!-- Handle -->
    <path d="M 152 305 L 152 342 C 152 350 160 354 168 350 L 176 345 C 180 343 182 338 182 332 L 182 305 Z" 
          fill="#D97706" stroke="#78350F" stroke-width="3" />

    <!-- Megaphone Front Rim Flare -->
    <ellipse cx="285" cy="270" rx="10" ry="50" fill="#FEF08A" stroke="#92400E" stroke-width="3" />

    <!-- Dynamic Soundwaves radiating Citizen Voice -->
    <g stroke="url(#goldGrad)" stroke-linecap="round" fill="none">
      <path d="M 310 240 A 35 35 0 0 1 310 300" stroke-width="6" />
      <path d="M 330 220 A 62 62 0 0 1 330 320" stroke-width="7" opacity="0.9" />
      <path d="M 352 200 A 90 90 0 0 1 352 340" stroke-width="8" opacity="0.75" />
    </g>
  </g>

  <!-- Stars of Truth & Integrity -->
  <g fill="url(#goldGrad)">
    <!-- Left Star -->
    <polygon points="120,230 124,242 136,242 126,250 130,262 120,254 110,262 114,250 104,242 116,242" />
    <!-- Right Star -->
    <polygon points="392,230 396,242 408,242 398,250 402,262 392,254 382,262 386,250 376,242 388,242" />
  </g>

  <!-- Grand Banner for "SUARA RAKYAT" -->
  <g filter="url(#shadowFilter)">
    <!-- Banner Shadow & Backdrop -->
    <rect x="46" y="390" width="420" height="84" rx="22" fill="#0F172A" stroke="url(#goldGrad)" stroke-width="3.5" />
    <!-- Inner Accent Line inside Banner -->
    <rect x="52" y="396" width="408" height="72" rx="16" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.4" />
    
    <!-- Main Headline: SUARA RAKYAT -->
    <text x="256" y="434" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
          font-weight="900" font-size="32" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">
      SUARA RAKYAT
    </text>

    <!-- Subtitle: PORTAL BERITA WARGA -->
    <text x="256" y="458" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
          font-weight="800" font-size="13" fill="#FDE047" text-anchor="middle" letter-spacing="3">
      ★ PORTAL BERITA WARGA ★
    </text>
  </g>
</svg>`;

async function main() {
  console.log('Generating official Suara Rakyat logo and app icons...');

  // 1. Write public/logo.svg and public/favicon.svg
  fs.writeFileSync(path.join(__dirname, '../public/logo.svg'), masterSvg, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), masterSvg, 'utf8');

  // Also write to dist/ if dist exists
  if (fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.writeFileSync(path.join(__dirname, '../dist/logo.svg'), masterSvg, 'utf8');
    fs.writeFileSync(path.join(__dirname, '../dist/favicon.svg'), masterSvg, 'utf8');
  }

  const svgBuffer = Buffer.from(masterSvg);

  // 2. Generate Web & PWA PNG icons
  const webSizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  for (const { name, size } of webSizes) {
    const destPath = path.join(__dirname, '../public', name);
    await sharp(svgBuffer).resize(size, size).png().toFile(destPath);
    console.log(`Generated: public/${name} (${size}x${size})`);
    
    if (fs.existsSync(path.join(__dirname, '../dist'))) {
      fs.copyFileSync(destPath, path.join(__dirname, '../dist', name));
    }
  }

  // 3. Generate Android Mipmap native icon densities
  const androidDensities = [
    { folder: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
    { folder: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
    { folder: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
    { folder: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
    { folder: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
  ];

  for (const { folder, launcherSize, foregroundSize } of androidDensities) {
    const dir = path.join(__dirname, '../android-assets/res', folder);
    fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png (square/squircle)
    await sharp(svgBuffer).resize(launcherSize, launcherSize).png().toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png (circular)
    const circleSvg = `<svg width="${launcherSize}" height="${launcherSize}" viewBox="0 0 ${launcherSize} ${launcherSize}">
      <mask id="circleMask">
        <circle cx="${launcherSize/2}" cy="${launcherSize/2}" r="${launcherSize/2}" fill="white" />
      </mask>
      <image href="data:image/svg+xml;base64,${Buffer.from(masterSvg).toString('base64')}" width="${launcherSize}" height="${launcherSize}" mask="url(#circleMask)" />
    </svg>`;
    await sharp(Buffer.from(circleSvg)).png().toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    await sharp(svgBuffer).resize(foregroundSize, foregroundSize).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`Generated Android assets for: ${folder}`);
  }

  // 4. Generate splash screen
  const drawableDir = path.join(__dirname, '../android-assets/res/drawable');
  fs.mkdirSync(drawableDir, { recursive: true });
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(drawableDir, 'splash.png'));
  console.log('Generated Android splash.png');

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
