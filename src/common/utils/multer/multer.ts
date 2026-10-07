import multer, { diskStorage, type Options } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

export const imageUploadOptions = {
  storage: diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
};

export const upload = (options: Options = {}) => {
  return multer({
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
    ...options,
    storage: multer.memoryStorage(),
  });
};

export const publicImageUrl = (image?: string) => {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/\\/g, '/');
  const uploadsIndex = normalized.lastIndexOf('/uploads/');
  const filename =
    uploadsIndex >= 0
      ? normalized.slice(uploadsIndex + '/uploads/'.length)
      : normalized.split('/').pop();
  if (!filename) return undefined;

  const serverUrl =
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
  return `${serverUrl}/uploads/${encodeURIComponent(filename)}`;
};
