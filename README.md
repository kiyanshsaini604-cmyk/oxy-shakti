# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
is a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.





# Oxy Shakti

### AI-Powered Decentralized Emergency Intelligence Network

🌐 **Live Demo:** https://oxy-shakti-core.lovable.app/

📂 **GitHub Repository:** https://github.com/kiyanshsaini604-cmyk/oxy-shakti

---

## 🚀 Overview

Oxy Shakti is an AI-powered decentralized emergency intelligence network designed to improve disaster monitoring and emergency response.

The platform combines IoT sensors, AI-powered threat analysis, and blockchain-backed event logging to provide real-time environmental monitoring and intelligent emergency recommendations.

Using ESP32-based monitoring nodes, Oxy Shakti continuously tracks critical environmental parameters such as gas concentration and temperature anomalies, helping identify potential hazards before they escalate.

---

## 🌍 Problem Statement

During disasters and emergency situations:

- Centralized communication systems may fail.
- Emergency alerts are often delayed.
- Environmental hazards can go undetected.
- Incident records may be incomplete or vulnerable to tampering.

A reliable, decentralized, and intelligent monitoring system is needed to improve situational awareness and emergency response.

---

## 💡 Solution

Oxy Shakti creates a decentralized emergency intelligence network using:

- ESP32 IoT monitoring nodes
- Real-time telemetry collection
- AI-powered threat analysis
- Blockchain-secured emergency logging
- Interactive monitoring dashboard

The system detects hazards, analyzes risk levels, generates emergency recommendations, and stores critical incident data securely.

---

## ⚡ Key Features

- Real-time environmental monitoring
- AI-powered threat analysis
- Emergency alert generation
- Decentralized node architecture
- Blockchain-secured incident logs
- Live telemetry analytics
- Mobile-first command dashboard
- Scalable emergency infrastructure

---

## 🔧 Hardware Components

- ESP32 Development Board
- MQ-2 Gas Sensor
- DHT11 Temperature & Humidity Sensor
- Piezo Buzzer
- Status LED
- Breadboard
- Jumper Wires
- USB Power Interface

---

## 🧠 Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Blockchain
- Sui Blockchain
- Move Smart Contracts

### AI
- OpenAI API

### Hardware
- ESP32
- MQ-2
- DHT11

---

## 📊 System Architecture

```text
ESP32 Nodes
      ↓
Telemetry Server
      ↓
AI Threat Analysis Engine
      ↓
Sui Blockchain Logging
      ↓
Emergency Dashboard
```

---

## 📱 Dashboard Preview

### Threat Analysis Dashboard

![Threat Analysis](assets/screenshots/threat-analysis.jpg)

### Blockchain Logging System

![Blockchain Logs](assets/screenshots/blockchain-logs.jpg)

### Telemetry Analytics

![Telemetry Analytics](assets/screenshots/telemetry.jpg)

---

## 🔧 Hardware Prototype

![ESP32 Node](assets/hardware/esp32-node.jpg)

---

## 🤖 AI Threat Intelligence

Oxy Shakti analyzes:

- Temperature anomalies
- Gas concentration levels
- Node health metrics
- Environmental telemetry
- Threat severity indicators

The AI engine generates actionable emergency recommendations and threat assessments in real time.

---

## ⛓️ Sui Blockchain Integration

Critical emergency events are recorded on-chain using Sui blockchain technology.

Benefits include:

- Immutable incident history
- Transparent alert tracking
- Secure decentralized records
- Reliable event verification

---

## 🚨 Future Scope

- Smart city deployment
- Autonomous rescue drones
- Disaster response coordination
- Decentralized mesh communication
- Multi-region monitoring networks
- AI-powered evacuation planning
- Emergency response automation

---

## 🛡️ Vision

> "When communication fails, intelligence survives."

Oxy Shakti aims to create a future where intelligent decentralized systems enhance public safety and emergency preparedness.

---

## 👨‍💻 Project Links

🌐 Live Demo:
https://oxy-shakti-core.lovable.app/

📂 GitHub Repository:
https://github.com/kiyanshsaini604-cmyk/oxy-shakti

---

Built for **Sui Overflow 2026** 🚀
