#!/bin/bash

cd ..
echo "######################### STARTING SIMPLE EXPERIMENT ############################"

./launchIdentityManager.sh  1  64  1  10  32 1 simple $1 $2 $3

echo "############ EXPERIMENT FINISHED ############"
