/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const yargs = require('yargs');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

let ccp;
let wallet;
//let contractESC = {};
//let contractIdentity = {};
let contract = {};

const argv = yargs
    .command('arguments','blabla',{
        walletName: {
            description: 'wallet identity to use',
            alias: 'i',
            type: 'string',
        },
        transactionName: {
            description: 'transaction name',
            alias: 't',
            type: 'string',
        },
        transactionParams: {
            description: 'transaction parameters',
            alias: 'p',
            type: 'array',
        },  
        chaincodeName: {
            description: 'chaincode name',
            alias: 'chaincode',
            type: 'string',
        }, 
        contractName: {
            description: 'contract name',
            alias: 'contract',
            type: 'string',
        },       
        sensorNumber: {
            description: 'number of sensors to test',
            alias: 'n',
            type: 'number',
        }}).help().alias('help', 'h').argv; 
        
        
        
async function main(walletName, transactionName, transactionParams, chaincodeName, contractName, sensorNumber) {
    try {
    	
    	console.log("iteration");
	const identity = await takeUserWallet(walletName);
	await getGatewayChaincode(walletName, chaincodeName, contractName);
	await invokeFunction(walletName, transactionName, transactionParams);
        
	
 	
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

async function takeUserWallet(walletName){
	// load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'base-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
	//const identityName = 'sensor'+sensorNumber;
        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(walletName);
        if (!identity) {
            console.log('An identity for the user "sensor" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        return identity;
}

async function getGatewayChaincode(walletName, chaincodeName, contractName){
	const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: walletName, discovery: { enabled: true, asLocalhost: true } });
 	console.log('Connected to gateway');
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
	 console.log('connected to channel');
        // Get the contract from the network.
        //contractESC = network.getContract('ESC_network', 'ESC_network');
        //contractRights = network.getContract('Identity_manager', 'rights_manager');
        contract = network.getContract(chaincodeName, contractName);
	
	
	 const listener = async (event) => {
                const eventResult = JSON.parse(event.payload.toString());
			
			    console.log(`-- Contract Event Received: ${event.eventName} - ${JSON.stringify(eventResult)}`);
			
			   // console.log(`*** Event: ${event.eventName}:${eventResult.ID}`);
			
			    const eventTransaction = event.getTransactionEvent();
			    console.log(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`);
		
			    const eventBlock = eventTransaction.getBlockEvent();
			    console.log(`*** block: ${eventBlock.blockNumber.toString()}`);
            }

		    // now start the client side event service and register the listener
		    console.log(`--> Start contract event stream to peer in Org1`);
            await contract.addContractListener(listener);
}

async function invokeFunction(walletName, transactionName, transactionParams){
	console.log(transactionParams);
	if(!transactionParams || transactionParams === '') {
                await contract.submitTransaction(transactionName);
        }else {
                await contract.submitTransaction(transactionName, ...transactionParams);
        }
	
	
 	//const sensorid = await contractIdentity.submitTransaction('provideIdentity', walletName, "LightSensor"+sensorNumber, "", "", "");
        //const newSensorid = (sensorid.toString());
        //console.log("Identity created: " + newSensorid);   
	
        

        /*await contractIdentity.submitTransaction('provideIdentity', walletName, "LightSensor", "", "", "");
        //const newSensorid = (sensorid.toString());
        console.log("Identity created");
        
	const c = await contractESC.submitTransaction('test');
	//console.log(Buffer.from(c).toString());
	console.log(`rights on app initialized with value:${Buffer.from(c).toString()}`);
	
	const c1 = await contractRights.submitTransaction('createRights', walletName, 'ESC_network');
	console.log(Buffer.from(c1).toString());
	console.log(`rights assigned to device: ${walletName}`);
	
	let result1 = await contractIdentity.evaluateTransaction('getSingleIdentity', walletName);
	console.log(`*** Identity updated with rights: ${Buffer.from(result1).toString()}`);
	
	const c2 = await contractRights.submitTransaction('removeRights', walletName, 'ESC_network');
	//console.log(Buffer.from(c1).toString());
	console.log(`rights removed to device: ${walletName}`);
	

	let result3 = await contractIdentity.evaluateTransaction('getSingleIdentity', walletName);
	console.log(`*** Identity updated with rights: ${Buffer.from(result3).toString()}`);
	
        console.log("Process terminated");*/
        
        
        
	//process.exit();
	
	/*let sensorid = await contract.submitTransaction('provideIdentity', identityName, "sensor", "", "", "");
        const newSensorid = (sensorid.toString()).replace('"', '').replace('"', '');
        
	console.log(newSensorid);
	
	const rights = {
	    Test1: "test",
            Test2: "test" 
	};
	let result = await contract.evaluateTransaction('getSingleIdentity', newSensorid);
	console.log(`*** Result prima di update: ${Buffer.from(result.toString())}`);
	
	await contract.submitTransaction('updateIdentityRights', newSensorid, "sensor", "", "", "", JSON.stringify(rights));
	
	let result3 = await contract.evaluateTransaction('getSingleIdentity', newSensorid);
	console.log(`*** Result: ${Buffer.from(result3.toString())}`);
	
	await contract.submitTransaction('dismissIdentity', newSensorid);
	let result4 = await contract.evaluateTransaction('getSingleIdentity', newSensorid);
	console.log(`*** Result: ${Buffer.from(result4.toString())}`);*/

}


main(argv.walletName, argv.transactionName, argv.transactionParams, argv.chaincodeName, argv.contractName, argv.sensorNumber);
