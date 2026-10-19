// Builds the halftone dot grid for the geography section from Natural Earth admin-0 outlines
// (public domain, https://github.com/nvkelso/natural-earth-vector, 50m scale).
//
//   curl -sSL -o prototypes/light-home/tools/data/ne_50m_admin_0_countries.geojson \
//     https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
//   node prototypes/light-home/tools/make-map.mjs prototypes/light-home/tools/data/ne_50m_admin_0_countries.geojson
//
// Only the computed grid is shipped: the script rewrites the block between /*MAP:BEGIN*/ and /*MAP:END*/
// in ../index.html. No country names are written; the page only knows "Uzbekistan" vs "other land".
//
// Grid: equirectangular with cos(lat0) x-scaling, hex-offset rows. One character per cell:
//   "."  no land      "o" other land      "e" other land at a border
//   "u"  Uzbekistan   "b" Uzbekistan at a border
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
if (!src) { console.error('usage: node make-map.mjs <ne_50m_admin_0_countries.geojson>'); process.exit(1); }
const gj = JSON.parse(readFileSync(src, 'utf8'));

// Fergana valley in the middle of the frame, Central Asia around it.
const LON0 = 58.5, LON1 = 79.5, LAT0 = 36.6, LAT1 = 44.6;
const KOKAND = { lon: 70.94, lat: 40.53 };
const kx = Math.cos(((LAT0 + LAT1) / 2) * Math.PI / 180);
const STEP = 0.165;                                  // degrees of latitude per row
const COLS = Math.round(((LON1 - LON0) * kx) / STEP);
const ROWS = Math.round((LAT1 - LAT0) / STEP);

// keep only countries whose bbox touches the frame
const polys = [];   // { id, rings: [[ [lon,lat], ... ], ...] }  (first ring outer, rest holes)
for (const f of gj.features) {
  const id = f.properties.ADM0_A3 || f.properties.ISO_A3;
  const g = f.geometry; if (!g) continue;
  const list = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const rings of list) {
    let a = 180, b = -180, c = 90, d = -90;
    for (const [x, y] of rings[0]) { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); }
    if (b < LON0 - 1 || a > LON1 + 1 || d < LAT0 - 1 || c > LAT1 + 1) continue;
    polys.push({ id, rings, box: [a, b, c, d] });
  }
}

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function countryAt(lon, lat) {
  for (const p of polys) {
    const [a, b, c, d] = p.box;
    if (lon < a || lon > b || lat < c || lat > d) continue;
    if (!inRing(lon, lat, p.rings[0])) continue;
    let hole = false;
    for (let k = 1; k < p.rings.length; k++) if (inRing(lon, lat, p.rings[k])) { hole = true; break; }
    if (!hole) return p.id;
  }
  return null;
}

const cellLonLat = (c, r) => {
  const x = (c + (r % 2 ? 0.5 : 0) + 0.5) * STEP;     // hex offset on odd rows
  const y = (r + 0.5) * STEP;
  return [LON0 + x / kx, LAT1 - y];
};
const rows = [];
let dots = 0;
for (let r = 0; r < ROWS; r++) {
  let line = '';
  for (let c = 0; c < COLS; c++) {
    const [lon, lat] = cellLonLat(c, r);
    const id = countryAt(lon, lat);
    if (!id) { line += '.'; continue; }
    const h = STEP * 0.55;
    const edge = [[h / kx, 0], [-h / kx, 0], [0, h], [0, -h]].some(([dx, dy]) => countryAt(lon + dx, lat + dy) !== id);
    const uz = id === 'UZB';
    line += uz ? (edge ? 'b' : 'u') : (edge ? 'e' : 'o');
    dots++;
  }
  rows.push(line);
}
const kokand = {
  x: +(((KOKAND.lon - LON0) * kx) / STEP / COLS).toFixed(4),
  y: +(((LAT1 - KOKAND.lat) / STEP) / ROWS).toFixed(4),
};
const block = `/*MAP:BEGIN*/ const MAP = { cols: ${COLS}, rows: ${ROWS}, kokand: ${JSON.stringify(kokand)}, grid: ${JSON.stringify(rows.join(''))} }; /*MAP:END*/`;
const indexPath = resolve(here, '../index.html');
const html = readFileSync(indexPath, 'utf8');
if (!/\/\*MAP:BEGIN\*\/[\s\S]*?\/\*MAP:END\*\//.test(html)) { console.error('MAP markers not found in index.html'); process.exit(1); }
writeFileSync(indexPath, html.replace(/\/\*MAP:BEGIN\*\/[\s\S]*?\/\*MAP:END\*\//, () => block));
console.log(`grid ${COLS}x${ROWS}, ${dots} land dots, kokand at ${JSON.stringify(kokand)}, block ${block.length} chars`);
