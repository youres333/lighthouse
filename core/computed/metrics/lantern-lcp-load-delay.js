/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {makeComputedArtifact} from '../computed-artifact.js';
import {LanternMetric} from './lantern-metric.js';
import {LighthouseError} from '../../lib/lh-error.js';

/** @typedef {import('../../lib/dependency-graph/base-node.js').Node} Node */

class LanternLCPLoadDelay extends LanternMetric {
  /**
   * @return {LH.Gatherer.Simulation.MetricCoefficients}
   */
  static get COEFFICIENTS() {
    return {
      intercept: 0,
      optimistic: 0.5,
      pessimistic: 0.5,
    };
  }

  /**
   * @param {Node} dependencyGraph
   * @param {LH.Artifacts.ProcessedNavigation} processedNavigation
   * @return {Node}
   */
  static getLcpRequestNode(dependencyGraph, processedNavigation) {
    if (!processedNavigation.largestContentfulPaintEvt) {
      throw new LighthouseError(LighthouseError.errors.NO_LCP);
    }

    const lcpUrl = processedNavigation.lcpImagePaintEvt?.args.data?.imageUrl;
    if (!lcpUrl) {
      throw new Error('LCP was not an image');
    }

    /** @type {Node|undefined} */
    let lcpRequestNode = undefined;

    dependencyGraph.traverse(node => {
      if (node.type !== 'network') return;
      if (node.record.url !== lcpUrl) return;
      lcpRequestNode = node;
    });

    if (!lcpRequestNode) throw new Error('Could not find LCP request node');
    return lcpRequestNode;
  }

  /**
   * @param {Node} dependencyGraph
   * @param {LH.Artifacts.ProcessedNavigation} processedNavigation
   * @return {Node}
   */
  static getOptimisticGraph(dependencyGraph, processedNavigation) {
    const lcpRequestNode = this.getLcpRequestNode(dependencyGraph, processedNavigation);
    return dependencyGraph.cloneWithRelationships(node => {
      if (node.startTime > lcpRequestNode.startTime) return false;
      // Assume no CPU nodes block the LCP request in the optimistic graph.
      if (node.type === 'cpu') return false;
      if (node.record.priority === 'Low' || node.record.priority === 'VeryLow') return false;
      return true;
    });
  }

  /**
   * @param {Node} dependencyGraph
   * @param {LH.Artifacts.ProcessedNavigation} processedNavigation
   * @return {Node}
   */
  static getPessimisticGraph(dependencyGraph, processedNavigation) {
    const lcpRequestNode = this.getLcpRequestNode(dependencyGraph, processedNavigation);
    return dependencyGraph.cloneWithRelationships(node => {
      if (node.startTime > lcpRequestNode.startTime) return false;
      // Assume all CPU nodes block the LCP request in the pessimistic graph.
      if (node.type === 'cpu') return true;
      return true;
    });
  }
}

const LanternLCPLoadDelayComputed = makeComputedArtifact(
  LanternLCPLoadDelay,
  ['devtoolsLog', 'gatherContext', 'settings', 'simulator', 'trace', 'URL']
);
export {LanternLCPLoadDelayComputed as LanternLCPLoadDelay};
