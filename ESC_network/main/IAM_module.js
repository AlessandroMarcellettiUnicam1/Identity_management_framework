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
    .command('arguments','parameters to use',{
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
    	
    	console.log("Retrieving devices wallet");
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
        contract = network.getContract(chaincodeName, contractName);
	
	
	 const listener = async (event) => {
                const eventResult = JSON.parse(event.payload.toString());
			
			    console.log(`-- Contract Event Received: ${event.eventName} - ${JSON.stringify(eventResult)}`);
			
			    const eventTransaction = event.getTransactionEvent();
			    console.log(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`);
		
			    const eventBlock = eventTransaction.getBlockEvent();
			    console.log(`*** block: ${eventBlock.blockNumber.toString()}`);
			    exit();
            }


		    console.log(`--> Start contract event stream to peer in Org1`);
            await contract.addContractListener(listener);
}

async function invokeFunction(walletName, transactionName, transactionParams){

	if(!transactionParams || transactionParams === '') {
                const c = await contract.submitTransaction(transactionName);
                console.log(Buffer.from(c).toString());

        }else {
                const c = await contract.submitTransaction(transactionName, ...transactionParams);
                console.log(Buffer.from(c).toString());

        }
	


}


main(argv.walletName, argv.transactionName, argv.transactionParams, argv.chaincodeName, argv.contractName, argv.sensorNumber);
