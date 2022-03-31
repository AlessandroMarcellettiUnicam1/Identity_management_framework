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
    const applicationRightsRaw = await ctx.stub.invokeChaincode(requestedApp, ['getRightsForApp', requestedApp], 'mychannel');
    //const appRights = applicationRightsRaw.payload;
    const appRights = JSON.parse(Buffer.from(applicationRightsRaw.payload).toString('utf8'));
    /*const appRights = {
        	ID: "ESC_network",
        	AllowedOrgs: ['Org1MSP'],
        	AllowedOp: [{Obj: 'LightSensor1', Op: 'WRITE'}]
        };*/
    
    for (let i = 0; i < appRights.AllowedOrgs.length; i++) {
    	if(appRights.AllowedOrgs[i] == ctx.stub.getCreator().mspid){
    		for (let t = 0; t < appRights.AllowedOp.length; t++) {
    			if(appRights.AllowedOp[t].Obj == identityName){
    				const rights = {
	    				AppName: requestedApp,
            				ApprovedMSP: appRights.AllowedOrgs[i],
            				AllowedObj: appRights.AllowedOp[t].Obj,
            				AllowedOp: appRights.AllowedOp[t].Op,
				};
				let identityClass = new Identity();
				identityClass.updateIdentityRights(id, JSON.stringify(rights));
    			}
    		}
    	}
    }
    
    return applicationRightsRaw.payload.toString('utf8');
    
    

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
