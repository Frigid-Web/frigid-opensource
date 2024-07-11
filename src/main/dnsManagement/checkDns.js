import dns from 'dns';
import ip from 'ip';
import { getCurrentDnsServers } from './extractDns';
import si from 'systeminformation'
import os from 'os';
import { exec } from 'child_process';


const setNewIpv4 = (ipv4) => {
  if (ipv4.length == 0) return [];
  let newDns = ['127.0.0.1']
  if (ipv4[0] == '127.0.0.1') {
    if (ipv4.length > 1) {
      newDns.push(ipv4[1])
    }
    else {
      newDns.push('1.1.1.1')
    }
  }
  else {
    if (ipv4.length > 0) {
      newDns.push(ipv4[0])
    }
    else {
      newDns.push('1.1.1.1')
    }
  }
  return newDns
}

const setNewIpv6 = (ipv6) => {
  if (ipv6.length == 0) return [];
  let newDns = ['::1']
  return newDns
}

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

export const getIpv4AndIpv6 = async (flag = null) => {
  let interfaceName = 'Wi-Fi'
  if (os.platform() == 'win32') {
    const networkStats = await si.networkStats();
    const defaultInterface = await si.networkInterfaceDefault();
    const activeInterface = networkStats.find(net => net.iface === defaultInterface);
    interfaceName = activeInterface.iface
  }
  else if (os.platform() == 'darwin') {
    interfaceName = await command(`active_interface=$(route get default | grep 'interface' | awk '{print $2}')
        networksetup -listallhardwareports | awk -v iface="$active_interface" '
        /Hardware Port/ {port=$3}
        /Device/ {device=$2; if (device == iface) {print port}}'`)
    interfaceName = interfaceName.trim();
  }



  let originalDNSServers = await getCurrentDnsServers(interfaceName)

  let ipv4 = []
  let ipv6 = []
  originalDNSServers.forEach(address => {
    if (ip.isV4Format(address)) {
      if (address == '127.0.0.1') {
        ipv4.unshift(address)
      }
      else {
        ipv4.push(address)
      }
    } else if (ip.isV6Format(address)) {
      if (os.platform() == 'darwin') {
        if (address == '::1:53') {
          ipv6.unshift(address)
        }
        else {
          ipv6.push(address)
        }
      }
      else {
        if (address == '::1') {
          ipv6.unshift(address)
        }
        else {
          ipv6.push(address)
        }
      }

    }
  });
  if (ipv4.length != 0) {
    if (ipv4[0] != '127.0.0.1') {
      ipv4 = setNewIpv4(ipv4)
    }
    else {
      ipv4 = []
    }
  }
  else {
    ipv4 = ['127.0.0.1', '1.1.1.1']
  }
  if (ipv6.length != 0) {
    if (os.platform() == 'darwin') {
      if (ipv6[0] != '::1:53') {
        ipv6 = setNewIpv6(ipv6)
      }
      else {
        ipv6 = []
      }
    }
    else {
      if (ipv6[0] != '::1') {
        ipv6 = setNewIpv6(ipv6)
      }
      else {
        ipv6 = []
      }
    }

  }
  else {
    if (os.platform() == 'darwin') {
      ipv6 = ['::1:53']
    }
  }

  if (os.platform() == 'darwin') {

    if (ipv6.length > 0 || ipv4.length > 0) {
      ipv6 = ['::1:53']
      ipv4 = ['127.0.0.1']
    }
  }

  return { ipv4, ipv6 }
}


export const checkDnsIsSet = async (flag = null) => {
  const { ipv4, ipv6 } = await getIpv4AndIpv6(flag)
  let setIpv4 = false
  let setIpv6 = false
  if (ipv4.length != 0) {
    setIpv4 = true
  }
  if (ipv6.length != 0) {
    setIpv6 = true
  }

  if (setIpv4 || setIpv6) {
    return false
  }
  else {
    return true
  }
}