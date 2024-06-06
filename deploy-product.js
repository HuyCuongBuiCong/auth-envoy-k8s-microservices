#!/usr/bin/env node

const {execSync} = require('child_process');
const path = require("path");
const serviceName = 'product';
const serviceDir = path.join(process.cwd(), serviceName);

const main = () => {
    try {

        process.chdir(serviceDir);
        execSync(`kubectl config use-context docker-desktop `, {stdio: 'inherit'});
        execSync(`docker build -t ${serviceName}:latest .`, {stdio: 'inherit'});
        try {
            execSync(`helm uninstall ${serviceName}`, {stdio: 'inherit'});
        } catch (error) {
            console.log(`${serviceName} is not installed.`);
        }
        execSync(`helm install ${serviceName} ${serviceDir}/helm`, {stdio: 'inherit'});
        console.log(`${serviceName} service is up and running.`);
    } catch (error) {
        console.error(`Failed to run service ${serviceName}:`, error);
        process.exit(1);
    }
};

main();
