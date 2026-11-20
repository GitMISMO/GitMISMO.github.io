/* File checks (Nov 20, 2026, after the website found 18 zips missing their first 5 MB).
   checkBuf(buf, file, expectedBytes?) -> '' when the file is whole, otherwise what is wrong, in plain words.
   A zip must start with "PK" and its own directory must match where it sits in the file
   (a zip missing its start says it should be larger than it is). */
export function zipProblem(buf) {
  if (buf.length < 22) return 'too small to be a zip';
  if (buf[0] !== 0x50 || buf[1] !== 0x4b) return 'does not start with "PK"';
  const from = Math.max(0, buf.length - 65557);
  let e = -1; for (let i = buf.length - 22; i >= from; i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) return 'has no zip directory at its end';
  let cdSize = buf.readUInt32LE(e + 12), cdOff = buf.readUInt32LE(e + 16), end = e;
  if (cdOff === 0xffffffff || cdSize === 0xffffffff) {           /* zip64: read the zip64 directory record */
    const l = e - 20; if (l < 0 || buf.readUInt32LE(l) !== 0x07064b50) return 'has a damaged zip64 directory';
    const r = Number(buf.readBigUInt64LE(l + 8)); if (r < 0 || r + 56 > buf.length || buf.readUInt32LE(r) !== 0x06064b50) return 'has a damaged zip64 directory';
    cdSize = Number(buf.readBigUInt64LE(r + 40)); cdOff = Number(buf.readBigUInt64LE(r + 48)); end = r;
  }
  const gap = cdOff + cdSize - end;
  if (gap > 0) return `is missing ${gap.toLocaleString('en-US')} bytes (its directory says it should be ${(buf.length + gap).toLocaleString('en-US')} bytes)`;
  if (gap < 0 && buf.readUInt32LE(cdOff) !== 0x02014b50) return 'has a damaged zip directory';
  return '';
}
export function checkBuf(buf, file, expected) {
  if (!buf || !buf.length) return 'is empty';
  if (expected != null && buf.length !== expected) return `is ${buf.length.toLocaleString('en-US')} bytes, not ${Number(expected).toLocaleString('en-US')}`;
  return /\.zip$/i.test(file || '') ? zipProblem(buf) : '';
}
