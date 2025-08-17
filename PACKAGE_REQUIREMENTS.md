# Package Requirements

## Core Dependencies

### Web Framework & Server
- **express** - `npm install express`
  - Web framework for Node.js
  - Used in: `src/index.js`, `src/app.js`

### Database
- **mongoose** - `npm install mongoose`
  - MongoDB object modeling for Node.js
  - Used in: `src/db/index.js`, `src/models/user.model.js`, `src/models/video.model.js`

- **mongoose-aggregate-paginate-v2** - `npm install mongoose-aggregate-paginate-v2`
  - Pagination plugin for Mongoose aggregation queries
  - Used in: `src/models/video.model.js`

### Authentication & Security
- **bcrypt** - `npm install bcrypt`
  - Password hashing library
  - Used in: `src/models/user.model.js`

- **jsonwebtoken** - `npm install jsonwebtoken`
  - JSON Web Token implementation for authentication
  - Used in: `src/models/user.model.js`

### Middleware
- **cors** - `npm install cors`
  - Cross-Origin Resource Sharing middleware
  - Used in: `src/app.js`

- **cookie-parser** - `npm install cookie-parser`
  - Parse HTTP request cookies
  - Used in: `src/app.js`

### Configuration
- **dotenv** - `npm install dotenv`
  - Environment variable management
  - Used in: `src/index.js`

### File Upload & Storage
- **multer** - `npm install multer`
  - Middleware for handling multipart/form-data (file uploads)
  - Used in: `src/middlewares/multer.middleware.js`

- **cloudinary** - `npm install cloudinary`
  - Cloud-based image and video management service
  - Used in: `src/utils/cloudinary.js`

### Development Dependencies
- **nodemon** - `npm install -D nodemon`
  - Development server with auto-restart
  - Used in: `package.json` scripts

## Built-in Node.js Modules
- **fs** - File system operations (built-in, no installation required)
  - Used in: `src/utils/cloudinary.js`

## Installation Command
```bash
npm install express mongoose mongoose-aggregate-paginate-v2 bcrypt jsonwebtoken cors cookie-parser dotenv multer cloudinary
npm install -D nodemon
```