/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const IdentityManager = require('./identity_manager.js');

class rights_manager extends Contract {


    constructor() {
        // Unique smart contract name when multiple contracts per chaincode
        super('rights_manager');
   }
   
   
   
   /* Function for assigning rights to an identity
   * First the id of the invoker wallet is generated
   * Then the rights for the desired application are retrieved
   * Finally, if the wallet MSP is contained in the authorized organizations the rights are assigned
   * and the identity is updated in the world state
   */
    async createRights(ctx, identityName, requestedApp){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;

    const applicationRightsRaw = await ctx.stub.invokeChaincode(requestedApp, ['getRightsForApp', requestedApp], 'mychannel');

    const appRights = JSON.parse(Buffer.from(applicationRightsRaw.payload).toString('utf8'));

    const identity = await ctx.stub.getState(id);
    
   

    const jsonIdentity = JSON.parse(identity.toString());
    
    if(jsonIdentity.State == "DISMISSED"){
    	throw new Error(`ERROR: you cannot assign rights to a dismissed identity`);
    }
    
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
				    
				    ctx.stub.setEvent('rightsCreation', Buffer.from(JSON.stringify(jsonIdentity)));
				    await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
				    return jsonIdentity.toString();
    			}
    		}
    	}
    }
    
    ctx.stub.setEvent('rightsCreation', Buffer.from(JSON.stringify(jsonIdentity)));
    
    return "No identity can be found for this ID";
    
    }
    
    async updateRights(ctx, identityName, requestedApp){
       const org = ctx.stub.getCreator().mspid;
       
       const applicationRightsRaw = await ctx.stub.invokeChaincode(requestedApp, ['getRightsForApp', requestedApp], 'mychannel');
       const appRights = JSON.parse(Buffer.from(applicationRightsRaw.payload).toString('utf8'));
    
       const id = identityName + ':' + org;
       const identity = await ctx.stub.getState(id);
       const jsonIdentity = JSON.parse(identity.toString());
        
     	if(jsonIdentity.State == "DISMISSED"){
    		throw new Error(`ERROR: you cannot assign rights to a dismissed identity`);
     	}
     
      	for (let i = 0; i < jsonIdentity.Rights.length; i++) {
      		if(jsonIdentity.Rights[i].AppName == requestedApp){
      		
      			for (let z = 0; z < appRights.AllowedOrgs.length; z++) {
    				if(appRights.AllowedOrgs[z].MSPName == org){
    				
		      			for (let t = 0; t < appRights.AllowedOrgs[z].AllowedOp.length; t++) {
				    		if(appRights.AllowedOrgs[z].AllowedOp[t].Type == jsonIdentity.Type){
				    	   		
					   		jsonIdentity.Rights[i] = appRights.AllowedOrgs[z].AllowedOp[t];
				    	
				    		}
		   	   		}
   	   			}
   	   		}
   	   	}
   	   }
   	   
   	ctx.stub.setEvent('rightsUpdate', Buffer.from(JSON.stringify(jsonIdentity)));
      
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
    	return jsonIdentity.toString();
      
    }
    
    
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
	    
	    ctx.stub.setEvent('rightsRemoval', Buffer.from(JSON.stringify(jsonIdentity)));
	    await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
    	    return jsonIdentity.toString();
    }
    
    
    
}

module.exports = rights_manager;
