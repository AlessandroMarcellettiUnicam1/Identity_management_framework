#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
NETWORK=$8
CCNAME='Identity_manager'
CCNAME2='ESC_network'
CCNAME3='testBenchmark'

if [ "$NETWORK" == "up" ] ; then
 ./networkDown.sh
 ./startFabric.sh javascript "false" ${CCNAME}
 ./startFabric.sh javascript "true" ${CCNAME2}
 ./startFabric.sh javascript "true" ${CCNAME3}

elif [ "$NETWORK" == "down" ] ; then
 ./networkDown.sh
 
elif [ "$NETWORK" == "deploy" ] ; then
./startFabric.sh javascript "false" ${CCNAME}

fi
#./launchTests.sh $1  $2 $3 $i $5  $6 $7
#docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
#cd main
#sleep 1
#./register.sh $1
#node harvestingManager.js launchDetections -n $1 -m $2 -s $3 -j $i -t $5 -d $6 &
#cd ..
#docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
#./networkDown.sh
exit
