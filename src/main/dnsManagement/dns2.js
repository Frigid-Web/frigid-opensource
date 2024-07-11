import { app, dialog } from 'electron';
import { store } from '../main';
import { getIpv4AndIpv6 } from './checkDns';
import { exec } from 'child_process';
import path from 'path';
import { ensureDir } from 'fs-extra';
import { getAppPathway } from '../util';
const dns2 = require('dns2');
const dns = require('dns');
const os = require('os');
const sudo = require('sudo-prompt');
const ip = require('ip');
const si = require('systeminformation');
const dgram = require('dgram');
const fs = require('fs');
const net = require('net');



const { TCPClient } = dns2;

const tcpResolve = TCPClient({
  dns: '1.1.1.1'
});



let pathway;
let root;
if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
    root = app.getAppPath();
} else if (getAppPathway()) {
    pathway = getAppPathway()
    root = getAppPathway() + '/../../'
} else {
    throw new Error('PORTABLE_EXECUTABLE_DIR is not defined in production mode');
}


// Utilities for DNS modification
const execute = (command) => {
  return new Promise((resolve, reject) => {
    sudo.exec(command, { name: 'DNS Modifier' }, (error, stdout, stderr) => {
      console.log(stdout, stderr, error)
      if (error) reject(error);
      else if (stderr) reject(new Error(stderr));
      else resolve(stdout);
    });
  });
};

function command(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }
      resolve(stdout);
    });
  });
}

const changeDNSMac = async () => {
  try {
    const homeDir = os.homedir();

    // Define paths
    const appSupportDir = path.join(homeDir, 'Library', 'Application Support', 'Frigid');
    if(!fs.existsSync(appSupportDir)){
      return false
    }
    let dnsFolder = path.join(appSupportDir, 'dnsManagement')
    if(!fs.existsSync(dnsFolder)){
      return false
    }
    let dnsFile = path.join(dnsFolder, 'Frigid_mac_dns_set.sh')
    if(!fs.existsSync(dnsFile)){
      return false
    }
    console.log(dnsFile)
    await command(`"${dnsFile}"`)
    
    return true
  } catch (error) {
    console.log(error)
    return false
  }

}


const changeDNSWindows = async () => {

  try {
    await new Promise(async (resolve, reject) => {
      try {
        const pipePath = '\\\\.\\pipe\\frigid';  // Correctly formatted pipe path for Windows

        const client = net.createConnection(pipePath, () => {
            console.log('Connected to server');
    
            const message = 'SetDns';
            client.write(message);
        });
    
        client.on('data', (data) => {
          console.log(data.toString())
            if(data.toString() == 'Dns Set'){
              client.end()
              resolve()
            }
            else{
              client.end()
              reject()
            }
        });

        client.on('error', (err) => {
            reject()
        });
      } catch (error) {
        reject("DNS Failure");
      }
    });
  } catch (error) {
    console.log(error);
    return false;
  }

  return true;
};

const revertDNSWindows = async () => {
  try {
    await new Promise(async (resolve, reject) => {
      try {
        const pipePath = '\\\\.\\pipe\\frigid';  // Correctly formatted pipe path for Windows

        const client = net.createConnection(pipePath, () => {
            console.log('Connected to server');
    
            const message = 'ClearDns';
            client.write(message);
        });
    
        client.on('data', (data) => {
            if(data.toString() == 'Dns Reset'){
              client.end()
              resolve()
            }
            else{
              client.end()
              reject()
            }
        });

        client.on('error', (err) => {
            reject()
        });
      } catch (error) {
        reject("DNS Failure");
      }
    });
  } catch (error) {
    console.log(error);
    return false;
  }

  return true;
};

const revertDNSMac = async () => {
  try {
    const homeDir = os.homedir();

    // Define paths
    const appSupportDir = path.join(homeDir, 'Library', 'Application Support', 'Frigid');
    if(!fs.existsSync(appSupportDir)){
      return false
    }
    let dnsFolder = path.join(appSupportDir, 'dnsManagement')
    if(!fs.existsSync(dnsFolder)){
      return false
    }
    let dnsFile = path.join(dnsFolder, 'Frigid_mac_dns_reset.sh')
    if(!fs.existsSync(dnsFile)){
      return false
    }
    await command(`"${dnsFile}"`)
  } catch (error) {
    console.log(error);
    return false;
  }

  return true;
};



