#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const serviceName = process.argv[2];
if (!serviceName) {
    console.error('Please provide a service name');
    process.exit(1);
}

const installNestCLI = () => {
    console.log('Installing NestJS CLI...');
    execSync('npm list -g @nestjs/cli || npm install -g @nestjs/cli', { stdio: 'inherit' });
};

const createNestProject = () => {
    console.log(`Creating NestJS project ${serviceName}...`);
    execSync(`nest new ${serviceName} -p npm --skip-git`, { stdio: 'inherit' });
    process.chdir(serviceName);
};

const generateNestComponents = () => {
    console.log(`Generating module, service, and controller for ${serviceName}...`);
    execSync(`nest generate module ${serviceName}`, { stdio: 'inherit' });
    execSync(`nest generate service ${serviceName}`, { stdio: 'inherit' });
    execSync(`nest generate controller ${serviceName}`, { stdio: 'inherit' });

    const controllerContent = `
import { Controller, Get } from '@nestjs/common';

@Controller('${serviceName}')
export class ${capitalizeFirstLetter(serviceName)}Controller {
@Get()
getOrder() {
    return 'Hello ${serviceName} Service';
}
}
    `;
    fs.writeFileSync(`src/${serviceName}/${serviceName}.controller.ts`, controllerContent.trim());
};

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const removeTestFiles = () => {
    console.log('Removing test files...');
    execSync(`rm -rf src/**/*.spec.ts`, { stdio: 'inherit' });
};

const main = () => {
    installNestCLI();
    createNestProject();
    generateNestComponents();
    removeTestFiles();
    console.log(`Service ${serviceName} created successfully`);
};

main();
