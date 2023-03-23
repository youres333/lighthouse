/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {makeComputedArtifact} from '../computed-artifact.js';
import {NavigationMetric} from './navigation-metric.js';
import {LighthouseError} from '../../lib/lh-error.js';
import PrioritizeLcpImage from '../../audits/prioritize-lcp-image.js';
import {NetworkRecords} from '../network-records.js';
import {LanternLCPLoadDelay} from './lantern-lcp-load-delay.js';

class LCPLoadDelay extends NavigationMetric {
  /**
   * @param {LH.Artifacts.NavigationMetricComputationData} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<LH.Artifacts.LanternMetric>}
   */
  static computeSimulatedMetric(data, context) {
    const metricData = NavigationMetric.getMetricComputationInput(data);
    return LanternLCPLoadDelay.request(metricData, context);
  }

  /**
   * @param {LH.Artifacts.NavigationMetricComputationData} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<LH.Artifacts.Metric>}
   */
  static async computeObservedMetric(data, context) {
    const {processedNavigation} = data;
    if (processedNavigation.timings.largestContentfulPaint === undefined) {
      throw new LighthouseError(LighthouseError.errors.NO_LCP);
    }

    const timeOriginTs = processedNavigation.timestamps.timeOrigin;
    const networkRecords = await NetworkRecords.request(data.devtoolsLog, context);

    const lcpRecord =
      PrioritizeLcpImage.getLcpRecord(processedNavigation, networkRecords);

    if (!lcpRecord) {
      throw new Error('LCP is not an image');
    }

    const loadDelayTs = lcpRecord.networkRequestTime * 1000;
    const loadDelayTiming = (loadDelayTs - timeOriginTs) / 1000;

    return {
      timing: loadDelayTiming,
      timestamp: loadDelayTs,
    };
  }
}

const LCPLoadDelayComputed = makeComputedArtifact(
  LCPLoadDelay,
  ['devtoolsLog', 'gatherContext', 'settings', 'simulator', 'trace', 'URL']
);
export {LCPLoadDelayComputed as LCPLoadDelay};
