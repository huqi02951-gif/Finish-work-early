import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MarketListingStatus, PantryIdentityStatus, UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PantryService } from './pantry.service';

@UseGuards(AuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get('feed')
  getFeed(@Req() req) {
    return this.pantryService.getFeed(req.user.sub);
  }

  @Post('posts')
  createPost(@Req() req, @Body() body: any) {
    return this.pantryService.createPost(req.user.sub, body);
  }

  @Get('posts/:id')
  getPost(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.pantryService.getPostDetail(req.user.sub, id);
  }

  @Post('posts/:id/comments')
  createComment(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { content?: string }) {
    return this.pantryService.createComment(req.user.sub, id, body.content || '');
  }

  @Get('posts/:id/comments')
  listComments(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.pantryService.listComments(req.user.sub, id);
  }

  @Post('posts/:id/reactions')
  react(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { type?: string }) {
    return this.pantryService.react(req.user.sub, id, body.type || 'EYES');
  }

  @Post('posts/:id/bookmarks')
  bookmark(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.pantryService.bookmark(req.user.sub, id);
  }

  @Patch('me/coffee')
  updateCoffeeProfile(
    @Req() req,
    @Body() body: { coffeeQrUrl?: string; coffeeNote?: string; coffeePublic?: boolean },
  ) {
    return this.pantryService.updateCoffeeProfile(req.user.sub, body);
  }

  @Post('reports')
  report(@Req() req, @Body() body: any) {
    return this.pantryService.report(req.user.sub, body);
  }

  @Get('listings')
  listListings(@Req() req) {
    return this.pantryService.listListings(req.user.sub);
  }

  @Post('listings')
  createListing(@Req() req, @Body() body: any) {
    return this.pantryService.createListing(req.user.sub, body);
  }

  @Post('listings/:id/orders')
  createOrder(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { note?: string }) {
    return this.pantryService.createOrder(req.user.sub, id, body.note);
  }

  @Get('orders/me')
  listMyOrders(@Req() req, @Query('status') status?: string, @Query('take') take?: string) {
    return this.pantryService.listMyOrders(req.user.sub, { status, take: take ? Number(take) : undefined });
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.pantryService.updateOrderStatus(req.user.sub, id, body);
  }

  @Get('notifications')
  listNotifications(@Req() req, @Query('take') take?: string) {
    return this.pantryService.listNotifications(req.user.sub, take ? Number(take) : undefined);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.pantryService.markNotificationRead(req.user.sub, id);
  }

  @Get('conversations')
  listConversations(@Req() req) {
    return this.pantryService.listConversations(req.user.sub);
  }

  @Post('conversations')
  createConversation(@Req() req, @Body() body: any) {
    return this.pantryService.createConversation(req.user.sub, body);
  }

  @Get('conversations/:id/messages')
  getMessages(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.pantryService.getConversationMessages(req.user.sub, id);
  }

  @Post('conversations/:id/messages')
  sendMessage(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { content?: string }) {
    return this.pantryService.sendMessage(req.user.sub, id, body.content || '');
  }
}

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
@Controller('pantry/admin')
export class PantryAdminController {
  constructor(private readonly pantryService: PantryService) {}

  @Get('reports')
  listReports() {
    return this.pantryService.listReports();
  }

  @Patch('reports/:id')
  resolveReport(@Param('id', ParseIntPipe) id: number, @Body() body: { status?: 'RESOLVED' | 'REJECTED' | 'REVIEWING' }) {
    return this.pantryService.resolveReport(id, body.status || 'REVIEWING');
  }

  @Patch('listings/:id/status')
  setListingStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status?: MarketListingStatus }) {
    return this.pantryService.setListingStatus(id, body.status || MarketListingStatus.HIDDEN);
  }

  @Patch('identities/:id/status')
  setIdentityStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status?: PantryIdentityStatus; mutedUntil?: string },
  ) {
    return this.pantryService.setIdentityStatus(id, body.status || PantryIdentityStatus.MUTED, body.mutedUntil);
  }
}
