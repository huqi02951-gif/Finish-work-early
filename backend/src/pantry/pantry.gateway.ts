import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  namespace: '/pantry',
  pingInterval: 25_000,
  pingTimeout: 20_000,
  cors: {
    origin: '*',
  },
})
export class PantryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (token) {
      void this.authenticate(client, { token });
    }
  }

  handleDisconnect(client: Socket) {
    client.removeAllListeners();
  }

  @SubscribeMessage('auth')
  async authenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { token?: string },
  ) {
    const token = String(body?.token || '').trim();
    if (!token) {
      return { ok: false };
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = Number(payload.sub);
      if (!Number.isFinite(userId)) {
        return { ok: false };
      }
      client.data.userId = userId;
      client.join(this.userRoom(userId));
      client.join('pantry:authed');
      return { ok: true, userId };
    } catch {
      client.disconnect(true);
      return { ok: false };
    }
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId?: number },
  ) {
    const userId = Number(client.data.userId);
    if (!Number.isFinite(userId)) {
      return { ok: false, message: 'unauthorized' };
    }
    const conversationId = Number(body?.conversationId);
    if (!Number.isFinite(conversationId)) {
      return { ok: false };
    }
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      select: { id: true },
    });
    if (!conversation) {
      return { ok: false, message: 'forbidden' };
    }
    client.join(this.conversationRoom(conversationId));
    return { ok: true };
  }

  emitMessage(conversationId: number, participantIds: number[], payload: unknown) {
    this.server.to(this.conversationRoom(conversationId)).emit('message:new', payload);
    participantIds.forEach((userId) => {
      this.server.to(this.userRoom(userId)).emit('conversation:update', payload);
    });
  }

  emitOrder(participantIds: number[], payload: unknown) {
    participantIds.forEach((userId) => {
      this.server.to(this.userRoom(userId)).emit('order:update', payload);
    });
  }

  emitOrderTo(userId: number, payload: unknown) {
    this.server.to(this.userRoom(userId)).emit('order:update', payload);
  }

  emitNotification(userId: number, payload: unknown) {
    this.server.to(this.userRoom(userId)).emit('pantry:notification', payload);
  }

  emitFeed(payload: unknown) {
    this.server.to('pantry:authed').emit('feed:update', payload);
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const bearer = client.handshake.headers.authorization;
    if (typeof authToken === 'string' && authToken.trim()) return authToken.trim();
    if (typeof bearer === 'string' && bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
    return '';
  }

  private userRoom(userId: number) {
    return `user:${userId}`;
  }

  private conversationRoom(conversationId: number) {
    return `conversation:${conversationId}`;
  }
}
