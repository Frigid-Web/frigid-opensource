import os
import wmi
import win32pipe, win32file, pywintypes, win32security, ntsecuritycon
import threading
import pythoncom  # Add this import
import subprocess

def clear_dns_server_search_order():
    c = wmi.WMI()
    network_adapters = c.Win32_NetworkAdapterConfiguration(IPEnabled=True)

    response = "Dns Reset"
    for adapter in network_adapters:
        try:
            adapter.SetDNSServerSearchOrder([])
        except Exception as e:
            response = "Error: Dns Failure"
            break

    # Now clear IPv6 DNS servers
    try:
        # Get the list of network adapters
        result = subprocess.run(["powershell", "-Command", "Get-NetAdapter -Physical | Select-Object -ExpandProperty ifIndex"], capture_output=True, text=True)
        interface_indexes = result.stdout.strip().split()

        for index in interface_indexes:
            # Reset IPv6 DNS servers to automatic using netsh
            subprocess.run(["netsh", "interface", "ipv6", "set", "dnsservers", index, "source=dhcp"])
    except Exception as e:
        response = "Error: IPv6 DNS Failure"
    os.system('cls')
    return response


def set_dns_server_addresses():
    c = wmi.WMI()
    network_adapters = c.Win32_NetworkAdapterConfiguration(IPEnabled=True)

    response = "Dns Set"
    for adapter in network_adapters:
        try:
            ip_addresses = adapter.IPAddress
            if ip_addresses:
                for ip_address in ip_addresses:
                    if '.' in ip_address:
                        # Set IPv4 DNS servers to 127.0.0.1 and 1.1.1.1
                        adapter.SetDNSServerSearchOrder(["127.0.0.1", "1.1.1.1"])
        except Exception as e:
            response = "Error: Dns Failure"
            clear_dns_server_search_order()
            break

    # Set IPv6 DNS servers
    try:
        # Get the list of network adapters
        result = subprocess.run(["powershell", "-Command", "Get-NetAdapter -Physical | Select-Object -ExpandProperty ifIndex"], capture_output=True, text=True)
        interface_indexes = result.stdout.strip().split()

        for index in interface_indexes:
            # Set IPv6 DNS server to ::1 using netsh
            subprocess.run(["netsh", "interface", "ipv6", "set", "dnsservers", index, "static", "::1", "primary"], check=True)
    except Exception as e:
        response = "Error: IPv6 DNS Failure"
    os.system('cls')
    return response

def handle_client(pipe):
    pythoncom.CoInitialize()  # Initialize COM library for this thread
    try:
        while True:
            try:
                # Read from the pipe
                res, message = win32file.ReadFile(pipe, 64*1024)
                message = message.decode().strip()

                # Process the received message
                if message == "ClearDns":
                    response = clear_dns_server_search_order()
                elif message == "SetDns":
                    response = set_dns_server_addresses()
                elif message == "Ping":
                    response = "Pong"
                else:
                    response = "Error: No Command"

                # Send the response back to the client
                win32file.WriteFile(pipe, response.encode())
                win32file.FlushFileBuffers(pipe)  # Ensure all data is sent before waiting for next message

            except pywintypes.error as e:
                if e.winerror == 109:  # ERROR_BROKEN_PIPE
                    break  # Exit the loop to wait for a new connection
                else:
                    break

    finally:
        # Clean up the pipe handle
        if pipe:
            win32file.CloseHandle(pipe)
        pythoncom.CoUninitialize()  # Uninitialize COM library for this thread

def create_security_attributes():
    # Create a security descriptor
    sd = win32security.SECURITY_DESCRIPTOR()
    sd.Initialize()

    # Create a DACL (Discretionary Access Control List)
    dacl = win32security.ACL()

    # Add permissions for the Local System account
    sid_system = win32security.CreateWellKnownSid(win32security.WinLocalSystemSid, None)
    dacl.AddAccessAllowedAce(win32security.ACL_REVISION, ntsecuritycon.FILE_ALL_ACCESS, sid_system)

    # Add permissions for Everyone
    sid_everyone = win32security.CreateWellKnownSid(win32security.WinWorldSid, None)
    rights_mask = (ntsecuritycon.FILE_GENERIC_READ |
                   ntsecuritycon.FILE_GENERIC_WRITE |
                   ntsecuritycon.FILE_GENERIC_EXECUTE |
                   ntsecuritycon.DELETE |
                   ntsecuritycon.READ_CONTROL |
                   ntsecuritycon.WRITE_DAC |
                   ntsecuritycon.WRITE_OWNER |
                   ntsecuritycon.SYNCHRONIZE)
    dacl.AddAccessAllowedAce(win32security.ACL_REVISION, rights_mask, sid_everyone)

    # Set the DACL in the security descriptor
    sd.SetSecurityDescriptorDacl(1, dacl, 0)

    # Create security attributes
    sa = win32security.SECURITY_ATTRIBUTES()
    sa.SECURITY_DESCRIPTOR = sd

    return sa

def run_server():
    pipe_name = r'\\.\pipe\frigid'

    # Create security attributes with the appropriate permissions
    sa = create_security_attributes()

    try:
        while True:
            # Create a named pipe
            pipe = win32pipe.CreateNamedPipe(
                pipe_name,
                win32pipe.PIPE_ACCESS_DUPLEX,
                win32pipe.PIPE_TYPE_MESSAGE | win32pipe.PIPE_READMODE_MESSAGE | win32pipe.PIPE_WAIT,
                win32pipe.PIPE_UNLIMITED_INSTANCES,
                65536, 
                65536, 
                0, 
                sa)


            win32pipe.ConnectNamedPipe(pipe, None)
            # Start a new thread to handle the client connection
            client_thread = threading.Thread(target=handle_client, args=(pipe,))
            client_thread.daemon = True
            client_thread.start()

    except Exception as e:
        return

if __name__ == "__main__":
    run_server()
