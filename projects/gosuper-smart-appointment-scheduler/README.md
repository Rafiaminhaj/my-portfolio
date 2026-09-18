# 📅 GoSuper Smart Appointment Scheduler

> **GoSuper Edtech Junior Full-Stack Developer — Practical Technical Assessment (Task 1)**  
> **Candidate Name:** Rafia Minhaj (`rafiaminhaj423@gmail.com`)  
> **Institution:** Cambridge Institute of Technology, Ranchi (B.Tech CSE '27, GSSoC '26 Global Rank #29)  
> **GitHub Repository:** [https://github.com/Rafiaminhaj/gosuper-smart-appointment-scheduler](https://github.com/Rafiaminhaj/gosuper-smart-appointment-scheduler)  
> **Live Deployed Prototype:** [https://gosuper-smart-appointment-scheduler.vercel.app](https://gosuper-smart-appointment-scheduler.vercel.app)  

---

## 🎯 1. Problem Statement & Functional Requirements

Businesses and schools need a reliable, real-time appointment scheduling system to manage customer inquiries, available time slots, and bookings without double-booking or over-capacity issues.

### ✅ Key Features & Business Logic Implemented:
1. **Operating Hours & Slot Generation:** Generates 16 standard 30-minute time slots between **9:00 AM and 5:00 PM** (e.g. `09:00 - 09:30`, `09:30 - 10:00`, ... `16:30 - 17:00`).
2. **Capacity Limit Enforcement:** Each 30-minute slot accommodates a **maximum of 3 appointments**. If a slot reaches 3 bookings, the system marks the slot as `FULL` and prevents any further bookings.
3. **Customer Booking Workflow:** Allows customers/users to book appointments by providing `Name`, `Email`, `Phone`, `Date`, `Time Slot`, and `Service Notes`.
4. **Interactive Capacity Grid & Live Status:** Displays real-time progress bars for each slot (`0/3`, `1/3`, `2/3`, `3/3 FULL`) with remaining spot indicators.
5. **Full CRUD & Management:** Allows viewing, updating, and cancelling appointments with instant database persistence and UI sync.

---

## 🛠️ 2. Tech Stack & Architecture

- **Frontend UI:** Single Page Application built with HTML5, CSS3 Glassmorphic Dark Theme, FontAwesome, and JavaScript (ES6+ async/await REST API integrations).
- **Backend API:** Node.js + Express.js REST Framework.
- **Database:** SQLite3 local SQL database (`scheduler.db`) with parameterized queries to prevent SQL injection.
- **Deployment:** Live serverless deployment on Vercel (`https://gosuper-smart-appointment-scheduler.vercel.app`).

```
[ Frontend SPA UI ]  ───────►  [ Node.js + Express REST API ]  ───────►  [ SQLite Database ]
  (Port 8000)                       (server.js)                         (scheduler.db)
```

---

## 📡 3. REST API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check and uptime status. |
| `GET` | `/api/slots?date=YYYY-MM-DD` | Returns 16 time slots with current booking counts, capacity, and remaining spots. |
| `GET` | `/api/appointments?date=YYYY-MM-DD` | Lists all booked appointments filtered by date. |
| `POST` | `/api/appointments` | Creates a new appointment after validating max 3-booking capacity limit. |
| `PUT` | `/api/appointments/:id` | Updates customer details or notes for an existing appointment. |
| `DELETE` | `/api/appointments/:id` | Cancels/deletes an appointment and frees up slot capacity. |

---

## 🚀 4. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18+)
- npm

### Step-by-step Execution:

```bash
# 1. Clone the repository
git clone https://github.com/Rafiaminhaj/gosuper-smart-appointment-scheduler.git
cd gosuper-smart-appointment-scheduler

# 2. Install dependencies
npm install

# 3. Start the application
npm start
```

Open your browser and navigate to **`http://localhost:8000`**.

---

## 📄 License & Contact
Created by **Rafia Minhaj** for **GoSuper Edtech Practical Assessment**.  
Email: `rafiaminhaj423@gmail.com` | Phone: `+91 62066 75008`
