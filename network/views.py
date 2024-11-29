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
    if request.method == "POST":
        # Adatok
        post_data = json.loads(request.body)
        global host
        global port
        global username
        global password
        host = post_data["ip"]
        port = post_data["port"]
        username = post_data["username"]
        password = post_data["password"]

        output = send("show ip interface brief")

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
        
        return JsonResponse(interfaces, safe=False)
    return JsonResponse('{Error: "Only POST method allowed"}')

@csrf_exempt
def send_command(request):
    if request.method == "POST":
        post_data = json.loads(request.body)
        return JsonResponse("{Response: {" + send(post_data["command"]) + "}", safe=False)
    
    return JsonResponse('{Error: "Only POST method allowed"}')

def send(command):
    client = paramiko.SSHClient()

    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=host, port=port, username=username, password=password)
    
    stdin, stdout, stderr = client.exec_command(command)
    return stdout.read().decode()