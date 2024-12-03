// Gombok
const connectButton = document.getElementById('connect-button')
const interfaceItems = document.getElementById('interface-items')
const interfaceSettings = document.getElementById('interface-settings')
const generalSettings = document.getElementById('general-settings')

// Beviteli mezők
const ipInput = document.getElementById('ip-input')
const portInput = document.getElementById('port-input')
const usernameInput = document.getElementById('username-input')
const passwordInput = document.getElementById('password-input')
const enablePasswordInput = document.getElementById('enable-password-input')

// Add this function to your existing connection.js file
function testConnection() {
    fetch("/test_connection/", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sendAlert("Test connection successful!", "success");
            // Hide the connection form
            document.getElementById('connection-container').classList.add('hide');
            // Show mock interfaces
            showMockInterfaces();
            // Show connection status
            showConnectionStatus("0.0.0.0", "22", "Mock Device"); // You can adjust the IP, port, and hostname as needed
        } else {
            sendAlert("Test connection failed!", "error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        sendAlert("An error occurred during the test connection.", "error");
    });
}

function showConnectionStatus(ip, port, hostname) {
    document.getElementById("connected-ip").innerHTML = ip;
    document.getElementById("connected-port").innerHTML = port;
    document.getElementById("connected-hostname").innerHTML = hostname;
    
    // Show the connection status container
    document.getElementById('connection-status').classList.remove('hide');
}

// Function to display mock interfaces
function showMockInterfaces() {
    const mockInterfaces = {
        "GigabitEthernet0/1": { state: "up", swmode: "access", swaccessvlan: "10", swtrunkvlan: "" },
        "GigabitEthernet0/2": { state: "down", swmode: "trunk", swaccessvlan: "", swtrunkvlan: "100" },
        "FastEthernet0/1": { state: "up", swmode: "access", swaccessvlan: "20", swtrunkvlan: "" }
    };

    const interfaceItems = document.getElementById('interface-items');
    interfaceItems.innerHTML = ''; // Clear existing items

    for (const [interfaceName, settings] of Object.entries(mockInterfaces)) {
        const div = document.createElement('div');
        div.textContent = interfaceName;
        div.className = 'interface-item';
        div.id = 'interface-' + interfaceName;
        div.onclick = () => showSettings(interfaceName, settings);
        div.dataset.state = settings.state;
        div.dataset.swmode = settings.swmode;
        div.dataset.swaccessvlan = settings.swaccessvlan;
        div.dataset.swtrunkvlan = settings.swtrunkvlan;
        interfaceItems.appendChild(div);
    }

    // Show the container with interfaces
    document.getElementById('container').classList.remove('hide');
}

// Function to show settings for a specific interface
function showSettings(interfaceName, settings) {
    // Similar to your existing showSettings function, you can create a new interface settings display
    const interfaceSettings = document.getElementById('interface-settings');
    const settingsHtml = `
        <div class="setting"><strong>Interface:</strong> ${interfaceName}</div>
        <div class="setting"><strong>State:</strong> ${settings.state}</div>
        <div class="setting"><strong>Switchport Mode:</strong> ${settings.swmode}</div>
        <div class="setting"><strong>Access VLAN:</strong> ${settings.swaccessvlan}</div>
        <div class="setting"><strong>Trunk VLANs:</strong> ${settings.swtrunkvlan}</div>
    `;
    interfaceSettings.innerHTML = settingsHtml;
}

// Kapcsolódási űrlap validálása
function validateForm() {
    // IP cím formátumának ellenőrzésére szolgáló reguláris kifejezés
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    
    const ip = ipInput.value
    const port = portInput.value
    const username = usernameInput.value
    const password = passwordInput.value

    // IP cím formátumának ellenőrzése
    if (!ipRegex.test(ip)) {
        sendAlert("Érvénytelen IP cím formátum.", "error")
        return false
    }

    // Port számának ellenőrzése (0-65535 között)
    if (port < 0 || port > 65535) {
        sendAlert("A portnak 0 és 65535 között kell lennie.", "error")
        return false
    }

    // Felhasználónév és jelszó kötelező mezők ellenőrzése
    if (username.trim() === "" || password.trim() === "") {
        sendAlert("Felhasználónév és jelszó kötelező.", "error")
        return false
    }

    // Minden ellenőrzés sikeres, készen áll a csatlakozásra
    seconds = 0

    function timer() {
        seconds += 1
        connectButton.innerHTML = `Kapcsolódás folyamatban... ${seconds}mp`
    }

    var interval = setInterval(timer, 1000)
    connectButton.disabled = true
    connectButton.innerHTML = "Kapcsolódás folyamatban..."

    connect(ip, port, username, password, enablePasswordInput.value, interval)
    return false
}

// Kapcsolódás a kapcsolóhoz
async function connect(ip, port, username, password, enablePassword, timer) {
    try {
        const response = await fetch("/connect/", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                ip: ip,
                port: port,
                username: username,
                password: password,
                enable_password: enablePassword
            }),
        })
        const json = await response.json()

        if (json.hasOwnProperty("error")) {
            sendAlert(json["error"].message, "error")
            console.error(`Error: ${json["error"].message}`)
            clearInterval(timer)
            connectButton.disabled = false
            connectButton.innerHTML = "Kapcsolódás"
            return false
        }

        const interfaces = Object.keys(json)

        console.log(json)
        
        interfaceItems.innerHTML = ''

        interfaces.forEach(interface => {
            if (interface == "general") {
                return
            }
            const div = document.createElement('div')
            div.textContent = interface
            div.className = 'interface-item'
            div.id = 'interface-' + interface
            div.onclick = () => showSettings(interface)
            div.dataset.state = json[interface].state
            div.dataset.swmode = json[interface].swmode
            div.dataset.swaccessvlan = json[interface].swaccessvlan
            div.dataset.swtrunkvlan = json[interface].swtrunkvlan
            div.dataset.ps = json[interface].ps
            div.dataset.pstype = json[interface].pstype
            div.dataset.psstaticmac = json[interface].psstaticmac
            div.dataset.psmaxuser = json[interface].psmaxuser
            div.dataset.psviolation = json[interface].psviolation
            interfaceItems.appendChild(div)
        })

        // SSH kapcsolódási űrlap eltüntetése és beállítások megjelenítése
        document.getElementById('container').classList.remove('hide')
        document.getElementById('connection-status').classList.remove('hide')
        document.getElementById('connection-container').classList.add('hide')

        document.getElementById("connected-hostname").innerHTML = json["general"].hostname
        generalSettings.dataset.hostname = json["general"].hostname
        generalSettings.dataset.managementip = json["general"].managementip
        generalSettings.dataset.subnetmask = json["general"].subnetmask
        generalSettings.dataset.defaultgateway = json["general"].defaultgateway

        document.getElementById("connected-ip").innerHTML = ip
        document.getElementById("connected-port").innerHTML = port

        sendAlert("Sikeres kapcsolódás", "success")
        clearInterval(timer)
    } catch (error) {
        console.error('Hiba:', error)
        sendAlert("Kapcsolódási hiba", "error")
        connectButton.disabled = false
        connectButton.innerHTML = "Kapcsolódás"
    }
}

// Parancs elküldése a kapcsolónak
function send_command(command_message) {
    fetch("/send_command/", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            command: command_message
        }),
    }).then((response) => {
        return response.json()
    })
}

// Kapcsolat bezárása
function close_connection() {
    if (confirm("A nem alkalmazott beállítások elvesznek. Biztos szét akar kapcsolni?") == true) {
        location.reload()
    }
}