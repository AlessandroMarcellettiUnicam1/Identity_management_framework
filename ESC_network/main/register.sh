#!/bin/bash

node enrollAdmin.js
node register_devices.js numberDevices -n $1
#node registerSensors.js registerSensors -n $1
