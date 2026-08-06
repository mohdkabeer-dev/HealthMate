# 🩺 HealthMate AI - Smart Medical Report Analyzer

<div align="center">

### AI-Powered Healthcare Assistant for Medical Report Analysis, Health Tracking & Patient History Management

</div>

---

## 🌟 Overview

**HealthMate AI** is a full-stack healthcare web application that helps patients understand and manage their medical information using Artificial Intelligence.

The application allows users to upload medical reports (PDF/images), analyze them using AI, identify abnormal values, understand important findings, and receive personalized health recommendations.

Apart from AI-powered report analysis, HealthMate also helps users maintain their medical history, track health vitals, and securely access previous reports whenever required.

> ⚠️ HealthMate is designed as a healthcare assistance tool and does not replace professional medical advice. Users should always consult qualified healthcare professionals for diagnosis and treatment decisions.

---

## 🚀 Key Features

### 🤖 AI Medical Report Analysis

- Upload medical reports in image/PDF format.
- AI extracts and analyzes important medical information.
- Identifies:
  - Abnormal values
  - High/Low readings
  - Important health indicators
  - Risk factors
- Provides:
  - Summary of findings
  - Health recommendations
  - Suggested precautions
  - Doctor consultation advice when required


---

### 📄 Medical Report Management

- Upload and store medical reports digitally.
- Maintain complete medical history.
- View previously uploaded reports.
- Download reports anytime for future reference.
- Organize health records in one place.

---

### ❤️ Health Vitals Tracking

Users can manually record and monitor personal health parameters:

- Blood Pressure
- Heart Rate
- Other important health measurements

The system helps users track their health trends and identify unusual values.

---

### 📊 Health Insights Dashboard

- Visual representation of health information.
- View analyzed reports.
- Monitor health records over time.
- Access AI-generated insights.

---

### 🔐 Authentication & User Management

- Secure user registration and login.
- Protected user-specific medical data.
- JWT-based authentication system.

---

## 🏗️ Application Workflow

```
Patient Uploads Medical Report
              |
              ↓
AI Reads & Extracts Medical Data
              |
              ↓
Identifies Abnormal Values & Findings
              |
              ↓
Generates Health Summary & Recommendations
              |
              ↓
Stores Report History for Future Access
```

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React.js
- TypeScript
- Tailwind CSS
- Recharts

## Backend

- Node.js
- Express.js
- REST APIs

## Database

- MongoDB
- Mongoose

## AI Integration

- Google Gemini API

## Authentication

- JWT Authentication
- Cookies

## File Management

- Multer
- Cloudinary

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

# 📂 Project Structure

```
HealthMate
│
├── frontend
│   ├── app
│   ├── components
│   ├── public
│   └── package.json
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── models
│   │   ├── router
│   │   └── gemini-api
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/mohdkabeer-dev/HealthMate.git

cd HealthMate
```

---

# Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_google_gemini_api_key
```

Start backend:

```bash
npm start
```

Backend will run on:

```
http://localhost:5000
```

---

# Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run development server:

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:3000
```

---

# 🔮 Future Improvements

- AI-powered health chatbot
- Doctor appointment integration
- Medicine reminder system
- Health report comparison over time
- Advanced health analytics dashboard
- Mobile application version

---

# 📸 Screenshots

(Add application screenshots here)

```
/screenshots
   ├── dashboard.png
   ├── report-analysis.png
   ├── vitals.png
```

---

# 👨‍💻 Developer

**Mohd Kabeer Mansoori**

UI Developer | Frontend Developer | MERN Stack Developer

GitHub:
https://github.com/mohdkabeer-dev

LinkedIn:
(Add LinkedIn URL)

---

# 📌 Disclaimer

HealthMate AI provides AI-assisted health information based on uploaded reports and user-entered data.

It is not a replacement for professional medical diagnosis, treatment, or emergency healthcare services.

Always consult a qualified healthcare professional for medical decisions.
