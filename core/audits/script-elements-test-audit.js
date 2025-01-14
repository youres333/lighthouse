/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This is a fake audit used exclusively in smoke tests to force inclusion of ScriptElements artifact.
 * It is included here for complex reasons in the way the bundled smoketests work.
 *
 * The smokehouse configs are evaluated first in the node CLI side (which requires an absolute path using LH_ROOT).
 * The smokehouse configs are then *re-evaluated* in the bundled context for execution by Lighthouse (which *cannot* use an absolute path using LH_ROOT).
 *
 * This mismatch in environment demands that the audit path in the config must be context-aware,
 * yet the require-graph for the config is included before even the CLI knows that it will be using
 * a bundled runner. Rather than force a massive smoketest architecture change, we include a harmless,
 * test-only audit in our core list instead.
 */

export default {
  meta: {
    id: 'script-elements-test-audit',
    title: 'ScriptElements',
    failureTitle: 'ScriptElements',
    description: 'Audit to force the inclusion of ScriptElements artifact',
    requiredArtifacts: ['ScriptElements'],
  },
  audit: () => ({score: 1}),
};
