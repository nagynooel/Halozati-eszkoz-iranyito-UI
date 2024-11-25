function toggleVlanInput() {
    const modeSelect = document.getElementById('switchport-mode'); // A switchport mód kiválasztása
    const vlanSetting = document.getElementById('vlan-setting'); // VLAN beállítási elem
    if (modeSelect.value === 'swaccess') { // Ha a mód 'swaccess'
        vlanSetting.style.display = 'block'; // Mutasd a VLAN beállítást
    } else {
        vlanSetting.style.display = 'none'; // Egyébként rejtsd el
    }
}

function toggleMACInput() {
    const modeSelect = document.getElementById('port-security-type'); // Port biztonsági típus kiválasztása
    const macInput = document.getElementById('set-mac-address'); // MAC cím beállítási elem
    if (modeSelect.value === 'pssticky') { // Ha a típus 'pssticky'
        macInput.style.display = 'none'; // Rejtsd el a MAC cím beállítást
    } else {
        macInput.style.display = 'block'; // Egyébként mutasd
    }
}

function showGeneralSettings() {
    const settings = ` // Általános beállítások megjelenítése
        <div class="setting"><strong>Hostname:</strong> 
            <input type="text" id="hostname-input" placeholder="Új hostname megadása" />
            <button onclick="changeHostname()">Hostname megváltoztatása</button>
        </div>
    `;
    interfaceSettings.innerHTML = settings; // Beállítások hozzáadása az interfészhez
}

function changeHostname() {
    const hostnameInput = document.getElementById('hostname-input'); // Hostname bemeneti mező
    const newHostname = hostnameInput.value; // Új hostname érték

    fetch("/send_command/", { // Kérés küldése a hostname megváltoztatására
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            command: "en\nconf t\nhostname teszt"
        }),
    }).then(response => {
        if (response.ok) { // Ha a válasz sikeres
            sendAlert("Hostname sikeresen megváltoztatva!", "success"); // Sikeres üzenet
        } else {
            sendAlert("Hostname megváltoztatása sikertelen.", "error"); // Sikertelen üzenet
        }
    });
}