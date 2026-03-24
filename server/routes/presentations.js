const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const cloudinary = require('../config/cloudinary');
const Presentation = require('../models/Presentation');

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  fileFilter: (req, file, cb) => {
    const allowed = ['.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .ppt and .pptx files are allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Check if conversion tools are available
const hasConversionTools = () => {
  try {
    execSync('soffice --version', { stdio: 'ignore' });
    execSync('pdftoppm -v', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// GET all presentations
router.get('/', async (req, res) => {
  try {
    const presentations = await Presentation.find().sort({ uploadedAt: -1 });
    res.json(presentations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single presentation
router.get('/:id', async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) return res.status(404).json({ error: 'Not found' });
    res.json(presentation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload presentation
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const tempPath = req.file.path;
  const originalName = req.file.originalname;
  const pptxPath = tempPath + path.extname(originalName).toLowerCase();
  fs.renameSync(tempPath, pptxPath);

  try {
    // Upload original PPTX to Cloudinary
    const ext = path.extname(originalName).toLowerCase().replace('.', '');
    const rawResult = await cloudinary.uploader.upload(pptxPath, {
      resource_type: 'raw',
      folder: 'presentations/originals',
      public_id: `${Date.now()}_${path.parse(originalName).name}.${ext}`,
    });

    let slideUrls = [];

    // Try to convert if tools are available
    if (hasConversionTools()) {
      console.log('Converting PPTX to slide images...');
      const slideDir = pptxPath + '_slides';
      fs.mkdirSync(slideDir, { recursive: true });

      try {
        // Convert to PDF
        execSync(`soffice --headless --convert-to pdf --outdir "${slideDir}" "${pptxPath}"`, { timeout: 120000 });
        const pdfFiles = fs.readdirSync(slideDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
        
        if (pdfFiles.length > 0) {
          const pdfPath = path.join(slideDir, pdfFiles[0]);
          const pngPrefix = path.join(slideDir, 'slide');
          execSync(`pdftoppm -r 150 -png "${pdfPath}" "${pngPrefix}"`, { timeout: 120000 });

          const slideFiles = fs.readdirSync(slideDir)
            .filter((f) => f.toLowerCase().endsWith('.png'))
            .sort()
            .map((f) => path.join(slideDir, f));

          console.log(`Generated ${slideFiles.length} slide(s)`);

          // Upload each slide to Cloudinary
          const timestamp = Date.now();
          for (let i = 0; i < slideFiles.length; i++) {
            const result = await cloudinary.uploader.upload(slideFiles[i], {
              folder: 'presentations/slides',
              public_id: `${timestamp}_slide_${i + 1}`,
              resource_type: 'image',
            });
            slideUrls.push(result.secure_url);
          }
        }

        // Cleanup
        fs.rmSync(slideDir, { recursive: true, force: true });
      } catch (convErr) {
        console.warn('Conversion failed, using Office Online fallback:', convErr.message);
      }
    } else {
      console.log('Conversion tools not available — using Office Online viewer');
    }

    // Save to MongoDB
    const presentation = new Presentation({
      title: req.body.title || path.parse(originalName).name,
      originalName,
      cloudinaryUrl: rawResult.secure_url,
      cloudinaryPublicId: rawResult.public_id,
      slides: slideUrls, // Empty if conversion failed — frontend will use Office Online
    });
    await presentation.save();

    res.status(201).json(presentation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (fs.existsSync(pptxPath)) fs.unlinkSync(pptxPath);
  }
});

// DELETE presentation
router.delete('/:id', async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) return res.status(404).json({ error: 'Not found' });
    await cloudinary.uploader.destroy(presentation.cloudinaryPublicId, { resource_type: 'raw' });
    await presentation.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
