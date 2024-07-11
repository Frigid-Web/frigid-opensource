# Fetch the active network interface
active_interface=$(route get default | grep 'interface' | awk '{print $2}')

# Get network name with the active interface
networkName=$(networksetup -listallhardwareports | awk -v iface="$active_interface" '
/Hardware Port/ {port=$3}
/Device/ {device=$2; if (device == iface) {print port}}')

# Trim whitespace from the network name
networkName=$(echo $networkName | xargs)

# Define the DNS servers
ipv6="::1"
ipv4="127.0.0.1"

# Get default IPv4 DNS address
default_ipv4=$(networksetup -getdnsservers "$networkName" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1)

# Set DNS servers
networksetup -setdnsservers "$networkName" $ipv6 $ipv4 $default_ipv4
