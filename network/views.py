from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponse
import paramiko
import threading

# Create your views here.
def index_view(request):
    return render(request, "network/index.html")

@csrf_exempt
def connect(request):
    host = request.POST.get("ip", "")
    port = request.POST.get("port", "")
    username = request.POST.get("username", "")
    password = request.POST.get("password", "")

    global client
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(hostname=host, port=port, username=username, password=password)
        receive_thread = threading.Thread(target=receive_messages)
        receive_thread.start()
    except Exception as e:
        return JsonResponse("{Error: '" + str(e) + "'}", safe=False)

    interfaces = get_switch_interfaces()
    
    return JsonResponse(interfaces, safe=False)

def receive_messages():
    global last_message
    while True:
        try:
            stdin, stdout, stderr = client.exec_command("show ip interface brief")
            last_message = stdout.read().decode('utf-8')
            break
        except Exception as e:
            print(e)
            break
    client.close()

def send_message(message):
    if client:
        stdin, stdout, stderr = client.exec_command(message)
        print("Sent")

def get_switch_interfaces():
    send_message("show ip interface brief")
    
    import time
    time.sleep(2)

    interfaces = []
    print(last_message)

    for message in last_message.splitlines():
        if "Interface" in message and "Status" in message:
            continue
        if message.strip():
            parts = message.split()
            if len(parts) >= 2:
                interface_name = parts[0]
                interface_status = parts[4]
                interfaces.append((interface_name, interface_status))

    return interfaces

@csrf_exempt
def send_command(request):
    if request.method == "POST":
        command = request.POST.get('command', '')
        if command:
            send_message(command)
            return JsonResponse({"status": "success", "message": "Command sent"})
        else:
            return JsonResponse({"status": "error", "message": "No command provided"})
    return JsonResponse({"status": "error", "message": "Invalid request method"})

# @csrf_exempt
# def connect(request, ip_address):
#     host = ip_address
#     port = 5001

#     global client_socket
#     client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#     try:
#         client_socket.connect((host, port))
#     except Exception as e:
#         return JsonResponse('{"type":"error", "message":"Sikertelen csatlakozás"}', safe=False)

#     return JsonResponse('{"type":"success", "message":"Sikeres csatlakozás"}', safe=False)

# def send_message(message):
#     if client_socket:
#         message += "\r\n"
#         client_socket.send(message.encode('utf-8'))
#         print("Sent")