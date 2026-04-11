# Face Recognition attendance system

A modern, automated attendance tracking solution built with Next.js, utilizing facial recognition technology to streamline student attendance processes for educational institutions.

## 🌟 Overview

The **Automated Face Recognition Attendance System** is designed to eliminate the manual effort and potential inaccuracies of traditional roll-call methods. By leveraging browser-based facial recognition, the system identifies students in real-time and logs their attendance directly into a secure database. It provides distinct portals for students and faculty, ensuring a seamless experience for all users.

## 🚀 Features

- **Facial Recognition**: Real-time identification using `face-api.js`.
- **Role-Based Access**: Specialized dashboards for Students and Faculty (Teachers/Admins).
- **Student Portal**: View personalized attendance history and profile.
- **Faculty Dashboard**: Manage courses, students, and manually override attendance if necessary.
- **Secure Authentication**: Protected routes and encrypted passwords using `NextAuth.js` and `bcrypt`.
- **Responsive Design**: Polished UI built with modern CSS and React.

## 🛠️ Technical Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Frontend**: React, Vanilla CSS
- **Database**: SQLite (via Prisma ORM)
- **Facial Recognition**: [face-api.js](https://github.com/justadudewhohacks/face-api.js/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Language**: JavaScript

---

## 💻 Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher

### 1. Clone the Repository

```bash
git clone https://github.com/tanuj-datta/face-recognition-attendance-system.git
cd face-recognition-attendance-system
```

### 2. Install Dependencies

Install all necessary libraries and packages:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your configurations. You can use the following template:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

Initialize the SQLite database and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

---

## 📂 Project Structure

- `/app`: Next.js application routes and pages.
- `/components`: Reusable UI components.
- `/prisma`: Database schema and migrations.
- `/public`: Static assets (models for face-api, images).
- `/lib`: Utility functions and database client.

## 🛡️ License

This project is licensed under the MIT License.
