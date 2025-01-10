import forge from 'node-forge';
import sudo from 'sudo-prompt';
import fs from 'fs/promises'; // Using fs promises directly
import fsSync from 'fs'; // Using fs sync for file existence check
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../main';
import { getAppPathway } from '../util';
import { randomUUID } from 'crypto';
import { checkIfRootCAExistsInRegistry, checkIfRootCAFileExists } from './checkCertificates';
const { dialog } = require('electron')
const { exec } = require('child_process');
let pathway;

if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
  } 
else {
    pathway =  path.resolve(getAppPathway() + '/../../')
}

const certPath = path.join(pathway , 'certificates');

// Function to initialize and install Root CA

const createContractsDirectory = async () => {
    if(!fsSync.existsSync(certPath)){
        await fs.mkdir(certPath, { recursive: true });
    }
}

let certificateInterval = null;
let certificateTimeout = null;
let certificateResolve = null

export async function initializeAndInstallRootCA() {
    try {
        if(fsSync.existsSync(certPath)){
            await fs.rmdir(certPath, { recursive: true });
        }
        await createContractsDirectory()
        const certFilePath = path.join(certPath, 'rootCA.pem');
        const keyFilePath = path.join(certPath, 'rootCA.key');

        let certNeedsRenewal = true;  // Assume the certificate needs renewal by default

        if (certNeedsRenewal) {
            const keys = forge.pki.rsa.generateKeyPair(2048);

            // Create a Certificate
            const cert = forge.pki.createCertificate();
            cert.publicKey = keys.publicKey;
            cert.serialNumber = uuidv4().replace(/-/g, '').toUpperCase();
            
            // Set Validity Period (10 years)
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
            
            // Set CA Name
            let caName = 'FrigidCA';
            if (process.env.NODE_ENV === 'development') {
                caName = 'FrigidCAev';
            }
            
            // Set Certificate Subject and Issuer
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
            
            // Add Extensions
            cert.setExtensions([
                {
                    name: 'basicConstraints',
                    cA: true,
                    critical: true
                },
                {
                    name: 'keyUsage',
                    digitalSignature: true,
                    keyEncipherment: true, // Add keyEncipherment
                    keyCertSign: true,
                    cRLSign: true,
                    critical: false // Make non-critical
                },
                {
                    name: 'subjectKeyIdentifier'
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
                    if(certificateInterval != null){
                        clearInterval(certificateInterval);
                        clearTimeout(certificateTimeout);
                        certificateResolve(null)
                    }

                    const tmpCertPath = '/tmp/rootCA.pem';
                    await fs.copyFile(certFilePath, tmpCertPath);
                    let config = `
                    <?xml version="1.0" encoding="UTF-8"?>
                        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
                        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                        <plist version="1.0">
                        <dict>
                            <key>PayloadContent</key>
                            <array>
                            <dict>
                                <key>PayloadCertificateFileName</key>
                                <string>frigid_rootCA.pem</string>
                                <key>PayloadContent</key>
                                <data>
                                ${fsSync.readFileSync(tmpCertPath).toString('base64')}
                                </data>
                                <key>PayloadDescription</key>
                                <string>Installs the Frigid root certificate to enable access to web3 websites</string>
                                <key>PayloadDisplayName</key>
                                <string>Frigid ${caName == 'FrigidCA' ? '' : 'Dev '}Root CA Certificate</string>
                                <key>PayloadIdentifier</key>
                                <string>com.frigid.rootca</string>
                                <key>PayloadType</key>
                                <string>com.apple.security.root</string>
                                <key>PayloadUUID</key>
                                <string>${randomUUID() }</string>
                                <key>PayloadVersion</key>
                                <integer>1</integer>
                            </dict>
                            </array>
                            <key>PayloadDisplayName</key>
                            <string>Frigid ${caName == 'FrigidCA' ? '' : 'Dev '}Root Certificate</string>
                            <key>PayloadIdentifier</key>
                            <string>com.frigid.trustedcerts</string>
                            <key>PayloadRemovalDisallowed</key>
                            <false/>
                            <key>PayloadType</key>
                            <string>Configuration</string>
                            <key>PayloadUUID</key>
                            <string>${randomUUID() }</string>
                            <key>PayloadVersion</key>
                            <integer>1</integer>
                        </dict>
                        </plist>
                    `
                    fsSync.writeFileSync('/tmp/frigidRootCa.mobileconfig', config);
        

                    await new Promise((success, fail) => {
                        exec(`open /tmp/frigidRootCa.mobileconfig; open /System/Library/PreferencePanes/Profiles.prefPane`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                            success()
                        });
                    })
                    fsSync.unlinkSync('/tmp/rootCA.pem');

                    let value = await new Promise((resolve) => {
                        certificateResolve = resolve
                        certificateTimeout = setTimeout(() => {
                            clearInterval(certificateInterval);
                            certificateResolve(null)
                          }, 5 * 60 * 1000) 

                        certificateInterval = setInterval(async () => {
                          if (await checkIfRootCAExistsInRegistry() && await checkIfRootCAFileExists()) {
                            fsSync.unlinkSync('/tmp/frigidRootCa.mobileconfig');
              
                            clearTimeout(certificateTimeout);
                            clearInterval(certificateInterval);
                            certificateResolve(true)
                          }
                        }, 2000)
                        
              
                      })
                      return value
                   
                    
                    break;
                default:
                    console.log('Unsupported platform:', os.platform());
                    return;
            }
        }
        return true
    } catch (error) {
        console.error('Failed to initialize and install root CA:', error);
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


