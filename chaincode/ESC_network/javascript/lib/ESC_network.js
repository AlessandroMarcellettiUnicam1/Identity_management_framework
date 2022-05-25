/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const appRights = {
   ID: "ESC_network",
   AllowedOrgs: [{
      MSPName: 'Org1MSP',
      AllowedOp: [{Type: 'LightSensor1', Op: 'WRITE'}, {Type: 'Actuator1', Op: 'READ'}]
   }]
};
        
        
class ESC_network extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Application Rights ===========');
        
        
        
        console.info('============= END : Initialize Ledger ===========');
    }
    


    async initRights(ctx){
    	
        
        await ctx.stub.putState('ESC_network', Buffer.from(JSON.stringify(appRights)));
        return JSON.stringify(appRights);
        
    }
    
    async checkRights(ctx, identityName, operation){
    	const id = identityName + ':' + ctx.stub.getCreator().mspid;
    	
        const deviceIdentityRaw = await ctx.stub.invokeChaincode('Identity_manager', ['getSingleIdentity', id], 'mychannel');
        const deviceIdentity = JSON.parse(Buffer.from(deviceIdentityRaw.payload).toString('utf8'));
       
        const rights = deviceIdentity.Rights;
        
        for (let i = 0; i < rights.length; i++) {
        	if(rights[i].AppName == 'ESC_network' && rights[i].AllowedOp.includes(operation)){
        		return true;        	
        	}
        }
        
        return false;

    }
    
    
    
    async getRightsForApp(ctx, requestedApp){
    	const rights = await ctx.stub.getState(requestedApp);
    	return rights.toString();
    }
    
    
    async queryAllDetections(ctx, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
    
        const startKey = 'DETECTION0';
        const endKey = 'DETECTION99999999999999999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
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
    
    async queryAllFlows(ctx, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        const startKey = 'CARFLOW0';
        const endKey = 'CARFLOW9999999999999999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
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

    async queryAllSensorsInRange(ctx, numberSensors, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        const startKey = 'SENSOR1';
        const endKey = 'SENSOR'+(parseInt(numberSensors)+1);
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
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

    async createDetection(ctx, numberSensor, detectionNumber, sensorKilometer, direction, numberCars, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'WRITE') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        let detectionDateTime = Date.now();
        let sensor = parseInt(numberSensor)
        const detection = {
            sensor,
            docType: 'detection',
            detectionDateTime,
            numberCars,
            sensorKilometer
        };

        // Añadir la resolución a los datos y cambiar de zona a unico punto, hacer el flujo en cuanto a cada sensor junto con un agregador
    
        if(direction === 'ascendent'){
            detection.direction = 'ASCENDENT';
        }else{
            detection.direction = 'DESCENDENT';
        }

        await ctx.stub.putState(detectionNumber, Buffer.from(JSON.stringify(detection)));
    }
    
    async calculateFlow(ctx, calculationNumber, streetId, fromDate, numberSensors, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'WRITE') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        let totalBeginHR = process.hrtime();
        let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;
        let toDate = Date.now();

        let res = [];
        let bySection = [];
        let totalDetections = 0;
        let total = 0;
        for(let j=1; j<=numberSensors; j++){
            res.push(await this.queryCalculate(ctx, fromDate, toDate, j, identityName));
            let detections = await JSON.parse(res[j-1].toString());
            let numberCars = 0;
            for(let i=0; i< detections.length; i++){
                numberCars +=  parseInt(detections[i].Record.numberCars);
            }
            bySection.push(parseFloat(((numberCars *1000) /  (toDate - fromDate)).toFixed(3)));
            total += parseFloat(((numberCars *1000) /  (toDate - fromDate)).toFixed(3));
            totalDetections += numberCars;
        }
        
        const carFlow = {
            streetId,
            docType: 'carflow',
            dateFlow: {
                fromDate,
                toDate
            },
            carsPerSecond: {
                bySection,
                total: total/numberSensors
            },
            totalDetections
        };

        await ctx.stub.putState(calculationNumber, Buffer.from(JSON.stringify(carFlow)));

        let totalEndHR = process.hrtime()
        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
        let totalDuration = (totalEnd - totalBegin) / 1000;

        let event = {
            totalDetections: totalDetections,
            type: 'calculateFlow',
            execDuration: totalDuration,
            carsPerSecondSection: bySection,
            carsPerSecondTotal: total/numberSensors

        };
        await ctx.stub.setEvent('FlowEvent', Buffer.from(JSON.stringify(event)));
    }
    
    async queryDetectionsInRange(ctx,startDate, endDate, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startDate, endDate)) {
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
    
    async queryCalculate(ctx, fromDate, toDate, numberSensor) {
    /*const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }*/
        let queryString = `{
            "selector": {
                "sensor": {
                    "$eq": ${numberSensor}
                },
                "detectionDateTime": {
                    "$lte": ${toDate}, 
                    "$gte": ${fromDate}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    async querySensor(ctx, numberSensor) {
    /*const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }*/
        let queryString = `{
            "selector": {
                "numberSensor": {
                    "$eq": ${numberSensor}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }
 
    //this should be create identity
    async createSensor(ctx, numberSensor) {
        
    
        const sensor = {
            numberSensor: parseInt(numberSensor),
            detections: [],
        };
    
        await ctx.stub.putState('SENSOR'+numberSensor, Buffer.from(JSON.stringify(sensor)));
    }

    //Write rights check
    async updateData(ctx, numberSensor, detections, timeData, frequency, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'WRITE') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        let s = await this.querySensor(ctx, parseInt(numberSensor));
        let sensor = JSON.parse(s.toString())[0];
        let det = JSON.parse(detections);
        let time = Date.now();
        sensor.Record.detections = sensor.Record.detections.filter((i) => {
            return i.detectionDateTime >= (time - timeData*1000 - 10000);
        });
        for(let i = 0; i< det.length; i++){
            sensor.Record.detections.push(det[i]);
        }
        

        await ctx.stub.putState(sensor.Key, Buffer.from(JSON.stringify(sensor.Record)));

        let event = {
            type: 'detection',
            numberSensor: parseInt(numberSensor),
            timeData: timeData,
            frequency: frequency
        };
        await ctx.stub.setEvent('DetectionEvent', Buffer.from(JSON.stringify(event)));
    }


    //Writing rights check
    async analysis(ctx, streetFlow, timeData, fromDates, numberSensors, frequency, identityName) {
    const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'WRITE') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        let totalBeginHR = process.hrtime();
        let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;

        let strFlow = JSON.parse(streetFlow)[0].Record;
        let frmDates = JSON.parse(fromDates);
        let sensors = [];
        let bySection = [];
        let totalDetections = 0;
        let total = 0;
        let numSens = parseInt(numberSensors);
        let totalDetectionsStored = 0;
        let totalDetectionsStoredList = [];

        let totalDetectionsEvent = [];
        let bySectionEvent = [];
        let totalEvent = [];
        if(frmDates.length > 0){

            for(let j=1; j<=numSens; j++){
                let sensor = await this.querySensor(ctx, j);
                sensors.push(JSON.parse(sensor.toString())[0]);
            }
    
            for(let k=0; k<frmDates.length; k++){
                let fromDate = frmDates[k];
                let toDate = fromDate - (1000* timeData);
                
                for(let l=0;l<sensors.length; l++){
                    totalDetectionsStored += sensors[l].Record.detections.length;

                    let detections = sensors[l].Record.detections.filter((i) => {
                        return parseInt(fromDate) >= i.detectionDateTime && i.detectionDateTime >= parseInt(toDate);
                    });
                    let numberCars = 0;
                    for(let i=0; i< detections.length; i++){
                        numberCars +=  parseInt(detections[i].numberCars);
                    }
                    bySection.push(parseFloat(((numberCars *1000) /  (fromDate - toDate)).toFixed(3)));
                    total += parseFloat(((numberCars *1000) /  (fromDate - toDate)).toFixed(3));
                    totalDetections += numberCars;
                }
                totalDetectionsStoredList.push(totalDetectionsStored);
                bySectionEvent.push(bySection);
                totalEvent.push(total/numberSensors);
                totalDetectionsEvent.push(totalDetections);
                let carFlow = {
                    streetId: strFlow.streetId,
                    dateFlow: {
                        fromDate: parseInt(fromDate),
                        toDate: parseInt(toDate)
                    },
                    carsPerSecond: {
                        bySection,
                        total: total/numSens
                    },
                    totalDetections,
                };
                if(totalDetections > 0){
                    strFlow.flows.push(carFlow);
                }
                bySection = [];
                totalDetections = 0;
                total = 0;
                totalDetectionsStored = 0;
            }
            
            if(strFlow.flows.length > 0){
                await ctx.stub.putState('STREETFLOWS' + strFlow.streetId, Buffer.from(JSON.stringify(strFlow)));
            }


        }
        let totalEndHR = process.hrtime()
        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
        let totalDuration = (totalEnd - totalBegin) / 1000;

        if (frmDates.length == 0){
            totalDuration = 0;
        }
        let event = {
            fromDates: frmDates,
            totalDetections: totalDetectionsEvent,
            type: 'analysis',
            execDuration: totalDuration,
            carsPerSecondSection: bySectionEvent,
            carsPerSecondTotal: totalEvent,
            timeData: timeData,
            frequencyData: frequency,
            totalDetectionsStoredList: totalDetectionsStoredList

        };
        await ctx.stub.setEvent('FlowEvent', Buffer.from(JSON.stringify(event)));
    }

    //Reading rights control
    async evaluateHistory(ctx, timeData, calculateTime, maxCalculateTime, minCalculateTime, identityName) {
        const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        if(parseInt(calculateTime) >= parseInt(maxCalculateTime)*0.9){
            return JSON.parse(parseInt(timeData)*0.75);
        }else if(parseInt(calculateTime) <= parseInt(minCalculateTime)*1.1){
            return JSON.parse(parseInt(timeData)*1.25);
        }else{
            return JSON.parse(timeData);
        }
    
    }

    //Reading rights control
    async evaluateFrequency(ctx, frequency, calculateTime, maxCalculateTime, minCalculateTime, identityName) {
        const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
        if(parseFloat(calculateTime) >= parseFloat(maxCalculateTime)*0.9){
            return JSON.parse(parseFloat(frequency)*1.25);
        }else if(parseFloat(calculateTime) <= parseFloat(minCalculateTime)*1.1){
            return JSON.parse(parseFloat(frequency)*0.75);
        }else{
            return JSON.parse(frequency);
        }
    
    }

    async querySensor2(ctx, numberSensor) {
    /*const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }*/
        let res = await this.querySensor(ctx, numberSensor);

        return JSON.parse(res.toString())[0].Record.detections;
    
    }

    async queryStreetFlows(ctx, streetId) {
    /*const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }*/
        let queryString = `{
            "selector": {
                "streetId": {
                    "$eq": ${streetId}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString, identityName);
    
    }

    async createStreetFlows(ctx, streetId, identityName) {
        const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'WRITE') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }
    
        const streetflows = {
            streetId: parseInt(streetId),
            flows: [],
        };
    
        await ctx.stub.putState('STREETFLOWS'+streetId, Buffer.from(JSON.stringify(streetflows)));
    }
        
    async queryWithQueryString(ctx, queryString) {
    /*const id = identityName + ':' + ctx.stub.getCreator().mspid;
    if(checkRights(id, 'READ') == false){
    	throw new Error(`ERROR: The provided identity has no rights for this operation`);
    }*/
        console.log('query String');
        console.log(JSON.stringify(queryString));
    
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
    
        let allResults = [];
    
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let res = await resultsIterator.next();
    
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
    
                console.log(res.value.value.toString('utf8'));
    
                jsonRes.Key = res.value.key;
    
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
    
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
                return JSON.stringify(allResults);
            }
        }
    
    }

}

module.exports = ESC_network;
