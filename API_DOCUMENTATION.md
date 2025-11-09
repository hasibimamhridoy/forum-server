# Forum API Documentation

## Base URL

\`\`\`
http://localhost:5000/api/v1
\`\`\`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: <token>
\`\`\`

## Response Format

All responses follow this standardized format:
\`\`\`json
{
"success": true,
"data": { ... },
"message": "Optional message"
}
\`\`\`

Error responses:
\`\`\`json
{
"success": false,
"message": "Error message",
"error": "Error details"
}
\`\`\`

---

## 1. Authentication Endpoints

### POST `/users/register`

Register a new user account.

**Request Body:**
\`\`\`json
{
"username": "string (3-30 chars, required)",
"email": "string (valid email, required)",
"password": "string (min 6 chars, required)"
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
"success": true,
"data": {
"user": {
"id": "string",
"username": "string",
"email": "string",
"role": "user"
},
"token": "jwt_token"
}
}
\`\`\`

**Errors:**

- `400` - User already exists
- `400` - Validation errors

---

### POST `/auth/login`

Login with existing credentials.

**Request Body:**
\`\`\`json
{
"email": "string (required)",
"password": "string (required)"
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"user": {
"id": "string",
"username": "string",
"email": "string",
"role": "string"
},
"token": "jwt_token"
}
}
\`\`\`

**Errors:**

- `401` - Invalid credentials
- `401` - User account inactive

---

### GET `/auth/me`

Get current user profile.

**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"username": "string",
"email": "string",
"avatar": "string | null",
"bio": "string",
"role": "user | moderator | admin",
"isActive": true,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

---

### PUT `/auth/profile`

Update user profile.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
"username": "string (optional, 3-30 chars)",
"bio": "string (optional, max 500 chars)",
"avatar": "string (optional, URL)"
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"username": "string",
"email": "string",
"avatar": "string | null",
"bio": "string",
"role": "string",
"isActive": true,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

---

## 2. Thread Endpoints

### POST `/threads`

Create a new thread.

**Authentication:** Required  
**Rate Limit:** Special rate limiting applied

**Request Body:**
\`\`\`json
{
"title": "string (5-200 chars, required)",
"content": "string (min 10 chars, required)",
"category": "string (optional)",
"tags": ["string"] (optional, array of strings)
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"title": "string",
"content": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"category": "string",
"tags": ["string"],
"views": 0,
"isPinned": false,
"isLocked": false,
"isFlagged": false,
"flagReason": "string | null",
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**AI Moderation:**

- Content is automatically analyzed for spam
- If confidence > 0.8, thread is rejected
- If confidence > 0.5, thread is flagged

**Errors:**

- `400` - Content flagged as spam
- `400` - Validation errors
- `429` - Rate limit exceeded

---

### GET `/threads`

Get list of threads with pagination and filtering.

**Authentication:** Not required  
**Caching:** Redis cached for 5 minutes

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - Search in title, content, and tags
- `category` (string, optional) - Filter by category
- `sort` (string, default: "-createdAt") - Sort field

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"threads": [
{
"id": "string",
"title": "string",
"content": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"category": "string",
"tags": ["string"],
"views": 0,
"isPinned": false,
"isLocked": false,
"isFlagged": false,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 100,
"pages": 5
}
},
"cached": true
}
\`\`\`

---

### GET `/threads/:id`

Get a single thread by ID.

**Authentication:** Not required  
**Caching:** Redis cached for 5 minutes

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"title": "string",
"content": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"category": "string",
"tags": ["string"],
"views": 1,
"isPinned": false,
"isLocked": false,
"isFlagged": false,
"flagReason": "string | null",
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**Side Effects:**

- Increments view count

**Errors:**

- `404` - Thread not found

---

### PUT `/threads/:id`

Update an existing thread.

**Authentication:** Required (must be author or admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Request Body:**
\`\`\`json
{
"title": "string (5-200 chars, optional)",
"content": "string (min 10 chars, optional)",
"category": "string (optional)",
"tags": ["string"] (optional)
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"title": "string",
"content": "string",
"author": "string",
"category": "string",
"tags": ["string"],
"views": 0,
"isPinned": false,
"isLocked": false,
"isFlagged": false,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**Side Effects:**

- Invalidates Redis cache for this thread and thread lists
- Emits socket event `thread:updated`

**Errors:**

- `403` - Not authorized to update
- `404` - Thread not found

---

### DELETE `/threads/:id`

Delete a thread and all its posts.

**Authentication:** Required (must be author or admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {}
}
\`\`\`

**Side Effects:**

- Deletes all posts in the thread
- Invalidates Redis cache
- Emits socket event `thread:deleted`

**Errors:**

- `403` - Not authorized to delete
- `404` - Thread not found

---

## 3. Post Endpoints

### POST `/posts`

Create a new post in a thread.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
"content": "string (1-5000 chars, required)",
"threadId": "string (required, MongoDB ObjectId)",
"parentPostId": "string (optional, MongoDB ObjectId for replies)"
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
"success": true,
"message": "Post created successfully",
"data": {
"id": "string",
"content": "string",
"thread": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"parentPost": "string | null",
"isEdited": false,
"isFlagged": false,
"flagReason": "string | null",
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**Side Effects:**

- AI content moderation analysis
- Creates notifications for mentions
- Emits socket event `post:created`

**Errors:**

- `400` - Validation errors
- `404` - Thread not found
- `423` - Thread is locked

---

### GET `/posts/thread/:threadId`

Get all posts in a thread with pagination.

**Authentication:** Not required

**URL Parameters:**

- `threadId` (string, required) - Thread MongoDB ObjectId

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"posts": [
{
"id": "string",
"content": "string",
"thread": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"parentPost": {
"id": "string",
"content": "string",
"author": "string"
} | null,
"isEdited": false,
"isFlagged": false,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
],
"pagination": {
"page": 1,
"limit": 50,
"total": 100,
"pages": 2
}
}
}
\`\`\`

**Errors:**

- `404` - Thread not found

---

### PUT `/posts/:id`

Update a post.

**Authentication:** Required (must be author)

**URL Parameters:**

- `id` (string, required) - Post MongoDB ObjectId

**Request Body:**
\`\`\`json
{
"content": "string (1-5000 chars, required)"
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"message": "Post updated successfully",
"data": {
"id": "string",
"content": "string",
"thread": "string",
"author": "string",
"parentPost": "string | null",
"isEdited": true,
"isFlagged": false,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**Side Effects:**

- Sets `isEdited` to true
- Emits socket event `post:updated`

**Errors:**

- `403` - Not authorized to update
- `404` - Post not found

---

### DELETE `/posts/:id`

Delete a post.

**Authentication:** Required (must be author or admin/moderator)

**URL Parameters:**

- `id` (string, required) - Post MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"message": "Post deleted successfully",
"data": {
"id": "string"
}
}
\`\`\`

**Side Effects:**

- Emits socket event `post:deleted`

**Errors:**

- `403` - Not authorized to delete
- `404` - Post not found

---

## 4. Notification Endpoints

### GET `/notifications`

Get user notifications with pagination.

**Authentication:** Required

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `unreadOnly` (boolean, default: false) - Filter only unread

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"notifications": [
{
"id": "string",
"recipient": "string",
"sender": {
"id": "string",
"username": "string",
"avatar": "string | null"
} | null,
"type": "mention | reply | thread_update | system",
"content": "string",
"relatedThread": "string | null",
"relatedPost": "string | null",
"isRead": false,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
],
"unreadCount": 5,
"pagination": {
"page": 1,
"limit": 20,
"total": 50,
"pages": 3
}
}
}
\`\`\`

---

### PUT `/notifications/:id/read`

Mark a notification as read.

**Authentication:** Required (must be recipient)

**URL Parameters:**

- `id` (string, required) - Notification MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"recipient": "string",
"sender": "string | null",
"type": "string",
"content": "string",
"relatedThread": "string | null",
"relatedPost": "string | null",
"isRead": true,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**Errors:**

- `403` - Not authorized
- `404` - Notification not found

---

### PUT `/notifications/read-all`

Mark all user notifications as read.

**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"message": "All notifications marked as read"
}
}
\`\`\`

---

### DELETE `/notifications/:id`

Delete a notification.

**Authentication:** Required (must be recipient)

**URL Parameters:**

- `id` (string, required) - Notification MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {}
}
\`\`\`

**Errors:**

- `403` - Not authorized
- `404` - Notification not found

---

## 5. User Endpoints

### GET `/users/search`

Search for users by username or email.

**Authentication:** Not required

**Query Parameters:**

- `q` (string, required) - Search query
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"users": [
{
"id": "string",
"username": "string",
"email": "string",
"avatar": "string | null",
"bio": "string",
"role": "string",
"isActive": true,
"createdAt": "ISO date"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 10,
"pages": 1
}
}
}
\`\`\`

---

### GET `/users/:id`

Get user profile by ID.

**Authentication:** Not required

**URL Parameters:**

- `id` (string, required) - User MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"username": "string",
"email": "string",
"avatar": "string | null",
"bio": "string",
"role": "user | moderator | admin",
"isActive": true,
"createdAt": "ISO date",
"updatedAt": "ISO date"
}
}
\`\`\`

**Errors:**

- `404` - User not found

---

### GET `/users/:id/threads`

Get all threads created by a user.

**Authentication:** Not required

**URL Parameters:**

- `id` (string, required) - User MongoDB ObjectId

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"threads": [
{
"id": "string",
"title": "string",
"content": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"category": "string",
"tags": ["string"],
"views": 0,
"isPinned": false,
"isLocked": false,
"createdAt": "ISO date"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 50,
"pages": 3
}
}
}
\`\`\`

**Errors:**

- `404` - User not found

---

### GET `/users/:id/posts`

Get all posts created by a user.

**Authentication:** Not required

**URL Parameters:**

- `id` (string, required) - User MongoDB ObjectId

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"posts": [
{
"id": "string",
"content": "string",
"author": {
"id": "string",
"username": "string",
"avatar": "string | null"
},
"thread": {
"id": "string",
"title": "string"
},
"isEdited": false,
"isFlagged": false,
"createdAt": "ISO date"
}
],
"pagination": {
"page": 1,
"limit": 50,
"total": 200,
"pages": 4
}
}
}
\`\`\`

**Errors:**

- `404` - User not found

---

## 6. Admin Endpoints

**Note:** All admin endpoints require authentication and `moderator` or `admin` role.

### GET `/admin/stats`

Get dashboard statistics.

**Authentication:** Required (moderator/admin)

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"users": {
"total": 1000,
"active": 950,
"inactive": 50
},
"threads": {
"total": 500,
"flagged": 10
},
"posts": {
"total": 5000,
"flagged": 25
}
}
}
\`\`\`

---

### GET `/admin/threads/:id/summary`

Generate AI summary of a thread.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"summary": "string",
"keyPoints": ["string"],
"sentiment": "positive | neutral | negative"
}
}
\`\`\`

**Note:** Uses first 100 posts for summary generation

**Errors:**

- `404` - Thread not found

---

### PUT `/admin/threads/:id/flag`

Flag a thread for moderation.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Request Body:**
\`\`\`json
{
"reason": "string (optional)"
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"title": "string",
"isFlagged": true,
"flagReason": "string"
}
}
\`\`\`

---

### PUT `/admin/threads/:id/unflag`

Remove flag from a thread.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`

