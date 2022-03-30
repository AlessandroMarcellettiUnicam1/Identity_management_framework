/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const identity_manager = require('./lib/identity_manager');

module.exports.identity_manager = identity_manager;
module.exports.contracts = [ identity_manager];
