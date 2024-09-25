const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs-extra');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost/book_upload_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Book model
const Book = mongoose.model('Book', {
  name: String,
  deployedUrl: String,
});

// AWS configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

// Multer configuration for folder uploads
const upload = multer({ dest: 'uploads/' });

// Function to upload folder to S3
async function uploadFolderToS3(folderPath, bucketName, folderName) {
  const files = await fs.readdir(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileContent = await fs.readFile(filePath);
    
    await s3.putObject({
      Bucket: bucketName,
      Key: `course_content/${folderName}/${file}`,
      Body: fileContent,
      ContentType: 'text/html'
    }).promise();
  }
}

// Routes
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const { bookName } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const folderPath = path.join(__dirname, 'uploads', bookName);
    await fs.ensureDir(folderPath);

    for (const file of files) {
      await fs.move(file.path, path.join(folderPath, file.originalname));
    }

    // Upload folder to S3
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    await uploadFolderToS3(folderPath, bucketName, bookName);

    // Create CloudFront distribution
    const distribution = await cloudfront.createDistribution({
      DistributionConfig: {
        CallerReference: `${bookName}-${Date.now()}`,
        DefaultCacheBehavior: {
          TargetOriginId: bucketName,
          ViewerProtocolPolicy: 'redirect-to-https',
          MinTTL: 0,
          ForwardedValues: {
            QueryString: false,
            Cookies: { Forward: 'none' },
          },
        },
        Enabled: true,
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: bucketName,
              DomainName: `${bucketName}.s3.amazonaws.com`,
              S3OriginConfig: { OriginAccessIdentity: '' },
            },
          ],
        },
        DefaultRootObject: 'index.html',
      },
    }).promise();

    const deployedUrl = `https://${distribution.Distribution.DomainName}/${bookName}/index.html`;

    // Save book information to the database
    const newBook = new Book({
      name: bookName,
      deployedUrl: deployedUrl,
    });
    await newBook.save();

    res.status(201).json({ message: 'Book uploaded and deployed successfully', deployedUrl });
  } catch (error) {
    console.error('Error uploading and deploying book:', error);
    res.status(500).json({ message: 'Error uploading and deploying book' });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});