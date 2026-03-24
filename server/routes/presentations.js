const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const cloudinary = require('../config/cloudinary');
const Presentation = require('../models/Presentation');

const SOFFICE = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
const PDFTOPPM = 'C:\\Users\\aditi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\\poppler-25.07.0\\Library\\bin\\pdftoppm.exe';

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
  // Give it the proper extension so LibreOffice recognises it
  const pptxPath = tempPath + path.extname(originalName).toLowerCase();
  fs.renameSync(tempPath, pptxPath);

  const slideDir = pptxPath + '_slides';
  fs.mkdirSync(slideDir, { recursive: true });

  try {
    // 1. Convert PPTX → PDF using LibreOffice
    console.log('Converting PPTX to PDF...');
    execSync(
      `"${SOFFICE}" --headless --convert-to pdf --outdir "${slideDir}" "${pptxPath}"`,
      { timeout: 120000 }
    );

    const pdfFiles = fs.readdirSync(slideDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) throw new Error('LibreOffice failed to produce a PDF');
    const pdfPath = path.join(slideDir, pdfFiles[0]);
    console.log('PDF created:', pdfPath);

    // 2. Split PDF into per-page PNGs using pdftoppm
    const pngPrefix = path.join(slideDir, 'slide');
    execSync(`"${PDFTOPPM}" -r 150 -png "${pdfPath}" "${pngPrefix}"`, { timeout: 120000 });

    // Collect sorted slide files
    let slideFiles = fs.readdirSync(slideDir)
      .filter((f) => f.toLowerCase().endsWith('.png'))
      .sort()
      .map((f) => path.join(slideDir, f));

    console.log(`Generated ${slideFiles.length} slide image(s):`, slideFiles.map(f => path.basename(f)));
    if (slideFiles.length === 0) throw new Error('No slide images were generated');

    // 2. Upload each slide image to Cloudinary
    const slideUrls = [];
    const timestamp = Date.now();
    for (let i = 0; i < slideFiles.length; i++) {
      const result = await cloudinary.uploader.upload(slideFiles[i], {
        folder: 'presentations/slides',
        public_id: `${timestamp}_slide_${i + 1}`,
        resource_type: 'image',
      });
      slideUrls.push(result.secure_url);
    }

    // 3. Upload original PPTX as raw for download
    const rawResult = await cloudinary.uploader.upload(pptxPath, {
      resource_type: 'raw',
      folder: 'presentations/originals',
      public_id: `${timestamp}_${path.parse(originalName).name}.pptx`,
    });

    // 4. Save to MongoDB
    const presentation = new Presentation({
      title: req.body.title || path.parse(originalName).name,
      originalName,
      cloudinaryUrl: rawResult.secure_url,
      cloudinaryPublicId: rawResult.public_id,
      slides: slideUrls,
    });
    await presentation.save();

    res.status(201).json(presentation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Cleanup temp files
    if (fs.existsSync(pptxPath)) fs.unlinkSync(pptxPath);
    if (fs.existsSync(slideDir)) fs.rmSync(slideDir, { recursive: true, force: true });
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
