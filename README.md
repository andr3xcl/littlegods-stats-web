
# littlegods-stats-web
[![Donate](https://img.shields.io/badge/☕_DONATE-Ko--fi-8A2BE2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/littlegods)
[![Donate](https://img.shields.io/badge/💜_DONATE-PayPal-6E00FF?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=7W9ABVTNCV3EA)

<h1 align="center">
  LITTLEGODS STATS WEB - [RELEASE] 
</h1>

<p align="center">
<img src="https://github.com/user-attachments/assets/1f5d4b20-bda4-4340-987b-99197c7ffc63"
alt="Littlegods Stats Web"
width="85%"
style="border-radius:18px;box-shadow:0 0 25px #C000FF;">
</p>

<p align="center">
<img src="https://img.shields.io/badge/VERSION-1.0.0-6E00FF?style=for-the-badge&logo=starship&logoColor=white" alt="Version 1.0.0">
<img src="https://img.shields.io/badge/COD_BO2-ZOMBIES-2E0854?style=for-the-badge&logo=activision&logoColor=white" alt="Call of Duty: Black Ops 2 Zombies">
<img src="https://img.shields.io/badge/SCRIPTS-TYPESCRIPT_JSON_GSC-9932CC?style=for-the-badge&logo=typescript&logoColor=white" alt="Scripts: TypeScript, JSON, GSC">
<img src="https://img.shields.io/badge/PLATFORM-Plutonium-9400D3?style=for-the-badge&logo=atom&logoColor=white" alt="Platform: Plutonium">
<a href="https://www.google.com/search?q=https://github.com/andr3xcl"><img src="https://img.shields.io/badge/CREATOR-andr3xcl-1A001A?style=for-the-badge&logo=github&logoColor=%23C300FF" alt="Creador: andr3xcl"></a>
</p>

# Littlegods Stats Web

**Littlegods Stats Web** is a project created for the **T6 Zombies** community, designed for both personal use and server integration.  
With this tool, you can **save your stats**, **view them through a web interface**, compare previous matches, and enjoy multiple **visual interactions**.

Although this project starts at version **v1.0.0**, it will be continuously updated to **fix issues**, **improve features**, and **add new content**.

---

## 🛠️ Installation Guide

### 1. Requirements
- Install **[Node.js](https://nodejs.org/en/download)**

### 2. Get the project
- Clone the repository or download the `.zip` version  
- Extract the files and open the main folder  
  Everything is automated to make the process easy — simply follow these steps:

---

## 🚀 Automatic Setup Steps

### **Step 1:**  
Go to the **`utils/automatic`** folder.  
Inside you will find executables that allow the project to run correctly.

### **Step 2:**  
Run **`npm_dependencies.bat`**  
> This installs all required web dependencies.

### **Step 3:**  
Run **`scripts_zm.bat`**  
> This will copy all `.gsc` files from the project's `zm` folder into your game path:  
`%localappdata%\Plutonium\storage\t6\raw\scripts\zm`

### **Step 4:**  
Run **`run_stats_web.bat`**  
> This starts the full project by running:
- `npm run dev` (web server)  
- `node utils/watchdog.js` (statistics tracking)

#### Optional individual start:
- **Step 4.1:** `run_web.bat` → Starts only the web  
- **Step 4.2:** `run_watchdog.bat` → Starts only the stats tracker (recommended for performance)

### **Step 5:**  
You're done! Launch **Plutonium → Zombies** and have fun.


<img width="1903" height="964" alt="Captura de pantalla 2025-11-25 164437" src="https://github.com/user-attachments/assets/3095317f-fff4-42e9-b848-c9f6bf513eab" />
<img width="1903" height="960" alt="Captura de pantalla 2025-11-25 164503" src="https://github.com/user-attachments/assets/3c5c31b6-6d2f-497b-a1d2-b7f62aa4703d" />
<img width="1906" height="958" alt="Captura de pantalla 2025-11-25 164528" src="https://github.com/user-attachments/assets/cf56eb60-b586-45a0-b0f3-7ec519b70105" />
<img width="1907" height="963" alt="image" src="https://github.com/user-attachments/assets/f5e399e5-dde0-4079-b4e6-c3fdc2300947" />







## 📜 License
This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).  
See the [LICENSE](LICENSE) file for more details.

