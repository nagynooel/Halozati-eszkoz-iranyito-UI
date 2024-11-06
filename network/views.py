from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponse
import socket
import threading

# Create your views here.
def index_view(request):
    return render(request, "network/index.html")

@csrf_exempt
def connect(request, ip_address):
    host = ip_address
    port = 23
    
    global client_socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        client_socket.connect((host, port))
        receive_thread = threading.Thread(target=receive_messages)
        receive_thread.start()
    except Exception as e:
        return HttpResponse("Error")
    
    return HttpResponse("Connected")

def receive_messages():
    while True:
        try:
            message = client_socket.recv(1024).decode('utf-8')
            if message:
                print(message)
            else:
                break
        except Exception as e:
            print(e)
            break
    client_socket.close()

def send_message(message):
    if client_socket:
        client_socket.send(message.encode('utf-8'))
        print("Sent")

# Add the view to your urls.py