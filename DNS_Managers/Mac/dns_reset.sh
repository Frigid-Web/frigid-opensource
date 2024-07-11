active_interface=$(route get default | grep 'interface' | awk '{print $2}')

# Get the network name associated with the active interface
networkName=$(networksetup -listallhardwareports | awk -v iface="$active_interface" '
/Hardware Port/ {getline; if ($2 == iface) {print $0}}' | cut -d ' ' -f 3-)

# Trim whitespace from the network name
networkName=$(echo "$networkName" | xargs)

# Set DNS servers to automatic for the current network interface
networksetup -setdnsservers "$networkName" "Empty"
