import forge from 'node-forge';
import sudo from 'sudo-prompt';
import fs from 'fs/promises'; // Using fs promises directly
import fsSync from 'fs'; // Using fs sync for file existence check
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../main';
import { getAppPathway } from '../util';
const { dialog } = require('electron')

let pathway;

if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
  } 
else {
    pathway =  getAppPathway() + '/../../'
}

const certPath = path.join(pathway , 'certificates');

// Function to initialize and install Root CA

const createContractsDirectory = async () => {
    if(!fsSync.existsSync(certPath)){
        await fs.mkdir(certPath, { recursive: true });
    }
}

export async function initializeAndInstallRootCA() {
    try {
        await createContractsDirectory()
        const certFilePath = path.join(certPath, 'rootCA.pem');
        const keyFilePath = path.join(certPath, 'rootCA.key');

        let certNeedsRenewal = true;  // Assume the certificate needs renewal by default

        if (certNeedsRenewal) {
            const keys = forge.pki.rsa.generateKeyPair(2048);

            const cert = forge.pki.createCertificate();
            cert.publicKey = keys.publicKey;
            cert.serialNumber = uuidv4().replace(/-/g, '').toUpperCase();
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 100); // Valid for 10 years
            let caName = 'FrigidCA'
            if(process.env.NODE_ENV === 'development'){
                caName = 'FrigidCAev'
            }
            const attrs = [
                { name: 'commonName', value: caName },
                { name: 'countryName', value: 'US' },
                { shortName: 'ST', value: 'FF' },
                { name: 'localityName', value: 'WebThree' },
                { name: 'organizationName', value: 'Frigid' },
                { shortName: 'OU', value: 'Frigid' }
            ];

            cert.setSubject(attrs);
            cert.setIssuer(attrs);

            cert.setExtensions([
                {
                    name: 'basicConstraints',
                    cA: true,
                    critical: true
                },
                {
                    name: 'keyUsage',
                    keyCertSign: true,
                    cRLSign: true,
                    critical: true
                }
            ]);
            
            // Sign the certificate with the private key using SHA-256
            cert.sign(keys.privateKey, forge.md.sha256.create());

            // Convert certificate and private key to PEM format
            const pemCert = forge.pki.certificateToPem(cert);
            const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

            store.set('rootCaPem', pemCert);
            store.set('rootCaKey', pemKey);

            await fs.writeFile(certFilePath, pemCert);
            await fs.writeFile(keyFilePath, pemKey);

            let installCommand = ''
            switch (os.platform()) {
                case 'linux':
                    // await changeDNSLinux(originalDNSServers);
                    break;
                case 'win32':
                    let caName = 'FrigidCA'
                    if(process.env.NODE_ENV === 'development'){
                        caName = 'FrigidCAev'
                    }
                    installCommand = `certutil -delstore "Root" "${caName}" && certutil -addstore "Root" "${certFilePath}"`;
                    await new Promise((success, fail) => {
                        sudo.exec(installCommand, { name: 'Frigid' }, (error, stdout, stderr) => {
                            console.log(error)
                            console.log(stdout)
                            if (error) fail(error);
                            if (stderr) fail(stderr);
                            success(true)
                        });
                    })
                  
                    break;
                case 'darwin':
                    const tmpCertPath = '/tmp/rootCA.pem';
                    await fs.copyFile(certFilePath, tmpCertPath);
                    installCommand = `
                        security authorizationdb write com.apple.trust-settings.admin allow;
                        security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "/tmp/rootCA.pem";
                        security authorizationdb remove com.apple.trust-settings.admin
                    `;
                    await new Promise((success, fail) => {
                        sudo.exec(installCommand, { name: 'Frigid' }, (error, stdout, stderr) => {
                            if (error) throw error;
                            if (stderr) console.error(`stderr: ${stderr}`);
                            console.log(`stdout: ${stdout}`);
                            console.log("New Root CA installed successfully.");
                            success('succes')
                        });
                    })
                    await fs.unlink('/tmp/rootCA.pem');
                    break;
                default:
                    console.log('Unsupported platform:', os.platform());
                    return;
            }
        }
        return true
    } catch (error) {
        // console.error('Failed to initialize and install root CA:', error);
        return false
    }
}
// Function to generate a certificate for a domain based on the Root CA

export async function generateCertificateForDomain(domain) {
    try {
        await createContractsDirectory()
        let pemCertCheck = fsSync.existsSync(path.join(certPath, `${domain}.pem`))
        let pemKeyCheck = fsSync.existsSync(path.join(certPath, `${domain}.key`))
        const rootCertPem = store.get('rootCaPem');
        const rootKeyPem =  store.get('rootCaKey');
        if(pemCertCheck && pemKeyCheck){
            const pemCert = await fs.readFile(path.join(certPath, `${domain}.pem`), 'utf8');
            const pemKey = await fs.readFile(path.join(certPath, `${domain}.key`), 'utf8');
            return { key: pemKey, cert: pemCert, ca: rootCertPem};
        }
      
        const rootCert = forge.pki.certificateFromPem(rootCertPem);
        const rootKeys = forge.pki.privateKeyFromPem(rootKeyPem);

        const keys = forge.pki.rsa.generateKeyPair(2048);
        const cert = forge.pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = uuidv4().replace(/-/g, '').toUpperCase();
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // Valid for 1 year

        const attrs = [
            { name: 'commonName', value: domain },
            { name: 'countryName', value: 'US' },
            { shortName: 'ST', value: 'State' },
            { name: 'localityName', value: 'City' },
            { name: 'organizationName', value: 'YourOrganization' },
            { shortName: 'OU', value: 'YourDepartment' }
        ];

        cert.setSubject(attrs);
        cert.setIssuer(rootCert.subject.attributes);

        const altNames = [
            { type: 2, value: domain },
        ];

        cert.setExtensions([
            {
                name: 'subjectAltName',
                altNames: altNames
            }
        ]);

        cert.sign(rootKeys, forge.md.sha256.create());

        const pemCert = forge.pki.certificateToPem(cert);
        const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

        // Save the generated certificates and keys
        await fs.writeFile(path.join(certPath, `${domain}.pem`), pemCert);
        await fs.writeFile(path.join(certPath, `${domain}.key`), pemKey);

        console.log(`Certificate and key for ${domain} have been successfully generated and saved.`);
        return { key: pemKey, cert: pemCert, ca: rootCertPem};

    } catch (error) {
        console.error(`Failed to generate certificate for ${domain}:`, error);
        return undefined;
    }
}


