/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const identity_manager = require('./lib/identity_manager');
const rights_manager = require('./lib/rights_manager');
module.exports.identity_manager = identity_manager;
module.exports.rights_manager = rights_manager;
module.exports.contracts = [ identity_manager, rights_manager ];
