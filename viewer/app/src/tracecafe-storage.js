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
  const encoder = new TextEncoder();
  const encodedBuffer = encoder.encode(str);

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
 * @param {LH.Result|LH.FlowResult} reportObject
 * @param {string} filename
 * @returns Promise<object described below>
 */
async function uploadLhrToTraceCafe(reportObject, filename) {
  const lhrJsonStr = JSON.stringify(reportObject);
  const lhrBlob = await gzipStringToBlob(lhrJsonStr);

  // This REST technique is completely undocumented, but.. it works.
  const formData = new FormData();
  formData.append(
    'metadata',
    JSON.stringify({
      name: `lhrs/${filename}`,
      cacheControl: 'max-age=31536000',
      contentEncoding: 'gzip',
      contentType: 'application/json',
      metadata: {oName: `${filename}`},
    })
  );
  formData.append('file', lhrBlob, 'filename');

  const resp = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/tum-lhrs/o?name=lhrs%2F${filename}`,
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
  return payload;
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
