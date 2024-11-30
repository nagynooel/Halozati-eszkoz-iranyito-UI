// sendAlert függvény: figyelmeztető üzenet küldése
function sendAlert(message, type, autoClose=true) {
    const alertContainer = document.getElementById("alert-container");
    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type} show`;
    alertBox.innerHTML = `
        <span>${message}</span>
        <button class="close-alert" onclick="closeAlert(this)">X</button>
    `;
    alertContainer.appendChild(alertBox);

    // 5 másodperc múlva eltűnik a doboz
    if (autoClose == true) {
        setTimeout(() => {
            alertBox.classList.remove("show");
            setTimeout(() => {
                alertContainer.removeChild(alertBox);
            }, 500);
        }, 5000);
    }
}

// closeAlert függvény: figyelmeztető doboz bezárása
function closeAlert(button) {
    const alertBox = button.parentElement;
    alertBox.classList.remove("show");
    setTimeout(() => {
        alertBox.parentElement.removeChild(alertBox);
    }, 500);
}