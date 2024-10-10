const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const corsOptions = {
  origin: process.env.VERCEL_FRONTEND_URL, // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // If you need to allow credentials
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/photoApp');
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoApp');
mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_LOCALHOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if connection fails
});


// Mongoose schema
const MemorySchema = new mongoose.Schema({
  title: String,
  description: String,
  photo: String, // Store image as a base64 string
  isfavorite: Boolean,
});

const Memory = mongoose.model('Memory', MemorySchema);

// Multer setup to handle image uploads with increased file size limit
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
    fieldSize: 10 * 1024 * 1024, // 10 MB field size limit
    fields: 10, // Max number of non-file fields
    files: 1,  // Max number of files
    parts: 20, // Max number of parts (fields + files)
  },
});

// Endpoint to add a new memory
app.post('/api/memories', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or file too large' });
  }

  const newMemory = new Memory({
    title: req.body.title,
    description: req.body.description,
    photo: req.file.buffer.toString('base64'), // Store base64 string
    // isfavorite: req.body.isfavorite === 'false', // Convert string to boolean
    isfavorite: req.body.isfavorite === 'true' ? true : false
    // isfavorite: req.body.isfavorite
  });

  newMemory.save()
    .then((memory) => res.json(memory))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Endpoint to fetch all memories
// app.get('/api/memories', async (req, res) => {
//   try {
//     const memories = await Memory.find();
//     res.json(memories);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// Paginated endpoint for fetching memories
app.get('/api/memories', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const skip = (page - 1) * limit; // Calculate how many records to skip

    const memories = await Memory.find()
      .skip(skip)
      .limit(limit);

    const total = await Memory.countDocuments(); // Get total number of documents

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      memories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/memories/:_id', async (req, res) => {
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
app.put('/api/memories/:_id', async (req, res) => {
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
      // updateData.isfavorite = req.body.isfavorite === 'true' ? true : false
      updateData.isfavorite = req.body.isfavorite === 'false' || req.body.isfavorite === true;
      // updateData.isfavorite = req.body.isfavorite;
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

// Start the server
// app.listen(5000, () => {
//   console.log('Server started on port 5000');
// });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

