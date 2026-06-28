import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect, admin } from '../middleware/auth.js';
import { getProducts, getProductById, createProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Ensure upload directory exists for multer
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.single('image'), createProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
