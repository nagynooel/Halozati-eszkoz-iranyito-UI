# Cisco Switch Management UI

[![hu](https://img.shields.io/badge/lang-hu-green.svg)](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/README.hu.md)

## Project Description
The project is a Django-based web application designed to provide a simple and intuitive interface for **configuring Cisco switches** via the SSH protocol. The project was tested on a C2960 switch with the C2960-K9 operating system.

**Available Settings:**

- General settings:
    - Hostname
    - Enable password
    - Management VLAN IP address
    - Saving the running configuration
- Interface settings:
    - Enable/disable interfaces
    - Switchport mode:
        - Dynamic
        - Access - VLAN configuration
        - Trunk - configure allowed VLANs
    - Port security:
        - MAC address filtering:
            - Static
            - Sticky
        - Maximum MAC addresses
        - Violation action:
            - Shutdown
            - Protect
            - Restrict

The backend logic is implemented using the Django framework, enabling efficient data handling and a secure user experience.  
The frontend is built using **HTML, CSS, and JavaScript**, ensuring a responsive and modern appearance.

## Installation

Before running the web application, you need to install the required packages listed in the requirements.txt file with the corresponding version numbers.

**Step-by-step installation and setup:**
1. Download/clone the GitHub repository.
2. Open a terminal and navigate to the project folder.
3. Install the modules listed in requirements.txt (`pip install -r requirements.txt`).
4. Start the Django server (`python manage.py runserver`).
5. The application will be accessible by default at localhost:8000.

## User Guide

**Requirements:**

- SSH-capable Cisco switch (C2960-K9).
- Active SSH connection between your computer and the switch to be configured.

**This guide does not cover the initial configuration of the switch!**

On the homepage, fill out the form with the switch details required for SSH connection. Password fields can be left empty if no password is set on the switch. The login form is shown in *Figure 1*.

![Login Form](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/documentation/login-img.PNG)

*Figure 1: Login Form*

Upon successful login, the main interface of the application will appear, allowing you to configure the settings. The top bar displays basic connection information and provides an option to disconnect.

### General Settings
On the left-hand side, you will find the general settings tab, which allows you to perform the basic configurations mentioned above.

**Note: Changing the management VLAN IP address may interrupt the connection. In such cases, log in again using the new IP address!**

The graphical interface for general settings is shown in *Figure 2*.

![General Settings](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/documentation/general-settings-img.PNG)

*Figure 2: General Settings*

After making all the desired changes to the switch, click the **"Save Changes"** button in the bottom-right corner. If you navigate to another tab without saving, the settings will not be applied.

Saving the running configuration to the startup configuration can be done by clicking the **"Save Running Config"** button.

### Interface Settings

After connecting, the application automatically retrieves the available interfaces on the switch and lists them in the left-hand menu. Once you select an interface to configure, the settings interface shown in *Figure 3* will appear.

![Interface Settings](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/documentation/general-settings-img.PNG)

*Figure 3: Interface Settings*

The status of the selected interface can be toggled instantly by pressing the button next to its status.

After changing the switchport mode, additional settings will appear. In **access** mode, you can specify the VLAN number, while in **trunk** mode, you can set the allowed VLANs separated by commas (`,`). No additional options appear for dynamic mode.

When enabling port security, you can configure **MAC address filtering**. You can choose between **static** and **sticky** settings. For static settings, a field for entering the MAC address will appear. Additionally, you can specify the maximum number of MAC addresses and the protocol to apply in case of violations.

After making all the desired changes to the switch, click the **"Save Changes"** button in the bottom-right corner. If you navigate to another tab without saving, the settings will not be applied.
