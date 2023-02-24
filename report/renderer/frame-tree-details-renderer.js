/**
 * @license
 * Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This file contains helpers for constructing and rendering the
 * frame tree.
 */

import {Globals} from './report-globals.js';

/** @typedef {import('./dom.js').DOM} DOM */
/** @typedef {import('./details-renderer.js').DetailsRenderer} DetailsRenderer */
/**
 * @typedef Segment
 * @property {LH.Audit.Details.FrameTreeNode} node
 * @property {boolean} isLastChild
 * @property {boolean} hasChildren
 * @property {boolean[]} treeMarkers
 */

class FrameTreeRenderer {
  /**
   * Helper to create context for each critical-request-chain node based on its
   * parent. Calculates if this node is the last child, whether it has any
   * children itself and what the tree looks like all the way back up to the root,
   * so the tree markers can be drawn correctly.
   * @param {LH.Audit.Details.FrameTreeNode} node
   * @param {LH.Audit.Details.FrameTreeNode} parent
   * @param {Array<boolean>=} treeMarkers
   * @param {boolean=} parentIsLastChild
   * @return {Segment}
   */
  static createSegment(node, parent, treeMarkers, parentIsLastChild) {
    const index = parent.children.indexOf(node);
    const isLastChild = index === (parent.children.length - 1);
    const hasChildren = !!node.children && node.children.length > 0;

    // Copy the tree markers so that we don't change by reference.
    const newTreeMarkers = Array.isArray(treeMarkers) ? treeMarkers.slice(0) : [];

    // Add on the new entry.
    if (typeof parentIsLastChild !== 'undefined') {
      newTreeMarkers.push(!parentIsLastChild);
    }

    return {
      node,
      isLastChild,
      hasChildren,
      treeMarkers: newTreeMarkers,
    };
  }

  /**
   * Creates the DOM for a tree segment.
   * @param {DOM} dom
   * @param {Segment} segment
   * @param {DetailsRenderer} detailsRenderer
   * @return {Node}
   */
  static createTreeNode(dom, segment, detailsRenderer) {
    const chainEl = dom.createComponent('crcChain');

    // Hovering over request shows full URL.
    dom.find('.lh-crc-node', chainEl).setAttribute('title', segment.node.url);

    const treeMarkeEl = dom.find('.lh-crc-node__tree-marker', chainEl);

    // Construct lines and add spacers for sub requests.
    segment.treeMarkers.forEach(separator => {
      const classSeparator = separator ?
        'lh-tree-marker lh-vert' :
        'lh-tree-marker';
      treeMarkeEl.append(
        dom.createElement('span', classSeparator),
        dom.createElement('span', 'lh-tree-marker')
      );
    });

    const classLastChild = segment.isLastChild ?
      'lh-tree-marker lh-up-right' :
      'lh-tree-marker lh-vert-right';
    const classHasChildren = segment.hasChildren ?
      'lh-tree-marker lh-horiz-down' :
      'lh-tree-marker lh-right';

    treeMarkeEl.append(
      dom.createElement('span', classLastChild),
      dom.createElement('span', 'lh-tree-marker lh-right'),
      dom.createElement('span', classHasChildren)
    );

    const url = segment.node.url;
    const linkEl = detailsRenderer.renderTextURL(url);
    const treevalEl = dom.find('.lh-crc-node__tree-value', chainEl);
    treevalEl.append(linkEl);

    if (segment.node.name) {
      const span = dom.createElement('span', 'lh-crc-node__chain-duration');
      span.textContent = ' - ' + segment.node.name;
      treevalEl.append(span);
    }

    return chainEl;
  }

  /**
   * Recursively builds a tree from segments.
   * @param {DOM} dom
   * @param {DocumentFragment} tmpl
   * @param {Segment} segment
   * @param {Element} elem Parent element.
   * @param {LH.Audit.Details.FrameTree} details
   * @param {DetailsRenderer} detailsRenderer
   */
  static buildTree(dom, tmpl, segment, elem, details, detailsRenderer) {
    elem.append(FrameTreeRenderer.createTreeNode(dom, segment, detailsRenderer));
    for (const child of segment.node.children) {
      const childSegment = FrameTreeRenderer.createSegment(child, segment.node,
        segment.treeMarkers, segment.isLastChild);
      FrameTreeRenderer.buildTree(dom, tmpl, childSegment, elem, details, detailsRenderer);
    }
  }

  /**
   * @param {DOM} dom
   * @param {LH.Audit.Details.FrameTree} details
   * @param {DetailsRenderer} detailsRenderer
   * @return {Element}
   */
  static render(dom, details, detailsRenderer) {
    const tmpl = dom.createComponent('crc');
    const containerEl = dom.find('.lh-crc', tmpl);

    // Fill in top summary.
    dom.find('.lh-crc__longest_duration_label', tmpl).textContent =
        Globals.strings.totalFramesLabel;
    dom.find('.lh-crc__longest_duration', tmpl).textContent = String(details.total);

    // Construct visual tree.
    // for (let i = 0; i < details.root.children.length; i++) {
    //   const segment =
    //     FrameTreeRenderer.createSegment(details.root, i);
    //   FrameTreeRenderer.buildTree(dom, tmpl, segment, containerEl, details, detailsRenderer);
    // }
    const segment =
      FrameTreeRenderer.createSegment(details.root, {children: [details.root], url: ''});
    FrameTreeRenderer.buildTree(dom, tmpl, segment, containerEl, details, detailsRenderer);

    return dom.find('.lh-crc-container', tmpl);
  }
}

export {
  FrameTreeRenderer,
};
