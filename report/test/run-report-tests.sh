#!/usr/bin/env bash

##
# @license
# Copyright 2023 Google LLC
# SPDX-License-Identifier: Apache-2.0
##

set -eux

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LH_ROOT="$SCRIPT_DIR/../.."

ARGS=(
  --testMatch='report/test/**/*-test.js'
)

cd "$LH_ROOT"
node --loader=@esbuild-kit/esm-loader core/test/scripts/run-mocha-tests.js ${ARGS[*]} "$@"
