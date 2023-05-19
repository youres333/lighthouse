/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/* global window, document, getNodeDetails */

import FRGatherer from '../base-gatherer.js';
import {axeSource} from '../../lib/axe.js';
import {pageFunctions} from '../../lib/page-functions.js';

/**
 * @return {Promise<LH.Artifacts.Accessibility>}
 */
/* c8 ignore start */
async function runA11yChecks() {
  /** @type {import('axe-core/axe')} */
  // @ts-expect-error - axe defined by axeLibSource
  const axe = window.axe;
  const application = `lighthouse-${Math.random()}`;
  axe.configure({
    // TODO: if app name is not the default of `axeAPI`, axe won't ever accept postMessages.
    // branding: {
    //   application,
    // },
    noHtml: true,
  });
  const axeResults = await axe.run(document, {
    elementRef: true,
    runOnly: {
      type: 'tag',
      values: [
        'wcag2a',
        'wcag2aa',
      ],
    },
    // resultTypes doesn't limit the output of the axeResults object. Instead, if it's defined,
    // some expensive element identification is done only for the respective types. https://github.com/dequelabs/axe-core/blob/f62f0cf18f7b69b247b0b6362cf1ae71ffbf3a1b/lib/core/reporters/helpers/process-aggregate.js#L61-L97
    resultTypes: ['violations', 'inapplicable'],
    rules: {
      // Consider http://go/prcpg for expert review of the aXe rules.
      'tabindex': {enabled: true},
      'accesskeys': {enabled: true},
      'heading-order': {enabled: true},
      'meta-viewport': {enabled: true},
      'duplicate-id': {enabled: false},
      'table-fake-caption': {enabled: false},
      'td-has-header': {enabled: true},
      'marquee': {enabled: false},
      'area-alt': {enabled: false},
      'html-xml-lang-mismatch': {enabled: false},
      'blink': {enabled: false},
      'server-side-image-map': {enabled: false},
      'identical-links-same-purpose': {enabled: false},
      'no-autoplay-audio': {enabled: false},
      'svg-img-alt': {enabled: false},
      'audio-caption': {enabled: false},
      'aria-treeitem-name': {enabled: true},
      // https://github.com/dequelabs/axe-core/issues/2958
      'nested-interactive': {enabled: false},
      'frame-focusable-content': {enabled: true},
      'aria-roledescription': {enabled: false},
      'scrollable-region-focusable': {enabled: false},
      // TODO(paulirish): create audits and enable these 5.
      'input-button-name': {enabled: false},
      'role-img-alt': {enabled: false},
      'select-name': {enabled: false},
      'link-in-text-block': {enabled: false},
      'frame-title-unique': {enabled: false},
    },
  });

  // axe just scrolled the page, scroll back to the top of the page so that element positions
  // are relative to the top of the page
  document.documentElement.scrollTop = 0;

  return {
    violations: axeResults.violations.map(createAxeRuleResultArtifact),
    incomplete: axeResults.incomplete.map(createAxeRuleResultArtifact),
    notApplicable: axeResults.inapplicable.map(result => ({id: result.id})), // FYI: inapplicable => notApplicable!
    passes: axeResults.passes.map(result => ({id: result.id})),
    version: axeResults.testEngine.version,
    // AXE_OUTPUT: window.AXE_OUTPUT,
  };
}

async function runA11yChecksAndResetScroll() {
  const originalScrollPosition = {
    x: window.scrollX,
    y: window.scrollY,
  };

  try {
    return await runA11yChecks();
  } finally {
    window.scrollTo(originalScrollPosition.x, originalScrollPosition.y);
  }
}

/**
 * @param {import('axe-core/axe').Result} result
 * @return {LH.Artifacts.AxeRuleResult}
 */
