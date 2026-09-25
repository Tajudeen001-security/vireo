/**
 * Minimal ZIP writer (store method, no compression) for browser downloads.
 */

function crc32(data: number[] | Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeU16(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff];
}

function writeU32(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
}

export type ZipEntry = { path: string; content: string };

/** Build a ZIP as a plain number[] then copy into ArrayBuffer (TS-safe for Blob). */
export function buildZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const localChunks: number[][] = [];
  const centralChunks: number[][] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = entry.path.replace(/^\/+/, "");
    const nameBytes = Array.from(encoder.encode(name));
    const dataBytes = Array.from(encoder.encode(entry.content));
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    const localHeader = [
      ...writeU32(0x04034b50),
      ...writeU16(20),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU32(crc),
      ...writeU32(size),
      ...writeU32(size),
      ...writeU16(nameBytes.length),
      ...writeU16(0),
      ...nameBytes,
    ];

    localChunks.push(localHeader, dataBytes);

    const central = [
      ...writeU32(0x02014b50),
      ...writeU16(20),
      ...writeU16(20),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU32(crc),
      ...writeU32(size),
      ...writeU32(size),
      ...writeU16(nameBytes.length),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU16(0),
      ...writeU32(0),
      ...writeU32(offset),
      ...nameBytes,
    ];
    centralChunks.push(central);
    offset += localHeader.length + dataBytes.length;
  }

  const centralDir = centralChunks.flat();
  const end = [
    ...writeU32(0x06054b50),
    ...writeU16(0),
    ...writeU16(0),
    ...writeU16(entries.length),
    ...writeU16(entries.length),
    ...writeU32(centralDir.length),
    ...writeU32(offset),
    ...writeU16(0),
  ];

  const all = [...localChunks.flat(), ...centralDir, ...end];
  const ab = new ArrayBuffer(all.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < all.length; i++) view[i] = all[i];

  return new Blob([ab], { type: "application/zip" });
}

export function downloadZip(filename: string, entries: ZipEntry[]) {
  const blob = buildZip(entries);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".zip") ? filename : `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
