#!/bin/bash

set -e

ARCH=${ARCH:-$(uname -m)}
FLEET_TYPE="generic-${ARCH}"
FLEET_NAME=${FLEET_NAME:-deduplication_test}
OS_VERSION=$(balena os versions ${FLEET_TYPE} | head -n 1)

echo "This script is designed to generate a problematic fleet, image and run some emulated devices in qemu"

echo "Creating fleet ${FLEET_NAME} of type ${FLEET_TYPE}"

set +e
balena fleet create ${FLEET_NAME} --type ${FLEET_TYPE}

mkdir OS
set -e
echo "Downloading the OS image"

balena os download ${FLEET_TYPE} -o OS/os-images.img

UUID=$(openssl rand -hex 16)
echo "Registering device UUID ${UUID}"

balena device register ${FLEET_NAME} --uuid ${UUID}

echo "Generating configuration file for this device"

balena config generate --version ${OS_VERSION} --device ${UUID} --network ethernet --appUpdatePollInterval 5 --output OS/config.json

echo "Configuring the OS image"

balena os configure OS/os-images.img --version ${OS_VERSION} --config OS/config.json --device ${UUID} --config-network ethernet

echo "Your image is ready to start qemu at OS/image.img"