from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponse
import paramiko
import json
import time
import re

# Create your views here.
def index_view(request):
    return render(request, "network/index.html")

# Add this function to your existing views.py file
@csrf_exempt
def test_connection(request):
    if request.method == "POST":
        # Simulate a successful connection response
        return JsonResponse({"success": True})
    
    return JsonResponse({"success": False}, status=400)

@csrf_exempt
def connect(request):
    if request.method == "POST":
        # Adatok
        post_data = json.loads(request.body)
        global host
        global port
        global username
        global password
        global enable_password
        host = post_data["ip"]
        port = post_data["port"]
        username = post_data["username"]
        password = post_data["password"]
        enable_password = post_data["enable_password"]

        output = send("show ip interface brief")
        if not output:
            error = {}
            error["error"] = {}
            error["error"]["message"] = "Kapcsolódási hiba"
            return JsonResponse(error, safe=False)

        interfaces = {}

        started = False

        print("indul")
        for message in output.splitlines():
            print(started)
            print(message)
            if not started:
                if "Interface" in message and "Status" in message:
                    started = True
                continue
            if message.strip():
                parts = message.split()
                if len(parts) >= 2:
                    interface_name = parts[0]
                    interface_status = parts[4]

                    if "Vlan" in interface_name:
                        continue

                    interfaces[interface_name] = {}
                    interfaces[interface_name]["state"] = interface_status
        

        output = send("show int switchport")
        if not output:
            error = {}
            error["error"] = {}
            error["error"]["message"] = "Kapcsolódási hiba"
            return JsonResponse(error, safe=False)
        
        current_name = ""
        for message in output.splitlines():
            if "Name:" in message:
                current_name = message.replace("Name: ", "").replace("Fa", "FastEthernet").replace("Gi", "GigabitEthernet").strip()
            elif "Administrative Mode:" in message:
                interfaces[current_name]["swmode"] = message.replace("Administrative Mode: ", "").replace("auto", "").replace("static", "").strip()
            elif "Access Mode VLAN:" in message:
                if interfaces[current_name]["swmode"] == "access":
                    interfaces[current_name]["swaccessvlan"] = re.sub("\(VLAN\d\d\d\d\)", "", message.replace("Access Mode VLAN: ", "").replace("(default)", "")).strip()
                else:
                    interfaces[current_name]["swaccessvlan"] = ""
            elif "Trunking VLANs Enabled:" in message:
                if interfaces[current_name]["swmode"] == "trunk":
                    interfaces[current_name]["swtrunkvlan"] = message.replace("Trunking VLANs Enabled: ", "").replace("ALL", "").strip()
                else:
                    interfaces[current_name]["swtrunkvlan"] = ""
        
        interfaces["general"] = {}

        cint = ""
        cps = ""
        cmactype = ""
        cmac = ""
        cmaxuser = ""
        cviolation = ""

        management_active = False
        management_ip = ""
        management_mask = ""
        default_gateway = ""
        # Settings in the current iteration
        output = send("show running-config")
        if not output:
            error = {}
            error["error"] = {}
            error["error"]["message"] = "Kapcsolódási hiba"
            return JsonResponse(error, safe=False)
        
        for message in output.splitlines():
            if message.strip() == "!":
                if not (cint == ""):
                    interfaces[cint]["ps"] = "On" if cps else "Off"
                    interfaces[cint]["pstype"] = cmactype if cps else ""
                    interfaces[cint]["psstaticmac"] = cmac if cps and cmactype == "static" else ""
                    interfaces[cint]["psmaxuser"] = cmaxuser if cps else ""
                    interfaces[cint]["psviolation"] = cviolation if cps else ""

                    cint = ""
                    cps = ""
                    cmactype = ""
                    cmac = ""
                    cmaxuser = ""
                    cviolation = ""
                    management_active = False
                
                continue

            # Management ip cím és alhálózati maszk
            if management_active:
                if "ip address" in message:
                    message = message.replace("ip address", "").strip()
                    management_ip= message.split()[0]
                    management_mask = message.split()[1]
                    management_active = False
                continue

            # Általános beállítások
            if "hostname" in message:
                interfaces["general"]["hostname"] = message.replace("hostname ", "").strip()
            elif "interface Vlan1" in message:
                management_active = True
            elif "ip default-gateway" in message:
                default_gateway = message.replace("ip default-gateway ", "").strip()
            elif "interface" in message and "Vlan" not in message:
                cint = message.replace("interface ", "").strip()
            elif "switchport port-security" == message.strip():
                cps = True
            elif "switchport port-security mac-address" in message:
                if "sticky" in message:
                    cmactype = "sticky"
                else:
                    cmactype = "static"
                    cmac = message.replace("switchport port-security mac-address ", "").strip()[:14]
            elif "switchport port-security maximum" in message:
                cmaxuser = message.replace("switchport port-security maximum ", "").strip()
            elif "switchport port-security violation" in message:
                cviolation = message.replace("switchport port-security violation ", "").strip()
        
        interfaces["general"]["managementip"] = management_ip
        interfaces["general"]["subnetmask"] = management_mask
        interfaces["general"]["defaultgateway"] = default_gateway

        return JsonResponse(interfaces, safe=False)
    
    error = {}
    error["error"] = {}
    error["error"]["message"] = "Kapcsolódási hiba"
    return JsonResponse(error, safe=False)

@csrf_exempt
def send_command(request):
    if request.method == "POST":
        post_data = json.loads(request.body)
        response = send(post_data["command"])
        if not response:
            error = {}
            error["error"] = {}
            error["error"]["message"] = "Nem sikerült elküldeni az SSH üzenetet"
            return JsonResponse(error, safe=False)
        return JsonResponse('{"response": {"message": "' + response + '"}', safe=False)
    
    error = {}
    error["error"] = {}
    error["error"]["message"] = "Only POST method allowed"
    return JsonResponse(error, safe=False)

def send(command):
    try:
        client = paramiko.SSHClient()

        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, port=port, username=username, password=password)

        shell = client.invoke_shell()
        output = shell.recv(1000)
        
        disable_paging(shell)
        
        shell.send(f"enable\n{enable_password}\n")
        
        shell.send(command + "\n")
        time.sleep(2)
        output = shell.recv(100000).decode()
        print(output)
        print(type(output))

        client.close()
        return output
    except:
        return False

def disable_paging(shell):
    shell.send("terminal length 0\n")
    time.sleep(1)
    output = shell.recv(1000)
    return output