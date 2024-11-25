from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponse
import paramiko
import json

# Create your views here.
def index_view(request):
    return render(request, "network/index.html")

@csrf_exempt
def connect(request):
    # Adatok
    post_data = json.loads(request.body)
    host = post_data["ip"]
    port = post_data["port"]
    username = post_data["username"]
    password = post_data["password"]

    # SSH kapcsolat
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=host, port=port, username=username, password=password)

    stdin, stdout, stderr = client.exec_command("show ip interface brief")
    output = stdout.read().decode()

    interfaces = {}

    for message in output.splitlines():
        if "Interface" in message and "Status" in message:
            continue
        if message.strip():
            parts = message.split()
            if len(parts) >= 2:
                interface_name = parts[0]
                interface_status = parts[4]

                if "Vlan" in interface_name:
                    continue

                interfaces[interface_name] = interface_status

    print("Interface")
    print(interfaces)
    
    return JsonResponse(interfaces, safe=False)

@csrf_exempt
def send_command(request):
    if request.method == "POST":
        post_data = json.loads(request.body)
        command = post_data["command"]
        if command:
            send_message(command)
            return JsonResponse({"status": "success", "message": "Command sent"})
        else:
            return JsonResponse({"status": "error", "message": "No command provided"})
    return JsonResponse({"status": "error", "message": "Invalid request method"})

def close_connection(request):
    client.close()
    return JsonResponse({"status": "success", "message": "Connection closed"})

def send_message(message):
    if client:
        stdin, stdout, stderr = client.exec_command(message)
        print(stdout.read().decode())
        return stdout.read().decode()

def get_switch_interfaces():
    output = send_message("show ip interface brief")

    interfaces = []

    for message in output.splitlines():
        if "Interface" in message and "Status" in message:
            continue
        if message.strip():
            parts = message.split()
            if len(parts) >= 2:
                interface_name = parts[0]
                interface_status = parts[4]
                interfaces.append((interface_name, interface_status))

    return interfaces