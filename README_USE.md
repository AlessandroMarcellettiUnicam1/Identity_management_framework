# Device Identity and Rights registration

go to **/Identity_management_framework/ESC-network/IdentityManager** and run ./launchSimpleExperiments.sh up. this will create the network and deploy the two chaincodes containing the application and the I&AM managers. 

Then move to **Identity_management_framework/ESC-network/main** and run node ./register.sh 1, this creates an admin certification for the gateway and it registers devices.

At this point, the script ./IAM_module.js can be used to interact with the smart contracts to create an identity and assign the related rights.
To  run it use:
node IAM_module.js arguments -i device1 -t provideIdentity -p sensor1 Actuator1 none none none --chaincode Identity_manager --contract identity_manager -n 1
node IAM_module.js arguments -i device1 -t initRights --chaincode ESC_network --contract ESC_network -n 1
node IAM_module.js arguments -i device1 -t createRights -p sensor1 ESC_network --chaincode Identity_manager --contract rights_manager -n 1

To customise the examples, you can follow the parameters described below:
- **i**: identity of the device to use
- **t**: name of the function to execute
- **p**: list of function parameters
- **chaincode**: name of the chaincode to retrieve
- **contract**: name of the contract to invoke

# Basic Experiments configuration and execution

To execute an example of the urban lighting system, go to **Identity_management_framework/ESC-network/main** and run
node IAM_module.js arguments -i device1 -t createSensor -p 1 sensor1 --chaincode ESC_network --contract ESC_network -n 1

Then, move to **Identity_management_framework/ESC-network/SimpleExperiment** and run
./launchSimpleExperiment.sh

This will start the measurement of the previosulr registered sensor, authenticated using its rights.

# Elastic Experiments configuration and execution

1. Please read the README.md file first and install all necessary components first

2. go to **Identity_management_framework/ESC-network/ExperimentSetElasticity** and run ./launchExperimentsElastic.sh with the necessary parameters, if you run it without any, an error message will appear explaining each parameter:

- **Number of sensors**: number of sensors to simulate in the experiments.

- **Execution time**: time in seconds for the experiment to run.

- **Calculation frequency**: frequency in seconds for the experiment to run a flow calculation.

- **Sensor update frequency**: frequency for the sensors to insert data into the Blockchain.

- **Time window**: number of seconds for the data to be kept as valid data in the Blockchain for flow calculations.

- **Elasticity evaluation frequency**: number of calculation between each evaluation of the system performance in order to make use of the elasticity if necessary.

- **Street length**: number of kilometers of the simulated street.

- **Maximum time**: number of miliseconds allow at most for the system to apply elasticity. (Elasticity parameter)

- **Minimum time**: number of miliseconds allow at least for the system to apply elasticity. (Elasticity parameter)

Each one of these parameters must be given in order, an example of a correct use of the script is shown if the error message for the wrong number of parameters appears:

```
./launchExperimentsElastic.sh 4 3600 8 1 1800 5 1 100 50
```

The parameters of this example are the same used in the graphs shown at the end of the document. The script will execute 3 experiments so be aware that the execution time you use will be multiplied by 3.

For each one of those experiments 2 CSV files will be generated in the "results" folder with a timestamp of the execution date and a prefix for each experiment: "testNoElastic", "testFrequency" and "testTimeWindow". the three experiment test the system without any elasticity, with the frequency of update of sensors as elasticity parameter and the time window for the data to be stored as elasticity parameter, respectively.
Wait for the network to start up and run the experiments! Once it is finished it will shut down itself. The estimated duration of these experiments is between three and three and a half hours. The results will be written in a series of .csv files inside ``elastic-smart-contracts/ESC-network/main/results``.

The simulated sensor data for the experiment can be configured in the file [defaultData.csv](https://github.com/isa-group/elastic-smart-contracts/blob/master/ESC_network/main/defaultData.csv); in the current scenario, each row represent the speed and relative arrival time for each car.  

# Results interpretation

Two .csv files will be generated for each experiments, one containing the analytics of each calculation flow executed during the experiment, and the other with the general statistics of the whole experiment.

1. The .csv for the statistics of the experiment consist in a single row of data for each experiment executed, the description of each column are as follows:

- **NUMBER_SENSORS**: number of sensors used in the experiment.

- **FREQUENCY**: frequency in seconds of execution of a flow calculation.

- **TIME_DATA**: temporal window in seconds for data to be stored and used in the calculation.

- **MIN_TIME**: minimum execution time of a flow calculation registered during the experiment.

- **MAX_TIME**: maximum execution time of a flow calculation registered during the experiment.

- **AVG_TIME**: average execution time of all flow calculations registered during the experiment.

- **STD_TIME**: standar deviation of the execution time of all flow calculations registered during the experiment.

- **SUCCESFUL_CALCULATIONS**: number of flow calculations executed successfully.

- **CALCULATIONS_OVER_MAX**: number of flow calculations with an execution time at least 50% more of the maximum execution time allowed by elasticity rules.

2. The .csv for the calculations of the experiment consist in a row of data for each execution of a flow calculation, the description of each column are as follows:

- **NUMBER_SENSORS**: number of sensors used in the experiment.

- **NUMBER_DETECTIONS**: number of cars detected in total, note that a single car can be detected once per sensor.

- **TOTAL_TIME**: execution time of the flow calculation.

- **CARS_PER_SECOND_BY_SENSOR**: array containing the calculation of traffic flow for each sector covered by a sensor.

- **CARS_PER_SECOND_TOTAL**: flow of cars calculated for the whole street.

- **REAL_CARS_PER_SECOND**: real flow of cars having into consideration the data straight from the csv of cars used to simulate the flow, this flow is for the immediate time of the calculation.

- **REAL_CARS_PER_SECOND_TOTAL**: real flow of cars having into consideration the data straight from the csv of cars used to simulate the flow, the difference between this column and the previous one is that this one takes the flow for the entire time window given, instead of the inmediate time alone.

- **FREQUENCY**: frequency in seconds of execution of a flow calculation.

- **TIME_DATA**: temporal window in seconds for data to be stored and used in the calculation.

- **FREQUENCY_DATA**: frequency in seconds for sensors to insert data in the blockchain.

- **DETECTIONS_STORED**: number of "detections" objects stored in the blockchain at the time of the calculation, note that a detection object can contain more than 1 car detected.

- **FROM_DATE**: time in miliseconds to get data for the calculation between this column and TO_DATE column.

- **TO_DATE**: time in miliseconds to get data for the calculation between this column and FROM_DATE column.

- **MINIMUM_TIME**: minimum execution time established by elasticity rules.

- **MAXIMUM_TIME**: maximum execution time established by elasticity rules.
