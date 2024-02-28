import { Injectable } from '@nestjs/common';
import { orthographyCheckUseCase } from './use-cases/orthography.use-cases';
import { OrthographyDto, ProsConsDiscusserDto } from './dtos';
import OpenAI from 'openai';
import { prosConsDiscusserUseCase } from './use-cases/pros-cons-discusser.use-case';
import { prosConsDiscusserStreamUseCase } from './use-cases/pros-cons-stream.use-case';

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
}
