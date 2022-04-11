'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

         const myArgs = {
            contractId: "Identity_manager",
            contractFunction: 'provideIdentity',
            invokerIdentity: 'Admin',
            contractArguments: ["sensor1", "ReadSensor","","",""],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(myArgs);
    }

    async submitTransaction() {
        
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'createRights',
            invokerIdentity: 'Admin',
            contractArguments: ["sensor1", "ESC_network"],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(myArgs);
    }

    async cleanupWorkloadModule() {
       
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

