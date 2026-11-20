// Renders the app icons in public/icons from one SVG. Run: npm run icons
import sharp from "sharp";
const mark = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" ${pad ? "" : 'rx="0"'} fill="#1d1d1f"/><path d="M${150 + 0} 268l70 70 142-150" fill="none" stroke="#fff" stroke-width="${pad ? 44 : 52}" stroke-linecap="round" stroke-linejoin="round" transform="${pad ? "translate(51 51) scale(.8)" : ""}"/></svg>`;
const out = [["icon-192.png", 192, false], ["icon-512.png", 512, false], ["apple-touch-icon.png", 180, false], ["icon-maskable-512.png", 512, true]];
for (const [name, size, pad] of out) await sharp(Buffer.from(mark(pad))).resize(size, size).png().toFile(`public/icons/${name}`);
console.log("icons done");
