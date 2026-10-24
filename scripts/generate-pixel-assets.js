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

// 12-point scalloped Material 3 Expressive flower path (precisely centered at 0, 0)
const CENTERED_FLOWER_PATH = "M24.6,5.0C24.2,5.5 23.8,5.9 23.4,6.4C23.1,6.9 22.7,7.3 22.5,7.8C22.2,8.3 22.0,8.7 21.8,9.2C21.7,9.8 21.6,10.3 21.5,10.9C21.4,11.4 21.4,12.0 21.4,12.6C21.3,13.2 21.3,13.9 21.2,14.5C21.1,15.1 20.9,15.7 20.7,16.3C20.4,16.8 20.1,17.3 19.7,17.8C19.3,18.2 18.9,18.6 18.4,18.9C17.8,19.2 17.2,19.4 16.7,19.6C16.1,19.8 15.4,19.9 14.8,20.0C14.2,20.2 13.6,20.3 13.1,20.4C12.5,20.5 12.0,20.7 11.5,20.9C11.0,21.1 10.6,21.4 10.2,21.7C9.7,22.0 9.3,22.4 8.9,22.9C8.5,23.3 8.1,23.7 7.6,24.2C7.2,24.6 6.7,25.0 6.2,25.4C5.7,25.8 5.2,26.1 4.7,26.3C4.1,26.5 3.5,26.6 2.9,26.7C2.3,26.7 1.7,26.6 1.1,26.4C0.6,26.3 -0.0,26.0 -0.6,25.8C-1.3,25.5 -1.8,25.2 -2.3,24.9C-2.8,24.6 -3.3,24.3 -3.8,24.1C-4.3,23.9 -4.8,23.7 -5.3,23.6C-5.8,23.5 -6.4,23.5 -6.9,23.5C-7.5,23.5 -8.0,23.5 -8.6,23.6C-9.2,23.6 -9.9,23.7 -10.5,23.8C-11.1,23.8 -11.7,23.8 -12.3,23.7C-12.9,23.6 -13.5,23.5 -14.1,23.2C-14.6,23.0 -15.1,22.6 -15.5,22.2C-15.9,21.8 -16.3,21.3 -16.6,20.8C-17.0,20.2 -17.2,19.6 -17.4,19.1C-17.7,18.5 -17.9,17.9 -18.1,17.4C-18.3,16.8 -18.5,16.3 -18.8,15.9C-19.1,15.4 -19.4,15.0 -19.8,14.6C-20.1,14.2 -20.5,13.8 -21.0,13.5C-21.5,13.1 -22.0,12.8 -22.5,12.5C-23.0,12.1 -23.5,11.8 -24.0,11.4C-24.4,11.0 -24.9,10.5 -25.3,10.1C-25.6,9.6 -25.9,9.0 -26.1,8.5C-26.3,7.9 -26.4,7.3 -26.4,6.7C-26.4,6.1 -26.3,5.5 -26.1,4.9C-26.0,4.3 -25.8,3.7 -25.6,3.1C-25.4,2.5 -25.2,2.0 -25.1,1.4C-24.9,0.9 -24.8,0.3 -24.7,-0.2C-24.7,-0.7 -24.7,-1.2 -24.7,-1.8C-24.8,-2.3 -24.9,-2.9 -25.1,-3.4C-25.2,-4.0 -25.4,-4.6 -25.6,-5.2C-25.7,-5.8 -25.9,-6.4 -26.0,-7.0C-26.0,-7.6 -26.0,-8.3 -25.9,-8.8C-25.8,-9.4 -25.7,-10.0 -25.4,-10.5C-25.1,-11.0 -24.7,-11.5 -24.3,-11.9C-23.9,-12.4 -23.4,-12.8 -22.9,-13.1C-22.4,-13.5 -21.8,-13.8 -21.3,-14.1C-20.8,-14.4 -20.3,-14.7 -19.8,-15.0C-19.4,-15.4 -19.0,-15.7 -18.6,-16.1C-18.3,-16.5 -18.0,-17.0 -17.7,-17.4C-17.4,-17.9 -17.2,-18.5 -17.0,-19.0C-16.7,-19.5 -16.5,-20.1 -16.2,-20.7C-15.9,-21.2 -15.6,-21.8 -15.2,-22.3C-14.8,-22.7 -14.4,-23.2 -13.9,-23.5C-13.4,-23.8 -12.9,-24.1 -12.3,-24.3C-11.7,-24.4 -11.1,-24.5 -10.5,-24.5C-9.9,-24.5 -9.2,-24.4 -8.6,-24.4C-8.0,-24.3 -7.4,-24.2 -6.8,-24.1C-6.3,-24.0 -5.8,-23.9 -5.3,-23.9C-4.6,-23.9 -4.1,-24.0 -3.6,-24.1C-3.1,-24.2 -2.5,-24.4 -2.0,-24.7C-1.5,-24.9 -1.0,-25.2 -0.4,-25.4C0.1,-25.7 0.7,-26.0 1.3,-26.2C1.9,-26.4 2.5,-26.6 3.1,-26.6C3.7,-26.7 4.3,-26.7 4.9,-26.6C5.4,-26.4 6.0,-26.2 6.5,-25.9C7.0,-25.6 7.5,-25.2 8.0,-24.8C8.4,-24.4 8.9,-23.9 9.3,-23.5C9.7,-23.0 10.1,-22.5 10.5,-22.1C10.9,-21.7 11.2,-21.3 11.7,-21.0C12.1,-20.7 12.6,-20.5 13.1,-20.2C13.6,-20.0 14.1,-19.9 14.7,-19.7C15.2,-19.6 15.9,-19.5 16.4,-19.3C17.0,-19.1 17.7,-18.9 18.2,-18.7C18.8,-18.4 19.3,-18.1 19.8,-17.8C20.2,-17.4 20.6,-16.9 21.0,-16.4C21.3,-15.9 21.5,-15.4 21.7,-14.8C21.8,-14.2 21.9,-13.6 21.9,-13.0C22.0,-12.3 22.0,-11.7 22.0,-11.1C22.0,-10.5 22.0,-9.9 22.1,-9.4C22.2,-8.8 22.3,-8.3 22.4,-7.8C22.6,-7.3 22.8,-6.8 23.1,-6.3C23.4,-5.9 23.7,-5.4 24.1,-4.9C24.4,-4.4 24.8,-3.9 25.2,-3.4C25.5,-2.9 25.8,-2.3 26.0,-1.7C26.3,-1.2 26.4,-0.6 26.5,0.0C26.5,0.6 26.5,1.2 26.3,1.8C26.2,2.3 25.9,2.9 25.5,3.4C25.3,4.0 24.9,4.5 24.6,5.0Z";

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
// 1. ROTATING PIXEL BADGE (Height: 28, Flower Center: 14, 14)
// -------------------------------------------------------------
function generateBadge({ name, label, icon, flowerDark, flowerLight, iconDark, iconLight, width }) {
  // DARK with active 8s rotation
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 8s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M14,0H${width - 14}A14,14 0 0 1 ${width},14V14A14,14 0 0 1 ${width - 14},28H14A14,14 0 0 1 0,14V14A14,14 0 0 1 14,0Z" fill="#221b24" stroke="#362938" stroke-width="1"/>
    <g transform="translate(14, 14)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerDark}" transform="scale(0.44)"/>
      </g>
      ${renderIcon(icon, 11, iconDark)}
    </g>
    <text x="27" y="18" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#f0e2ee">${label}</text>
  </svg>`;
  saveSvg(path.join('dark', `badge-${name}.svg`), darkSvg);

  // LIGHT with active 8s rotation
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 8s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M14,0H${width - 14}A14,14 0 0 1 ${width},14V14A14,14 0 0 1 ${width - 14},28H14A14,14 0 0 1 0,14V14A14,14 0 0 1 14,0Z" fill="#f0e5ef" stroke="#ded0dd" stroke-width="1"/>
    <g transform="translate(14, 14)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerLight}" transform="scale(0.44)"/>
      </g>
      ${renderIcon(icon, 11, iconLight)}
    </g>
    <text x="27" y="18" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#261b28">${label}</text>
  </svg>`;
  saveSvg(path.join('light', `badge-${name}.svg`), lightSvg);
}

