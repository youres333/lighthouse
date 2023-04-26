/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {makeComputedArtifact} from './computed-artifact.js';
import {NetworkRecords} from './network-records.js';
import {ProcessedNavigation} from './processed-navigation.js';
import {MainResource} from './main-resource.js';

/**
 * @fileoverview Compute the navigation specific URLs `requestedUrl` and `mainDocumentUrl` in situations where
 * the `URL` artifact is not present. This is not a drop-in replacement for `URL` but can be helpful in situations
 * where getting the `URL` artifact is difficult.
 */

class DocumentUrls {
  /**
   * @param {{trace: LH.Trace, devtoolsLog: LH.DevtoolsLog}} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<{requestedUrl: string, mainDocumentUrl: string}>}
   */
  static async compute_(data, context) {
    const networkRecords = await NetworkRecords.request(data.devtoolsLog, context);
    const {firstNavigationStartEvt} = await ProcessedNavigation.request(data.trace, context);
    const navigationId = firstNavigationStartEvt.args.data?.navigationId;

    const initialRequest = networkRecords.find(record => record.requestId === navigationId);
    if (!initialRequest) throw new Error('No main frame navigations found');

    // Defer to MainResource for mainDocumentUrl for consistency.
    const mainResource = await MainResource.request(data, context);

    return {requestedUrl: initialRequest.url, mainDocumentUrl: mainResource.url};
  }
}

const DocumentUrlsComputed = makeComputedArtifact(DocumentUrls, ['devtoolsLog', 'trace']);
export {DocumentUrlsComputed as DocumentUrls};

