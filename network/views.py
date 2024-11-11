from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.http import HttpResponse
import asyncio
import telnetlib3
import json
# import socket
# import threading

PORT = 23

# Create your views here.
def index_view(request):
    return render(request, "network/index.html")

@csrf_exempt
def send_command(request):
    if request.method == "POST":
        asyncio.run(send_telnet(HOST, PORT, json.loads(request.body)["command"]))
  
    return HttpResponse("Teszt")

def connect(request, ip_address):
    global HOST
    HOST = ip_address
    print(HOST)
    print(PORT)
    response = get_port_status(asyncio.run(send_telnet(HOST, PORT, "sh ip int brief\r\n ")))
    print(response)
    return JsonResponse(response, safe=False)

async def send_telnet(host, port, command):
    reader, writer = await telnetlib3.open_connection(host, port)

    # Clear the buffer
    await reader.read(100000)  # Read any leftover data in the buffer

    # Send command
    writer.write(command + '\r\n')
    await writer.drain()

    # Wait for the command to be executed and read the response
    await asyncio.sleep(2)  # Increase wait time to ensure the response is received
    response = await reader.read(100000)  # Adjust the buffer size as needed

    writer.close()

    # Clean up the response to remove the command and empty line
    response_lines = response.splitlines()[1:][:-1]
    print(response_lines)

    interfaces = []
    for interface in response_lines:
        interface.replace("--More--", "")
        interfaces.append(interface)

    cleaned_response = "\n".join(interfaces)

    print(cleaned_response)

    return cleaned_response

def get_port_status(response):
    interfaces = {}

    for message in response.splitlines():
        if "Interface" in message and "Status" in message:
            # Átugorjuk a fejlécet
            continue
        if message.strip():  # Ellenőrizzük, hogy nem üres-e a sor
            parts = message.split()
            if len(parts) >= 2:  # Ellenőrizzük, hogy van elég elem a sorban
                interface_name = parts[0]
                interface_status = parts[5]
                interfaces[interface_name] = interface_status

    return interfaces

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