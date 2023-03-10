/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import CSPInline from '../../audits/csp-inline.js';

const CSP_HTML = `
<html>
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'"/>
</head>
<body>hi</body>
</html>
`;

const NO_CSP_HTML = `
<html>
<body>hi</body>
</html>
`;

const CSP_META_ELEMENT = {
  httpEquiv: 'Content-Security-Policy',
};

describe('CSP inline audit', () => {
  it('fails when HTML contains a CSP in an inline meta tag', async () => {
    const auditResult = await CSPInline.audit({
      MetaElements: [CSP_META_ELEMENT],
      MainDocumentContent: CSP_HTML,
    });
    expect(auditResult.score).toEqual(0);
  });

  it('passes if a CSP meta tag was added dynamically', async () => {
    const auditResult = await CSPInline.audit({
      MetaElements: [CSP_META_ELEMENT],
      MainDocumentContent: NO_CSP_HTML,
    });
    expect(auditResult.score).toEqual(1);
  });

  it('passes if there was no CSP meta tag', async () => {
    const auditResult = await CSPInline.audit({
      MetaElements: [],
      MainDocumentContent: NO_CSP_HTML,
    });
    expect(auditResult.score).toEqual(1);
  });
});
