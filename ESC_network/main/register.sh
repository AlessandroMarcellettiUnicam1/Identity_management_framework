#!/bin/bash

node enrollAdmin.js
node register_devices.js numberDevices -n $1
