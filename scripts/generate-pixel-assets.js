const fs = require('fs');
const path = require('path');

// Output directories
const darkDir = path.join(__dirname, '..', 'assets', 'readme', 'dark');
const lightDir = path.join(__dirname, '..', 'assets', 'readme', 'light');
const pubDarkDir = path.join(__dirname, '..', 'public', 'assets', 'readme', 'dark');
const pubLightDir = path.join(__dirname, '..', 'public', 'assets', 'readme', 'light');

for (const d of [darkDir, lightDir, pubDarkDir, pubLightDir]) {
  fs.mkdirSync(d, { recursive: true });
}

// 12-point scalloped Material 3 Expressive flower path (center: 38.55, 34.1)
const RAW_FLOWER_PATH = "M63.1,39.1C62.7,39.6 62.3,40.0 61.9,40.5C61.6,41.0 61.2,41.4 61.0,41.9C60.7,42.4 60.5,42.8 60.3,43.3C60.2,43.9 60.1,44.4 60.0,45.0C59.9,45.5 59.9,46.1 59.9,46.7C59.8,47.3 59.8,48.0 59.7,48.6C59.6,49.2 59.4,49.8 59.2,50.4C58.9,50.9 58.6,51.4 58.2,51.9C57.8,52.3 57.4,52.7 56.9,53.0C56.3,53.3 55.7,53.5 55.2,53.7C54.6,53.9 53.9,54.0 53.3,54.1C52.7,54.3 52.1,54.4 51.6,54.5C51.0,54.6 50.5,54.8 50.0,55.0C49.5,55.2 49.1,55.5 48.7,55.8C48.2,56.1 47.8,56.5 47.4,57.0C47.0,57.4 46.6,57.8 46.1,58.3C45.7,58.7 45.2,59.1 44.7,59.5C44.2,59.9 43.7,60.2 43.2,60.4C42.6,60.6 42.0,60.7 41.4,60.8C40.8,60.8 40.2,60.7 39.6,60.5C39.1,60.4 38.5,60.1 37.9,59.9C37.3,59.6 36.8,59.3 36.3,59.0C35.7,58.7 35.2,58.4 34.7,58.2C34.2,58.0 33.7,57.8 33.2,57.7C32.7,57.6 32.1,57.6 31.6,57.6C31.0,57.6 30.5,57.6 29.9,57.7C29.3,57.7 28.6,57.8 28.0,57.9C27.4,57.9 26.8,57.9 26.2,57.8C25.6,57.7 25.0,57.6 24.4,57.3C23.9,57.1 23.4,56.7 23.0,56.3C22.6,55.9 22.2,55.4 21.9,54.9C21.5,54.3 21.3,53.7 21.1,53.2C20.8,52.6 20.6,52.0 20.4,51.5C20.2,50.9 20.0,50.4 19.7,50.0C19.4,49.5 19.1,49.1 18.7,48.7C18.4,48.3 18.0,47.9 17.5,47.6C17.0,47.2 16.5,46.9 16.0,46.6C15.5,46.2 15.0,45.9 14.5,45.5C14.1,45.1 13.6,44.6 13.2,44.2C12.9,43.7 12.6,43.1 12.4,42.6C12.2,42.0 12.1,41.4 12.1,40.8C12.1,40.2 12.2,39.6 12.4,39.0C12.5,38.4 12.7,37.8 12.9,37.2C13.1,36.6 13.3,36.1 13.4,35.5C13.6,35.0 13.7,34.4 13.8,33.9C13.8,33.4 13.8,32.9 13.8,32.3C13.7,31.8 13.6,31.2 13.4,30.7C13.3,30.1 13.1,29.5 12.9,28.9C12.8,28.3 12.6,27.7 12.5,27.1C12.5,26.5 12.5,25.8 12.6,25.3C12.7,24.7 12.8,24.1 13.1,23.6C13.4,23.1 13.8,22.6 14.2,22.2C14.6,21.7 15.1,21.3 15.6,21.0C16.1,20.6 16.7,20.3 17.2,20.0C17.7,19.7 18.2,19.4 18.7,19.1C19.1,18.7 19.5,18.4 19.9,18.0C20.2,17.6 20.5,17.1 20.8,16.7C21.1,16.2 21.3,15.6 21.5,15.1C21.8,14.6 22.0,14.0 22.3,13.4C22.6,12.9 22.9,12.3 23.3,11.8C23.7,11.4 24.1,10.9 24.6,10.6C25.1,10.3 25.6,10.0 26.2,9.8C26.8,9.7 27.4,9.6 28.0,9.6C28.6,9.6 29.3,9.7 29.9,9.7C30.5,9.8 31.1,9.9 31.7,10.0C32.2,10.1 32.8,10.2 33.3,10.2C33.9,10.2 34.4,10.1 34.9,10.0C35.4,9.9 36.0,9.7 36.5,9.4C37.0,9.2 37.5,8.9 38.1,8.7C38.6,8.4 39.2,8.1 39.8,7.9C40.4,7.7 41.0,7.5 41.6,7.5C42.2,7.4 42.8,7.4 43.4,7.5C43.9,7.7 44.5,7.9 45.0,8.2C45.5,8.5 46.0,8.9 46.5,9.3C46.9,9.7 47.4,10.2 47.8,10.6C48.2,11.1 48.6,11.6 49.0,12.0C49.4,12.4 49.7,12.8 50.2,13.1C50.6,13.4 51.1,13.6 51.6,13.9C52.1,14.1 52.6,14.2 53.2,14.4C53.7,14.5 54.4,14.6 54.9,14.8C55.5,15.0 56.2,15.2 56.7,15.4C57.3,15.7 57.8,16.0 58.3,16.3C58.7,16.7 59.1,17.2 59.5,17.7C59.8,18.2 60.0,18.7 60.2,19.3C60.3,19.9 60.4,20.5 60.4,21.1C60.5,21.8 60.5,22.4 60.5,23.0C60.5,23.6 60.5,24.2 60.6,24.7C60.7,25.3 60.8,25.8 60.9,26.3C61.1,26.8 61.3,27.3 61.6,27.8C61.9,28.2 62.2,28.7 62.6,29.2C62.9,29.7 63.3,30.2 63.7,30.7C64.0,31.2 64.3,31.8 64.5,32.4C64.8,32.9 64.9,33.5 65.0,34.1C65.0,34.7 65.0,35.3 64.8,35.9C64.7,36.4 64.4,37.0 64.1,37.5C63.8,38.1 63.4,38.6 63.1,39.1Z";

