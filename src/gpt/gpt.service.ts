import { Injectable, NotFoundException } from '@nestjs/common';
import { orthographyCheckUseCase } from './use-cases/orthography.use-cases';
import { AudioToTextDto, ImageGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TranslateDto } from './dtos';
import OpenAI from 'openai';
import { prosConsDiscusserUseCase } from './use-cases/pros-cons-discusser.use-case';
import { prosConsDiscusserStreamUseCase } from './use-cases/pros-cons-stream.use-case';
import { audioToTextUseCase, imageGenerationUseCase, translateUseCase } from './use-cases';
import { TextToAudioDto } from './dtos/text-to-audio.dto';
import { textToAudioUseCase } from './use-cases/text-to-audio.use-case';
import * as path from 'path'
import * as fs from 'fs'
import { imageVariationUseCase } from './use-cases/image-variation.use-case';

@Injectable()
export class GptService {

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    async orthographyCheck(orthographyDto: OrthographyDto){

        return await orthographyCheckUseCase(this.openai, {
             prompt: orthographyDto.prompt });
    }

    async prosConsDiscusser ( { prompt }: ProsConsDiscusserDto) {
        return await prosConsDiscusserUseCase( this.openai, {prompt} );
    }

    async prosConsDiscusserStream ( { prompt }: ProsConsDiscusserDto) {
        return await prosConsDiscusserStreamUseCase( this.openai, {prompt} );
    }

    async translateText ( { prompt, lang }: TranslateDto) {
        return await translateUseCase ( this.openai, {prompt, lang} );
    }

    async textToAudio ( { prompt, voice }: TextToAudioDto) {
        return await textToAudioUseCase ( this.openai, {prompt, voice} );
    }

    async textToAudioGetter( field: string ) {
        const filePath = path.resolve( __dirname, '../../generated/audios/', `${ field }.mp3`); 
        const wasFound = fs.existsSync( filePath );

         if ( !wasFound ) throw new NotFoundException(`El archivo no está, churri :(`)
         return filePath;
    }

    async audioToText(audioFile: Express.Multer.File, audioToTextDto: AudioToTextDto ) {

        const { prompt } = audioToTextDto;

        return await audioToTextUseCase( this.openai, { audioFile, prompt } );
    }

    async imageGeneration(imageGenerationDto: ImageGenerationDto) {

        return imageGenerationUseCase( this.openai, { ...imageGenerationDto } )
    }

    async getGeneratedImage(fileName: string) {

        const filePath = path.resolve(  './', './generated/images/', fileName ); 
        const exists = fs.existsSync( filePath );

        if ( !exists ) throw new NotFoundException(`File ${ fileName } not found`)

        return filePath;

    }

    async generateImageVariation({ baseImage }: ImageVariationDto) {
        return imageVariationUseCase( this.openai, { baseImage });
    }



}
