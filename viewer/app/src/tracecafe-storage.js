/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* global CompressionStream TransformStream */

/**
 * @param {string} str
 * @returns {Promise<Blob>}
 */
async function gzipStringToBlob(str) {
  const encodedBuffer = new TextEncoder().encode(str);

  const codecStream = new CompressionStream('gzip');
  const {readable, writable} = new TransformStream();
  const codecReadable = readable.pipeThrough(codecStream);

  const writer = writable.getWriter();
  void writer.write(encodedBuffer);
  void writer.close();

  const response = new Response(codecReadable);
  return response.blob();
}

/**
 * Thx https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 * @param {string} str
 */
async function generateHash(str) {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Reduce to a base-36 alpha-numeric hash
  // FWIW: `hashArray.map(b => String.fromCharCode(b)).join('')` creates a shorter id, but NOT after uri encoding
  const hash = hashArray.map(b => b.toString(36)).join('');
  return hash;
}
/**
 * @param {LH.Result|LH.FlowResult} reportObject
 * @param {string} filename
 * @returns Promise<object described below>
 */
async function uploadLhrToTraceCafe(reportObject, filename) {
  const lhrJsonStr = JSON.stringify(reportObject);
  const lhrBlob = await gzipStringToBlob(lhrJsonStr);

  const hash = await generateHash(lhrJsonStr);
  // Strip time off filename, for a cleaner look
  const shortname = filename.split('_').slice(0, 2).join('_').replaceAll('-', '_');
  const id = `${shortname}-${hash}`;

  // This REST technique is completely undocumented, but.. it works.
  const formData = new FormData();
  formData.append(
    'metadata',
    JSON.stringify({
      name: `lhrs/${id}`,
      cacheControl: 'max-age=31536000',
      contentEncoding: 'gzip',
      contentType: 'application/json',
      metadata: {oName: `${filename}`},
    })
  );
  formData.append('file', lhrBlob, 'filename');

  const resp = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/tum-lhrs/o?name=lhrs%2F${id}`,
    {
      method: 'POST',
      body: formData,
      headers: {'X-Goog-Upload-Protocol': 'multipart'},
    }
  );
  const payload = await resp.json();
  if (!resp.ok) {
    console.error(payload);
    throw new Error(`Upload failed. ${payload?.error?.message}`);
  }
  return id;
}

/**
 * Result is in this shape:
 *
  {
    name: 'lhrs/lhrfilename.json',
    bucket: 'tum-lhrs',
    generation: '1700156936417822',
    metageneration: '1',
    contentType: 'application/json',
    timeCreated: '2023-11-16T17:48:56.475Z',
    updated: '2023-11-16T17:48:56.475Z',
    storageClass: 'MULTI_REGIONAL',
    size: '472',
    md5Hash: 'KDAFaeEugvWpLvt8SS0unw==',
    contentEncoding: 'gzip',
    contentDisposition: "inline; filename*=utf-8''lhrfilename.json",
    cacheControl: 'max-age=31536000',
    crc32c: 'Jhu89w==',
    etag: 'CJ7kh5KKyYIDEAE=',
    downloadTokens: '021e757e-a64d-491a-97c9-01dbf2463266',
    metadata: {oName: 'lhrfilename.json'},
  };
 */

export {
  uploadLhrToTraceCafe,
};
