# Laundry_Backend

Production-ready Express.js & TypeScript backend service for the LaundryFresh on-demand laundry and dry cleaning ecosystem.

## 🚀 Features
- **Authentication & Customers**: OTP-based authentication, user profile management, saved addresses
- **Orders & Workflow Engine**: Real-time lifecycle management (Booked → Picked Up → Weighed → Washing → Ironing → Out for Delivery → Delivered)
- **Dynamic 2D Pricing**: Dynamic rate matrix by cloth type and service type, plus bulk/per-KG slab tiers
- **Slots & Capacity**: Live real-time driver pickup/delivery capacity reservation engine
- **Payment Processing**: Razorpay order creation, signature verification, and automated webhook handling
- **Dispute Resolution**: Customer photo proof dispute ticketing with credit adjustments

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase Firestore / Firebase Admin SDK
- **Payments**: Razorpay Node SDK

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file with:
```env
PORT=5000
NODE_ENV=development
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### 3. Run Development Server
```bash
npm run dev
```
