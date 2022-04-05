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
let contractESC = {};
let contractIdentity = {};
let contractRights = {};

const argv = yargs
    .command('identityName','blabla',{
        walletName: {
            description: 'wallet identity to use',
            alias: 'i',
            type: 'string',
        },
        sensorNumber: {
            description: 'number of sensors to test',
            alias: 'c',
            type: 'number',
        }}).help().alias('help', 'h').argv; 
        
        
        
async function main(walletName, sensorNumber) {
    try {
    	for(let i =1; i<=sensorNumber; i++){
    	console.log("iteration");
		const identity = await takeUserWallet(walletName+i);
		await getGatewayChaincode(walletName+i);
		await invokeFunction(walletName+i, i);
        }
	
 	
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
        contractESC = network.getContract('ESC_network', 'ESC_network');
        contractRights = network.getContract('Identity_manager', 'rights_manager');
        contractIdentity = network.getContract('Identity_manager', 'identity_manager');
	//console.log('Connected to contract');
}

async function invokeFunction(walletName, sensorNumber){

	
 	const sensorid = await contractIdentity.submitTransaction('provideIdentity', walletName, "LightSensor"+sensorNumber, "", "", "");
        const newSensorid = (sensorid.toString());
        console.log("Identity created: " + newSensorid);   
	
        

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


main(argv.walletName, argv.sensorNumber);
