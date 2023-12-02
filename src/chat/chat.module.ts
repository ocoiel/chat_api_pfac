import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [PrismaModule, AuthModule],
})
export class ChatModule {}
