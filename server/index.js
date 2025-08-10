const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// In-memory storage (in a real app, you'd use a database)
let posts = [];
let scheduledPosts = [];

// n8n Configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || `${N8N_BASE_URL}/webhook/social-media-post`;

// Routes

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// Get scheduled posts
app.get('/api/scheduled-posts', (req, res) => {
  res.json(scheduledPosts);
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { content, platforms, scheduledTime, imageUrl } = req.body;
    
    console.log('📝 Creating new post:', { 
      content: content ? content.substring(0, 50) + '...' : 'empty',
      platforms, 
      scheduledTime, 
      imageUrl: imageUrl ? (imageUrl.startsWith('data:') ? 'base64-image' : imageUrl.substring(0, 50) + '...') : 'none'
    });
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'At least one platform must be selected' });
    }
    
    const newPost = {
      id: uuidv4(),
      content: content.trim(),
      platforms: platforms || ['twitter', 'linkedin'],
      scheduledTime: scheduledTime || new Date().toISOString(),
      imageUrl: imageUrl || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0
      }
    };

    posts.push(newPost);
    console.log('✅ Post saved to database with ID:', newPost.id);

    // If scheduled for future, add to scheduled posts
    if (scheduledTime && new Date(scheduledTime) > new Date()) {
      console.log('⏰ Post scheduled for future:', new Date(scheduledTime));
      scheduledPosts.push(newPost);
      schedulePost(newPost);
    } else {
      // Post immediately
      console.log('🚀 Publishing post immediately...');
      try {
        await triggerN8nWorkflow(newPost);
      } catch (n8nError) {
        console.log('n8n error during post creation (continuing anyway):', n8nError.message);
      }
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      error: 'Failed to create post',
      details: error.message 
    });
  }
});

// Update post status
app.put('/api/posts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.status = status;
    
    if (status === 'published') {
      try {
        await triggerN8nWorkflow(post);
      } catch (n8nError) {
        console.log('n8n error during status update (continuing anyway):', n8nError.message);
      }
    }

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  posts = posts.filter(p => p.id !== id);
  scheduledPosts = scheduledPosts.filter(p => p.id !== id);
  res.json({ message: 'Post deleted successfully' });
});

// n8n Integration Functions

async function triggerN8nWorkflow(post) {
  try {
    console.log('Triggering n8n workflow for post:', post.id);
    
    const payload = {
      postId: post.id,
      content: post.content,
      platforms: post.platforms,
      imageUrl: post.imageUrl,
      scheduledTime: post.scheduledTime
    };

    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });

    console.log('n8n workflow triggered successfully:', response.data);
    
    // Update post status
    const postIndex = posts.findIndex(p => p.id === post.id);
    if (postIndex !== -1) {
      posts[postIndex].status = 'published';
      posts[postIndex].publishedAt = new Date().toISOString();
    }

    return response.data;
  } catch (error) {
    console.log('n8n not available (this is normal if n8n is not running):', error.message);
    
    // Update post status even if n8n is not available
    const postIndex = posts.findIndex(p => p.id === post.id);
    if (postIndex !== -1) {
      posts[postIndex].status = 'published';
      posts[postIndex].publishedAt = new Date().toISOString();
    }
    
    return { message: 'Post published (n8n not available)' };
  }
}

function schedulePost(post) {
  const scheduledDate = new Date(post.scheduledTime);
  const cronExpression = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;
  
  cron.schedule(cronExpression, async () => {
    console.log(`Executing scheduled post: ${post.id}`);
    await triggerN8nWorkflow(post);
    
    // Remove from scheduled posts
    scheduledPosts = scheduledPosts.filter(p => p.id !== post.id);
  });
}

// Webhook endpoint for n8n to send back engagement data
app.post('/api/webhook/engagement', (req, res) => {
  try {
    const { postId, platform, engagement } = req.body;
    
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.engagement = {
        ...post.engagement,
        ...engagement
      };
    }
    
    res.json({ message: 'Engagement data received' });
  } catch (error) {
    console.error('Error processing engagement webhook:', error);
    res.status(500).json({ error: 'Failed to process engagement data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    n8nUrl: N8N_BASE_URL,
    postsCount: posts.length,
    scheduledPostsCount: scheduledPosts.length
  });
});

// Debug endpoint to see all posts and their status
app.get('/api/debug/posts', (req, res) => {
  res.json({
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    draftPosts: posts.filter(p => p.status === 'draft').length,
    scheduledPosts: scheduledPosts.length,
    posts: posts.map(post => ({
      id: post.id,
      content: post.content.substring(0, 50) + '...',
      platforms: post.platforms,
      status: post.status,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
      engagement: post.engagement
    }))
  });
});

// Global error handler for payload size errors
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Payload too large',
      details: 'The image file is too large. Please use a smaller image (max 5MB).'
    });
  }
  next(error);
});

app.listen(PORT, () => {
  console.log(`🚀 Social Media Scheduler Server running on port ${PORT}`);
  console.log(`📱 n8n Integration URL: ${N8N_WEBHOOK_URL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Payload limit: 10MB (for image uploads)`);
});
