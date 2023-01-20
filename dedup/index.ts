import { getSdk, BalenaSDK, fromSharedOptions } from 'balena-sdk';
import {execSync, spawn} from 'child_process';
import { promises , readFileSync} from 'fs';

const sdk : BalenaSDK = getSdk({
    apiUrl: "https://api.balena-cloud.com/",
    dataDirectory: process.env.HOME+"/.balena",
    isBrowser: false
});


async function main (sdk: BalenaSDK) {
    let username = await sdk.auth.whoami() ;
    let signed = await sdk.auth.isLoggedIn() ;

    console.log("Is signed in:", signed, "as", username);

    let device_uuid = process.env.UUID || 0;

    try {
        let device = await sdk.models.device.get(device_uuid);

        let new_device_name = device.device_name + "-dedup";
        let new_uuid = sdk.models.device.generateUniqueKey();
        let application = await sdk.models.device.getApplicationName(device_uuid);
        let app = await sdk.models.application.getAppByName(application);

        console.log("Generating new device", new_device_name, "with UUID", new_uuid);

        let key = await sdk.models.device.register(app.slug, new_uuid);

        await sdk.models.device.rename(key.uuid, new_device_name);

        console.log("Generated new device:", key);

        console.log("Pull the current config.json from the device");

        let tunnel = spawn("balena", ["tunnel", device_uuid.toString() ,"-p", "22222"]);

        await new Promise(resolve => setTimeout(resolve, 10000));
        
        execSync("scp -P 22222 -o StrictHostKeyChecking=no root@localhost:/mnt/boot/config.json .");

        let config = JSON.parse(readFileSync("config.json").toString());
        
        console.log("Pulled config", config);

        config.deviceId = key.id;
        config.uuid = key.uuid;
        config.deviceApiKey = key.api_key;

        let config2 = await promises.open('config.json.new', 'w');
        config2.write(JSON.stringify(config));
        config2.close();

        console.log("Configuration updated, uploading...");

        execSync("scp -P 22222 -o StrictHostKeyChecking=no config.json.new root@localhost:/mnt/boot/config.json");

        await tunnel.kill();
     }
    catch (e) {
        console.log("Error", e);
    }
}

main(sdk)