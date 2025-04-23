# 📄 requirements.md  
### 🧠 Project Prompt for Cursor AI – Online Course Selling System with Face Authentication  

---

## 📌 Goal

The aim is to generate a full-fledged **Online Course Selling System** using **Cursor AI**, with three key user roles: **Admin**, **Instructor**, and **User**. It must support **face authentication**, **secure Razorpay integration**, and be built using modern technologies.

---

## ⚙️ Tech Stack (Must Use)

| Component           | Stack                                                  |
|---------------------|--------------------------------------------------------|
| Frontend            | Next.js 15 (App Router), Tailwind CSS   , use only javascript not typescript               |
| Main Backend        | Node.js + Express                                       |
| Face Auth Backend   | Python Flask (CPU-only, no TensorFlow, no WebGL)       |
| Database            | MongoDB with Mongoose                                  |
| Payment Gateway     | Razorpay                                                |
| Authentication      | JWT + Face Authentication via Flask API                |

---

## ❌ What Not to Use

- ❌ TensorFlow  
- ❌ WebGL  
- ❌ GPU dependencies  
- ✅ Only CPU-based face recognition in Python (e.g., using `face_recognition` library)

---

## 🧑‍💼 User Roles and Panels

### 1. 👩‍🎓 User (Student)
- Browse and search courses
- Purchase with Razorpay
- Watch video lectures
- View progress and certificates
- Face authentication for login

### 2. 👨‍🏫 Instructor
- Create and manage courses (title, description, video uploads)
- Monitor student enrollments
- Face authentication to login
- View revenue dashboard

### 3. 🧑‍💼 Admin
- Full system control panel
- Approve/reject instructors
- Manage courses and users
- Monitor transactions and analytics

---

## 🔐 Face Authentication Features

- Built with **Flask** backend
- CPU-only image processing
- Face registration: user uploads/captures image
- Face login: compares live image with stored data
- Secure REST API endpoints consumed by Next.js frontend

---

## 📦 Deliverables from Cursor AI

- Complete frontend in Next.js 15 (App Router)
- Beautiful and responsive UI using Tailwind CSS
- Express backend with proper route protection and validation
- Python Flask server for face auth
- MongoDB schema and connection
- Payment flow via Razorpay
- JWT-based authentication and session handling
- Admin, Instructor, and User dashboards

