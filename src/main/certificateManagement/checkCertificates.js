import forge from 'node-forge';
import fs from 'fs/promises'; // Using fs promises directly
import path from 'path';
import os from 'os';
import { exec } from "child_process";
import { store } from '../main';


const extractNotAfterTimestamp = (certificateText) => {
    const notAfterRegex = /NotAfter:\s*(.*)/;
    const match = certificateText.match(notAfterRegex);
    if (match && match[1]) {
        const notAfterDate = new Date(match[1]);
        const currentDate = new Date();
        return currentDate < notAfterDate;
    } else {
        return false
    }
}

let certPath;




export async function checkIfRootCAFileExists() {
    try {
        if (store.get('rootCaPem') && store.get('rootCaKey')) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}


export async function checkIfRootCAExistsInRegistry() {
    const platform = os.platform();

    if (platform === 'win32') {
        return checkIfRootCAExistsWindows();
    } else if (platform === 'darwin') {
        return checkIfRootCAExistsMac();
    } else if (platform === 'linux') {
        return checkIfRootCAExistsLinux();
    } else {
        throw new Error('Unsupported platform');
    }
}



// Windows implementation
async function checkIfRootCAExistsWindows() {
    try {
        let caName = 'FrigidCA'
        if(process.env.NODE_ENV === 'development'){
            caName = 'FrigidCAev'
        }
        const certUtilCommand = `certutil -verifystore root "${caName}"`;
        return new Promise((resolve, reject) => {
            exec(certUtilCommand, (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(extractNotAfterTimestamp(stdout));
                }
            });
        });
    } catch (error) {
        return false;
    }
}

// Mac implementation
async function checkIfRootCAExistsMac() {
    try {
        let caName = 'FrigidCA'
        if(process.env.NODE_ENV === 'development'){
            caName = 'FrigidCAev'
        }

        const securityCommand = `security find-certificate -c "${caName}" -a -Z`;
        return new Promise((resolve, reject) => {
            console.log('test')
            exec(securityCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log(error)
                    resolve(false);
                } else {
                    if (stdout.includes(caName)) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            });
        });
    } catch (error) {
        return false;
    }
}


// Linux implementation
async function checkIfRootCAExistsLinux() {
    const { exec } = require('child_process');
    const path = require('path');
    const fs = require('fs').promises;

    try {
        const certFilePath = path.join(certPath, 'FrigidCA.pem');
        const opensslCommand = `openssl x509 -in "${certFilePath}" -noout -issuer`;

        return new Promise((resolve, reject) => {
            exec(opensslCommand, async (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    const issuer = stdout.trim();
                    const certFiles = await fs.readdir('/etc/ssl/certs');
                    let found = false;

                    for (const file of certFiles) {
                        const filePath = path.join('/etc/ssl/certs', file);
                        const fileContent = await fs.readFile(filePath, 'utf8');
                        if (fileContent.includes(issuer)) {
                            found = true;
                            break;
                        }
                    }

                    resolve(found);
                }
            });
        });
    } catch (error) {
        return false;
    }
}
