import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @UseGuards(JwtAuthGuard) // nếu cần auth
  @Post('generate-qr')
  async generateQr(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.generateQr(createOrderDto);
  }
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto);
  }

  @Post('create-order-and-generate-qr')
  async createOrderAndGenerateQr(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrderAndGenerateQr(createOrderDto);
  }

  @Get()
  async findOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    const [data, total] = await this.orderService.findOrders({
      page,
      limit,
      search,
    });
    return { data, total };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Get('user/:user')
  async findByUserId(@Param('user') user: string) {
    return this.orderService.findByUserId(user);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Query('status') status: string) {
    return this.orderService.updateStatus(id, status);
  }
  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return await this.orderService.deleteOrder(id);
  }

  @Get('status/:orderType')
  async findByStatus(@Param('orderType') status: string) {
    return this.orderService.findByStatus(status);
  }

  @Get('stats/daily-sales')
  getDailySales() {
    return this.orderService.getDailyProductSales();
  }

  @Get('stats/daily-sales/:date')
  getProductSalesByDate(@Param('date') date: string) {
    const parsedDate = new Date(date); // Đảm bảo rằng `date` là chuỗi hợp lệ như "2025-05-15"
    return this.orderService.getProductSalesByDate(parsedDate);
  }

  @Get('stats/monthly-sales')
  getMonthlySales() {
    return this.orderService.getMonthlyProductSales();
  }

  @Get('stats/monthly-sales/:year/:month')
  getProductSalesByMonth(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.orderService.getProductSalesByMonth(month, year);
  }

  @Get('stats/daily-sales/:year/:month')
  getDailySalesByMonth(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.orderService.getDailySalesByMonth(month, year);
  }

  @Get('stats/monthly-purched')
  getMonthlyPurchedStats() {
    return this.orderService.getMonthlyPurchedStats();
  }

  @Get('stats/monthly-status')
  getMonthlyOrderStatusStats() {
    return this.orderService.getMonthlyOrderStatusStats();
  }

  @Get('stats/monthly-top-product')
  getMonthlyProduct() {
    return this.orderService.getMonthlyProduct();
  }
}