export const resetDNSEntries = async () => {


  let results = false
  try {
    switch (os.platform()) {
      case 'linux':
        // await changeDNSLinux(originalDNSServers);
        results = true
        break;
      case 'win32':
        results = await revertDNSWindows();
        break;
      case 'darwin':
        results = await revertDNSMac();
        break;
      default:
        console.log('Unsupported platform:', os.platform());
        return;
    }
    return results
  } catch (error) {
    console.error('Failed to update DNS settings:', error);
    return false
  }
};



export const setLocalhostAsPrimaryDNS = async () => {


  let results = false
  try {
    switch (os.platform()) {
      case 'linux':
        // await changeDNSLinux(originalDNSServers);
        break;
      case 'win32':
        results = await changeDNSWindows();
        break;
      case 'darwin':
        results = await changeDNSMac();
        break;
      default:
        console.log('Unsupported platform:', os.platform());
        return;
    }
    return results
  } catch (error) {
    console.error('Failed to update DNS settings:', error);
    return false
  }
};

export const createDNSControllerMac = async () => {
  try {
    const homeDir = os.homedir();
    const userName = os.userInfo().username;

    const appSupportDir = path.join(homeDir, 'Library', 'Application Support', 'Frigid');
    let dnsFolder = path.join(appSupportDir, 'dnsManagement');

    await ensureDir(dnsFolder);

    let dnsSetFile = path.join(dnsFolder, 'Frigid_mac_dns_set.sh');
    const macSetDnsScript = fs.readFileSync(path.join(root, 'assets', 'dnsManagement', 'Frigid_mac_dns_set.sh'));
    fs.writeFileSync(dnsSetFile, macSetDnsScript);

    let dnsResetFile = path.join(dnsFolder, 'Frigid_mac_dns_reset.sh');
    const macResetDnsScript = fs.readFileSync(path.join(root, 'assets', 'dnsManagement', 'Frigid_mac_dns_reset.sh'));
    fs.writeFileSync(dnsResetFile, macResetDnsScript);

    const sudoersEntry = `${userName} ALL=(ALL) NOPASSWD: "${dnsSetFile}", "${dnsResetFile}"`;

    const escapedDnsSetFile = dnsSetFile.replace(/\//g, '\\/');
    const escapedDnsResetFile = dnsResetFile.replace(/\//g, '\\/');

    const command = `
      chmod -w "${dnsSetFile}" "${dnsResetFile}" &&
      chmod +x "${dnsSetFile}" "${dnsResetFile}" &&
      sudo sed -i '' '/${escapedDnsSetFile}/d' /etc/sudoers &&
      sudo sed -i '' '/${escapedDnsResetFile}/d' /etc/sudoers &&
      echo "${sudoersEntry}" | sudo tee -a /etc/sudoers
    `;


    await execute(command);

    return true;
  } catch (error) {
    return false;
  }
};

export const createDNSControllerTask = async () => {
  try {
    const userPath = app.getPath('userData')
    let directoryPath = path.join(userPath, 'Frigid', 'DNSController')
    await ensureDir(directoryPath)
    directoryPath = directoryPath.replace(/\\/g, '/');

    let powershellDirectory =  path.join(directoryPath, 'Frigid_DNS_Controller.exe')
    powershellDirectory = powershellDirectory.replace(/\\/g, '/');

    const powershellScript = fs.readFileSync(path.join(root, 'assets', 'dnsManagement', 'Frigid_DNS_Controller.exe'))
    fs.writeFileSync(powershellDirectory, powershellScript)

    const psScript = `
   $taskName = "Frigid_DNS_Controller";
$exePath = "${powershellDirectory}";
$startInPath = "${directoryPath}";

Stop-Process -Name "Frigid_DNS_Controller" -Force -ErrorAction SilentlyContinue;
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false;
}

$action = New-ScheduledTaskAction -Execute $exePath -WorkingDirectory $startInPath;
$trigger = New-ScheduledTaskTrigger -AtLogOn;
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest;

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries;

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force;

Start-ScheduledTask -TaskName $taskName;



  `;
  
  const formattedPsScript = psScript.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '\\"');
  
  const taskResults = await execute(`powershell -Command "${formattedPsScript}"`);
  
    console.log("Hi")
    return true
  } catch (error) {
    if(error.message.includes('because /ST is earlier')){
      return true
    }
    return false
  }
}



const { Packet, createServer } = dns2;

let server;
let ipv6Server;
let ipv4Client;

const RCODE = {
  NOERROR: 0,  // No Error
  FORMERR: 1,  // Format Error
  SERVFAIL: 2, // Server Failure
  NXDOMAIN: 3, // Non-Existent Domain
  NOTIMP: 4,   // Not Implemented
  REFUSED: 5,  // Query Refused
  YXDOMAIN: 6, // Name Exists when it should not
  YXRRSET: 7,  // RR Set Exists when it should not
  NXRRSET: 8,  // RR Set that should exist does not
  NOTAUTH: 9,  // Server Not Authoritative for zone
  NOTZONE: 10  // Name not contained in zone
  // Additional RCODEs can be added here
};


export const startDNSServer = async () => {
  let appInfo = await store.get('chainAppInfo')
  let suffixes = Object.keys(appInfo.domains)
  suffixes.push('frigid')
  return new Promise(async (res, reject) => {
    if (!server) {
      server = dns2.createServer({
        udp: true,
        handle: async (request, send, rinfo) => {
          // console.log(request.questions)
          let response = Packet.createResponseFromRequest(request);
          const question = request.questions[0];
          const name = question.name;

          const isFrigidDomain = suffixes.some(suffix => name.endsWith(suffix));
          response.header.ra = 1;

          let packetName = 'A'
          for (let key in Packet.TYPE) {
            if (Packet.TYPE[key] == question.type) {
              packetName = key
            }
          }
          if (isFrigidDomain) {
            if (packetName == 'A') {
              // Handle IPv4 address
              console.log('Frigid domain A record');
              response.answers.push({
                name,
                type: dns2.Packet.TYPE.A,
                class: dns2.Packet.CLASS.IN,
                ttl: 300,
                address: '127.0.0.1'
              });
            } else if (packetName == 'AAAA') {
              // Handle IPv6 address
              console.log('Frigid domain AAAA record');
              response.answers.push({
                name,
                type: dns2.Packet.TYPE.AAAA,
                class: dns2.Packet.CLASS.IN,
                ttl: 300,
                address: '::1'
              });
            }
          } else {
            try {
              const externalResponse = await tcpResolve(question.name, packetName);
              response.answers = externalResponse.answers;
            } catch (error) {
              response.header.rcode = RCODE.SERVFAIL;
            }
          }
          send(response);
        }
      });

      server.on('listening', async () => {
        console.log('DNS server is listening on port 53');
        await startIPv6Server();
        res("Booted")

      });

      server.listen({
        udp: {
          port: 53,
          type: "udp6",  // IPv4 or IPv6 (Must be either "udp4" or "udp6")
        }

      });
    } else {
      // resolve("Server is already running.")
      console.log('Server is already running.');
    }
  })

};


export const stopDNSServer = () => {
  if (server) {
    server.close();
    server = null;
    console.log('DNS server shutdown');
  } else {
    console.log('Server is not running.');
  }
  if (ipv6Server) {
    ipv6Server.close();
    ipv6Server = null;
    console.log('IPv6 server shutdown');
  } else {
    console.log('IPv6 server is not running.');
  }
  if (ipv4Client) {
    ipv4Client.close(); // Close the IPv4 client
    ipv4Client = null;
    console.log('IPv4 client shutdown');
  }
};




const startIPv6Server = async () => {
  ipv6Server = dgram.createSocket({ type: 'udp6', ipv6Only: true });
  ipv4Client = dgram.createSocket('udp4');
  ipv4Client.bind(12345);

  let clientInfoMap = {};

  ipv6Server.on('message', (msg, rinfo) => {
    const dnsRequest = dns2.Packet.parse(msg);
    clientInfoMap[dnsRequest.header.id] = { address: rinfo.address, port: rinfo.port };
    ipv4Client.send(msg, 53, '127.0.0.1');

  });

  ipv4Client.on('message', (msg, rinfo) => {

    const dnsRequest = dns2.Packet.parse(msg);
    const clientInfo = clientInfoMap[dnsRequest.header.id];
    if (clientInfo) {
      ipv6Server.send(msg, clientInfo.port, clientInfo.address, (err) => {
        if (err) {
          console.error(`Failed to send back to IPv6 client: ${err}`);
        }
      });
    }
  });

  ipv6Server.on('listening', () => {
    const address = ipv6Server.address();
    console.log(`IPv6 server listening on ${address.address}:${address.port}`);
  });

  ipv6Server.bind(53); // Bind to a specific port for IPv6
  console.log('IPv6 server started');
};

