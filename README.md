
[![Donate](https://img.shields.io/badge/☕_DONATE-Ko--fi-8A2BE2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/littlegods)
[![Donate](https://img.shields.io/badge/💜_DONATE-PayPal-6E00FF?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=7W9ABVTNCV3EA)

<h1 align="center">
  LITTLEGODS STATS WEB - [RELEASE] 
</h1>

<p align="center">
<img src="https://github.com/user-attachments/assets/4d2622db-13a4-4a53-8b2c-660c90a682c6"
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

<h3 align="center">

</h3>

**Littlegods Stats Web** is a tool created to visualize player statistics, player information, and Zombies mode data from **Call of Duty: Black Ops 2 (Plutonium)**.

### Installation and Usage

Quick guide to set up and start the project locally.

### Prerequisites

[Node.js](https://nodejs.org/)

[Plutonium](https://plutonium.pw/docs/install/)

### Project Download

You can download the latest version from the repository:

### Download ZIP from the repository

Once downloaded, extract the content into a folder where you keep your projects.

### Web Project Configuration

Open a terminal (PowerShell) in the directory where you extracted the project and run the following commands:

### Install project dependencies
```bash
npm install
```
### GSC Script Installation (Game)

These scripts are required for the game to collect and send statistics.

Press **Windows + R** to open the "Run" dialog.

Paste the following path and press **Enter**:

```bash
%localappdata%\Plutonium\storage\t6\raw\scripts\zm
```
Locate the **stats_gsc** folder that came in the ZIP you downloaded.

Extract all the contents of the **stats_gsc** folder directly into the **zm** folder.

### Launch the Application

You will need to have two terminals open in the project folder:

**Terminal 1:** Start the Web Server

### Start the web project

```bash
npm run dev
```


🟢 The web application will be available at [http://localhost:3000/](http://localhost:3000/).

**Terminal 2:** Start the Tracker (Watchdog)

### Start the real-time statistics tracker

```bash
node utils/watchdog.js
```

🟢 This script monitors the statistics files and updates the web in real time.

