/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {makeComputedArtifact} from './computed-artifact.js';
import {ProcessedTrace} from './processed-trace.js';
import {NetworkRecords} from './network-records.js';

/**
 * Generates the document request chain including client-side and server-side redirects.
 *
 * Example:
 *    GET /requestedUrl => 302 /firstRedirect
 *    GET /firstRedirect => 200 /firstRedirect, window.location = '/secondRedirect'
 *    GET /secondRedirect => 302 /thirdRedirect
 *    GET /thirdRedirect => 302 /mainDocumentUrl
 *    GET /mainDocumentUrl => 200 /mainDocumentUrl
 *
 * Returns network records [/requestedUrl, /firstRedirect, /secondRedirect, /thirdRedirect, /mainDocumentUrl]
 */
class DocumentRedirects {
  /**
   * @param {{devtoolsLog: LH.DevtoolsLog, trace: LH.Trace}} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<Array<LH.Artifacts.NetworkRequest>>}
   */
  static async compute_({trace, devtoolsLog}, context) {
    const networkRecords = await NetworkRecords.request(devtoolsLog, context);
    const processedTrace = await ProcessedTrace.request(trace, context);

    /** @type {Array<LH.Artifacts.NetworkRequest>} */
    const documentRequests = [];

    // Find all the document requests by examining navigation events and their redirects.
    for (const event of processedTrace.processEvents) {
      if (event.name !== 'navigationStart') continue;

      const data = event.args.data || {};
      if (!data.documentLoaderURL || !data.isLoadingMainFrame) continue;

      let networkRecord = networkRecords.find(record => record.requestId === data.navigationId);
      while (networkRecord) {
        documentRequests.push(networkRecord);
        // HTTP redirects won't have separate navStarts, so find through the redirect chain.
        networkRecord = networkRecord.redirectDestination;
      }
    }

    if (!documentRequests.length) {
      throw new Error('Navigation requests not found');
    }

    return documentRequests;
  }
}

const DocumentRedirectsComputed = makeComputedArtifact(DocumentRedirects, ['trace', 'devtoolsLog']);
export {DocumentRedirectsComputed as DocumentRedirects};