function createAxeRuleResultArtifact(result) {
  // Simplify `nodes` and collect nodeDetails for each.
  const nodes = result.nodes.map(node => {
    const {target, failureSummary, element} = node;
    // @ts-expect-error: smuggled from axe running inside iframes.
    const {_lhNodeDetails} = node;

    // if (!element) throw new Error(JSON.stringify(node, null, 2));
    // TODO: with `elementRef: true`, `element` is always be defined, except if the result came
    // from an iframe. In that case, we use a smuggled lh node details.
    // TODO: do same for related nodes.
    const nodeDetails = element ?
      // @ts-expect-error - getNodeDetails put into scope via stringification
      getNodeDetails(/** @type {HTMLElement} */ (element)) :
      _lhNodeDetails;

    /** @type {Set<HTMLElement>} */
    const relatedNodeElements = new Set();
    /** @param {import('axe-core/axe').ImpactValue} impact */
    const impactToNumber =
      (impact) => [null, 'minor', 'moderate', 'serious', 'critical'].indexOf(impact);
    const checkResults = [...node.any, ...node.all, ...node.none]
      // @ts-expect-error CheckResult.impact is a string, even though ImpactValue is a thing.
      .sort((a, b) => impactToNumber(b.impact) - impactToNumber(a.impact));
    for (const checkResult of checkResults) {
      for (const relatedNode of checkResult.relatedNodes || []) {
        /** @type {HTMLElement} */
        // @ts-expect-error - should always exist, just being cautious.
        const relatedElement = relatedNode.element;

        // Prevent overloading the report with way too many nodes.
        if (relatedNodeElements.size >= 3) break;
        // Should always exist, just being cautious.
        if (!relatedElement) continue;
        if (element === relatedElement) continue;

        relatedNodeElements.add(relatedElement);
      }
    }
    // @ts-expect-error - getNodeDetails put into scope via stringification
    const relatedNodeDetails = [...relatedNodeElements].map(getNodeDetails);

    return {
      target,
      failureSummary,
      node: nodeDetails,
      relatedNodes: relatedNodeDetails,
    };
  });

  // Ensure errors can be serialized over the protocol.
  /** @type {Error | undefined} */
  // @ts-expect-error - when rules throw an error, axe saves it here.
  // see https://github.com/dequelabs/axe-core/blob/eeff122c2de11dd690fbad0e50ba2fdb244b50e8/lib/core/base/audit.js#L684-L693
  const resultError = result.error;
  let error;
  if (resultError instanceof Error) {
    error = {
      name: resultError.name,
      message: resultError.message,
    };
  }

  return {
    id: result.id,
    impact: result.impact || undefined,
    tags: result.tags,
    nodes,
    error,
  };
}
/* c8 ignore stop */

class Accessibility extends FRGatherer {
  /** @type {LH.Gatherer.GathererMeta} */
  meta = {
    supportedModes: ['snapshot', 'navigation'],
  };

  static pageFns = {
    runA11yChecks,
    createAxeRuleResultArtifact,
  };

  /**
   * @param {LH.Gatherer.FRTransitionalContext} passContext
   * @return {Promise<LH.Artifacts.Accessibility>}
   */
  async getArtifact(passContext) {
    const driver = passContext.driver;

    // Hack the axe source code to use a subset of options when running inside a frame. We don't want to surface everything,
    // just allow for `frame-focusable-content` to work.
    const frameOptions = {
      elementRef: true,
      runOnly: {type: 'rules', values: ['frame-focusable-content']},
    };
    const replacement = `{options:${JSON.stringify(frameOptions)},command:o,parameter:i,context:r}`;
    const hackedAxeSource =
      // minified...
      axeSource.replace('{options:a,command:o,parameter:i,context:r}', replacement)
      // not minified...
                .replace('var params = {', `options = ${JSON.stringify(frameOptions)}\nvar params = {`);

    for (const executionContext of driver.targetManager.mainFrameExecutionContexts()) {
      const r = await driver.defaultSession.sendCommand('Runtime.evaluate', {
        expression: `${pageFunctions.getNodeDetails.toString()}\n${hackedAxeSource}`,
        returnByValue: true,
        // contextId: executionContext.id,
        uniqueContextId: executionContext.uniqueId,
      });
      // console.log(executionContext, r.exceptionDetails, r.result.value)
    }

    let r;
    try {
      r = await driver.executionContext.evaluate(runA11yChecksAndResetScroll, {
        args: [],
        // useIsolation: true,
        deps: [
          // axeSource,
          pageFunctions.getNodeDetails,
          createAxeRuleResultArtifact,
          runA11yChecks,
        ],
      });
    } catch (e) {
      console.error(e);
    }

    console.log('done, getting logs...');
    for (const executionContext of driver.targetManager.mainFrameExecutionContexts()) {
      const r = await driver.defaultSession.sendCommand('Runtime.evaluate', {
        expression: 'window.AXE_OUTPUT',
        returnByValue: true,
        uniqueContextId: executionContext.uniqueId,
      });
      console.log(r.exceptionDetails, r.result.value);
    }

    return r;
  }
}

export default Accessibility;
