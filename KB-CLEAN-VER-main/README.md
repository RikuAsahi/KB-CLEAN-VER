# 🤝 KapitBisig - NGO Crowdfunding Platform

A secure, full-stack crowdfunding platform designed for NGOs in Barangay 105, Tondo, Manila. This project features complete authentication, campaign management, donation processing, and admin dashboard capabilities.

## 📋 Project Overview

**Status:** ✅ **PRODUCTION READY** (All 7 phases complete)

KapitBisig is a web-based crowdfunding platform that empowers NGOs to create campaigns and donors to support causes they care about. The platform emphasizes transparency, security, and ease of use.

## 🏗️ Architecture

### Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express.js
- **Database:** MySQL
- **Testing:** Jest + Supertest
- **Security:** Helmet.js, bcryptjs, express-rate-limit

## 🚀 Quick Start

### Backend Setup
```bash
cd BACKEND/server
npm install
npm start
# Server runs on http://localhost:4000
```

### Frontend Setup
Open `FRONTEND/HTML/Landingpage.html` in your browser or use a local server.

## 📚 Key Features

✅ User Authentication (Sign up, Sign in, Sign out)
✅ Campaign Management (Create, Read, Update, Delete)
✅ Donation System (Multiple payment methods)
✅ NGO Profile Management
✅ Admin Dashboard with Activity Logging
✅ Role-Based Access Control
✅ Rate Limiting & Security Headers
✅ Automated Testing Suite
✅ Production Deployment Ready

## 🔐 Security

- Helmet.js for HTTP security headers
- bcryptjs password hashing
- Session security with httpOnly & sameSite cookies
- Parameterized SQL queries
- Input validation & sanitization
- Rate limiting (Global, Auth, Donations)
- RBAC with permission matrix

## 📊 Project Statistics

- **Total Phases:** 7/7 ✅ Complete
- **API Endpoints:** 28
- **Database Tables:** 5+
- **Backend Files:** 28+
- **Frontend Files:** 28+
- **Test Coverage:** 50%+

## 📚 Documentation

- `PHASE_7_COMPLETION_SUMMARY.js` - Complete overview
- `DEPLOYMENT_GUIDE.js` - Production deployment
- `SECURITY_AUDIT_CHECKLIST.js` - Security verification
- `SYSTEM_ARCHITECTURE.js` - System design
- `INTEGRATION_GUIDE.js` - API integration

## 🧪 Testing

```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode for development
```

## 🚢 Deployment

```bash
npm install -g pm2
pm2 start BACKEND/server/src/server.js --name "kapitbisig-api"
```

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.js`

## 📞 Support

Refer to relevant documentation files for troubleshooting and configuration.

---

**Status:** Production Ready ✅
**Version:** 1.0.0
**Last Updated:** 2026-05-09
