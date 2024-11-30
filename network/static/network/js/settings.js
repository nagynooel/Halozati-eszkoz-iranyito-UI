// Általános kapcsoló beállítások megjelenítése
function showGeneralSettings() {
    const settings = `
        <div class="setting"><strong>Hostname:</strong> 
            <input type="text" id="hostname-input" placeholder="Új hostname megadása" value="${generalSettings.dataset.hostname}" />
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
                <option value="dynamic" ${(clickedElement.dataset.swmode == "dynamic") ? "selected" : ""}>Dinamikus</option>
                <option value="access" ${(clickedElement.dataset.swmode == "access") ? "selected" : ""}>Access</option>
                <option value="trunk" ${(clickedElement.dataset.swmode == "trunk") ? "selected" : ""}>Trunk</option>
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
                    <option value="static" ${(clickedElement.dataset.pstype == "static") ? "selected" : ""}>Statikus</option>
                    <option value="sticky" ${(clickedElement.dataset.pstype == "sticky") ? "selected" : ""}>Sticky</option>
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
                    <option value="shutdown" ${(clickedElement.dataset.psviolation == "") ? "selected" : ""}>Lekapcsolás</option>
                    <option value="protect" ${(clickedElement.dataset.psviolation == "protect") ? "selected" : ""}>Védelem</option>
                    <option value="restrict" ${(clickedElement.dataset.psviolation == "restrict") ? "selected" : ""}>Korlátozás</option>
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
    send_command("configure terminal\nhostname " + newHostName)
    console.log("General: Hostname set to " + newHostName)
    document.getElementById("connected-hostname").innerHTML = newHostName
}

// Kapcsoló állapotának váltása
function setState(interface, state) {
    console.log(interface)
    let button = document.getElementsByClassName("state-button")[0]
    let interfaceElement = document.getElementById(`interface-${interface}`)

    if(state == "up"){
        send_command(`configure terminal\ninterface ${interface}\nno shutdown`)
        console.log(`${interface}: Changed state to up`)
        button.innerHTML = "Lekapcsolás"
        button.style.background = "red"
        button.onclick = () => setState(interface, "down")
        interfaceElement.dataset.state = "up"
    } else {
        send_command(`configure terminal\ninterface ${interface}\nshutdown`)
        console.log(`${interface}: Changed state to down`)
        button.innerHTML = "Felkapcsolás"
        button.style.background = "green"
        button.onclick = () => setState(interface, "up")
        interfaceElement.dataset.state = "down"
    }
}

function saveInterfaceChanges(interface) {
    let int = document.getElementById("interface-" + interface)

    const swMode = document.getElementById("switchport-mode").value
    const swAccessVlan = document.getElementById("vlan-input").value
    const swTrunkVlan = document.getElementById("allowed-vlan-input").value
    const ps = (document.getElementById("port-security-check").checked) ? "On" : "Off"
    const psType = document.getElementById("port-security-type").value
    const psStaticMac = document.getElementById("mac-address").value
    const psMaxUser = document.getElementById("maxusers").value
    const psViolation = document.getElementById("port-security-violation").value

    // Switchport beállítások
    if (swMode != int.dataset.swmode) {
        if (swMode == "dynamic") {
            int.dataset.swtrunkvlan = ""
            int.dataset.swaccessvlan = ""
            send_command(
                `
                configure terminal
                interface ${interface}
                no switchport trunk allowed vlan
                no switchport access vlan
                no switchport port-security
                no switchport port-security mac-address
                no switchport port-security violation
                `
            )
        }
        
        send_command(`configure terminal\ninterface ${interface}\nswitchport mode ${swMode} ${(swMode == "dynamic") ? "desirable" : ""}`)
        int.dataset.swmode = swMode
        console.log(`${interface}: Changed switchport mode to ${swMode}`)
    }

    if (swMode == "access") {
        int.dataset.swtrunkvlan = ""
        send_command(`configure terminal\ninterface ${interface}\nno switchport trunk allowed vlan`)
        
        if (swAccessVlan != int.dataset.swaccessvlan) {
            send_command(`configure terminal\ninterface ${interface}\nswitchport access vlan ${swAccessVlan}`)
            int.dataset.swaccessvlan = swAccessVlan
            console.log(`${interface}: Changed access vlan to ${swAccessVlan}`)
        }
    } else if (swMode == "trunk") {
        int.dataset.swaccessvlan = ""
        send_command(`configure terminal\ninterface ${interface}\nno switchport access vlan`)

        if (swTrunkVlan != int.dataset.swtrunkvlan) {
            send_command(`configure terminal\ninterface ${interface}\nswitchport trunk allowed vlan ${swTrunkVlan}`)
            int.dataset.swtrunkvlan = swTrunkVlan
            console.log(`${interface}: Changed allowed vlans to ${swTrunkVlan}`)
        }
    }

    // Portsecurity beállítások
    if (ps != int.dataset.ps) {
        if (ps == "On") {
            send_command(`configure terminal\ninterface ${interface}\nswitchport port-security`)
            console.log(`${interface}: Changed port security to On`)
        } else {
            send_command(
                `
                configure terminal
                interface ${interface}
                no switchport port-security
                no switchport port-security mac-address
                no switchport port-security violation
                `
            )
            console.log(`${interface}: Changed port security to Off`)
        }
        
        int.dataset.ps = ps
    }
    
    if (ps == "On") {
        if (psType != int.dataset.pstype) {
            if (psType == "static") {
                send_command(
                    `
                    configure terminal
                    interface ${interface}
                    no switchport port-security mac-address
                    no switchport port-security mac-address sticky
                    switchport port-security mac-address ${psStaticMac}
                    `
                )
                int.dataset.psstaticmac = psStaticMac
                console.log(`${interface}: Changed portsecurity static mac-address to ${psStaticMac}`)
            } else {
                send_command(`configure terminal\ninterface ${interface}\nswitchport port-security mac-address sticky`)
                console.log(`${interface}: Changed portsecurity mac-address to sticky`)
            }
            
            int.dataset.pstype = psType
        }
        
        if (psMaxUser != int.dataset.psmaxuser) {
            if (psMaxUser == "") {
                send_command(`configure terminal\ninterface ${interface}\nno switchport port-security maximum`)
                console.log(`${interface}: Turned maximum mac address option OFF`)
            } else {
                send_command(`configure terminal\ninterface ${interface}\nswitchport port-security maximum ${psMaxUser}`)
                console.log(`${interface}: Changed maximum mac-address to ${psMaxUser}`)
            }
            int.dataset.psmaxuser = psMaxUser
        }
        
        if (psViolation != int.dataset.psviolation) {
            send_command(`configure terminal\ninterface ${interface}\nswitchport port-security violation ${psViolation}`)
            console.log(`${interface}: Changed port security violation to ${psViolation}`)
            int.dataset.psviolation = psViolation
        }
    }
}

function toggleVlanInput() {
    const modeSelect = document.getElementById('switchport-mode'); // A switchport mód kiválasztása
    const vlanSetting = document.getElementById('vlan-setting'); // VLAN beállítási elem
    const allowedVlanSetting = document.getElementById('allowed-vlan-setting'); // VLAN beállítási elem
    const checkbox = document.getElementById("port-security-check")
    
    if (modeSelect.value === 'access') { // Ha a mód 'swaccess'
        vlanSetting.style.display = 'block'; // Mutasd a VLAN beállítást
        allowedVlanSetting.style.display = 'none'; // Mutasd a VLAN beállítást
        checkbox.disabled = false
        checkbox.title = ""
    } else if(modeSelect.value === 'trunk') {
        vlanSetting.style.display = 'none'; // Egyébként rejtsd el
        allowedVlanSetting.style.display = 'block'; // Mutasd a VLAN beállítást
        checkbox.disabled = false
        checkbox.title = ""
    } else {
        vlanSetting.style.display = 'none';
        allowedVlanSetting.style.display = 'none';
        // Port security nem állítható be dinamikus porton
        checkbox.checked = false
        var clickEvent = new Event("click")
        checkbox.dispatchEvent(clickEvent)
        checkbox.disabled = true
        checkbox.title = "Dinamikus módban a portbiztonság nem engedélyezett"
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

    if (modeSelect.value === 'sticky') { // Ha a típus 'sticky'
        macInput.style.display = 'none';
        violationSettings.style.display = 'block';
    } else {
        macInput.style.display = 'block';
        violationSettings.style.display = 'block';
    }
}