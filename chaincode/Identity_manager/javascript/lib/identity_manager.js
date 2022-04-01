/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');



class identity_manager extends Contract {

   constructor() {
        // Unique smart contract name when multiple contracts per chaincode
        super('identity_manager');
        
   }

    /* Function for creating a new Identity associated to the caller
    * First it checks if there is an identity already associated with the caller
    */
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
    
    /* Function for assigning rights to an idenitty
    * If the identity is still ACTIVE, the rights in JSON format will be assigned to it
    * It will automatically select the identity corresponding to the caller one
    * Usually invoked by the rights_manager contract
    */
    async updateIdentityRights(ctx, identityName, rights){

    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    const identity = await ctx.stub.getState(identityName);
    
    if(identity.State == "DISMISSED"){
    	throw new Error(`ERROR: you cannot assign rights to a dismissed identity`);
    }

     const jsonRights = JSON.parse(r.toString());
     const jsonIdentity = JSON.parse(identity.toString());
     
     jsonIdentity.rights = jsonRights;
     
     await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
     
    }
    
    /* Function for dismissing an idenitty
    * When invoked, the identity will not be authenticated in the application and no rights can be assigned to it
    * It will automatically select the identity corresponding to the caller one 
    */
    async dismissIdentity(ctx, identityName){
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(identity.State == "DISMISSED"){
    	throw new Error(`ERROR: the identity is already dismissed`);
    }
     const identity = await ctx.stub.getState(id);
     let jsonIdentity = JSON.parse(identity.toString());
     jsonIdentity.State = "DISMISSED";
     await ctx.stub.putState(id, Buffer.from(JSON.stringify(jsonIdentity)));
     
    }
    


    async queryAllIdentities_developer(ctx) {
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange('','')) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
    
    /* Function for retrieving the identity
    * It is used to retrieve the full identity of the caller so to limit the visibility of the others  
    */
    async getSingleIdentity(ctx, identityName){
    	const id = identityName + ':' + ctx.stub.getCreator().mspid;
        const identity = await ctx.stub.getState(id);
        return identity.toString();
    }
    
    
    
    

}


module.exports = identity_manager;
