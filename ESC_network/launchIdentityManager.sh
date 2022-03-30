#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
NETWORK=$8
CCNAME=$9

if [ "$NETWORK" == "up" ] ; then
 ./networkDown.sh
 ./startFabric.sh javascript "false" ${CCNAME}

elif [ "$NETWORK" == "down" ] ; then
 ./networkDown.sh
 
elif [ "$NETWORK" == "deploy" ] ; then
./startFabric.sh javascript "true" ${CCNAME}

fi

#docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
#./register.sh $1
#node harvestingManager.js launchDetections -n $1 -m $2 -s $3 -j $i -t $5 -d $6 &
cd ..
#docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
#./networkDown.sh
exit