// -------------------------------------------------------------
// 2. ROTATING ACTION BUTTON (Height: 68, Flower Center: 38, 34)
// -------------------------------------------------------------
function generateButton({ name, sublabel, label, icon, flowerDark, flowerLight, iconDark, iconLight, bgDark, bgLight, textDark, textLight, width = 216 }) {
  // DARK with active 10s rotation
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="68" viewBox="0 0 ${width} 68">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 10s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M34,1H${width - 34}A33,33 0 0 1 ${width - 1},34V34A33,33 0 0 1 ${width - 34},67H34A33,33 0 0 1 1,34V34A33,33 0 0 1 34,1Z" fill="${bgDark || '#261e27'}" stroke="#3d2f3e" stroke-width="1"/>
    <g transform="translate(38, 34)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerDark}" transform="scale(1.05)" />
      </g>
      ${renderIcon(icon, 24, iconDark)}
    </g>
    <text x="74" y="27" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="10" font-weight="700" fill="${textDark ? textDark + '99' : '#caa7cd'}" letter-spacing="0.08em">${sublabel.toUpperCase()}</text>
    <text x="74" y="47" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="16" font-weight="700" fill="${textDark || '#ffffff'}">${label}</text>
  </svg>`;
  saveSvg(path.join('dark', `btn-${name}.svg`), darkSvg);

  // LIGHT
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="68" viewBox="0 0 ${width} 68">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 10s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M34,1H${width - 34}A33,33 0 0 1 ${width - 1},34V34A33,33 0 0 1 ${width - 34},67H34A33,33 0 0 1 1,34V34A33,33 0 0 1 34,1Z" fill="${bgLight || '#f1e6f0'}" stroke="#dccbda" stroke-width="1"/>
    <g transform="translate(38, 34)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerLight}" transform="scale(1.05)" />
      </g>
      ${renderIcon(icon, 24, iconLight)}
    </g>
    <text x="74" y="27" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="10" font-weight="700" fill="${textLight ? textLight + '99' : '#695168'}" letter-spacing="0.08em">${sublabel.toUpperCase()}</text>
    <text x="74" y="47" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="16" font-weight="700" fill="${textLight || '#211824'}">${label}</text>
  </svg>`;
  saveSvg(path.join('light', `btn-${name}.svg`), lightSvg);
}

