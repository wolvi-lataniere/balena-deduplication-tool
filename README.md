# Balena device Deduplication - Hack Friday Project

Some Balena users are facing duplicated devices on their fleets due to a fault in the provisioning process:
- when cloning an already provisioned device,
- when flashing a pre-provisioned image to multiple devices). 

This document is a log of the tests and don't represent an HowTo documentation yet.

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

### Test results

The first generated device has MAC address `FE:1D:5A:BE:1A:06`.

The second VM has mac address `8E:A4:2D:E3:E4:2D`

When booting the second device, the MAC address displayed in the dashboard changes to the new one, even if the first device is still online and the SSH tunnel matches the second device.

### Trying to deduplicate the device

The Typescript module [dedup/index.ts](dedup) does connect to the Balena API using both `balena-cli` and `balena sdk` to:
- pull the information about the device, 
- generate a new device information,
- pull the `config.json` file from the device using `balena tunnel` and `ssh`,
- push a modified config to the device.

While testing the connected device did move to a new UUID/API Key. However the other one stays in `Hearbeat only` mode and can't be rebooted from the dashboard.

When manually rebooting the device it came back online.

**NOTE** For the first test, devices were setup with `developperMode` enabled.

