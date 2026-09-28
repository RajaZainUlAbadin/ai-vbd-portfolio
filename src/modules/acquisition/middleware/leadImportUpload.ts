import multer from 'multer';
import path from 'path';
import os from 'os';

const allowedExtensions = new Set(['.csv', '.xlsx', '.xls']);

export const leadImportUpload = multer({
  dest: path.join(os.tmpdir(), 'ai-vbd-lead-imports'),

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(new Error('Only CSV, XLSX and XLS files are supported'));
    }

    callback(null, true);
  },
});