// -------------------------------------------------------------
// 3. ROTATING HEADER BANNER (1000 x 104, Flower Center: 56, 52)
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
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 12s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M52,0H948A52,52 0 0 1 1000,52V52A52,52 0 0 1 948,104H52A52,52 0 0 1 0,52V52A52,52 0 0 1 52,0Z" fill="#231b24"/>
    <g transform="translate(56, 52)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerDark}" transform="scale(1.52)" />
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
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 12s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M52,0H948A52,52 0 0 1 1000,52V52A52,52 0 0 1 948,104H52A52,52 0 0 1 0,52V52A52,52 0 0 1 52,0Z" fill="#ede2ed"/>
    <g transform="translate(56, 52)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerLight}" transform="scale(1.52)" />
      </g>
      ${renderIcon(icon, 36, iconLight)}
    </g>
    <text x="114" y="47" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="32" font-weight="700" fill="#211824">${title}</text>
    <text x="114" y="74" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="15" font-weight="400" fill="#675466">${subtitle}</text>
    ${renderTags(tags, false)}
  </svg>`;
  saveSvg(path.join('light', `h-${name}.svg`), dLight);

  // MOBILE RESPONSIVE VERSION (640 x 90, Flower Center: 46, 45)
  const mDark = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="90" viewBox="0 0 640 90">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 12s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M45,0H595A45,45 0 0 1 640,45V45A45,45 0 0 1 595,90H45A45,45 0 0 1 0,45V45A45,45 0 0 1 45,0Z" fill="#231b24"/>
    <g transform="translate(46, 45)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerDark}" transform="scale(1.28)" />
      </g>
      ${renderIcon(icon, 30, iconDark)}
    </g>
    <text x="96" y="42" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="25" font-weight="700" fill="#ffffff">${title}</text>
    <text x="96" y="66" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13" font-weight="400" fill="#cbb4ca">${subtitle}</text>
  </svg>`;
  saveSvg(path.join('dark', `hm-${name}.svg`), mDark);

  const mLight = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="90" viewBox="0 0 640 90">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 12s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M45,0H595A45,45 0 0 1 640,45V45A45,45 0 0 1 595,90H45A45,45 0 0 1 0,45V45A45,45 0 0 1 45,0Z" fill="#ede2ed"/>
    <g transform="translate(46, 45)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerLight}" transform="scale(1.28)" />
      </g>
      ${renderIcon(icon, 30, iconLight)}
    </g>
    <text x="96" y="42" font-family="system-ui, -apple-system, 'Google Sans', Roboto, sans-serif" font-size="25" font-weight="700" fill="#211824">${title}</text>
    <text x="96" y="66" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="13" font-weight="400" fill="#675466">${subtitle}</text>
  </svg>`;
  saveSvg(path.join('light', `hm-${name}.svg`), mLight);
}

// -------------------------------------------------------------
// 4. ROTATING FEATURE CARD (430 x 218, Flower Center: 64, 60)
// -------------------------------------------------------------
function generateCard({ name, title, lines, icon, flowerDark, flowerLight, iconDark, iconLight }) {
  const tLines = lines.map((l, i) => `<tspan x="36" dy="${i === 0 ? 0 : 20}">${l}</tspan>`).join('');

  // DARK
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="430" height="218" viewBox="0 0 430 218">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 12s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <clipPath id="c_${name}"><rect width="430" height="218" rx="32" /></clipPath>
    <rect width="430" height="218" rx="32" fill="#1b131c" stroke="#362938" stroke-width="1"/>
    <g clip-path="url(#c_${name})">
      <path d="M440,110 C420,115 390,125 375,115 C360,105 340,65 315,55 C295,47 285,15 305,-5 C325,-25 355,-55 390,-55 C430,-55 470,20 475,50 C480,80 455,105 440,110 Z" fill="#261d28" />
    </g>
    <g transform="translate(64, 60)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerDark}" transform="scale(1.18)" />
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
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 12s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <clipPath id="cl_${name}"><rect width="430" height="218" rx="32" /></clipPath>
    <rect width="430" height="218" rx="32" fill="#f4ebf4" stroke="#e0cee0" stroke-width="1"/>
    <g clip-path="url(#cl_${name})">
      <path d="M440,110 C420,115 390,125 375,115 C360,105 340,65 315,55 C295,47 285,15 305,-5 C325,-25 355,-55 390,-55 C430,-55 470,20 475,50 C480,80 455,105 440,110 Z" fill="#ece0ed" />
    </g>
    <g transform="translate(64, 60)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerLight}" transform="scale(1.18)" />
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
// 5. ROTATING TECH STACK PILL (Height: 42, Flower Center: 21, 21)
// -------------------------------------------------------------
function generateStackPill({ name, label, icon, flowerDark, flowerLight, iconDark, iconLight, width }) {
  // DARK with active 8s rotation
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="42" viewBox="0 0 ${width} 42">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 8s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M21,0H${width - 21}A21,21 0 0 1 ${width},21V21A21,21 0 0 1 ${width - 21},42H21A21,21 0 0 1 0,21V21A21,21 0 0 1 21,0Z" fill="#231b24" stroke="#362938" stroke-width="1"/>
    <g transform="translate(21, 21)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerDark}" transform="scale(0.68)" />
      </g>
      ${renderIcon(icon, 17, iconDark)}
    </g>
    <text x="42" y="26" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="14.5" font-weight="600" fill="#f0e2ee">${label}</text>
  </svg>`;
  saveSvg(path.join('dark', `pill-${name}.svg`), darkSvg);

  // LIGHT
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="42" viewBox="0 0 ${width} 42">
    <defs>
      <style>
        @keyframes m3e-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .m3e-flower-spin { animation: m3e-spin 8s linear infinite; transform-origin: 0px 0px; }
      </style>
    </defs>
    <path d="M21,0H${width - 21}A21,21 0 0 1 ${width},21V21A21,21 0 0 1 ${width - 21},42H21A21,21 0 0 1 0,21V21A21,21 0 0 1 21,0Z" fill="#f0e5ef" stroke="#ded0dd" stroke-width="1"/>
    <g transform="translate(21, 21)">
      <g class="m3e-flower-spin">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
        <path d="${CENTERED_FLOWER_PATH}" fill="${flowerLight}" transform="scale(0.68)" />
      </g>
      ${renderIcon(icon, 17, iconLight)}
    </g>
    <text x="42" y="26" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="14.5" font-weight="600" fill="#261b28">${label}</text>
  </svg>`;
  saveSvg(path.join('light', `pill-${name}.svg`), lightSvg);
}

// Run generators
console.log('Generating living M3E animated badges, buttons, headers, and cards with smooth rotation...');

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

console.log('All Pixel-style SVG assets updated with smooth spinning animations!');
