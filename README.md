# Food Waste Reduction & Redistribution Platform

> A smart, real-time food waste reduction network connecting **Donors**, **NGOs**, and **Volunteers** to efficiently distribute surplus food to communities in need.

---

## 🌟 Key Features

- **🍽️ Donor Portal**: List surplus food items with details like quantity, expiry, pickup location, and special instructions.
- **🤝 NGO Portal**: Browse, filter, and claim available food donations in real time to distribute to beneficiaries.
- **🚚 Volunteer Portal**: Accept pickup and delivery tasks, update delivery statuses, and facilitate last-mile food distribution.
- **📊 Admin & Analytics Dashboard**: Track total food saved, active donations, community impact metrics, and user management.
- **🔐 Secure Authentication & OTP**: Email verification and OTP validation for donors, volunteers, and organizations.
- **✨ Modern UI/UX**: Sleek dark/light aesthetic powered by React, Tailwind CSS, Framer Motion animations, and Lucide icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

### Backend & Database
- **Backend**: Python Flask (`app.py`) with CORS & SMTP email notifications
- **Database**: Local JSON-based persistent store (`database.json`)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/amanraj7it/food-watage.git
cd food-watage
```

### 2. Backend Setup
Make sure you have Python 3.8+ installed:
```bash
pip install -r requirements.txt
python app.py
```
*The Flask server runs on `http://127.0.0.1:4321`.*

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start at `http://localhost:5173`.*

---

## 📁 Project Structure

```
├── app.py                     # Flask API backend & email services
├── database.json              # Local persistent JSON data store
├── requirements.txt           # Python dependencies
├── .gitignore                 # Root gitignore rules
├── README.md                  # Project documentation
└── frontend/                  # React + Vite frontend application
    ├── public/                # Static assets
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Route pages (Landing, Donor, Ngo, Volunteer, Dashboard, Login)
    │   ├── App.jsx            # Main app router & layout
    │   ├── index.css          # Tailwind & custom CSS styles
    │   └── main.jsx           # Vite application entrypoint
    ├── package.json           # Frontend dependencies & scripts
    └── vite.config.js         # Vite configuration & backend proxy
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 📄 License

This project is licensed under the MIT License.