// Helper to write file to both assets/readme and public/assets/readme
function saveSvg(subPath, content) {
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'readme', subPath), content);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'assets', 'readme', subPath), content);
}

// Common SVG Icons
const ICONS = {
  launch: `<path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm-10 4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v4H4V9h4V7H4z" fill="currentColor"/>`,
  rocket: `<path d="M12 2.5s4 1.5 6 6.5c1.2 3-.5 6-1.5 7.5L18 20l-3.5-1.5c-1.5 1-4.5 2.7-7.5 1.5-5-2-6.5-6-6.5-6s3.5-1.5 6.5-1.5c.5-1 1.5-2.5 3-4 1.5-1.5 3-3.5 3-6z" fill="currentColor"/>`,
  github: `<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor"/>`,
  heart: `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>`,
  bug: `<path d="M19 8h-1.81a5.985 5.985 0 0 0-1.82-1.96l1.24-1.24a.996.996 0 1 0-1.41-1.41L13.43 5.16C12.96 5.06 12.49 5 12 5s-.96.06-1.43.16L8.8 3.39a.996.996 0 1 0-1.41 1.41l1.24 1.24A5.985 5.985 0 0 0 6.81 8H5a1 1 0 1 0 0 2h1.17c-.11.64-.17 1.31-.17 2v1H5a1 1 0 1 0 0 2h1v1c0 .69.06 1.36.17 2H5a1 1 0 1 0 0 2h1.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H19a1 1 0 1 0 0-2h-1.17c.11-.64.17-1.31.17-2v-1h1a1 1 0 1 0 0-2h-1v-1c0-.69-.06-1.36-.17-2H19a1 1 0 1 0 0-2h-1v-1c0-.69-.06-1.36-.17-2H19a1 1 0 1 0 0-2zm-7 11c-2.76 0-5-2.24-5-5v-3c0-2.76 2.24-5 5-5s5 2.24 5 5v3c0 2.76-2.24 5-5 5z" fill="currentColor"/>`,
  contribute: `<path d="M18 16c-.79 0-1.5.31-2.03.81L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.53.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.51 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.51-.31 2.04-.81l7.05 4.12c-.05.22-.09.45-.09.69 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>`,
  scale: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v1.5h-2v-1.5c-2.2-.4-3.5-1.8-3.5-3.5h2c0 1.1.9 2 2.5 2s2.5-.9 2.5-2c0-1.3-1-1.7-2.7-2.1-2.3-.5-4.3-1.2-4.3-3.4 0-1.7 1.3-3.1 3.5-3.5V6h2v1.5c1.8.4 3 1.6 3.2 3.1h-2c-.2-.9-.8-1.6-2.2-1.6-1.3 0-2.2.7-2.2 1.6 0 1.1.8 1.5 2.6 1.9 2.5.6 4.4 1.3 4.4 3.6 0 1.9-1.4 3.4-3.8 3.9z" fill="currentColor"/>`,
  license: `<path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5l5 4.5H7l5-4.5zM12 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/>`,
  palette: `<path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.23 19.59 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-5 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>`,
  devices: `<path d="M4 6h16v10H4V6zm18 12H2v2h20v-2zm-6-9h4v6h-4V9z" fill="currentColor"/>`,
  fold: `<path d="M6 3h5v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 0h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5V3zm-2 2H9v14h2V5z" fill="currentColor"/>`,
  gallery: `<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>`,
  shapes: `<path d="M12 2l-5.5 9h11z M17.5 13a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z M3 13.5h7v7H3z" fill="currentColor"/>`,
  sparkles: `<path d="M9 3L7.5 7.5 3 9l4.5 1.5L9 15l1.5-4.5L15 9l-4.5-1.5z M19 11l-1 3-3 1 3 1 1 3 1-3 3-1-3-1z M17 3l-.6 1.8L14.6 5.4l1.8.6.6 1.8.6-1.8 1.8-.6-1.8-.6z" fill="currentColor"/>`,
  robot: `<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h4V5.72A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-4 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-6 5v1h4v-1h-4z" fill="currentColor"/>`,
  code: `<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor"/>`,
  terminal: `<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-12-3l3.5-3.5L8 8l1.4-1.4 4.9 4.9-4.9 4.9L8 15zm7 0h4v2h-4v-2z" fill="currentColor"/>`,
  help: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.65z" fill="currentColor"/>`,
  coffee: `<path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4v-2z" fill="currentColor"/>`,
  lock: `<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>`,
  check: `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>`,
  sync: `<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="currentColor"/>`,
  react: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="currentColor"/>`
};

function renderIcon(name, size, color) {
  const iconSvg = ICONS[name] || ICONS.sparkles;
  const scale = size / 24;
  const offset = -size / 2;
  return `<g transform="translate(${offset}, ${offset}) scale(${scale})" color="${color}">${iconSvg}</g>`;
}

// -------------------------------------------------------------
// 1. ANIMATED PIXEL BADGE (Height: 28)
// -------------------------------------------------------------
function generateBadge({ name, label, icon, flowerDark, flowerLight, iconDark, iconLight, width }) {
  // DARK with breathing pulse
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28">
    <path d="M14,0H${width - 14}A14,14 0 0 1 ${width},14V14A14,14 0 0 1 ${width - 14},28H14A14,14 0 0 1 0,14V14A14,14 0 0 1 14,0Z" fill="#221b24" stroke="#362938" stroke-width="1"/>
    <g transform="translate(14, 14)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="0.42;0.47;0.42" keyTimes="0;0.5;1" dur="3s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerDark}" transform="translate(-38.55, -34.1)"/>
      </g>
      ${renderIcon(icon, 11, iconDark)}
    </g>
    <text x="27" y="18" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#f0e2ee">${label}</text>
  </svg>`;
  saveSvg(path.join('dark', `badge-${name}.svg`), darkSvg);

  // LIGHT with breathing pulse
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28">
    <path d="M14,0H${width - 14}A14,14 0 0 1 ${width},14V14A14,14 0 0 1 ${width - 14},28H14A14,14 0 0 1 0,14V14A14,14 0 0 1 14,0Z" fill="#f0e5ef" stroke="#ded0dd" stroke-width="1"/>
    <g transform="translate(14, 14)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="0.42;0.47;0.42" keyTimes="0;0.5;1" dur="3s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerLight}" transform="translate(-38.55, -34.1)"/>
      </g>
      ${renderIcon(icon, 11, iconLight)}
    </g>
    <text x="27" y="18" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#261b28">${label}</text>
  </svg>`;
  saveSvg(path.join('light', `badge-${name}.svg`), lightSvg);
}

// -------------------------------------------------------------
// 2. ANIMATED ACTION BUTTON (Height: 68)
// -------------------------------------------------------------
function generateButton({ name, sublabel, label, icon, flowerDark, flowerLight, iconDark, iconLight, bgDark, bgLight, textDark, textLight, width = 216 }) {
  // DARK with organic pulse
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="68" viewBox="0 0 ${width} 68">
    <path d="M34,1H${width - 34}A33,33 0 0 1 ${width - 1},34V34A33,33 0 0 1 ${width - 34},67H34A33,33 0 0 1 1,34V34A33,33 0 0 1 34,1Z" fill="${bgDark || '#261e27'}" stroke="#3d2f3e" stroke-width="1"/>
    <g transform="translate(38, 34)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.0;1.06;1.0" keyTimes="0;0.5;1" dur="3.5s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerDark}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 24, iconDark)}
    </g>
    <text x="74" y="27" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="10" font-weight="700" fill="${textDark ? textDark + '99' : '#caa7cd'}" letter-spacing="0.08em">${sublabel.toUpperCase()}</text>
    <text x="74" y="47" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="16" font-weight="700" fill="${textDark || '#ffffff'}">${label}</text>
  </svg>`;
  saveSvg(path.join('dark', `btn-${name}.svg`), darkSvg);

  // LIGHT
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="68" viewBox="0 0 ${width} 68">
    <path d="M34,1H${width - 34}A33,33 0 0 1 ${width - 1},34V34A33,33 0 0 1 ${width - 34},67H34A33,33 0 0 1 1,34V34A33,33 0 0 1 34,1Z" fill="${bgLight || '#f1e6f0'}" stroke="#dccbda" stroke-width="1"/>
    <g transform="translate(38, 34)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.0;1.06;1.0" keyTimes="0;0.5;1" dur="3.5s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerLight}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 24, iconLight)}
    </g>
    <text x="74" y="27" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="10" font-weight="700" fill="${textLight ? textLight + '99' : '#695168'}" letter-spacing="0.08em">${sublabel.toUpperCase()}</text>
    <text x="74" y="47" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="16" font-weight="700" fill="${textLight || '#211824'}">${label}</text>
  </svg>`;
  saveSvg(path.join('light', `btn-${name}.svg`), lightSvg);
}

// -------------------------------------------------------------
// 3. HEADER BANNER GENERATOR (1000 x 104)
// -------------------------------------------------------------
function generateHeader({ name, title, subtitle, icon, tags = [], flowerDark, flowerLight, iconDark, iconLight }) {
  function renderTags(tagsList, isDark) {
    let x = 970;
    let out = '';
    const pillBg = isDark ? '#3d2e3f' : '#ddcedd';
    const textColor = isDark ? '#ffffff' : '#221824';
    
    for (let i = tagsList.length - 1; i >= 0; i--) {
      const t = tagsList[i];
      const pillWidth = t.length * 8 + 26;
      x -= pillWidth;
      out += `<g transform="translate(${x}, 36)">
        <rect width="${pillWidth}" height="32" rx="16" fill="${pillBg}"/>
        <text x="${pillWidth / 2}" y="20.5" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13" font-weight="700" fill="${textColor}" text-anchor="middle">${t}</text>
      </g>`;
      x -= 10;
    }
    return out;
  }

  // DESKTOP DARK
  const dDark = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="104" viewBox="0 0 1000 104">
    <path d="M52,0H948A52,52 0 0 1 1000,52V52A52,52 0 0 1 948,104H52A52,52 0 0 1 0,52V52A52,52 0 0 1 52,0Z" fill="#231b24"/>
    <g transform="translate(56, 52)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.5;1.56;1.5" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerDark}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 36, iconDark)}
    </g>
    <text x="114" y="47" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${title}</text>
    <text x="114" y="74" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="15" font-weight="400" fill="#cbb4ca">${subtitle}</text>
    ${renderTags(tags, true)}
  </svg>`;
  saveSvg(path.join('dark', `h-${name}.svg`), dDark);

  // DESKTOP LIGHT
  const dLight = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="104" viewBox="0 0 1000 104">
    <path d="M52,0H948A52,52 0 0 1 1000,52V52A52,52 0 0 1 948,104H52A52,52 0 0 1 0,52V52A52,52 0 0 1 52,0Z" fill="#ede2ed"/>
    <g transform="translate(56, 52)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.5;1.56;1.5" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerLight}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 36, iconLight)}
    </g>
    <text x="114" y="47" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="32" font-weight="700" fill="#211824">${title}</text>
    <text x="114" y="74" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="15" font-weight="400" fill="#675466">${subtitle}</text>
    ${renderTags(tags, false)}
  </svg>`;
  saveSvg(path.join('light', `h-${name}.svg`), dLight);

  // MOBILE RESPONSIVE VERSION (640 x 90)
  const mDark = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="90" viewBox="0 0 640 90">
    <path d="M45,0H595A45,45 0 0 1 640,45V45A45,45 0 0 1 595,90H45A45,45 0 0 1 0,45V45A45,45 0 0 1 45,0Z" fill="#231b24"/>
    <g transform="translate(46, 45)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.25;1.31;1.25" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerDark}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 30, iconDark)}
    </g>
    <text x="96" y="42" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="25" font-weight="700" fill="#ffffff">${title}</text>
    <text x="96" y="66" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13" font-weight="400" fill="#cbb4ca">${subtitle}</text>
  </svg>`;
  saveSvg(path.join('dark', `hm-${name}.svg`), mDark);

  const mLight = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="90" viewBox="0 0 640 90">
    <path d="M45,0H595A45,45 0 0 1 640,45V45A45,45 0 0 1 595,90H45A45,45 0 0 1 0,45V45A45,45 0 0 1 45,0Z" fill="#ede2ed"/>
    <g transform="translate(46, 45)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.25;1.31;1.25" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerLight}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 30, iconLight)}
    </g>
    <text x="96" y="42" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="25" font-weight="700" fill="#211824">${title}</text>
    <text x="96" y="66" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13" font-weight="400" fill="#675466">${subtitle}</text>
  </svg>`;
  saveSvg(path.join('light', `hm-${name}.svg`), mLight);
}

// -------------------------------------------------------------
// 4. ANIMATED FEATURE CARD (Width: 430, Height: 218)
// -------------------------------------------------------------
function generateCard({ name, title, lines, icon, flowerDark, flowerLight, iconDark, iconLight }) {
  const tLines = lines.map((l, i) => `<tspan x="36" dy="${i === 0 ? 0 : 20}">${l}</tspan>`).join('');

  // DARK
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="430" height="218" viewBox="0 0 430 218">
    <clipPath id="c_${name}"><rect width="430" height="218" rx="32" /></clipPath>
    <rect width="430" height="218" rx="32" fill="#1e1720" stroke="#322635" stroke-width="1"/>
    <g clip-path="url(#c_${name})">
      <path d="M440,110 C420,115 390,125 375,115 C360,105 340,65 315,55 C295,47 285,15 305,-5 C325,-25 355,-55 390,-55 C430,-55 470,20 475,50 C480,80 455,105 440,110 Z" fill="#261d28" />
    </g>
    <g transform="translate(64, 60)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.15;1.22;1.15" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerDark}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 30, iconDark)}
    </g>
    <text x="36" y="125" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="21" font-weight="700" fill="#ffffff">${title}</text>
    <text x="36" y="152" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13.5" font-weight="400" fill="#beabbe">
      ${tLines}
    </text>
  </svg>`;
  saveSvg(path.join('dark', `card-${name}.svg`), darkSvg);

  // LIGHT
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="430" height="218" viewBox="0 0 430 218">
    <clipPath id="cl_${name}"><rect width="430" height="218" rx="32" /></clipPath>
    <rect width="430" height="218" rx="32" fill="#f4ebf4" stroke="#e0cee0" stroke-width="1"/>
    <g clip-path="url(#cl_${name})">
      <path d="M440,110 C420,115 390,125 375,115 C360,105 340,65 315,55 C295,47 285,15 305,-5 C325,-25 355,-55 390,-55 C430,-55 470,20 475,50 C480,80 455,105 440,110 Z" fill="#ece0ed" />
    </g>
    <g transform="translate(64, 60)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1.15;1.22;1.15" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerLight}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 30, iconLight)}
    </g>
    <text x="36" y="125" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="21" font-weight="700" fill="#211824">${title}</text>
    <text x="36" y="152" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13.5" font-weight="400" fill="#5f4e60">
      ${tLines}
    </text>
  </svg>`;
  saveSvg(path.join('light', `card-${name}.svg`), lightSvg);
}

// -------------------------------------------------------------
// 5. ANIMATED TECH STACK PILL
// -------------------------------------------------------------
function generateStackPill({ name, label, icon, flowerDark, flowerLight, iconDark, iconLight, width }) {
  // DARK
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="42" viewBox="0 0 ${width} 42">
    <path d="M21,0H${width - 21}A21,21 0 0 1 ${width},21V21A21,21 0 0 1 ${width - 21},42H21A21,21 0 0 1 0,21V21A21,21 0 0 1 21,0Z" fill="#231b24" stroke="#362938" stroke-width="1"/>
    <g transform="translate(21, 21)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="0.65;0.72;0.65" keyTimes="0;0.5;1" dur="3.5s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerDark}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 17, iconDark)}
    </g>
    <text x="42" y="26" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="14.5" font-weight="600" fill="#f0e2ee">${label}</text>
  </svg>`;
  saveSvg(path.join('dark', `pill-${name}.svg`), darkSvg);

  // LIGHT
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="42" viewBox="0 0 ${width} 42">
    <path d="M21,0H${width - 21}A21,21 0 0 1 ${width},21V21A21,21 0 0 1 ${width - 21},42H21A21,21 0 0 1 0,21V21A21,21 0 0 1 21,0Z" fill="#f0e5ef" stroke="#ded0dd" stroke-width="1"/>
    <g transform="translate(21, 21)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="0.65;0.72;0.65" keyTimes="0;0.5;1" dur="3.5s" repeatCount="indefinite"/>
        <path d="${RAW_FLOWER_PATH}" fill="${flowerLight}" transform="translate(-38.55, -34.1)" />
      </g>
      ${renderIcon(icon, 17, iconLight)}
    </g>
    <text x="42" y="26" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="14.5" font-weight="600" fill="#261b28">${label}</text>
  </svg>`;
  saveSvg(path.join('light', `pill-${name}.svg`), lightSvg);
}

// Run generators
console.log('Generating living M3E animated badges, buttons, headers, and cards...');

generateButton({ name: 'launch', sublabel: 'LIVE WEB STUDIO', label: 'Launch App', icon: 'launch', flowerDark: '#6750A4', flowerLight: '#EADDFF', iconDark: '#FFFFFF', iconLight: '#21005D', width: 200 });
generateButton({ name: 'github', sublabel: 'BROWSE THE', label: 'Source code', icon: 'github', flowerDark: '#4A3B4F', flowerLight: '#E8DCEB', iconDark: '#FFFFFF', iconLight: '#251A29', width: 206 });
generateButton({ name: 'sponsor', sublabel: 'LIKE M3E STUDIO?', label: 'Support project', icon: 'heart', flowerDark: '#853B55', flowerLight: '#FFD8E4', iconDark: '#FFFFFF', iconLight: '#3B071F', width: 224 });
generateButton({ name: 'fold', sublabel: 'NEW 3D SIMULATION', label: 'Xiaomi 18 Fold', icon: 'fold', flowerDark: '#8A5128', flowerLight: '#FFDCC1', iconDark: '#FFFFFF', iconLight: '#351500', width: 218 });
generateButton({ name: 'issues', sublabel: 'FOUND A BUG?', label: 'Report an issue', icon: 'bug', flowerDark: '#734375', flowerLight: '#FBD7FC', iconDark: '#FFFFFF', iconLight: '#2C132E', width: 218 });
generateButton({ name: 'contribute', sublabel: 'PULL REQUESTS', label: 'Contribute', icon: 'contribute', flowerDark: '#3A5E53', flowerLight: '#CCE8DE', iconDark: '#FFFFFF', iconLight: '#042018', width: 196 });
generateButton({ name: 'license', sublabel: 'OPEN SOURCE', label: 'MIT License', icon: 'license', flowerDark: '#455173', flowerLight: '#D8E2FF', iconDark: '#FFFFFF', iconLight: '#001A41', width: 200 });

generateBadge({ name: 'clientonly', label: '100% Client-Side', icon: 'lock', flowerDark: '#2E6A45', flowerLight: '#C3EED0', iconDark: '#FFFFFF', iconLight: '#00210E', width: 142 });
generateBadge({ name: 'nextjs', label: 'Next.js 16', icon: 'terminal', flowerDark: '#333333', flowerLight: '#E5E5E5', iconDark: '#FFFFFF', iconLight: '#000000', width: 110 });
generateBadge({ name: 'react', label: 'React 19', icon: 'react', flowerDark: '#1E5268', flowerLight: '#C4E7FF', iconDark: '#FFFFFF', iconLight: '#001E2E', width: 104 });
generateBadge({ name: 'm3e', label: 'Material 3 Expressive', icon: 'palette', flowerDark: '#6750A4', flowerLight: '#EADDFF', iconDark: '#FFFFFF', iconLight: '#21005D', width: 172 });
generateBadge({ name: 'fold', label: 'Xiaomi 18 Fold 3D', icon: 'fold', flowerDark: '#8A5128', flowerLight: '#FFDCC1', iconDark: '#FFFFFF', iconLight: '#351500', width: 160 });
generateBadge({ name: 'devices', label: 'Phone · Watch · PC', icon: 'devices', flowerDark: '#006969', flowerLight: '#CCE8E8', iconDark: '#FFFFFF', iconLight: '#002020', width: 160 });
generateBadge({ name: 'zerobackend', label: 'Zero backend', icon: 'sync', flowerDark: '#5E5268', flowerLight: '#E8DEF8', iconDark: '#FFFFFF', iconLight: '#1D192B', width: 130 });
generateBadge({ name: 'mit', label: 'MIT License', icon: 'license', flowerDark: '#3B4E73', flowerLight: '#D3E3FD', iconDark: '#FFFFFF', iconLight: '#041E49', width: 118 });
generateBadge({ name: 'prs', label: 'PRs welcome', icon: 'contribute', flowerDark: '#4D6438', flowerLight: '#D3EABC', iconDark: '#FFFFFF', iconLight: '#111F05', width: 122 });

generateHeader({ name: 'overview', title: 'Overview', subtitle: 'Visual studio and AI prompt synthesizer for Material 3 Expressive', icon: 'palette', tags: ['Web Studio', 'Free', 'Open source'], flowerDark: '#6750A4', flowerLight: '#EADDFF', iconDark: '#FFFFFF', iconLight: '#21005D' });
generateHeader({ name: 'devices', title: 'Form Factors', subtitle: 'Xiaomi 18 Fold 3D, Phone, Wear OS, Tablet & Desktop Workstation', icon: 'fold', tags: ['Xiaomi Fold', 'Wear OS', 'Desktop'], flowerDark: '#8A5128', flowerLight: '#FFDCC1', iconDark: '#FFFFFF', iconLight: '#351500' });
generateHeader({ name: 'screenshots', title: 'Screenshots', subtitle: 'Tactile canvas, prototype preview, prompt synthesizer & mobile view', icon: 'gallery', tags: ['Canvas', 'Preview', 'Mobile'], flowerDark: '#3A5E53', flowerLight: '#CCE8DE', iconDark: '#FFFFFF', iconLight: '#042018' });
generateHeader({ name: 'design', title: 'Design Pillars', subtitle: 'Shapes, springs, tonal palettes, and expressive morphing loaders', icon: 'shapes', tags: ['Springs', 'Color', 'Shapes'], flowerDark: '#754877', flowerLight: '#FBD7FC', iconDark: '#FFFFFF', iconLight: '#2C132E' });
generateHeader({ name: 'features', title: 'Features', subtitle: 'Everything inside Material 3 Expressive Screen UI', icon: 'sparkles', tags: ['3D Fold', 'AI Prompts', 'Theming'], flowerDark: '#776228', flowerLight: '#FFE193', iconDark: '#FFFFFF', iconLight: '#251A00' });
generateHeader({ name: 'prompt', title: 'AI Prompt Engine', subtitle: 'Deterministic UI specs for Claude Code, Cursor, Codex & Gemini', icon: 'robot', tags: ['Compose', 'React', 'Flutter'], flowerDark: '#2A5D75', flowerLight: '#C3E8FF', iconDark: '#FFFFFF', iconLight: '#001E2E' });
generateHeader({ name: 'stack', title: 'Tech stack', subtitle: 'Built with Next.js 16, React 19, Framer Motion & Tailwind CSS', icon: 'code', tags: ['Next.js 16', 'React 19', 'Motion'], flowerDark: '#5E5268', flowerLight: '#E8DEF8', iconDark: '#FFFFFF', iconLight: '#1D192B' });
generateHeader({ name: 'start', title: 'Getting started', subtitle: 'Clone, run and test Material 3 Expressive Screen UI locally', icon: 'terminal', tags: ['Node 20+', 'TypeScript', 'Vitest'], flowerDark: '#38634B', flowerLight: '#BDEFD2', iconDark: '#FFFFFF', iconLight: '#002111' });
generateHeader({ name: 'support', title: 'Support & Sponsor', subtitle: 'SupportKori, nsave, RedotPay, Payoneer & GitHub Sponsors', icon: 'coffee', tags: ['SupportKori', 'nsave', 'RedotPay'], flowerDark: '#853B55', flowerLight: '#FFD8E4', iconDark: '#FFFFFF', iconLight: '#3B071F' });
generateHeader({ name: 'faq', title: 'FAQ', subtitle: 'Frequently asked questions about M3E Canvas and AI synthesis', icon: 'help', tags: ['Privacy', 'Export', 'Offline'], flowerDark: '#455173', flowerLight: '#D8E2FF', iconDark: '#FFFFFF', iconLight: '#001A41' });
generateHeader({ name: 'license', title: 'License & Credits', subtitle: 'Open source under the permissive MIT License © 2026', icon: 'scale', tags: ['MIT', 'Free', 'Open Source'], flowerDark: '#4A3B4F', flowerLight: '#E8DCEB', iconDark: '#FFFFFF', iconLight: '#251A29' });

generateCard({ name: 'fold', title: 'Xiaomi 18 Fold 3D', lines: ['Pure 3D book-fold animation with Falcon hinge,', '8.03" 2K 120Hz inner dual-screen, 6.56" HyperOS', 'cover display, and 0°/105°/180° posture modes.'], icon: 'fold', flowerDark: '#8A5128', flowerLight: '#FFDCC1', iconDark: '#FFFFFF', iconLight: '#351500' });
generateCard({ name: 'ai', title: 'AI Prompt Synthesis', lines: ['Automated deterministic specifications tailored for', 'autonomous coding agents: Claude Code, Cursor,', 'Codex, and Gemini. Compose and React ready.'], icon: 'robot', flowerDark: '#2A5D75', flowerLight: '#C3E8FF', iconDark: '#FFFFFF', iconLight: '#001E2E' });
generateCard({ name: 'theming', title: 'Dynamic Color Engine', lines: ['7 curated M3 expressive palettes, seed extraction,', 'light/dark/AMOLED modes, contrast tiers, and full', 'customizable corner rounding scales.'], icon: 'palette', flowerDark: '#6750A4', flowerLight: '#EADDFF', iconDark: '#FFFFFF', iconLight: '#21005D' });
generateCard({ name: 'docking', title: 'Magnetic Docking & Tidy', lines: ['Adjacent components fuse into unified visual clusters', 'with organic softened corner transitions. Snap to 16dp', 'gutters and 8dp rhythm boundaries in one click.'], icon: 'shapes', flowerDark: '#3A5E53', flowerLight: '#CCE8DE', iconDark: '#FFFFFF', iconLight: '#042018' });
generateCard({ name: 'loaders', title: 'Morphing Loaders', lines: ['Authentic Android shape-shifting loading indicators', 'and undulating circular/linear progress bars with', 'speed-dependent curvature mechanics.'], icon: 'sync', flowerDark: '#754877', flowerLight: '#FBD7FC', iconDark: '#FFFFFF', iconLight: '#2C132E' });
generateCard({ name: 'prototype', title: 'Interactive Wireframes', lines: ['Link buttons to target screens with directional slides,', 'subtle fades, and zoom animations. Bidirectional', 'swipe gestures and live prototype back-stack.'], icon: 'gallery', flowerDark: '#776228', flowerLight: '#FFE193', iconDark: '#FFFFFF', iconLight: '#251A00' });
generateCard({ name: 'privacy', title: '100% Client-Side Privacy', lines: ['Runs completely within browser memory and localStorage.', 'Zero telemetry, no server dependencies. Share layouts', 'statelessly via LZ-compressed URL hashes.'], icon: 'lock', flowerDark: '#2E6A45', flowerLight: '#C3EED0', iconDark: '#FFFFFF', iconLight: '#00210E' });
generateCard({ name: 'multidevice', title: 'Multi-Device Viewports', lines: ['Design simultaneously for Phone (412x892), Xiaomi Fold,', 'Wear OS Smartwatch (384x384), Large Tablet (800x1280),', 'and Desktop with vertical navigation rails.'], icon: 'devices', flowerDark: '#455173', flowerLight: '#D8E2FF', iconDark: '#FFFFFF', iconLight: '#001A41' });

generateStackPill({ name: 'nextjs', label: 'Next.js 16', icon: 'terminal', flowerDark: '#333333', flowerLight: '#E5E5E5', iconDark: '#FFFFFF', iconLight: '#000000', width: 140 });
generateStackPill({ name: 'react', label: 'React 19', icon: 'react', flowerDark: '#1E5268', flowerLight: '#C4E7FF', iconDark: '#FFFFFF', iconLight: '#001E2E', width: 130 });
generateStackPill({ name: 'ts', label: 'TypeScript 5.7', icon: 'code', flowerDark: '#2B4A75', flowerLight: '#D0E1FD', iconDark: '#FFFFFF', iconLight: '#071E3D', width: 170 });
generateStackPill({ name: 'm3e', label: 'Material 3 Expressive', icon: 'palette', flowerDark: '#6750A4', flowerLight: '#EADDFF', iconDark: '#FFFFFF', iconLight: '#21005D', width: 216 });
generateStackPill({ name: 'motion', label: 'Framer Motion 12', icon: 'sync', flowerDark: '#853B55', flowerLight: '#FFD8E4', iconDark: '#FFFFFF', iconLight: '#3B071F', width: 190 });
generateStackPill({ name: 'tailwind', label: 'Tailwind CSS 3.4', icon: 'sparkles', flowerDark: '#1F5B68', flowerLight: '#C8EAF2', iconDark: '#FFFFFF', iconLight: '#002026', width: 180 });
generateStackPill({ name: 'symbols', label: 'Material Symbols', icon: 'shapes', flowerDark: '#754877', flowerLight: '#FBD7FC', iconDark: '#FFFFFF', iconLight: '#2C132E', width: 190 });
generateStackPill({ name: 'vitest', label: 'Vitest 3 (750+ tests)', icon: 'check', flowerDark: '#4D6438', flowerLight: '#D3EABC', iconDark: '#FFFFFF', iconLight: '#111F05', width: 210 });
generateStackPill({ name: 'storage', label: 'LocalStorage & LZ-String', icon: 'lock', flowerDark: '#776228', flowerLight: '#FFE193', iconDark: '#FFFFFF', iconLight: '#251A00', width: 226 });

console.log('All Pixel-style SVG assets updated with smooth breathing animation!');
