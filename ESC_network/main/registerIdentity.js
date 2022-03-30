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
let contract = {};

const argv = yargs
    .command('identityName','blabla',{
        walletName: {
            description: 'wallet identity to use',
            alias: 'i',
            type: 'string',
        },
        contractName: {
            description: 'name of the contract to use',
            alias: 'c',
            type: 'string',
        }}).help().alias('help', 'h').argv; 
        
        
        /*
        .command('operation',{
        operation: {
            description: 'function to invoke in the contract',
            alias: 'o',
            type: 'string',
        }})
        .command('contractName',{
        contractName: {
            description: 'name of the contract to use',
            alias: 'c',
            type: 'string',
        }})
        */

async function main(walletName) {
    try {
        const identity = await takeUserWallet(walletName);
        await getGatewayChaincode(walletName);
        await invokeFunction();
        
	
 	//const sensorIdentity = "sensor1:Org1MSP";
        

	
	//process.exit();
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

async function getGatewayChaincode(walletName, contractName){
	const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: walletName, discovery: { enabled: true, asLocalhost: true } });
 	console.log('Connected to gateway');
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
	 console.log('connected to channel');
        // Get the contract from the network.
        contract = network.getContract('ESC_network', contractName);
	//console.log('Connected to contract');
}

async function invokeFunction(){
	
	const c = await contract.submitTransaction('test');
	console.log(Buffer.from(c).toString());
	console.log("transaction completed");
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


main(argv.walletName, argv.contractName);
