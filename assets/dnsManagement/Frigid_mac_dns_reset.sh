#!/bin/bash

# Reset DNS servers to automatic for all network services
networksetup -listallnetworkservices | while read -r service; do
  if [ "$service" != "An asterisk (*) denotes that a network service is disabled." ]; then
    networksetup -setdnsservers "$service" "Empty"
  fi
done
