# Developer Documentation - PPT Access Control System

This document provides detailed information for developers who want to set up, modify, or deploy the PPT Access Control System.

## System Architecture

The application follows a client-server architecture:
- **Frontend**: React with Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Storage**: Supabase Storage
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

### Supabase Storage Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project:
   - Go to the Supabase dashboard
   - Click "New Project"
   - Enter a name for your project
   - Set a secure database password
   - Choose a region closest to your users
   - Click "Create new project"

3. Set up storage:
   - In your Supabase project dashboard, navigate to "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Name it `acadigo` (or your preferred name)
   - Set access to "Private" for security

4. Configure storage policies:
   - Click on your bucket name
   - Go to the "Policies" tab
   - Create the following policies:

   **For authenticated users to read files:**
   - Click "Add Policies" and select "Give users access to a folder only to authenticated users" template
   - Name: "Allow authenticated reads"
   - Policy definition: Use the default SQL but make sure it looks like:
     ```sql
     bucket_id = 'acadigo' AND auth.role() = 'authenticated'
     ```
   - Select operations: SELECT

   **For trainers and admins to upload files:**
   - Click "Create Policy" and select "Custom"
   - Name: "Allow admin and trainer uploads"
   - Policy definition:
     ```sql
     bucket_id = 'acadigo' AND auth.jwt() ->> 'role' IN ('admin', 'trainer')
     ```
   - Select operations: INSERT, UPDATE, DELETE

   **For students to upload their assignment submissions:**
   - Click "Create Policy" and select "Custom"
   - Name: "Allow student submissions"
   - Policy definition:
     ```sql
     bucket_id = 'acadigo' AND auth.jwt() ->> 'role' = 'student' AND name LIKE 'submissions/%'
     ```
   - Select operations: INSERT

5. Get your API keys:
   - Go to Project Settings > API
   - Copy the Project URL (will be your `SUPABASE_URL`)
   - Under Project API keys:
     - Copy the "anon public" key (will be your `VITE_SUPABASE_ANON_KEY` for frontend)
     - Copy the "service_role" key (will be your `SUPABASE_SERVICE_ROLE_KEY` for backend - keep this secure!)

6. Add to backend `.env` file:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_BUCKET_NAME=acadigo
   ```

7. Add to frontend `.env` file (if needed for client-side uploads):
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_BUCKET_NAME=acadigo
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
- Supabase permissions: Verify storage policies and API keys
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