---

### PUT `/admin/threads/:id/lock`

Lock a thread (prevent new posts).

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`

---

### PUT `/admin/threads/:id/unlock`

Unlock a thread.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`

---

### PUT `/admin/threads/:id/pin`

Pin a thread to the top.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`

---

### PUT `/admin/threads/:id/unpin`

Unpin a thread.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Thread MongoDB ObjectId

**Response:** `200 OK`

---

### PUT `/admin/posts/:id/flag`

Flag a post for moderation.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Post MongoDB ObjectId

**Request Body:**
\`\`\`json
{
"reason": "string (optional)"
}
\`\`\`

**Response:** `200 OK`

---

### PUT `/admin/posts/:id/unflag`

Remove flag from a post.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - Post MongoDB ObjectId

**Response:** `200 OK`

---

### PUT `/admin/users/:id/deactivate`

Deactivate a user account.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - User MongoDB ObjectId

**Response:** `200 OK`

**Errors:**

- `403` - Cannot deactivate admin users

---

### PUT `/admin/users/:id/activate`

Activate a user account.

**Authentication:** Required (moderator/admin)

**URL Parameters:**

- `id` (string, required) - User MongoDB ObjectId

**Response:** `200 OK`

---

## 7. Webhook Endpoints

**Note:** All webhook endpoints require authentication.

### POST `/webhooks`

Create a new webhook.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
"url": "string (required, webhook URL)",
"events": ["string"] (required, array of event types),
"secret": "string (optional, for HMAC signing)"
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
"success": true,
"data": {
"id": "string",
"url": "string",
"events": ["thread:created", "post:created"],
"secret": "string | null",
"isActive": true,
"createdBy": "string",
"createdAt": "ISO date"
}
}
\`\`\`

---

### GET `/webhooks`

Get all user webhooks.

**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
"success": true,
"data": [
{
"id": "string",
"url": "string",
"events": ["string"],
"secret": "string | null",
"isActive": true,
"createdBy": "string",
"createdAt": "ISO date"
}
]
}
\`\`\`

---

### GET `/webhooks/:id`

Get a specific webhook.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**

- `id` (string, required) - Webhook MongoDB ObjectId

**Response:** `200 OK`

**Errors:**

- `403` - Not authorized
- `404` - Webhook not found

---

### PUT `/webhooks/:id`

Update a webhook.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**

- `id` (string, required) - Webhook MongoDB ObjectId

**Request Body:**
\`\`\`json
{
"url": "string (optional)",
"events": ["string"] (optional),
"isActive": "boolean (optional)",
"secret": "string (optional)"
}
\`\`\`

**Response:** `200 OK`

---

### DELETE `/webhooks/:id`

Delete a webhook.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**

- `id` (string, required) - Webhook MongoDB ObjectId

**Response:** `200 OK`

---

## 8. Socket.IO Events

### Connection

\`\`\`javascript
const socket = io('http://localhost:5000', {
auth: {
token: 'jwt_token'
}
})
\`\`\`

### Client Events (emit)

#### `thread:join`

Join a thread room to receive updates.
\`\`\`javascript
socket.emit('thread:join', { threadId: 'thread_id' })
\`\`\`

#### `thread:leave`

Leave a thread room.
\`\`\`javascript
socket.emit('thread:leave', { threadId: 'thread_id' })
\`\`\`

#### `thread:request-users`

Request active users in a thread.
\`\`\`javascript
socket.emit('thread:request-users', { threadId: 'thread_id' })
\`\`\`

### Server Events (listen)

#### `thread:created`

New thread created.
\`\`\`javascript
socket.on('thread:created', (thread) => {
console.log('New thread:', thread)
})
\`\`\`

#### `thread:updated`

Thread was updated.
\`\`\`javascript
socket.on('thread:updated', (thread) => {
console.log('Updated thread:', thread)
})
\`\`\`

#### `thread:deleted`

Thread was deleted.
\`\`\`javascript
socket.on('thread:deleted', ({ id }) => {
console.log('Deleted thread:', id)
})
\`\`\`

#### `post:created`

New post in thread.
\`\`\`javascript
socket.on('post:created', (post) => {
console.log('New post:', post)
})
\`\`\`

#### `post:updated`

Post was updated.
\`\`\`javascript
socket.on('post:updated', (post) => {
console.log('Updated post:', post)
})
\`\`\`

#### `post:deleted`

Post was deleted.
\`\`\`javascript
socket.on('post:deleted', ({ id }) => {
console.log('Deleted post:', id)
})
\`\`\`

#### `thread:users`

Active users in thread updated.
\`\`\`javascript
socket.on('thread:users', ({ threadId, users }) => {
console.log('Active users:', users)
})
\`\`\`

#### `notification:new`

New notification received.
\`\`\`javascript
socket.on('notification:new', (notification) => {
console.log('New notification:', notification)
})
\`\`\`

---

## Data Models

### User

\`\`\`typescript
{
id: string
username: string (3-30 chars, unique)
email: string (unique)
password: string (hashed, min 6 chars)
avatar: string | null
bio: string (max 500 chars)
role: 'user' | 'moderator' | 'admin'
isActive: boolean
createdAt: Date
updatedAt: Date
}
\`\`\`

### Thread

\`\`\`typescript
{
id: string
title: string (5-200 chars)
content: string (min 10 chars)
author: User
category: string
tags: string[]
views: number
isPinned: boolean
isLocked: boolean
isFlagged: boolean
flagReason: string | null
createdAt: Date
updatedAt: Date
}
\`\`\`

### Post

\`\`\`typescript
{
id: string
content: string (1-5000 chars)
thread: string (Thread ID)
author: User
parentPost: string | null (Post ID for replies)
isEdited: boolean
isFlagged: boolean
flagReason: string | null
createdAt: Date
updatedAt: Date
}
\`\`\`

### Notification

\`\`\`typescript
{
id: string
recipient: string (User ID)
sender: User | null
type: 'mention' | 'reply' | 'thread_update' | 'system'
content: string
relatedThread: string | null (Thread ID)
relatedPost: string | null (Post ID)
isRead: boolean
createdAt: Date
updatedAt: Date
}
\`\`\`

### Webhook

\`\`\`typescript
{
id: string
url: string
events: string[]
secret: string | null
isActive: boolean
createdBy: string (User ID)
createdAt: Date
updatedAt: Date
}
\`\`\`

---

## Error Codes

- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `423` - Locked (thread is locked)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

### Authentication Endpoints

- Window: 15 minutes
- Max requests: 5 per window
- Applies to: `/auth/register`, `/auth/login`

### Thread Creation

- Window: 15 minutes
- Max requests: 10 per window
- Applies to: `POST /threads`

---

## Caching

### Redis Caching

Threads and thread lists are cached in Redis with a 5-minute TTL.

**Cache Keys:**

- Single thread: `thread:{threadId}`
- Thread list: `threads:list:{page}:{limit}:{search}:{category}:{sort}`

**Cache Invalidation:**

- Thread creation: Invalidates all `threads:list:*` keys
- Thread update: Invalidates `thread:{id}` and all `threads:list:*` keys
- Thread deletion: Invalidates `thread:{id}` and all `threads:list:*` keys

---

## AI Features

### Content Moderation

All thread and post content is analyzed for spam using AI service.

**Spam Detection:**

- Confidence > 0.8: Content rejected
- Confidence > 0.5: Content flagged
- Confidence < 0.5: Content approved

### Thread Summarization

Generate AI-powered summaries of threads (admin only).

- Uses first 100 posts
- Provides key points and sentiment analysis

---

## Environment Variables

Required environment variables:

\`\`\`env

# Server

PORT=5000
NODE_ENV=development
API_VERSION=v1

# Database

MONGODB_URI=mongodb://localhost:27017/forum

# Redis

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS

CORS_ORIGIN=http://localhost:3000

# AI Service (optional)

AI_SERVICE_URL=
AI_SERVICE_KEY=
\`\`\`

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use pagination** for list endpoints to avoid loading too much data
3. **Subscribe to socket events** for real-time updates instead of polling
4. **Handle rate limits** gracefully with exponential backoff
5. **Cache responses** on the client side when appropriate
6. **Validate data** on client side before sending to reduce 400 errors
7. **Handle errors** properly and display meaningful messages to users

---

## Examples

### JavaScript/TypeScript Example

\`\`\`javascript
// Login
const login = async (email, password) => {
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ email, password }),
})

const data = await response.json()
if (data.success) {
localStorage.setItem('token', data.data.token)
return data.data.user
}
throw new Error(data.message)
}

// Get threads with search
const getThreads = async (search = '', page = 1) => {
const response = await fetch(
`http://localhost:5000/api/v1/threads?search=${search}&page=${page}`,
{
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`,
},
}
)

const data = await response.json()
return data.data
}

// Create post
const createPost = async (threadId, content) => {
const response = await fetch('http://localhost:5000/api/v1/posts', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`,
},
body: JSON.stringify({ threadId, content }),
})

const data = await response.json()
if (data.success) {
return data.data
}
throw new Error(data.message)
}

// Socket.IO connection
import io from 'socket.io-client'

const socket = io('http://localhost:5000', {
auth: {
token: localStorage.getItem('token')
}
})

socket.on('connect', () => {
console.log('Connected to socket')

// Join a thread
socket.emit('thread:join', { threadId: 'thread_id_here' })
})

socket.on('post:created', (post) => {
console.log('New post:', post)
// Update UI with new post
})
\`\`\`

---

## Support

For issues or questions about the API, please contact the development team or check the server logs for detailed error information.
