function validateForm() {
    // IP cím, port, felhasználónév és jelszó értékek lekérése
    const ipInput = document.getElementById('ip-input').value;
    const portInput = document.getElementById('port-input').value;
    const usernameInput = document.getElementById('username-input').value;
    const passwordInput = document.getElementById('password-input').value;

    // IP cím formátumának ellenőrzésére szolgáló reguláris kifejezés
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IP cím formátumának ellenőrzése
    if (!ipRegex.test(ipInput)) {
        sendAlert("Érvénytelen IP cím formátum.", "error");
        return false;
    }

    // Port számának ellenőrzése (0-65535 között)
    if (portInput < 0 || portInput > 65535) {
        sendAlert("A portnak 0 és 65535 között kell lennie.", "error");
        return false;
    }

    // Felhasználónév és jelszó kötelező mezők ellenőrzése
    if (usernameInput.trim() === "" || passwordInput.trim() === "") {
        sendAlert("Felhasználónév és jelszó kötelező.", "error");
        return false;
    }

    // Minden ellenőrzés sikeres, visszatérés true értékkel
    return true;
}