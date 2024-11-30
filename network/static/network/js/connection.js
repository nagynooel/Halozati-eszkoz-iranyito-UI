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
    connect(ip, port, username, password, enablePasswordInput.value)
    return false
}

// Kapcsolódás a kapcsolóhoz
async function connect(ip, port, username, password, enablePassword) {
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
    } catch (error) {
        console.error('Hiba:', error)
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

function close_connection() {
    fetch("/close/")
    console.log("Connection closed")
}