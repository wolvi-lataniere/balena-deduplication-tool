# Balena device Deduplication - Hack Friday Project

Some Balena users are facing duplicated devices on their fleets due to a fault in the provisioning process:
- when cloning an already provisioned device,
- when flashing a pre-provisioned image to multiple devices). 

This projects will try to reproduce the issue in a repeatable manner and come with solutions to separate the device from one another. 

This project is part of Balena's HackFridays event.

## Reproducing the issue

First step will be to reproduce the issue. For this we will:
- Create a new fleet,
- Download an OS image for this fleet,
- [Pre provision a device](https://github.com/balena-io/balena-cli-advanced-masterclass#52-preregistering-a-device) for this fleet,
- Run multiple virtual machine instances of this image to simulate each conflicting device.

The generation of the pre-provisioned image can be done using [generate-issue.sh](generate-issue.sh) script.

The generated image can then be instantiated into multiple virtual machines to generate the issue.

## Exploring possible fixes

The first option that comes in mind would be to inject into one of the duplicated devices a new `config.json` file with a new API-Key and device UUID.


