/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const yargs = require('yargs');
const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

const argv = yargs
    .command('numberDevices','blabla',{
        devices: {
            description: 'number of devices to test',
            alias: 'n',
            type: 'number',
        }}).help().alias('help', 'h').argv; 

async function main(deviceNumber) {
    try {
        console.log('registering started');
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'base-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        

        for(let i =1; i<= deviceNumber; i++){
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const userIdentity = await wallet.get('device'+ i);
		if (userIdentity) {
		
		   console.log(`An identity for the user ${userIdentity}" already exists in the wallet`);
		    console.log(`An identity for the user "device${deviceNumber}" already exists in the wallet`);
		    
		}else{
		// Check to see if we've already enrolled the admin user.
		const adminIdentity = await wallet.get('admin');
		if (!adminIdentity) {
		    console.log('An identity for the admin user "admin" does not exist in the wallet');
		    console.log('Run the enrollAdmin.js application before retrying');
		    
		}

		// build a user object for authenticating with the CA
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, 'admin');
 		// Register the user, enroll the user, and import the new identity into the wallet.
		const secret = await ca.register({
		    affiliation: 'org1.department1',
		    enrollmentID: 'device'+i,
		    role: 'client'
		}, adminUser);
		const enrollment = await ca.enroll({
		    enrollmentID: 'device'+i,
		    enrollmentSecret: secret
		});
		const x509Identity = {
		    credentials: {
		        certificate: enrollment.certificate,
		        privateKey: enrollment.key.toBytes(),
		    },
		    mspId: 'Org1MSP',
		    type: 'X.509',
		};
		await wallet.put('device'+i, x509Identity);
		console.info(`Successfully registered and enrolled admin user "device${i}" and imported it into the wallet`);
		}

		
	}
        

    } catch (error) {
        console.error(`Failed to register user "device${deviceNumber}": ${error}`);
        process.exit(1);
    }
}

main(argv.devices);

