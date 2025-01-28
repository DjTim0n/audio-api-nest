import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { AudioService } from './audio.service';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/guard/auth.guard';
import { AudioUpload } from 'src/interfaces/audio.interface';
import { AudioCreateDto } from 'src/DTO/audio.dto';
import { AuthUser } from 'src/decorators/user.decorator';
import { IAuthUser } from 'src/DTO/user.dto';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Auth()
  @Get('get_tracks')
  async getListTracks() {
    return this.audioService.getListTracks();
  }

  @Get('get_audio')
  @ApiQuery({ name: 'name', required: true })
  async getFile(
    @Query('name') name: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = path.join(process.cwd(), `audio/${name}`);
    const fileSize = fs.statSync(filePath).size;

    res.setHeader('Accept-Ranges', 'bytes');

    const range = res.req.headers.range;
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        return null;
      }

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', end - start + 1);

      const fileStream = fs.createReadStream(filePath, { start, end });

      fileStream.on('error', (err) => {
        if (err.message === 'ERR_STREAM_PREMATURE_CLOSE') {
          console.log('Client disconnected');
        } else {
          console.error(err);
        }
      });

      return new StreamableFile(fileStream, {
        type: 'audio/mpeg',
        disposition: 'inline',
      });
    } else {
      res.setHeader('Content-Length', fileSize);
      const fileStream = fs.createReadStream(filePath);
      return new StreamableFile(fileStream, {
        type: 'audio/mpeg',
        disposition: 'inline',
      });
    }
  }

  @Auth()
  @Post('uploadAudio')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audioFile: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
          description: 'Название аудио',
        },
        artist: {
          type: 'string',
          description: 'Артист',
        },
        album: {
          type: 'string',
          description: 'Альбом',
        },
        genre: {
          type: 'string',
          description: 'Жанр',
        },
        year: {
          type: 'string',
          description: 'Год',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audioFile'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: AudioCreateDto,
    @AuthUser() user: IAuthUser,
  ) {
    const bodyForCreate: AudioUpload = {
      ...body,
      file,
    };

    try {
      return this.audioService.uploadAudio(bodyForCreate, user);
    } catch (error) {
      return error.message;
    }
  }
}
