#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
NETWORK=$8
CCNAME='Identity_manager'
CCNAME2='ESC_network'

if [ "$NETWORK" == "up" ] ; then
 ./networkDown.sh
 ./startFabric.sh javascript "false" ${CCNAME}
 ./startFabric.sh javascript "true" ${CCNAME2}

elif [ "$NETWORK" == "down" ] ; then
 ./networkDown.sh
 
elif [ "$NETWORK" == "deploy" ] ; then
./startFabric.sh javascript "false" ${CCNAME}

fi
#node registerIdentity.js arguments -i sensor1 -t provideIdentity -p sensor1 LightSensor none none none --chaincode Identity_manager --contract identity_manager -n 1
#node registerIdentity.js arguments -i sensor1 -t test --chaincode ESC_network --contract ESC_network -n 1
#node registerIdentity.js arguments -i sensor1 -t createRights -p sensor1 ESC_network --chaincode Identity_manager --contract rights_manager -n 1
#./launchTests.sh $1  $2 $3 $i $5  $6 $7
#docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
#cd main
#sleep 1
#./register.sh $1
#node harvestingManager.js launchDetections -n $1 -m $2 -s $3 -j $i -t $5 -d $6 &
#cd ..
#docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
#./networkDown.sh
#exit
#node registerIdentity.js arguments -i sensor1 -t test --chaincode ESC_network --contract ESC_network -n 1
