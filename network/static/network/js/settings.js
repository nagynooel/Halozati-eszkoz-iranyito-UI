// Kapcsoló beállításainak megjelenítése
function showSettings(interface) {
    let clickedElement = document.getElementById("interface-" + interface)
    const settings = `
        <div class="setting"><strong>Interface:</strong> ${interface}</div>
        <div class="setting">
            <strong>Állapot:</strong>
            <button class="state-button" style='background-color: ${(clickedElement.dataset.state == "up") ? "red" : "green"};' onclick='setState("${interface}", "${(clickedElement.dataset.state == "up") ? "down" : "up"}")')>${(clickedElement.dataset.state == "up") ? "Lekapcsolás" : "Felkapcsolás"}</button>
        </div>
        <div class="setting"><strong>Ipv4 cím:</strong>
            <input type="text" id="ip-address-input" placeholder="0.0.0.0" value="${clickedElement.dataset.ip}"/>
            <strong>Alhálózati Maszk:</strong>
            <input type="text" id="subnet-mask-input" placeholder="0.0.0.0" value="${clickedElement.dataset.netmask}" />
        </div>
        <div class="setting"><strong>Switchport Mód:</strong>
            <select id="switchport-mode" onchange="toggleVlanInput()">
                <option value="swdynamic" ${(clickedElement.dataset.swmode == "swdynamic") ? "selected" : ""}>Dinamikus</option>
                <option value="swaccess" ${(clickedElement.dataset.swmode == "swaccess") ? "selected" : ""}>Access</option>
                <option value="swtrunk" ${(clickedElement.dataset.swmode == "swtrunk") ? "selected" : ""}>Trunk</option>
            </select>
        </div>
        <div class="setting" id="vlan-setting">
            <strong>VLAN azonosító:</strong> <input type="number" id="vlan-input" placeholder="VLAN szám" value="${clickedElement.dataset.swaccessvlan}"/>
        </div>
        <div class="setting" id="allowed-vlan-setting">
            <strong>Engedélyezett VLAN-ok:</strong> <input type="text" id="allowed-vlan-input" placeholder="VLAN-ok száma (1,2,3,4)" value="${clickedElement.dataset.swtrunkvlan}"/>
        </div>
        <div class="setting"><strong>Portbiztonság</strong>
            <div class="setting"><strong>Típus:</strong>
                <select id="port-security-type" onchange="toggleMACInput()">
                    <option value="psnone" ${(clickedElement.dataset.pstype == "psnone") ? "selected" : ""}>Nincs</option>
                    <option value="psstatic" ${(clickedElement.dataset.pstype == "psstatic") ? "selected" : ""}>Statikus</option>
                    <option value="pssticky" ${(clickedElement.dataset.pstype == "pssticky") ? "selected" : ""}>Sticky</option>
                </select>
                <div class="setting" id="set-mac-address">
                    <strong>MAC-cím:</strong> <input type="text" id="mac-address" placeholder="00:00:00:00:00:00" value="${clickedElement.dataset.psstaticmac}"/>
                </div>
            </div>
            <div class="setting" id="max-users-settings">
                <strong>Maximum felhasználók:</strong> <input type="number" id="maxusers" placeholder="0" value="${clickedElement.dataset.psmaxuser}"/>
            </div>
            <div class="setting" id="violation"><strong>Szabálysértés esetén:</strong>
                <select id="port-security-violation">
                    <option value="vshutdown" ${(clickedElement.dataset.psviolation == "vshutdown") ? "selected" : ""}>Lekapcsolás</option>
                    <option value="vprotect" ${(clickedElement.dataset.psviolation == "vprotect") ? "selected" : ""}>Védelem</option>
                    <option value="vrestrict" ${(clickedElement.dataset.psviolation == "vrestrict") ? "selected" : ""}>Korlátozás</option>
                </select>
            </div>
        </div>
        <button style="position: absolute; right: 1rem; bottom: 1rem;" onclick="saveChanges('${interface}')">Módosítások Alkalmazása</button>
    `;
    interfaceSettings.innerHTML = settings;

    // Legördülő menü helyes megjelenítése
    var event = new Event("change")
    document.getElementById("switchport-mode").dispatchEvent(event)
    document.getElementById("port-security-type").dispatchEvent(event)
    document.getElementById("port-security-violation").dispatchEvent(event)
}

// Kapcsoló állapotának váltása
function setState(interface, state) {
    console.log(interface)
    let button = document.getElementsByClassName("state-button")[0]
    let interfaceElement = document.getElementById(`interface-${interface}`)

    if(state == "up"){
        send_command(`en\nconf t\nint ${interface}\nno shu`)
        console.log(`${interface}: Changed state to up`)
        button.innerHTML = "Lekapcsolás"
        button.style.background = "red"
        button.onclick = () => setState(interface, "down")
        interfaceElement.dataset.state = "up"
    } else {
        send_command(`en\nconf t\nint ${interface}\nshu`)
        console.log(`${interface}: Changed state to down`)
        button.innerHTML = "Felkapcsolás"
        button.style.background = "green"
        button.onclick = () => setState(interface, "up")
        interfaceElement.dataset.state = "down"
    }
}

function saveChanges(interface) {
    const ipInput = document.getElementById("ip-address-input")
    const netmaskInput = document.getElementById("netmask-input")
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

function toggleVlanInput() {
    const modeSelect = document.getElementById('switchport-mode'); // A switchport mód kiválasztása
    const vlanSetting = document.getElementById('vlan-setting'); // VLAN beállítási elem
    const allowedVlanSetting = document.getElementById('allowed-vlan-setting'); // VLAN beállítási elem
    if (modeSelect.value === 'swaccess') { // Ha a mód 'swaccess'
        vlanSetting.style.display = 'block'; // Mutasd a VLAN beállítást
        allowedVlanSetting.style.display = 'none'; // Mutasd a VLAN beállítást
    } else if(modeSelect.value === 'swtrunk') {
        vlanSetting.style.display = 'none'; // Egyébként rejtsd el
        allowedVlanSetting.style.display = 'block'; // Mutasd a VLAN beállítást
    } else {
        vlanSetting.style.display = 'swnone';
        allowedVlanSetting.style.display = 'none';
    }
}

function toggleMACInput() {
    const modeSelect = document.getElementById('port-security-type'); // Port biztonsági típus kiválasztása
    const macInput = document.getElementById('set-mac-address'); // MAC cím beállítási elem
    const maxUserSettings = document.getElementById('max-users-settings'); // MAC cím beállítási elem
    const violationSettings = document.getElementById('violation'); // MAC cím beállítási elem
    if (modeSelect.value === 'psnone') {
        macInput.style.display = 'none';
        maxUserSettings.style.display = 'none';
        violationSettings.style.display = 'none';
    } else if (modeSelect.value === 'pssticky') { // Ha a típus 'sticky'
        macInput.style.display = 'none';
        maxUserSettings.style.display = 'block';
        violationSettings.style.display = 'block';
    } else {
        macInput.style.display = 'block';
        maxUserSettings.style.display = 'block';
        violationSettings.style.display = 'block';
    }
}