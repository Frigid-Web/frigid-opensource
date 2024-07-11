#!/bin/bash

# Define the DNS servers
ipv6="::1"
ipv4="127.0.0.1"

# Set DNS servers for all network services
networksetup -listallnetworkservices | while read -r service; do
  if [ "$service" != "An asterisk (*) denotes that a network service is disabled." ]; then
    networksetup -setdnsservers "$service" $ipv6 $ipv4
  fi
done
