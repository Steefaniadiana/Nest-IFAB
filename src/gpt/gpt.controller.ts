import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AudioToTextDto, ImageGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('gpt')
export class GptController {

  constructor(private readonly gptService: GptService) {  }

@Post('orthography-check')
orthographyCheck( 
  @Body() OrthographyDto: OrthographyDto
  ) {

  return this.gptService.orthographyCheck( OrthographyDto);

}

@Post('pros-cons-discusser')
prosConsDiscusser ( 
  @Body() prosConsDiscusserDto:ProsConsDiscusserDto
  ) {
  return this.gptService.prosConsDiscusser( prosConsDiscusserDto);
}

@Post('pros-cons-discusser-stream')
async prosConsDiscusserStream ( 
  @Body() prosConsDiscusserDto:ProsConsDiscusserDto,
  @Res() res: Response
  ) {

  const stream = await this.gptService.prosConsDiscusserStream( prosConsDiscusserDto);

  res.setHeader('Content-Type', 'application/json');
  res.status(HttpStatus.OK)

    for await (const chunk of stream) {
    const piece = chunk.choices[0].delta.content || '';
    console.log(piece);
    res.write(piece)
    }

res.end();
}

@Post('translate')
TranslateText ( 
  @Body() translateDto:TranslateDto
  ) {
  return this.gptService.translateText(translateDto);
}

@Post('text-to-audio')
async textToAudio ( 
  @Body() textToAudioDto:TextToAudioDto,
  @Res() res: Response
  ) {

const filePath = await this.gptService.textToAudio(textToAudioDto)

res.setHeader('Content-Type', 'audio/mp3')
res.status(HttpStatus.OK)
res.sendFile(filePath);
  }

  @Get('text-to-audio/:field')
  async textToAudioGetter ( 
    @Res() res: Response,
    @Param('field') field:string
    ) {
  
    const filePath = await this.gptService.textToAudioGetter(field);
    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
    }

    @Post('audio-to-text')
    @UseInterceptors(
      FileInterceptor ('file', {
        storage: diskStorage({
          destination: './generated/upload',
          filename: (req, file, callback) => {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${ new Date().getTime() }.${ fileExtension }`;
            return callback( null, fileName )
          }
        })
      })
    )
    async audioToText( 
      @UploadedFile(
        new ParseFilePipe ({
          validators: [
            new MaxFileSizeValidator({maxSize: 1000 * 1024 * 5, message: 'File is bigger than 5mb'}),
            new FileTypeValidator({fileType: 'audio/*'})
          ]
        })
      ) file: Express.Multer.File,

      @Body() audioToTextDto: AudioToTextDto,
      
    ) {
      return this.gptService.audioToText( file, audioToTextDto )
      
    }
@Post('image-generation')
async imageGeneration(
  @Body() imageGenerationDto: ImageGenerationDto
) {
  return await this.gptService.imageGeneration( imageGenerationDto )
}

@Get('image-generation/:fileName')
async getGeneratedImage(
  @Res() res: Response,
  @Param('fileName') fileName:string,
) {
  const filePath = await this.gptService.getGeneratedImage( fileName );

  res.sendFile( filePath );
}

@Post('image-variation')
async imageVariation( 
   @Body() imageVariation: ImageVariationDto
) {
return await this.gptService.generateImageVariation( imageVariation )
}







}
