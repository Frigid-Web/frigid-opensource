import ipRegex from './ipRegex';
import { exec } from 'child_process';
import os from 'os';

// Function to execute netsh command and return a promise with the output
function getDNSServers(command) {
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

// Function to extract DNS servers from the command output
function extractDNSServers(output, regex) {
    let results = output.match(ipRegex())
    if (results == null) {
        return []
    }
    return results
}

// Get IPv4 and IPv6 DNS servers dsafkjsl
export const getCurrentDnsServers = async (interfaceName) => {
    try {
        let ipv4Command
        let ipv6Command
        if (os.platform() == 'win32') {
            ipv4Command = `netsh interface ipv4 show dnsservers "${interfaceName}"`;
            ipv6Command = `netsh interface ipv6 show dnsservers "${interfaceName}"`;
        }
        else if (os.platform() == 'darwin') {
            ipv4Command = `networksetup -getdnsservers "${interfaceName}"`;
            ipv6Command = `networksetup -getdnsservers "${interfaceName}"`;
        }
        else if (os.platform() == 'linux') {
            ipv4Command = `cat /etc/resolv.conf`;
            ipv6Command = `cat /etc/resolv.conf`;
        }


        const ipv4Output = await getDNSServers(ipv4Command);
        const ipv6Output = await getDNSServers(ipv6Command);

        let ipv4DNSServers = []
        if (!ipv4Output.includes('None')) {
            ipv4DNSServers = extractDNSServers(ipv4Output);
        }
        let ipv6DNSServers = []
        if (!ipv6Output.includes('None')) {
            ipv6DNSServers = extractDNSServers(ipv6Output);
        }

        return [...ipv4DNSServers, ...ipv6DNSServers]
    } catch (error) {
        console.error('Error:', error);
    }
}
