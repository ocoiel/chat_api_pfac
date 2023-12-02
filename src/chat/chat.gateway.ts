import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  allowEIO3: true,
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer() server: Server;

  afterInit() {
    this.logger.log('Inicializando websocket...');
  }

  async handleConnection(client: Socket) {
    console.log('token', client.handshake.headers.authorization.split(' ')[1]);
    this.logger.log(`Cliente id: ${client.id} conectado! Eba!`);

    const user = await this.authService.getUserFromAuthenticationToken(
      client.handshake.headers.authorization.split(' ')[1],
    );

    if (!user) {
      client.emit('errorMessage', 'Usuário não autenticado.');
      throw new WsException('Falha na autenticação.');
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente id: ${client.id} desconectado.`);
    client.disconnect();
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, messageContent: string) {
    const user = await this.authService.getUserFromAuthenticationToken(
      client.handshake.headers.authorization.split(' ')[1],
    );

    if (!user) {
      client.emit('errorMessage', 'Usuário não autenticado.');
      throw new WsException('Falha na autenticação.');
    }

    const message = await this.prisma.message.create({
      data: {
        content: messageContent,
        senderId: user.id,
      },
    });
    console.log('message', message);
    client.emit('message', message);
  }

  @SubscribeMessage('allMessages')
  async handleAllMessages() {
    const messages = await this.prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
    });
    this.server.emit('allMessages', messages);
  }
}
