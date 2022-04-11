/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class testBenchmark extends Contract {


    constructor() {
        // Unique smart contract name when multiple contracts per chaincode
        super('testBenchmark');
   }
   
   async provideIdentity(ctx, identityName, type, endpoint, uri, coord){
	     const id = identityName + ':' + ctx.stub.getCreator().mspid;
	     //const id = ctx.clientIdentity.getID();
	    	const identity = {
		    ID: id,
		    State: "ACTIVE",
		    Type: type, 
		    Opt_info: {
		    	Endopint: endpoint,
		    	URI: uri,
		    	Coordinates: coord
		    },
		    Rights: [{
		    	AppName: '',
		    	AllowedOp: ''
		    }]
		};
	    
	      await ctx.stub.putState(id, Buffer.from(JSON.stringify(identity)));
	      return JSON.stringify(id);
      
    }
   

    async createRights(ctx, identityName, requestedApp){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;

    //const applicationRightsRaw = await ctx.stub.invokeChaincode(requestedApp, ['getRightsForApp', requestedApp], 'mychannel');

    //const appRights = JSON.parse(Buffer.from(applicationRightsRaw.payload).toString('utf8'));
    const appRights = {
   ID: "ESC_network",
   AllowedOrgs: [{
      MSPName: 'Org1MSP',
      AllowedOp: [{Type: 'WriteSensor', Op: 'WRITE'}, {Type: 'ReadSensor', Op: 'READ'}]
   }]
};

    const identity = await ctx.stub.getState(id);
    
    if(identity.State == "DISMISSED"){
    	throw new Error(`ERROR: you cannot assign rights to a dismissed identity`);
    }

    const jsonIdentity = JSON.parse(identity.toString());
    
    for (let i = 0; i < appRights.AllowedOrgs.length; i++) {
    	if(appRights.AllowedOrgs[i].MSPName == ctx.stub.getCreator().mspid){
    		
    		for (let t = 0; t < appRights.AllowedOrgs[i].AllowedOp.length; t++) {
    			if(appRights.AllowedOrgs[i].AllowedOp[t].Type == jsonIdentity.Type){
					
				    const identityRights = {
				    	AppName : appRights.ID,
				    	AllowedOp : appRights.AllowedOrgs[i].AllowedOp[t].Op
				    };
				    
				    jsonIdentity.Rights.push(identityRights);
				    
				    //AppName.push(appRights.ID);
				    //jsonIdentity.Rights.AllowedOp.push(appRights.AllowedOrgs.AllowedOp[t].Op);
				    
				    
				    await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
				    return jsonIdentity.toString();
    			}
    		}
    	}
    }
    
    return "No identity can be found for this ID";
    
    }
    
    //TODO maybe useless, has the same functionalities of the assign
    /*async updateRights(ctx, identityName){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    //TODO CREATE RIGHTS BASED ON APPLICATION
    let identityClass = new Identity();
    identityClass.updateIdentityRights(id);
    
    return JSON.stringify(id);
    }*/
    
    
    async removeRights(ctx, identityName, appId){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    const identity = await ctx.stub.getState(id);  
    const jsonIdentity = JSON.parse(identity.toString());
    
    if(jsonIdentity.State == "DISMISSED"){
    	throw new Error(`ERROR: you cannot removed rights to a dismissed identity`);
    }
    
    
    for (let i = 0; i < jsonIdentity.Rights.length; i++) {
    	if(jsonIdentity.Rights[i].AppName == appId){
    		const blankRights = {
		    	AppName: '',
		    	AllowedOp: ''
		    };
		jsonIdentity.Rights[i] = blankRights;
    	}
    }
    
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
    return jsonIdentity.toString();
    }
    
    
    
}

module.exports = testBenchmark;
