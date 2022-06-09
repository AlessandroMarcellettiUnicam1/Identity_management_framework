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
