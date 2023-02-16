/**
 * @license Copyright 2017 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Gathers stats about the max height and width of the DOM tree
 * and total number of elements used on the page.
 */

/* global getNodeDetails document */


import FRGatherer from '../../base-gatherer.js';
import {pageFunctions} from '../../../lib/page-functions.js';

/**
 * Calculates the maximum tree depth of the DOM.
 * @param {HTMLElement} element Root of the tree to look in.
 * @param {boolean=} deep True to include shadow roots. Defaults to true.
 * @return {Pick<LH.Artifacts.DOMStats, 'totalBodyElements' | 'width' | 'depth'>}
 */
/* c8 ignore start */
function getDOMStats(element = document.body, deep = true) {
  let deepestElement = null;
  let maxDepth = -1;
  let maxWidth = -1;
  let numElements = 0;
  let parentWithMostChildren = null;

  /**
   * @param {Element|ShadowRoot} element
   * @param {number} depth
   */
  const _calcDOMWidthAndHeight = function(element, depth = 1) {
    if (depth > maxDepth) {
      deepestElement = element;
      maxDepth = depth;
    }
    if (element.children.length > maxWidth) {
      parentWithMostChildren = element;
      maxWidth = element.children.length;
    }

    let child = element.firstElementChild;
    while (child) {
      _calcDOMWidthAndHeight(child, depth + 1);
      // If element has shadow dom, traverse into that tree.
      if (deep && child.shadowRoot) {
        _calcDOMWidthAndHeight(child.shadowRoot, depth + 1);
      }
      child = child.nextElementSibling;
      numElements++;
    }

    return {maxDepth, maxWidth, numElements};
  };

  const result = _calcDOMWidthAndHeight(element);

  return {
    depth: {
      max: result.maxDepth,
      // @ts-expect-error - getNodeDetails put into scope via stringification
      ...getNodeDetails(deepestElement),
    },
    width: {
      max: result.maxWidth,
      // @ts-expect-error - getNodeDetails put into scope via stringification
      ...getNodeDetails(parentWithMostChildren),
    },
    totalBodyElements: result.numElements,
  };
}
/* c8 ignore stop */

class DOMStats extends FRGatherer {
  /** @type {LH.Gatherer.GathererMeta} */
  meta = {
    supportedModes: ['snapshot', 'navigation'],
  };

  /**
   * @param {LH.Crdp.Page.FrameTree} rootFrameTree
   * @return {Pick<LH.Artifacts.DOMStats, "totalFrames" | "framesDepth">}
   */
  static determineFrameStats(rootFrameTree) {
    let maxDepth = 0;
    let maxFrameUrl = '';
    let totalFrames = 0;

    /**
     * @param {LH.Crdp.Page.FrameTree} frameTree
     */
    function walk(frameTree, depth = 1) {
      // When Chrome comes across an iframe for a URL already framed above in the hierarchy,
      // it will load as an empty document and its URL in the frame tree will be just `:`.
      // Best to just ignore.
      if (frameTree.frame.url === ':' || frameTree.frame.domainAndRegistry === '') {
        return;
      }

      if (depth > maxDepth) {
        maxDepth = depth;
        maxFrameUrl = frameTree.frame.url;
      }
      totalFrames += 1;
      for (const childFrameTree of frameTree.childFrames || []) {
        walk(childFrameTree, depth + 1);
      }
    }

    walk(rootFrameTree);
    return {
      totalFrames,
      framesDepth: {max: maxDepth, url: maxFrameUrl},
    };
  }

  /**
   * @param {LH.Gatherer.FRTransitionalContext} passContext
   * @return {Promise<LH.Artifacts['DOMStats']>}
   */
  async getArtifact(passContext) {
    const driver = passContext.driver;

    await driver.defaultSession.sendCommand('DOM.enable');
    const elementsResult = await driver.executionContext.evaluate(getDOMStats, {
      args: [],
      useIsolation: true,
      deps: [pageFunctions.getNodeDetails],
    });
    await driver.defaultSession.sendCommand('DOM.disable');

    const {frameTree} = await driver.defaultSession.sendCommand('Page.getFrameTree');
    const framesResult = DOMStats.determineFrameStats(frameTree);

    return {...elementsResult, ...framesResult};
  }
}

export default DOMStats;
