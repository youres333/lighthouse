/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {Audit} from './audit.js';
import * as i18n from '../lib/i18n/i18n.js';

const UIStrings = {
  /** TODO */
  title: 'Does not define any CSPs in an inline `<meta>` tag',
  /** TODO */
  failureTitle: 'Defines a CSP in an inline `<meta>` tag',
  /** TODO */
  description: 'A CSP defined in an inline `<meta>` tag will delay the preload scanner from ' +
    'loading resources early. Consider defining all CSPs in http headers if you can.',
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

const INLINE_CSP_REGEX = /http-equiv="content-security-policy"/i;

class CSPInline extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'csp-inline',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
      requiredArtifacts: ['MainDocumentContent', 'MetaElements'],
      supportedModes: ['navigation'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts) {
    const hasCspMetaTag = !!artifacts.MetaElements.find(m => {
      return m.httpEquiv && m.httpEquiv.toLowerCase() === 'content-security-policy';
    });

    // The page could add a CSP meta tag in a script.
    // This check doesn't cover all edge cases but should be good enough for our use case.
    const hasInlineCsp = INLINE_CSP_REGEX.test(artifacts.MainDocumentContent);
    const hasInlineCspMetaTag = hasCspMetaTag && hasInlineCsp;

    return {
      score: Number(!hasInlineCspMetaTag),
    };
  }
}

export default CSPInline;
export {UIStrings};
