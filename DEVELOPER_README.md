# Developer Documentation - PPT Access Control System

This document provides detailed information for developers who want to set up, modify, or deploy the PPT Access Control System.

## System Architecture

The application follows a client-server architecture:
- **Frontend**: React with Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Storage**: Firebase Storage
- **Authentication**: JWT-based
- **Email Service**: Nodemailer

## Environment Setup

### MongoDB Configuration

1. Create a MongoDB Atlas account (or use local MongoDB)
2. Create a new cluster
3. Get your connection string
4. Add to backend `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ppt-access-system
   ```

### Firebase Storage Setup

1. Create a Firebase project
2. Enable Storage in your project
3. Get your service account key:
   - Go to Project Settings > Service Accounts
   - Generate a new private key (JSON file)
4. Place the JSON file in the backend directory (e.g., `firebase-service-account.json`)
5. Add to backend `.env` file:
   ```
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```

### Email Configuration

For Nodemailer with Gmail:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

For SendGrid:
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-verified-sender@domain.com
```

### JWT Configuration
```
JWT_SECRET=your-secure-random-string
JWT_EXPIRY=7d
```

## Rate Limiting Configuration

The system uses Express Rate Limit middleware with different limits based on user roles:
```
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_STUDENT=60   # 60 requests per minute for students
RATE_LIMIT_MAX_TRAINER=120  # 120 requests per minute for trainers
RATE_LIMIT_MAX_ADMIN=180    # 180 requests per minute for admins
```

## Database Schema

Detailed explanation of MongoDB models and their relationships - see the `models` directory in the backend code.

## API Documentation

Comprehensive API documentation can be found in the backend code comments or use a tool like Swagger UI for interactive documentation.

## Deployment Guidelines

### Frontend Deployment (Vercel)

1. Push your code to a GitHub repository
2. Connect to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set environment variables

### Backend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Configure environment variables
3. Add a MongoDB add-on or connect to your MongoDB Atlas

## Troubleshooting

Common issues and their solutions:
- Connection issues with MongoDB: Check network settings and IP whitelist
- Firebase permissions: Verify service account privileges
- Email sending failures: Test SMTP settings and check credentials

## Performance Considerations

- Use indexes for MongoDB collections
- Implement caching for frequently accessed data
- Consider using a CDN for static assets

## Security Best Practices

- Keep JWT secret secure and rotate regularly
- Sanitize all user inputs
- Implement CORS properly
- Use HTTPS in production
- Regular security audits
