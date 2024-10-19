# Disney World Memories App Backend

This is the backend service for the **Disney World Memories App**, which allows users to upload photos, add titles and descriptions, and mark their favorite memories. The backend is built using **Node.js**, **Express**, **MongoDB**, and **AWS S3** for photo storage.

## Features

- **Photo Upload:** Upload photos to an AWS S3 bucket.
- **Memory Management:** Add, update, delete, and fetch memories from MongoDB.
- **Favorites Management:** Toggle whether a memory is marked as a favorite.
- **CORS Configuration:** CORS enabled for front-end communication.
- **Environment Variables:** Use `.env` for secure storage of sensitive information.

## API Endpoints
| Method | Endpoint                         | Description                          |
|--------|----------------------------------|--------------------------------------|
| POST   | `/api/memories`                  | Upload a photo and create a memory   |
| GET    | `/api/memories`                  | Fetch all memories                   |
| DELETE | `/api/memories/:_id`             | Delete a memory by `_id`             |
| PUT    | `/api/memories/:_id`             | Update a memory by `_id`             |

## Installation
1. Clone this repository:
   git clone https://github.com/your-username/disney-world-memories-backend.git
   cd disney-world-memories-backend
2. Install dependencies:
npm install

3. Set up environment variables: Create a .env file at the root of your project and include the following environment variables:
MONGODB_URI="mongodb+srv://crbagbuya:Lfs5JgcOAocWUpIG@chrisagbuya-cluster.9xqga.mongodb.net/photoApp?retryWrites=true&w=majority"
MONGODB_LOCALHOST="mongodb://localhost:27017/photoApp"
MONGODB_CONNECTSTRING="mongodb+srv://crbagbuya:Lfs5JgcOAocWUpIG@chrisagbuya-cluster.9xqga.mongodb.net"
VERCEL_FRONTEND_URL="https://disney-world-memories-mymoh222v-chris-projects-0f0e5269.vercel.app"
VERCEL_FRONTEND_URL_MAIN="https://disney-world-memories-app.vercel.app"
LOCALHOST_FRONTEND="http://localhost:3000"
# AWS
S3_BUCKET_NAME="crbagbuya1983"
AWS_ACCESS_KEY_ID="AKIAU6VTTBILTTM67JAT"
AWS_SECRET_ACCESS_KEY="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"
AWS_REGION="us-east-2"

# photo endpoints
PHOTO_ENDPOINT="/api/memories"
SELECTED_PHOTO="/api/memories/:_id"

4. Start the server:
npm start
5. The backend will run on the defined port, or by default, on http://localhost:5000
**AWS S3 Integration**
Photos uploaded via the API are stored in AWS S3. The backend utilizes the AWS SDK to upload files to an S3 bucket, and the S3 URL is stored in MongoDB for retrieval.
**MongoDB Integration**
Memories are stored in a MongoDB database. You can connect to either a local instance or a remote MongoDB Atlas cluster using environment variables.
**CORS Setup**
This app includes a CORS configuration that allows requests from specific frontend URLs, including the Vercel-deployed frontend, to ensure secure communication between the frontend and backend.
**How to Use**
•	Add a Memory: Upload a photo with a title and description.
•	View Memories: Retrieve all memories stored in the database.
•	Edit a Memory: Update the title, description, or favorite status of an existing memory.
•	Delete a Memory: Permanently delete a memory from the database.
**Deployment**
The backend is deployed on Heroku. Access the live backend via:
Heroku Backend URL
By default, accessing the root URL (https://disney-express-backend-360388aa6246.herokuapp.com/api/memories) redirects to the memories API endpoint.

### Key Sections Explained: 
1. **Project Overview**: Describes what the project does and the technologies used. 
2. **API Endpoints**: Lists the API routes with methods and descriptions. 
3. **Installation Steps**: Instructions for setting up the backend locally, including required dependencies and environment variables. 
4. **AWS S3 Integration**: Highlights how photo storage is handled. 
5. **CORS Setup**: Explains the CORS configuration for frontend-backend communication. 
6. **Deployment Info**: Provides the link to the live backend deployed on Heroku.

