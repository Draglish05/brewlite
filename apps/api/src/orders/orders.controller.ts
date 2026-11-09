import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Req() req: { user: { userId: number } },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.userId, dto);
  }

  // Phải đặt trước ':id', nếu không "me" bị hiểu là một id
  @Get('me')
  findMine(@Req() req: { user: { userId: number } }) {
    return this.ordersService.findMine(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Req() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(req.user.userId, id);
  }
}
