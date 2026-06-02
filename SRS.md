

#  Software Requirements Specification (SRS)

## Project: Bug Reproduction Tracker System (BRTS)

---

# 1. 🧾 Introduction

## 1.1 Purpose

The Bug Reproduction Tracker System (BRTS) is a web-based application designed to help developers log, manage, and track software bugs with detailed reproduction steps, environment metadata, and resolution workflows.

## 1.2 Scope

The system enables:

* Structured bug reporting
* Reproducibility tracking
* Status lifecycle management
* Filtering and querying of bugs
* Optional attachment of logs/screenshots

This system targets **developers, testers, and small teams**.

---

# 2. 🎯 Overall Description

## 2.1 Product Perspective

* Standalone web application (initially)
* REST API-driven backend (Flask)
* Future extensibility:

  * CI/CD integration
  * GitHub linking
  * AI-assisted bug classification

## 2.2 User Classes

* **Admin**

  * Full access
* **Developer**

  * Create, update, resolve bugs
* **Viewer**

  * Read-only access

---

# 3. ⚙️ Functional Requirements

---

## 3.1 User Management

### FR-1: User Registration

* Users can create an account
* Required fields:

  * username
  * email
  * password

### FR-2: Authentication

* Login/logout system
* Token/session-based authentication

---

## 3.2 Bug Management (Core CRUD)

### FR-3: Create Bug Report

User can create a bug with:

* Title
* Description
* Steps to reproduce (ordered list)
* Expected result
* Actual result
* Environment:

  * OS
  * Browser / runtime
  * Version
* Severity (Low, Medium, High, Critical)

---

### FR-4: View Bugs

* List all bugs
* View detailed bug page

Filters:

* Status
* Severity
* Date
* Assigned user

---

### FR-5: Update Bug

Editable fields:

* Status
* Steps
* Description
* Assigned developer

---

### FR-6: Delete Bug

* Soft delete (recommended)
* Only creator/admin can delete

---

## 3.3 Bug Lifecycle Management

### FR-7: Status Workflow

Each bug follows:

```
Open → In Progress → Fixed → Closed
          ↓
     Cannot Reproduce
```

Rules:

* Only assigned developer can mark “Fixed”
* Admin can override

---

## 3.4 Reproducibility Tracking

### FR-8: Reproducibility Score

* Users can mark:

  * Reproduced ✅
  * Not Reproduced ❌

System calculates:

```
Score = (# Reproduced) / (Total Attempts)
```

---

## 3.5 Comments & Logs

### FR-9: Add Comments

* Users can add comments to bugs
* Timestamp + user info stored

---

### FR-10: Attach Logs / Files

* Upload:

  * screenshots
  * log files

---

## 3.6 Search & Filtering

### FR-11: Advanced Search

* Search by:

  * keywords
  * tags
  * environment

---

# 4. 📊 Non-Functional Requirements

---

## 4.1 Performance

* API response time < 300ms (basic setup)
* Should handle 1000+ bug records efficiently

---

## 4.2 Scalability

* Modular architecture (Flask Blueprints)
* DB normalization

---

## 4.3 Security

* Password hashing
* JWT/session auth
* Input validation (prevent SQL injection)

---

## 4.4 Usability

* Clean UI
* Minimal steps to report bug

---

## 4.5 Reliability

* No data loss on crash
* Proper error handling

---

# 5. 🧱 System Design Overview

---

## 5.1 Architecture

```
Frontend (React / HTML)
        ↓
Flask REST API
        ↓
Database (PostgreSQL / SQLite)
```

---

## 5.2 Core Entities

### 🧩 Bug

* id
* title
* description
* status
* severity
* created_at
* updated_at

---

### 👤 User

* id
* username
* email
* role

---

### 🔁 Reproduction Attempt

* id
* bug_id
* user_id
* result (success/fail)

---

### 💬 Comment

* id
* bug_id
* user_id
* content

---

### 📎 Attachment

* id
* bug_id
* file_path

---

# 6. 🔄 Constraints

* Must use RESTful API design
* Must implement proper relationships (FK constraints)
* Must support pagination

---

# 7. 🚀 Future Enhancements

* Duplicate bug detection (ML or similarity)
* GitHub issue sync
* Email notifications
* Dashboard analytics

---


