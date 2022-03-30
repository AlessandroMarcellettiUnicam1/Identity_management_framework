/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const yargs = require('yargs');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');


async function main(sensorNumber) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'base-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
	const identityName = 'sensor'+sensorNumber;
        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(identityName);
        if (!identity) {
            console.log('An identity for the user "sensor" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }


        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: identityName, discovery: { enabled: true, asLocalhost: true } });
 	console.log('Connected to gateway');
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
	 console.log('connected to channel');
        // Get the contract from the network.
        const contract = network.getContract('identity_manager');
	console.log('Connected to contract');
	
        /*for(let i =1; i<=numberSensors; i++){
            setTimeout(() => {
                if(i == numberSensors){
                    contract.submitTransaction('createSensor', i).then((res) => {
                        process.exit();
                    });
                }else{
                    contract.submitTransaction('createSensor', i);
                }

            }, 100*i);
        }*/
 	const sensorIdentity = "sensor1:Org1MSP";
        let sensorid = await contract.submitTransaction('provideIdentity', identityName, "sensor", "", "", "");
        const newSensorid = (sensorid.toString()).replace('"', '').replace('"', '');
        
	console.log(newSensorid);
	
	/*const rawResult = await contract.evaluateTransaction('queryAllDetections');
	let result = rawResult.toString();
	console.log(`*** Result: ${result}`);*/
	
	//let result2 = await contract.evaluateTransaction('getSingleIdentity', identityName);
	//console.log(`*** Result: ${result2.toString()}`);
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
	console.log(`*** Result: ${Buffer.from(result4.toString())}`);
	
	
	
	process.exit();
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main(1);
