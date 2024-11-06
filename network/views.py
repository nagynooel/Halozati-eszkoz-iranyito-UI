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

    interfaces = get_switch_interfaces()
    
    return HttpResponse(interfaces)

def receive_messages():
    while True:
        global last_message
        try:
            message = client_socket.recv(1024).decode('utf-8')
            if message:
                last_message = message
        except Exception as e:
            print(e)
            break
    client_socket.close()

def send_message(message):
    if client_socket:
        client_socket.send(message.encode('utf-8'))
        print("Sent")

def get_switch_interfaces():
    # Küldjük el a parancsot a switch interfészeinek lekérésére
    send_message("show ip interface brief")
    
    # Várunk egy kicsit, hogy a switch válaszolhasson
    import time
    time.sleep(2)  # Várj 2 másodpercet a válasz érkezésére

    # Itt feltételezzük, hogy a receive_messages funkció folyamatosan kiírja a kapott üzeneteket
    # A kapott üzeneteket egy globális változóban tárolhatjuk
    interfaces = []

    print(last_message)

    # Feldolgozzuk a kapott üzeneteket
    for message in last_message.splitlines():
        if "Interface" in message and "Status" in message:
            # Átugorjuk a fejlécet
            continue
        if message.strip():  # Ellenőrizzük, hogy nem üres-e a sor
            parts = message.split()
            if len(parts) >= 2:  # Ellenőrizzük, hogy van elég elem a sorban
                interface_name = parts[0]
                interface_status = parts[4]
                interfaces.append((interface_name, interface_status))

    return interfaces