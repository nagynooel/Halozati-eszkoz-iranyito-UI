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
            li.onclick = () => showSettings(interface);
            interfaceItems.appendChild(li);
        });

        // SSH kapcsolódási űrlap eltüntetése és beállítások megjelenítése
        document.getElementById('container').classList.remove('hide');
        document.getElementById('connection-status').classList.remove('hide');
        document.getElementById('connection-container').classList.add('hide');

        await send_command("en");

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
    });
}

// Kapcsoló beállításainak megjelenítése
async function showSettings(interface) {
    await send_command("conf t");
    await send_command(`int ${interface}`)
    const settings = `
        <div class="setting"><strong>Interface:</strong> ${interface}</div>
        <div class="setting"><strong>Állapot:</strong> <button onclick="toggleStatus('${interface}')">Be/Ki</button></div>
        <div class="setting"><strong>Ipv4 cím:</strong> <input type="text" placeholder="0.0.0.0" /></div>
        <div class="setting"><strong>Switchport Mód:</strong>
            <select id="switchport-mode" onchange="toggleVlanInput()">
                <option value="swdynamic">Dinamikus</option>
                <option value="swaccess">Access</option>
                <option value="swtrunk">Trunk</option>
            </select>
        </div>
        <div class="setting" id="vlan-setting" style="display: none;">
            <strong>VLAN ID:</strong> <input type="number" id="vlan-input" placeholder="VLAN szám" />
        </div>
        <div class="setting"><strong>Portbiztonság</strong>
            <div class="setting"><strong>Típus:</strong>
                <select id="port-security-type" onchange="toggleMACInput()">
                    <option value="psstatic">Statikus</option>
                    <option value="pssticky">Sticky</option>
                </select>
                <div class="setting" id="set-mac-address">
                    <strong>MAC-cím:</strong> <input type="text" id="mac-address" placeholder="00:00:00:00:00:00" />
                </div>
            </div>
            <div class="setting" id="max-users-settings">
                <strong>Maximum felhasználók:</strong> <input type="number" id="maxusers" placeholder="0" />
            </div>
            <div class="setting" id="violation"><strong>Szabálysértés esetén:</strong>
                <select id="port-security-violation">
                    <option value="vshutdown">Lekapcsolás</option>
                    <option value="vprotect">Védelem</option>
                    <option value="vrestrict">Korlátozás</option>
                </select>
            </div>
        </div>
    `;
    interfaceSettings.innerHTML = settings;
}

// Kapcsoló állapotának váltása
function toggleStatus(interface) {
    alert(`Állapot váltás: ${interface}`);
    send_command("no shutdown")
}

function close_connection() {
    fetch("/close/")
    console.log("Connection closed")
}