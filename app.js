const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// aws
const AWS = require('aws-sdk');

const Memory = require('./models/Memory'); // Import the Memory model

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadPhotoToS3 = async (file) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`, // File name
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // This makes the uploaded file public
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // S3 URL
};


// Updated CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.VERCEL_FRONTEND_URL, process.env.VERCEL_FRONTEND_URL_MAIN, process.env.LOCALHOST_FRONTEND];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow requests with matching origins or requests with no origin (like from Postman)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allows sending cookies or authentication headers
};

const app = express();
app.use(cors(corsOptions));


// Update the CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [process.env.VERCEL_FRONTEND_URL, process.env.VERCEL_FRONTEND_URL_MAIN, process.env.LOCALHOST_FRONTEND];
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.options('*', cors(corsOptions));
// app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/photoApp');
mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_LOCALHOST)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if connection fails
});


// // Mongoose schema
// const MemorySchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   photo: String, // Store image as a base64 string
//   isfavorite: Boolean,
// });

// const Memory = mongoose.model('Memory', MemorySchema);

// Multer setup to handle image uploads with increased file size limit
//  Updated multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

// Endpointto add a new memory , photo to upload to S3
app.post(process.env.PHOTO_ENDPOINT, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or file too large' });
  }

  try {
    const photoUrl = await uploadPhotoToS3(req.file); // Upload to S3 and get the URL

    const newMemory = new Memory({
      title: req.body.title,
      description: req.body.description,
      photo: photoUrl, // Save the S3 URL
      isfavorite: req.body.isfavorite === 'true' ? true : false,
    });

    await newMemory.save();
    res.status(201).json(newMemory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all memories
app.get(process.env.PHOTO_ENDPOINT, async (req, res) => {
  try {
    const memories = await Memory.find();
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to delete a memory
app.delete(process.env.SELECTED_PHOTO, async (req, res) => {
  try {
    const result = await Memory.findByIdAndDelete(req.params._id);
    if (!result) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an existing memory (edit title, description, and isfavorite)
app.put(process.env.SELECTED_PHOTO, async (req, res) => {
  console.log('Request Body:', req.body);
  try {
    const { _id } = req.params;
    const updateData = {};

    // Add only the fields that are present in the request
    if (req.body.title) {
      updateData.title = req.body.title;
    }
    if (req.body.description) {
      updateData.description = req.body.description;
    }
    if (req.body.isfavorite !== undefined) {
      updateData.isfavorite = req.body.isfavorite === 'false' || req.body.isfavorite === true;
    }

    // Update the memory document without modifying the photo
    const updatedMemory = await Memory.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedMemory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    console.log('Updated Memory:', updatedMemory);
    res.json(updatedMemory);
  } catch (err) {
    console.error('Error updating memory:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.redirect('/api/memories'); // Redirect to /api/memories
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

