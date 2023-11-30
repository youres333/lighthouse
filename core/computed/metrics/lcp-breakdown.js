/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {makeComputedArtifact} from '../computed-artifact.js';
import {LargestContentfulPaint} from './largest-contentful-paint.js';
import {TimeToFirstByte} from './time-to-first-byte.js';
import {LCPImageRecord} from '../lcp-image-record.js';

class LCPBreakdown {
  /**
   * @param {LH.Artifacts.MetricComputationDataInput} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<{ttfb: number, loadStart?: number, loadEnd?: number}>}
   */
  static async compute_(data, context) {
    const lcpResult = await LargestContentfulPaint.request(data, context);
    const {timing: ttfb} = await TimeToFirstByte.request(data, context);

    const lcpRecord = await LCPImageRecord.request(data, context);
    if (!lcpRecord) {
      return {ttfb};
    }

    let loadStart;
    let loadEnd;
    if ('optimisticEstimate' in lcpResult) {
      for (const [node, timing] of lcpResult.optimisticEstimate.nodeTimings) {
        if (node.type !== 'network') continue;
        if (node.record.requestId !== lcpRecord.requestId) continue;

        loadStart = timing.startTime;
        loadEnd = timing.endTime;
        break;
      }

      if (!loadStart || !loadEnd) throw new Error('LCP image record has no lantern timing');

      loadEnd = Math.min(loadEnd, lcpResult.timing);
      loadStart = Math.max(ttfb, Math.min(loadStart, loadEnd));
    } else {
      loadStart = lcpRecord.networkRequestTime;
      loadEnd = lcpRecord.networkEndTime;
    }

    return {
      ttfb,
      loadStart,
      loadEnd,
    };
  }
}

const LCPBreakdownComputed = makeComputedArtifact(
  LCPBreakdown,
  ['devtoolsLog', 'gatherContext', 'settings', 'simulator', 'trace', 'URL']
);
export {LCPBreakdownComputed as LCPBreakdown};

