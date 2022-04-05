#!/bin/bash

node enrollAdmin.js
node registerUser.js numberSensors -n $1
#node registerIdentity.js registerSensors -n $1
#node registerUser.js registerSensors -n $1
node registerSensors.js registerSensors -n $1
