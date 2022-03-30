/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Identity = require('./identity_manager.js');

class rights_manager extends Contract {

    constructor() {
        // Unique smart contract name when multiple contracts per chaincode
        super('rights_manager');
   }
    async createRights(ctx, identityName, requestedApp){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    //TODO CREATE RIGHTS BASED ON APPLICATION
    const applicationRights = await ctx.stub.getState(requestedApp);
    
    
    //ctx.stub.invokeChaincode("ESC_network", arr, 'mychannel');
    
    
    //let identityClass = new Identity();
    //identityClass.updateIdentityRights(id);
    
    return JSON.stringify(applicationRights);
    }
    
    async updateRights(ctx, identityName){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    //TODO CREATE RIGHTS BASED ON APPLICATION
    let identityClass = new Identity();
    identityClass.updateIdentityRights(id);
    
    return JSON.stringify(id);
    }
    
    async dismissRights(ctx, identityName){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    //TODO CREATE RIGHTS BASED ON APPLICATION
    let identityClass = new Identity();
    identityClass.updateIdentityRights(id);
    
    return JSON.stringify(id);
    }
    
    
    
}

module.exports = rights_manager;
