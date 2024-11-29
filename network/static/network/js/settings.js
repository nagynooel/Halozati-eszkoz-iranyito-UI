// Általános kapcsoló beállítások megjelenítése
function showGeneralSettings() {
    const settings = `
        <div class="setting"><strong>Hostname:</strong> 
            <input type="text" id="hostname-input" placeholder="Új hostname megadása" />
        </div>
        <button style="position: fixed; right: 1rem; bottom: 1rem;" onclick="changeHostname()">Hostname megváltoztatása</button>
    `;
    interfaceSettings.innerHTML = settings; // Beállítások hozzáadása az interfészhez
}

// Kapcsoló interfész beállításainak megjelenítése
function showSettings(interface) {
    let clickedElement = document.getElementById("interface-" + interface)
    const settings = `
        <div class="setting"><strong>Interface:</strong> ${interface}</div>
        <div class="setting">
            <strong>Állapot:</strong>
            <button class="state-button" style='background-color: ${(clickedElement.dataset.state == "up") ? "red" : "green"};' onclick='setState("${interface}", "${(clickedElement.dataset.state == "up") ? "down" : "up"}")')>${(clickedElement.dataset.state == "up") ? "Lekapcsolás" : "Felkapcsolás"}</button>
        </div>
        <div class="setting"><strong>Switchport Mód:</strong>
            <select id="switchport-mode" onchange="toggleVlanInput()">
                <option value="swdynamic" ${(clickedElement.dataset.swmode == "dynamic") ? "selected" : ""}>Dinamikus</option>
                <option value="swaccess" ${(clickedElement.dataset.swmode == "access") ? "selected" : ""}>Access</option>
                <option value="swtrunk" ${(clickedElement.dataset.swmode == "trunk") ? "selected" : ""}>Trunk</option>
            </select>
        </div>
        <div class="setting" id="vlan-setting">
            <strong>VLAN azonosító:</strong> <input type="number" id="vlan-input" placeholder="VLAN szám" value="${clickedElement.dataset.swaccessvlan}"/>
        </div>
        <div class="setting" id="allowed-vlan-setting">
            <strong>Engedélyezett VLAN-ok:</strong> <input type="text" id="allowed-vlan-input" placeholder="VLAN-ok száma (1,2,3,4)" value="${clickedElement.dataset.swtrunkvlan}"/>
        </div>
        <div class="setting"><strong>Portbiztonság</strong> <input type="checkbox" name="port-security-check" id="port-security-check" onclick="togglePortSecurity()" ${(clickedElement.dataset.ps == "On") ? "checked" : ""}/>
            <div class="setting" id="mac-security-type"><strong>Típus:</strong>
                <select id="port-security-type" onchange="toggleMACInput()">
                    <option value="psnone" ${(clickedElement.dataset.pstype == "") ? "selected" : ""}>Nincs</option>
                    <option value="psstatic" ${(clickedElement.dataset.pstype == "static") ? "selected" : ""}>Statikus</option>
                    <option value="pssticky" ${(clickedElement.dataset.pstype == "sticky") ? "selected" : ""}>Sticky</option>
                </select>
                <div class="setting" id="set-mac-address">
                    <strong>MAC-cím:</strong> <input type="text" id="mac-address" placeholder="00:00:00:00:00:00" value="${clickedElement.dataset.psstaticmac}"/>
                </div>
            </div>
            <div class="setting" id="max-users-settings">
                <strong>Maximum MAC címek:</strong> <input type="number" id="maxusers" placeholder="0" value="${clickedElement.dataset.psmaxuser}"/>
            </div>
            <div class="setting" id="violation"><strong>Szabálysértés esetén:</strong>
                <select id="port-security-violation">
                    <option value="vshutdown" ${(clickedElement.dataset.psviolation == "") ? "selected" : ""}>Lekapcsolás</option>
                    <option value="vprotect" ${(clickedElement.dataset.psviolation == "protect") ? "selected" : ""}>Védelem</option>
                    <option value="vrestrict" ${(clickedElement.dataset.psviolation == "restrict") ? "selected" : ""}>Korlátozás</option>
                </select>
            </div>
        </div>
        <button style="position: fixed; right: 1rem; bottom: 1rem;" onclick="saveInterfaceChanges('${interface}')">Módosítások Alkalmazása</button>
    `;
    interfaceSettings.innerHTML = settings;

    // Legördülő menü helyes megjelenítése
    var changeEvent = new Event("change")
    var clickEvent = new Event("click")
    document.getElementById("switchport-mode").dispatchEvent(changeEvent)
    document.getElementById("port-security-type").dispatchEvent(changeEvent)
    document.getElementById("port-security-violation").dispatchEvent(changeEvent)
    document.getElementById("port-security-check").dispatchEvent(clickEvent)
}

function changeHostname() {
    const newHostName = document.getElementById("hostname-input").value
    send_command("en\nconf t\nhost " + newHostName)
    console.log("General: Hostname set to " + newHostName)
    document.getElementById("connected-hostname").innerHTML = newHostName
}

// Kapcsoló állapotának váltása
function setState(interface, state) {
    console.log(interface)
    let button = document.getElementsByClassName("state-button")[0]
    let interfaceElement = document.getElementById(`interface-${interface}`)

    if(state == "up"){
        send_command(`enable\nconfigure terminal\ninterface ${interface}\nno shutdown`)
        console.log(`${interface}: Changed state to up`)
        button.innerHTML = "Lekapcsolás"
        button.style.background = "red"
        button.onclick = () => setState(interface, "down")
        interfaceElement.dataset.state = "up"
    } else {
        send_command(`enable\nconfigure terminal\ninterface ${interface}\nshutdown`)
        console.log(`${interface}: Changed state to down`)
        button.innerHTML = "Felkapcsolás"
        button.style.background = "green"
        button.onclick = () => setState(interface, "up")
        interfaceElement.dataset.state = "down"
    }
}

function saveInterfaceChanges(interface) {
    const ipInput = document.getElementById("ip-address-input")
    const netmaskInput = document.getElementById("netmask-input")
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
        vlanSetting.style.display = 'none';
        allowedVlanSetting.style.display = 'none';
    }
}

function togglePortSecurity() {
    const checkbox = document.getElementById("port-security-check")
    const macSecurity = document.getElementById("mac-security-type")
    const maxUsers = document.getElementById("max-users-settings")
    const violation = document.getElementById("violation")

    if (checkbox.checked) {
        macSecurity.style.display = "block"
        maxUsers.style.display = "block"
        violation.style.display = "block"
    } else {
        macSecurity.style.display = "none"
        maxUsers.style.display = "none"
        violation.style.display = "none"
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