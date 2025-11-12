# Lost and Found Platform

> **Work In Progress (WIP)** - This project is currently under active development. Features may change, and some functionality may be incomplete or subject to updates.

A full-stack web application for managing lost and found items at Wentworth Institute of Technology. Users can post lost or found items, comment on posts, and administrators can moderate content.

**Repository**: [https://github.com/frankischilling/Lost-and-Found/](https://github.com/frankischilling/Lost-and-Found/)

## Project Status

**Current Status**: Work In Progress (WIP)

- Backend API (Posts, Users, Comments) - Complete
- Authentication System - Complete
- Admin Moderation - Complete
- API Testing Interface - Complete
- Frontend Application - In Development
- Additional Features - Planned

## Features

### User Features
- **Google OAuth Authentication** - Secure login with @wit.edu email addresses
- **Post Management** - Create, view, update, and delete lost/found item posts
- **Comment System** - Add comments to posts with full CRUD operations
- **User Profiles** - Manage your profile information
- **Photo Support** - Attach multiple photos to posts
- **Tagging System** - Add tags to posts for better searchability

### Admin Features
- **Post Moderation** - Approve, reject, or keep posts pending
- **Content Management** - Edit or delete any post or comment
- **User Management** - Manage user accounts and roles

## Tech Stack

### Backend
- **PHP 8.0+** - Server-side scripting (required for Google API client)
- **MySQL** - Database management
- **Composer** - PHP dependency management
- **Google OAuth2 Client Library** (`google/apiclient`) - Authentication via Composer
- **RESTful API** - JSON-based API endpoints

### Frontend
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6+)** - Client-side functionality
- **Fetch API** - API communication

> **Note for Lucas**: Please add the frontend tech stack here (e.g., React, Vue, Angular, etc.)

## Prerequisites

