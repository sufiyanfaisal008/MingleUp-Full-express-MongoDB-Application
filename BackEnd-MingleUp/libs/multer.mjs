import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, "image" + "-" + Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname);
  },
});

export const multerMiddleware = multer({ storage: storage });