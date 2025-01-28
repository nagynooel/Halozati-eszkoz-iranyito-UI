# Cisco Kapcsoló Irányító UI

[![en](https://img.shields.io/badge/lang-en-green.svg)](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/README.md)

## Projekt leírása
A projekt egy Django-alapú webalkalmazás, amely célja egy egyszerű és intuitív felület biztosítása **Cisco kapcsolók konfigurálásához** SSH protokollon keresztül. A projekt egy C2960 típusú, C2960-K9 operációs rendszerrel rendelkező kapcsolón lett tesztelve.

**Elérhető beállítások:**

- Általános beállítások:
    - Hostnév
    - Enable jelszó
    - Management VLAN IP-cím
    - Running konfiguráció mentése
- Interfész beállítások:
    - Fel-/lekapcsolás
    - Switchport mód:
        - Dinamikus
        - Access - VLAN beállítás
        - Trunk - engedélyezett VLAN-ok beállítása
    - Portbiztonság:
        - MAC-cím szűrés:
            - Statikus
            - Sticky
        - Maximum MAC-címek
        - Szabálysértési eljárás:
            - Lekapcsolás
            - Védelem
            - Korlátozás

A backend logika a Django keretrendszer segítségével valósult meg, amely lehetővé teszi a hatékony adatkezelést és a biztonságos felhasználói élményt.  
Az alkalmazás frontend része **HTML, CSS és JavaScript** technológiák felhasználásával készült, hogy reszponzív és modern megjelenést biztosítson.

## Telepítés

A webalkalmazás futtatása előtt először telepíteni kell a szükséges csomagokat, amelyek a requirements.txt fájlban találhatók verziószámokkal együtt.

**Telepítés és futtatás lépésről lépésre:**
1. A GitHub repository letöltése/klónozása.
2. Terminál megnyitása és a projektmappába lépés. 
3. A requirements.txt tartalmában szereplő modulok telepítése (`pip install -r requirements.txt`).
4. A Django szerver elindítása (`python manage.py runserver`).
5. Az alkalmazás alapértelmezetten a localhost:8000 címen érhető el.

## Használati útmutató

**Követelmények:**

- SSH-képes Cisco kapcsoló (C2960-K9).
- Működő SSH-kapcsolat a számítógép és a konfigurálni kívánt kapcsoló között.

**Az útmutató nem tartalmazza a kapcsoló kezdeti konfigurálásának részleteit!**

A kezdőlapon látható űrlap kitöltésénél adjuk meg a kapcsoló adatait, amelyek az SSH-csatlakozáshoz szükségesek. A jelszó mezők üresen hagyhatók, ha a kapcsolón nem állítottunk be jelszót. A bejelentkezési űrlap az *1. ábrán* látható.

![Bejelentkezési űrlap](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/documentation/login-img.PNG)

*1. ábra: Bejelentkezési űrlap*

A sikeres bejelentkezés után az alkalmazás fő kezelőfelülete tárul elénk, ahol a beállításokat végezhetjük el. A felső sáv mutatja a kapcsolat alapvető információit, és itt van lehetőség a szétkapcsolásra is.

### Általános beállítások
A bal oldalon található az általános beállítások fül, aminek segítségével a fent említett alapvető konfigurációkat tudjuk elvégezni.

**Figyelem: A management VLAN IP-címének megváltoztatásával megszakadhat a kapcsolat. Ebben az esetben az új IP-cím használatával kell újra bejelentkezni!**

Az általános beállítások grafikus felülete a *2. ábrán* látható.

![Általános beállítások](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/documentation/general-settings-img.PNG)

*2. ábra: Általános beállítások*

Miután minden módosítást elvégeztünk a kapcsolón, kattintsunk a jobb alsó sarokban lévő **"Módosítások mentése"** feliratú gombra. Ha mentés nélkül átlépünk egy másik fülre, akkor a beállítások nem kerülnek alkalmazásra.

A kapcsoló futó konfigurációjának mentése az indító konfigurációba a **"Running Config mentése"** gombra kattintva lehetséges.

### Interfész beállítások

A csatlakozás után az oldal automatikusan lekéri a kapcsolón elérhető interfészeket, és kilistázza a bal oldali menüben. A konfigurálni kívánt interfész kiválasztása után a *3. ábrán* látható beállítási felület jelenik meg.

![Interfész beállítások](https://github.com/nagynooel/Halozati-eszkoz-iranyito-UI/blob/master/documentation/general-settings-img.PNG)

*3. ábra: Interfész beállítások*

Az állapot mellett található gomb megnyomásával a kiválasztott interfész állapota azonnal megváltozik.

A switchport mód beállításának megváltoztatása után további beállítások jelennek meg. Az **access** mód esetén a VLAN számát tudjuk megadni, míg **trunk** módban az engedélyezett VLAN-ok számát **","-vel** elválasztva. Dinamikus mód választása esetén nem jelenik meg egyéb beállítás.

A portbiztonság bekapcsolása után **MAC-cím szűrést** végezhetünk. **Statikus** és **sticky** (ragadós) beállítások közül választhatunk. Statikus beállítás esetén megjelenik a MAC-cím beírására szolgáló mező. Ezenfelül megadhatjuk a MAC-címek maximális számát és a szabálysértés esetén alkalmazandó protokollt.

Miután minden módosítást elvégeztünk a kapcsolón, kattintsunk a jobb alsó sarokban lévő **"Módosítások mentése"** feliratú gombra. Ha mentés nélkül átlépünk egy másik fülre, a beállítások nem kerülnek alkalmazásra.
