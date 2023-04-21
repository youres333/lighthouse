/**
 * @license Copyright 2017 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {makeComputedArtifact} from './computed-artifact.js';
import {NetworkRecords} from './network-records.js';
import {ProcessedNavigation} from './processed-navigation.js';

/**
 * @fileoverview This artifact identifies the main resource on the page by using
 * the requestId associated with the last navigation in the trace.
 *
 * If there were redirects, this returns the final request in the redirect
 * chain. Follow the chain back (through `redirectSource` or `redirects`) if the
 * original request is needed instead.
 */
class MainResource {
  /**
   * @param {{trace: LH.Trace, devtoolsLog: LH.DevtoolsLog}} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<LH.Artifacts.NetworkRequest>}
   */
  static async compute_(data, context) {
    const networkRecords = await NetworkRecords.request(data.devtoolsLog, context);
    const {lastNavigationStartEvt} = await ProcessedNavigation.request(data.trace, context);
    const navigationId = lastNavigationStartEvt.args.data?.navigationId;

    let mainResource = networkRecords.find(record => record.requestId === navigationId);
    if (!mainResource) {
      throw new Error('Unable to identify the main resource');
    }

    // HTTP redirects won't have separate navStarts, so find through the redirect chain.
    while (mainResource.redirectDestination) {
      mainResource = mainResource.redirectDestination;
    }

    return mainResource;
  }
}

const MainResourceComputed = makeComputedArtifact(MainResource, ['trace', 'devtoolsLog']);
export {MainResourceComputed as MainResource};
