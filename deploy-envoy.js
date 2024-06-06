#!/usr/bin/env node

const {execSync} = require('child_process');
const path = require("path");
const serviceName = 'envoy-proxy';
const serviceDir = path.join(process.cwd(), serviceName);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
    try {

        process.chdir(serviceDir);
        execSync(`kubectl config use-context docker-desktop `, {stdio: 'inherit'});
        try {
            execSync(`helm uninstall envoy-proxy`)
            execSync(`kill $(lsof -t -i:3000)`, {stdio: 'inherit'});
        } catch (error) {
            console.log(`${serviceName} is not installed.`);
        }
        execSync(`helm install envoy-proxy ${serviceDir}/helm`, {stdio: 'inherit'});
        await sleep(3000);
        execSync(`kubectl port-forward svc/envoy-proxy 3000:3000`, {stdio: 'inherit'});
        console.log(`${serviceName} service is up and running.`);
    } catch (error) {
        console.error(`Failed to run service ${serviceName}:`, error);
        process.exit(1);
    }
};

main();
