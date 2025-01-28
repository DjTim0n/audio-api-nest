import { AudioCreateDto } from 'src/DTO/audio.dto';

export interface AudioUpload extends AudioCreateDto {
  file: Express.Multer.File;
}
