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

  async handleConnection(client: Socket, payload: string) {
    const { sockets } = this.server.sockets;

    this.logger.log(`Cliente id: ${client.id} conectado! Eba!`);
    this.logger.debug(`Número de clientes conectados: ${sockets.size}`);

    try {
      const user = await this.authService.getUserFromAuthenticationToken(
        client.handshake.auth.Authorization,
      );

      if (!user) {
        client.emit('errorMessage', 'Usuário não autenticado.');
        throw new WsException('Falha na autenticação.');
      }

      await this.prisma.message.create({
        data: {
          content: payload,
          senderId: user.id,
        },
      });
    } catch {
      console.log('disconnect user');
      return this.handleDisconnect(client);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente id: ${client.id} desconectado.`);
    client.disconnect();
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, messageContent: string) {
    this.server.emit('allMessages', 'teste');
    try {
      const user = await this.authService.getUserFromAuthenticationToken(
        client.handshake.auth.Authorization,
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
      client.emit('messages', message);
    } catch {
      console.log('disconnect user');
      return this.handleDisconnect(client);
    }
    // const messages = await this.prisma.message.findMany({
    //   orderBy: { createdAt: 'asc' },
    // });
  }

  @SubscribeMessage('allMessages')
  async handleAllMessages() {
    const messages = await this.prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
    });
    this.server.emit('allMessages', messages);
  }
}