- **PHP 8.0 or higher** (required for Google API client library)
- **MySQL 5.7+** or MariaDB 10.2+
- **Apache/Nginx** web server
- **Composer** - PHP dependency manager ([Download Composer](https://getcomposer.org/download/))
- **Google OAuth2 credentials** - Get from [Google Cloud Console](https://console.cloud.google.com/)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/frankischilling/Lost-and-Found.git
cd Lost-and-Found
```

### 2. Configure Database

Create a MySQL database:
```sql
CREATE DATABASE lostandfound CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Install PHP Dependencies

This project uses Composer to manage PHP dependencies, including the Google OAuth2 client library.

**First, install Composer** (if not already installed):
- Download from: https://getcomposer.org/download/
- Or install via package manager:
  ```bash
  # Linux/Mac
  curl -sS https://getcomposer.org/installer | php
  sudo mv composer.phar /usr/local/bin/composer
  
  # Windows
  # Download and run Composer-Setup.exe from https://getcomposer.org/download/
  ```

**Then install project dependencies:**
```bash
composer install
```

This will install:
- **google/apiclient** - Google OAuth2 and API client library (required for authentication)
- Other PHP dependencies as specified in `composer.json`

**Note**: Make sure PHP 8.0 or higher is installed, as required by the Google API client.

### 4. Configure Environment

Copy the example config file and edit with your database credentials:
```bash
cp public_html/config.php.example public_html/config.php
```

Edit `public_html/config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'lostandfound');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/auth/callback.php`
6. Update `config.php` with your credentials:
```php
define('GOOGLE_CLIENT_ID', 'your-client-id');
define('GOOGLE_CLIENT_SECRET', 'your-client-secret');
```

### 5. Run Database Migrations

Execute the migration files in order:
```bash
mysql -u your_username -p lostandfound < public_html/migrations/add_post_fields.sql
mysql -u your_username -p lostandfound < public_html/migrations/add_user_admin_field.sql
mysql -u your_username -p lostandfound < public_html/migrations/add_comments_table.sql
```

### 6. Set Up Admin User

After creating a user account, set them as admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@wit.edu';
```

### 7. Set Up Uploads Directory

Create the uploads directory and set proper permissions:

```bash
mkdir -p public_html/uploads/photos
chmod 755 public_html/uploads/photos
```

**Important**: Ensure the web server user has write permissions to the `uploads/` directory. The directory will be created automatically on first upload if it doesn't exist, but it's recommended to create it manually with proper permissions.

### 8. Configure Web Server

#### Apache
Ensure mod_rewrite is enabled and point DocumentRoot to `public_html/`

#### Nginx
Configure server block to point to `public_html/` directory

## Project Structure

```
project.frankhagan.online/
├── public_html/
│   ├── api-test.html          # Interactive API testing interface
│   ├── auth/                   # Authentication endpoints
│   │   ├── login.php
│   │   ├── callback.php
│   │   ├── logout.php
│   │   └── session.php
│   ├── migrations/             # Database migration scripts
│   │   ├── add_post_fields.sql
│   │   ├── add_user_admin_field.sql
│   │   └── add_comments_table.sql
│   ├── uploads/                 # Uploaded files directory
│   │   └── photos/              # Photo uploads (UUID-based filenames)
│   ├── posts.php               # Posts API endpoint
│   ├── users.php               # Users API endpoint
│   ├── comments.php            # Comments API endpoint
│   ├── upload_photo.php        # Photo upload API endpoint
│   ├── config.php              # Configuration file
│   └── ...
├── README.md                   # This file
└── composer.json              # PHP dependencies
```

## Quick Start

1. **Access the API Tester**
   - Navigate to `https://yourdomain.com/api-test.html`
   - This provides an interactive interface to test all API endpoints

2. **Login**
   - Click "Login with Google"
   - Use your @wit.edu email address

3. **Create a Post**
   - Use the "Create Post" section in the API tester
   - Fill in item details and submit

4. **View Documentation**
   - See `API_DOCUMENTATION.md` for complete API reference

## API Documentation

### Quick API Reference

#### Posts API (`/posts.php`)
- `GET /posts.php` - Get all posts (optional: `?type=lost` or `?type=found`)
- `GET /posts.php?id={uuid}` - Get single post
- `POST /posts.php` - Create new post (requires auth)
- `PUT /posts.php?id={uuid}` - Update post (owner or admin only)
- `DELETE /posts.php?id={uuid}` - Delete post (owner or admin only)

#### Users API (`/users.php`)
- `GET /users.php` - Get all users (admin only)
- `GET /users.php?id={uuid}` - Get single user
- `PUT /users.php?id={uuid}` - Update user (self or admin only)
- `DELETE /users.php?id={uuid}` - Delete user (self or admin only)

#### Comments API (`/comments.php`)
- `GET /comments.php?post_id={uuid}` - Get all comments for a post
- `GET /comments.php?id={uuid}` - Get single comment
- `POST /comments.php` - Create comment (requires auth)
- `PUT /comments.php?id={uuid}` - Update comment (owner or admin only)
- `DELETE /comments.php?id={uuid}` - Delete comment (owner or admin only)

#### Photo Upload API (`/upload_photo.php`)
- `POST /upload_photo.php` - Upload photos and get UUIDs (requires auth)
  - Accepts multiple photos via FormData
  - Optional: `post_id` parameter to verify ownership before upload
  - Returns array of photo objects with UUIDs, filenames, and URLs
  - Photos are stored in `/uploads/photos/` with UUID as filename
  - Supported formats: JPEG, PNG, GIF, WebP (max 10MB per file)

#### Authentication
- `GET /auth/session.php` - Check current session
- `GET /auth/login.php` - Initiate Google OAuth login
- `GET /auth/logout.php` - Logout current user

### Example Requests

#### Create a Post with Photos

```javascript
// Step 1: Upload photos first
const formData = new FormData();
formData.append('photos[]', photoFile1);
formData.append('photos[]', photoFile2);

const uploadResponse = await fetch('https://project.frankhagan.online/upload_photo.php', {
  method: 'POST',
  credentials: 'include',
  body: formData
});

const uploadData = await uploadResponse.json();
// uploadData.photos contains array of {uuid, filename, url, ...}

// Step 2: Create post with photo UUIDs
const photoIds = uploadData.photos.map(photo => photo.uuid);

const response = await fetch('https://project.frankhagan.online/posts.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    post_type: 'lost',
    item_name: 'iPhone 13',
    description: 'Lost my iPhone in the library',
    location_found: 'Library, 2nd floor',
    tags: ['phone', 'electronics'],
    photo_ids: photoIds  // Array of photo UUIDs
  })
});

const data = await response.json();
console.log(data);
```

#### Create a Post without Photos

```javascript
const response = await fetch('https://project.frankhagan.online/posts.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    post_type: 'found',
    item_name: 'Wallet',
    description: 'Found a brown leather wallet',
    location_found: 'Student Center',
    tags: ['wallet', 'brown', 'leather']
  })
});

const data = await response.json();
console.log(data);
```

#### Add Photos to Existing Post

```javascript
// Upload new photos (with post_id for permission check)
const formData = new FormData();
formData.append('photos[]', newPhotoFile);
formData.append('post_id', existingPostId);  // Verifies ownership

const uploadResponse = await fetch('https://project.frankhagan.online/upload_photo.php', {
  method: 'POST',
  credentials: 'include',
  body: formData
});

const uploadData = await uploadResponse.json();
const newPhotoIds = uploadData.photos.map(photo => photo.uuid);

// Get existing post to merge photo IDs
const getResponse = await fetch(`https://project.frankhagan.online/posts.php?id=${existingPostId}`);
const post = await getResponse.json();

// Merge existing and new photo IDs
const allPhotoIds = [...(post.photo_ids || []), ...newPhotoIds];

// Update post with merged photo IDs
const updateResponse = await fetch(`https://project.frankhagan.online/posts.php?id=${existingPostId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    photo_ids: allPhotoIds
  })
});
```

For complete API documentation with all endpoints, request/response formats, and examples, see the [Full API Documentation](./API_DOCUMENTATION.md).

## Authentication

The application uses Google OAuth2 for authentication. Only users with @wit.edu email addresses can register and use the platform.

### Session Management
- Sessions are managed server-side using PHP sessions
- Session lifetime: 7 days (configurable in `config.php`)
- Secure, HTTP-only cookies with SameSite protection

## Database Schema

### Core Tables
- **users** - User accounts and authentication
- **posts** - Lost and found item posts (includes `photo_ids` JSON field)
- **comments** - Comments on posts

See the API documentation for complete schema details.

## Photo Management

### Photo Storage
- Photos are stored in `/public_html/uploads/photos/`
- Each photo is assigned a UUID and stored as `{uuid}.{extension}`
- Photo UUIDs are stored in the `photo_ids` JSON array field in the `posts` table
- Photos can be accessed via: `/uploads/photos/{uuid}.{ext}`

### Photo Upload Process
1. **Upload photos** using `POST /upload_photo.php` with FormData
2. **Receive UUIDs** in the response
3. **Include UUIDs** in the `photo_ids` array when creating/updating posts

### Photo Permissions
- **Create Post**: Any authenticated user can upload photos
- **Update Post**: Only post creator or admins can add photos to existing posts
- Photos are validated for type (JPEG, PNG, GIF, WebP) and size (max 10MB)

### Photo File Format
```json
{
  "status": "success",
  "message": "2 photo(s) uploaded successfully",
  "photos": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "original_name": "photo1.jpg",
      "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
      "url": "/uploads/photos/550e8400-e29b-41d4-a716-446655440000.jpg",
      "size": 245678,
      "type": "image/jpeg"
    }
  ]
}
```

## Testing

Use the built-in API tester at `/api-test.html` to:
- Test all endpoints interactively
- View request/response examples
- Debug authentication issues
- Test permission scenarios

## Security Features

- **Input Validation** - All inputs are validated and sanitized
- **SQL Injection Protection** - Prepared statements with PDO
- **XSS Prevention** - Output escaping
- **CSRF Protection** - Session-based token validation
- **Role-Based Access Control** - Admin and user permissions
- **Secure Sessions** - HTTP-only, secure cookies

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify database credentials in `config.php`
- Ensure MySQL service is running
- Check database exists: `SHOW DATABASES;`

**OAuth Login Not Working**
- Verify Google OAuth credentials in `config.php`
- Check redirect URI matches Google Cloud Console settings
- Ensure domain is authorized in Google Cloud Console

**Permission Denied Errors**
- Verify user role in database: `SELECT id, email, role FROM users WHERE email = 'your@wit.edu';`
- Check session is active: Visit `/auth/session.php`
- Ensure cookies are enabled in browser

**Photo Upload Errors**
- Verify `uploads/photos/` directory exists and has write permissions: `chmod 755 public_html/uploads/photos`
- Check file size (max 10MB per photo)
- Verify file type is supported (JPEG, PNG, GIF, WebP)
- Ensure user is authenticated (photos require login)
- For updating posts: Verify you own the post or are an admin

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

See the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

For questions or support:
- **Project Maintainer**: Francis Hagan
- **Email**: haganf@wit.edu

## Acknowledgments

- Wentworth Institute of Technology
- Google OAuth2 for authentication
- PHP and MySQL communities

---

**Note**: This project is designed specifically for Wentworth Institute of Technology students and requires a @wit.edu email address for access.

**Live Demo**: [https://project.frankhagan.online](https://project.frankhagan.online)
