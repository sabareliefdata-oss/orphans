# One Nation - Orphans' Video Scripts Management & Review Portal

A secure, modern web application designed for managing, editing, reviewing, and approving orphan video scripts for **One Nation**.

---

## 🌟 Key Features

1. **Brand Identity & Aesthetics**:
   - **Header Bar Color**: `#0e4359` (Ocean Navy)
   - **Secondary Accent**: `#a78f31` (Gold)
   - **Logo**: One Nation logo integrated directly into the header.
   - **100% English UI**: Clean, modern cards dashboard with instant search, filter tabs, and compact table view.

2. **Smart Card Structure**:
   - **Serial Number**: Organized sequential numbering (`#1, #2, ... #93`).
   - **Orphan Code**: Standardized format (`YE-01086`, `YE-01280`, etc.).
   - **Child Name**: Displayed prominently as the card title.
   - **Script Text**: Full English translated video script body.
   - **Status Badge**:
     - 🟡 **Waiting for Review** (Yellow badge)
     - 🟢 **Reviewed & Approved** (Green badge)

3. **Role-Based Access Control (RBAC) & Security**:
   - **Translator / Admin Role**: Add/edit scripts, delete, resequence serials, export to Word docx.
   - **Reviewer Role**: Log in with independent credentials, edit scripts, and click **"Mark as Reviewed"** to immediately approve (Green) with reviewer timestamp.
   - **Password Security**: Hashed with `bcryptjs`.
   - **Session Security**: JWT (JSON Web Tokens) authentication with protected API endpoints and rate-limiting.

4. **Multi-Database Support (Local & Cloud Free Tier)**:
   - **Free Cloud Option**: **MongoDB Atlas (Free M0)** for cloud persistence across devices.
   - **Zero-Setup Local Option**: Automatic fallback to local encrypted JSON database (`data/database.json`).

5. **Export to Word (.docx)**:
   - Export all approved (or all) scripts into a professionally styled Microsoft Word document with 1 click.

---

## 🚀 How to Run Locally

### 1. Start the Server & App
```bash
npm start
```
Then open your browser at: **`http://localhost:5000`**

### 2. Default Login Accounts:
- **Reviewer Account**:
  - Username: `reviewer`
  - Password: `reviewer123`
- **Translator / Admin Account**:
  - Username: `admin`
  - Password: `admin123`

---

## ☁️ How to Deploy Free to Render + MongoDB Atlas

### Step 1: Create Free MongoDB Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Cluster**.
3. Under **Database Access**, create a database user (e.g. `onenation_user` and password).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** -> **Drivers** and copy your connection string:
   `mongodb+srv://onenation_user:<password>@cluster0.mongodb.net/one_nation?retryWrites=true&w=majority`

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "One Nation Orphans Video Scripts Portal"
# Push to your private GitHub repository
```

### Step 3: Deploy on Render (Free)
1. Go to [render.com](https://render.com) and create a free account.
2. Click **New +** -> **Web Service** and connect your GitHub repository.
3. Set the following settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: (Your connection string from Step 1)
   - `JWT_SECRET`: (Any secure secret string)
5. Click **Create Web Service**. Render will automatically build and deploy your portal with a free `https://` secure URL!
