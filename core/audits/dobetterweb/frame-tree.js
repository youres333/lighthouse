/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Displays the frame tree for a page, which can highlight unexpected
 * hierarchies of iframes.
 */

import {Audit} from '../audit.js';
import * as i18n from '../../lib/i18n/i18n.js';

const UIStrings = {
  /** Title of a diagnostic audit that provides detail on the size of the web page's DOM. The size of a DOM is characterized by the total number of DOM elements and greatest DOM depth. This descriptive title is shown to users when the amount is acceptable and no user action is required. */
  title: 'Avoids an excessive number of iframes',
  /** Title of a diagnostic audit that provides detail on the size of the web page's DOM. The size of a DOM is characterized by the total number of DOM elements and greatest DOM depth. This imperative title is shown to users when there is a significant amount of execution time that could be reduced. */
  failureTitle: 'Avoid an excessive number of iframes',
  /** Description of a Lighthouse audit that tells the user *why* they should reduce the size of the web page's DOM. The size of a DOM is characterized by the total number of DOM elements and greatest DOM depth. This is displayed after a user expands the section to see more. No character length limits. The last sentence starting with 'Learn' becomes link text to additional documentation. */
  // TODO !
  description: 'A large DOM will increase memory usage, cause longer ' +
    '[style calculations](https://developers.google.com/web/fundamentals/performance/rendering/reduce-the-scope-and-complexity-of-style-calculations), ' +
    'and produce costly [layout reflows](https://developers.google.com/speed/articles/reflow). [Learn how to avoid an excessive DOM size](https://developer.chrome.com/docs/lighthouse/performance/dom-size/).',
  /** Table column header for the type of statistic. These statistics describe how big the DOM is (count of DOM elements, children, depth). */
  columnStatistic: 'Statistic',
  /** Table column header for the observed value of the DOM statistic. */
  columnValue: 'Value',
  /** [ICU Syntax] Label for an audit identifying the number of frames found in the page. */
  displayValue: `{itemCount, plural,
    =1 {1 frame}
    other {# frames}
    }`,
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

class FrameTree extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'frame-tree',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      requiredArtifacts: ['DOMStats'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    const {frames} = artifacts.DOMStats;

    /**
     * @param {LH.Crdp.Page.FrameTree} currentFrame
     * @return {LH.Audit.Details.FrameTreeNode}
     */
    function walk(currentFrame) {
      /** @type {LH.Audit.Details.FrameTreeNode} */
      const node = {
        url: currentFrame.frame.url,
        name: currentFrame.frame.name,
        children: [],
      };
      for (const childFrame of currentFrame.childFrames || []) {
        node.children.push(walk(childFrame));
      }
      return node;
    }

    /** @type {LH.Audit.Details.FrameTree} */
    const details = {
      type: 'frametree',
      root: walk(frames.tree),
      total: frames.total,
      maxDepth: frames.maxDepth,
      // notes: [
      //   {type: 'number', key: 'total', label: ''},
      //   {type: 'number', key: 'maxDepth', label: ''},
      // ],
      // nodeComponents: [
      //   {type: 'url', key: 'url'},
      //   {type: 'text', value: 'name'},
      // ],
    };

    return {
      score: frames.total > 20 ? 0 : 1,
      numericValue: frames.total,
      numericUnit: 'unitless',
      displayValue: str_(UIStrings.displayValue, {itemCount: frames.total}),
      details,
    };
  }
}

export default FrameTree;
export {UIStrings};
