import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const name = randomUUID() + extname(file.originalname);
          cb(null, name);
        },
      }),
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map((f) => ({
      url: `/uploads/${f.filename}`,
      originalName: f.originalname,
      size: f.size,
    }));
  }
}
