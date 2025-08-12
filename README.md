# 🚀 Social Automation Hub

A powerful full-stack social media scheduling and automation platform built with React, Express.js, and n8n integration.

## ✨ Features

### 📱 **Multi-Platform Support**
- **Twitter** - Schedule tweets with character limits
- **LinkedIn** - Professional content scheduling
- **Facebook** - Social media posts
- **Instagram** - Visual content management

### 🎨 **Rich Content Creation**
- **Text Posts** - Write engaging content with character counting
- **Image Upload** - Direct file upload (JPEG, PNG, GIF, WebP)
- **Image URLs** - Support for external image links
- **Preview System** - See how your posts will look before publishing

### ⏰ **Smart Scheduling**
- **Instant Publishing** - Post immediately across platforms
- **Future Scheduling** - Schedule posts for optimal timing
- **Date/Time Picker** - Intuitive scheduling interface
- **Cron-based Automation** - Reliable scheduled execution

### 🔧 **n8n Integration**
- **Workflow Automation** - Connect to n8n for advanced automation
- **Webhook Support** - Real-time post triggering
- **Fault Tolerant** - Works with or without n8n running
- **Custom Workflows** - Extend functionality with n8n nodes

### 📊 **Post Management**
- **Dashboard Overview** - View all posts and their status
- **Status Tracking** - Draft, scheduled, published states
- **Engagement Metrics** - Track likes, shares, comments
- **Post History** - Complete audit trail

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **React DatePicker** - Date/time selection
- **React Icons** - Beautiful iconography
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - RESTful API server
- **Node-cron** - Task scheduling
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing

### Automation
- **n8n** - Workflow automation platform
- **Webhooks** - Real-time communication
- **Base64 Encoding** - Image handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-automation-hub.git
   cd social-automation-hub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in root directory
   PORT=5000
   N8N_BASE_URL=http://localhost:5678
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/social-media-post
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 📖 Usage

### Creating Posts
1. Navigate to "Create Post" from the dashboard
2. Select target platforms (Twitter, LinkedIn, Facebook, Instagram)
3. Write your content (with character limit validation)
4. Add images via file upload or URL
5. Choose publishing time (now or schedule for later)
6. Click "Publish Now" or "Schedule Post"

### Managing Posts
- **Dashboard** - View all posts and their current status
- **Edit Posts** - Modify content before publishing
- **Delete Posts** - Remove unwanted posts
- **Status Updates** - Change post status (draft/published)

### n8n Integration (Optional)
1. Install and run n8n locally
2. Create a webhook node in n8n
3. Configure the webhook URL in your .env file
4. Set up automation workflows for each platform

## 🔧 API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id/status` - Update post status
- `DELETE /api/posts/:id` - Delete post

### Scheduled Posts
- `GET /api/scheduled-posts` - Get scheduled posts

### System
- `GET /api/health` - Health check
- `GET /api/debug/posts` - Debug post information

### Webhooks
- `POST /api/webhook/engagement` - Receive engagement data

## 🎯 Features in Detail

### Image Upload System
- **File Validation** - Supports JPEG, PNG, GIF, WebP
- **Size Limits** - Maximum 5MB per image
- **Base64 Encoding** - Temporary storage for development
- **Preview System** - Real-time image preview
- **Dual Input** - File upload or URL input

### Scheduling Engine
- **Cron Expressions** - Precise timing control
- **Timezone Support** - Local time scheduling
- **Conflict Resolution** - Prevents duplicate schedules
- **Automatic Execution** - Background task processing

### Error Handling
- **Graceful Degradation** - Works without n8n
- **Payload Size Limits** - 10MB support for images
- **Validation** - Input sanitization and validation
- **User Feedback** - Clear error messages

## 🚀 Deployment

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
```

### Production
```bash
npm run build        # Build frontend for production
npm run server       # Start production server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **n8n** - For powerful workflow automation
- **React Community** - For excellent documentation and tools
- **Express.js** - For the robust backend framework
---

**Built with ❤️ for the social media automation community**
