// Beviteli mezők
const ipInput = document.getElementById('ip-input');
const portInput = document.getElementById('port-input');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
// Gombok
const connectButton = document.getElementById('connect-button');
const generalSettingsButtons = document.getElementById('general-settings');
const interfaceItems = document.getElementById('interface-items');
const interfaceSettings = document.getElementById('interface-settings');

// Kapcsolódási űrlap validálása
function validateForm() {
    // IP cím formátumának ellenőrzésére szolgáló reguláris kifejezés
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    ip = ipInput.value
    port = portInput.value
    username = usernameInput.value
    password = passwordInput.value

    // IP cím formátumának ellenőrzése
    if (!ipRegex.test(ip)) {
        sendAlert("Érvénytelen IP cím formátum.", "error");
        return false;
    }

    // Port számának ellenőrzése (0-65535 között)
    if (port < 0 || port > 65535) {
        sendAlert("A portnak 0 és 65535 között kell lennie.", "error");
        return false;
    }

    // Felhasználónév és jelszó kötelező mezők ellenőrzése
    if (username.trim() === "" || password.trim() === "") {
        sendAlert("Felhasználónév és jelszó kötelező.", "error");
        return false;
    }

    // Minden ellenőrzés sikeres, készen áll a csatlakozásra
    connect(ip, port, username, password);
    return false;
}

// Kapcsolódás a kapcsolóhoz
async function connect(ip, port, username, password) {
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
                password: password
            }),
        });
        const json = await response.json();
        const interfaces = Object.keys(json);

        console.log(json)
        
        interfaceItems.innerHTML = '';
        generalSettingsButtons.style.display = 'block';

        interfaces.forEach(interface => {
            const li = document.createElement('li');
            li.textContent = interface;
            li.className = 'interface-item';
            li.id = 'interface-' + interface;
            li.onclick = () => showSettings(interface)
            li.dataset.state = json[interface]
            li.dataset.ip = ""
            li.dataset.swmode = ""
            li.dataset.swaccessvlan = ""
            li.dataset.swtrunkvlan = ""
            li.dataset.pstype = ""
            li.dataset.psstaticmac = ""
            li.dataset.psmaxuser = ""
            li.dataset.psviolation = ""
            interfaceItems.appendChild(li);
        });

        // SSH kapcsolódási űrlap eltüntetése és beállítások megjelenítése
        document.getElementById('container').classList.remove('hide');
        document.getElementById('connection-status').classList.remove('hide');
        document.getElementById('connection-container').classList.add('hide');

    } catch (error) {
        console.error('Hiba:', error);
    }
};

// Parancs elkűldése a kapcsolónak
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
    }).then(response => {
        console.log(response)
    });
}

function close_connection() {
    fetch("/close/")
    console.log("Connection closed")
}