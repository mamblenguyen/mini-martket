import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import QRCode from 'qrcode';
import { generateVietQRImageUrl } from 'src/utils/vietqr.util';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}
  private generateOrderCode(orderType: 'store' | 'delivery'): string {
    const prefix = orderType === 'store' ? 'CH' : 'DH';
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số ngẫu nhiên
    return prefix + randomDigits;
  }

  private async generateUniqueOrderCode(
    orderType: 'store' | 'delivery',
  ): Promise<string> {
    let code: string;
    let exists: any;
    do {
      code = this.generateOrderCode(orderType);
      exists = await this.orderModel.exists({ orderCode: code });
    } while (exists);
    return code;
  }

  async generateQr(createOrderDto: CreateOrderDto) {
    if (
      !createOrderDto.items ||
      !Array.isArray(createOrderDto.items) ||
      createOrderDto.items.length === 0
    ) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    const productIds = createOrderDto.items.map((item) => item.product);

    // Validate product IDs are string and valid ObjectId
    if (
      !productIds.every(
        (id) => typeof id === 'string' && Types.ObjectId.isValid(id),
      )
    ) {
      throw new BadRequestException('Invalid product ID format.');
    }

    const objectIds = productIds.map((id) => new Types.ObjectId(id));
    const foundProducts = await this.productModel.find({
      _id: { $in: objectIds },
    });
    if (foundProducts.length !== productIds.length) {
      throw new BadRequestException('Some products do not exist.');
    }

    const items = createOrderDto.items.map((item) => {
      const product = foundProducts.find(
        (p) => p._id.toString() === item.product,
      );
      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price * item.quantity,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const orderCode = await this.generateUniqueOrderCode(
      createOrderDto.orderType,
    );

    const qrUrl = generateVietQRImageUrl({
      bankId: 'VietinBank',
      accountNumber: '100876574685',
      accountName: 'NGUYEN MINH QUANG',
      amount: totalAmount,
      orderCode,
    });

    return {
      qrCodeUrl: qrUrl,
      paymentInfo: {
        orderCode,
        bankId: 'VCB',
        accountNumber: '0123456789',
        accountName: 'CONG TY TNHH ABC',
        amount: totalAmount,
      },
    };
  }

  async create(createOrderDto: CreateOrderDto, userId: string | null) {
    if (
      createOrderDto.orderType === 'delivery' &&
      (!createOrderDto.shippingAddress ||
        !createOrderDto.shippingAddress.address)
    ) {
      throw new BadRequestException(
        'Shipping address is required for delivery orders.',
      );
    }

    if (
      !createOrderDto.items ||
      !Array.isArray(createOrderDto.items) ||
      createOrderDto.items.length === 0
    ) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    const productIds = createOrderDto.items.map((item) => item.product);

    if (
      !productIds.every(
        (id) => typeof id === 'string' && Types.ObjectId.isValid(id),
      )
    ) {
      throw new BadRequestException('Invalid product ID format.');
    }

    const objectIds = productIds.map((id) => new Types.ObjectId(id));
    const foundProducts = await this.productModel.find({
      _id: { $in: objectIds },
    });

    if (foundProducts.length !== productIds.length) {
      throw new BadRequestException('Some products do not exist.');
    }

    const items = createOrderDto.items.map((item) => {
      const product = foundProducts.find(
        (p) => p._id.toString() === item.product,
      );
      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price * item.quantity,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const orderCode = await this.generateUniqueOrderCode(
      createOrderDto.orderType,
    );

    // let status = 'pending';
    if (
      createOrderDto.orderType === 'store' &&
      createOrderDto.paymentMethod === 'cash'
    ) {
      createOrderDto.status = 'purched';
    }

    const order = new this.orderModel({
      orderType: createOrderDto.orderType,
      shippingAddress: createOrderDto.shippingAddress,
      items,
      totalAmount,
      paymentMethod: createOrderDto.paymentMethod,
      note: createOrderDto.note,
      user: userId,
      status: createOrderDto.status,
      orderCode,
    });

    const savedOrder = await order.save();

    if (createOrderDto.paymentMethod === 'cash') {
      for (const item of items) {
        await this.productModel.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true },
        );
      }
    }

    return savedOrder;
  }

  //  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
  //     const order = await this.orderModel.findById(id);
  //     if (!order) {
  //       throw new NotFoundException('Order not found');
  //     }

  //     order.status = dto.status;
  //     await order.save();

  //     return order;
  //   }

  async findOrders({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) {
    const query: any = {};

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or = [
          { _id: new mongoose.Types.ObjectId(search) },
          { orderCode: { $regex: search, $options: 'i' } },
        ];
      } else {
        query.orderCode = { $regex: search, $options: 'i' };
      }
    }

    const data = await this.orderModel
      .find(query)
      .populate('items.product user')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.orderModel.countDocuments(query);

    return [data, total];
  }

  async findById(id: string): Promise<Order> {
    return this.orderModel.findById(id).populate('items.product user').exec();
  }

  async findByStatus(orderType: string): Promise<Order[]> {
    return this.orderModel
      .find({ orderType })
      .populate('items.product user')
      .exec();
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    return this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async getDailyProductSales(): Promise<any> {
    // Thời gian hôm nay
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Thời gian hôm qua
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // Doanh thu hôm nay
    const todayData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
          status: 'purched',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.price' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          totalQuantity: 1,
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalDailyRevenue: { $sum: '$totalAmount' },
          products: {
            $push: {
              productId: '$productId',
              name: '$name',
              totalQuantity: '$totalQuantity',
              totalAmount: '$totalAmount',
            },
          },
        },
      },
    ]);

    const todayRevenue = todayData[0]?.totalDailyRevenue || 0;

    // Doanh thu hôm qua
    const yesterdayData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
          status: 'purched',
        },
      },

      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$items.price' },
        },
      },
    ]);

    const yesterdayRevenue = yesterdayData[0]?.totalAmount || 0;

    // Tính phần trăm thay đổi và trạng thái
    let percentChange = 0;
    let trend: 'up' | 'down' | 'equal' = 'equal';

    if (yesterdayRevenue === 0 && todayRevenue > 0) {
      percentChange = 100;
      trend = 'up';
    } else if (yesterdayRevenue > 0) {
      percentChange =
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
      trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'equal';
    }

    return {
      totalToday: todayRevenue,
      totalYesterday: yesterdayRevenue,
      percentChange: Math.abs(Math.round(percentChange * 100) / 100), // làm tròn 2 chữ số
      trend,
      products: todayData[0]?.products || [],
    };
  }

  async getProductSalesByDate(date: Date): Promise<any[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0); // Bắt đầu từ đầu ngày

    const end = new Date(date);
    end.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày

    // Tính tổng doanh thu theo từng sản phẩm và tổng doanh thu trong ngày
    const result = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product', // Gộp theo sản phẩm
          totalQuantity: { $sum: '$items.quantity' }, // Tổng số lượng bán
          totalAmount: { $sum: '$items.price' }, // Tổng doanh thu từ sản phẩm
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          totalQuantity: 1,
          totalAmount: 1,
        },
      },
      // Tính tổng doanh thu của cả ngày
      {
        $group: {
          _id: null,
          totalDailyRevenue: { $sum: '$totalAmount' }, // Tổng doanh thu cả ngày
          products: {
            $push: {
              productId: '$productId',
              name: '$name',
              totalQuantity: '$totalQuantity',
              totalAmount: '$totalAmount',
            },
          },
        },
      },
    ]);

    return result;
  }

  async getMonthlyProductSales(): Promise<any> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Lấy thời gian bắt đầu và kết thúc của tháng trước
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    // Doanh thu tháng này
    const thisMonthData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart, $lte: monthEnd },
          status: 'purched',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.price' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          totalQuantity: 1,
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalMonthlyRevenue: { $sum: '$totalAmount' },
          products: {
            $push: {
              productId: '$productId',
              name: '$name',
              totalQuantity: '$totalQuantity',
              totalAmount: '$totalAmount',
            },
          },
        },
      },
    ]);

    const thisMonthRevenue = thisMonthData[0]?.totalMonthlyRevenue || 0;

    // Doanh thu tháng trước
    const lastMonthData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          status: 'purched',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$items.price' },
        },
      },
    ]);

    const lastMonthRevenue = lastMonthData[0]?.totalAmount || 0;

    // Tính phần trăm thay đổi và xu hướng
    let percentChange = 0;
    let trend: 'up' | 'down' | 'equal' = 'equal';

    if (lastMonthRevenue === 0 && thisMonthRevenue > 0) {
      percentChange = 100;
      trend = 'up';
    } else if (lastMonthRevenue > 0) {
      percentChange =
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'equal';
    }

    return {
      totalThisMonth: thisMonthRevenue,
      totalLastMonth: lastMonthRevenue,
      percentChange: Math.abs(Math.round(percentChange * 100) / 100),
      trend,
      products: thisMonthData[0]?.products || [],
    };
  }
  async getMonthlyPurchedStats(): Promise<any> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Tổng số đơn trong tháng
    const totalOrders = await this.orderModel.countDocuments({
      createdAt: { $gte: monthStart, $lte: monthEnd },
    });

    // Tổng số đơn purched trong tháng
    const purchedOrders = await this.orderModel.countDocuments({
      createdAt: { $gte: monthStart, $lte: monthEnd },
      status: 'purched',
    });

    // Doanh thu từ tất cả đơn hàng
    const totalRevenueResult = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalAmount || 0;

    // Doanh thu từ đơn purched
    const purchedRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart, $lte: monthEnd },
          status: 'purched',
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);
    const purchedRevenue = purchedRevenueResult[0]?.totalAmount || 0;

    // Phần trăm đơn purched
    const percentPurchedOrders =
      totalOrders === 0
        ? 0
        : Math.round((purchedOrders / totalOrders) * 10000) / 100;

    // Phần trăm doanh thu từ đơn purched
    const percentPurchedRevenue =
      totalRevenue === 0
        ? 0
        : Math.round((purchedRevenue / totalRevenue) * 10000) / 100;

    return {
      totalOrders,
      purchedOrders,
      percentPurchedOrders, // VD: 25%
      totalRevenue,
      purchedRevenue,
      percentPurchedRevenue, // VD: 30%
    };
  }
async getMonthlyOrderStatusStats(): Promise<any> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const totalOrders = await this.orderModel.countDocuments({
    createdAt: { $gte: monthStart, $lte: monthEnd },
  });

  const statusStats = await this.orderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const allStatuses = [
    'pending',
    'purched',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'completed',
  ];

  // Map status sang title theo mẫu getStatusChip
  const statusTitles: Record<string, string> = {
    pending: 'Đang xử lý',
    purched: 'Đã thanh toán',
    processing: 'Đang xử lý',
    shipped: 'Đã gửi hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
  };

  // Khởi tạo với 0%
  const statusPercentages: Record<
    string,
    { title: string; percent: number }
  > = {};
  for (const status of allStatuses) {
    statusPercentages[status] = {
      title: statusTitles[status] || status,
      percent: 0,
    };
  }

  // Gán phần trăm thực tế
  for (const stat of statusStats) {
    const status = stat._id;
    const count = stat.count;
    const percent =
      totalOrders === 0 ? 0 : Math.round((count / totalOrders) * 10000) / 100;
    if (statusPercentages[status]) {
      statusPercentages[status].percent = percent;
    }
  }

  return {
    totalOrders,
    statusPercentages,
  };
}




  async getProductSalesByMonth(month: number, year: number): Promise<any[]> {
    const start = new Date(year, month - 1, 1); // Bắt đầu từ ngày 1 của tháng
    const end = new Date(year, month, 0, 23, 59, 59, 999); // Kết thúc vào cuối tháng

    const result = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product', // Gộp theo sản phẩm
          totalQuantity: { $sum: '$items.quantity' }, // Tổng số lượng bán
          totalAmount: { $sum: '$items.price' }, // Tổng doanh thu từ sản phẩm
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          totalQuantity: 1,
          totalAmount: 1,
        },
      },
      // Tính tổng doanh thu của cả ngày
      {
        $group: {
          _id: null,
          totalDailyRevenue: { $sum: '$totalAmount' }, // Tổng doanh thu cả ngày
          products: {
            $push: {
              productId: '$productId',
              name: '$name',
              totalQuantity: '$totalQuantity',
              totalAmount: '$totalAmount',
            },
          },
        },
      },
    ]);

    return result;
  }

  async getDailySalesByMonth(month: number, year: number): Promise<any[]> {
    const daysInMonth = new Date(year, month, 0).getDate();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Step 1: Aggregate doanh thu theo ngày
    const dailySales = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$createdAt' } },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Step 2: Tạo mảng tất cả các ngày trong tháng, gán doanh thu hoặc 0
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const salesMap = new Map(
      dailySales.map((item) => [item._id.day, item.totalAmount]),
    );

    const fullResult = daysArray.map((day) => ({
      day,
      totalAmount: salesMap.get(day) || 0,
    }));

    return fullResult;
  }

  // Top product by quanlity và revenue

  async getMonthlyProduct(): Promise<any> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  const topSoldProduct = await this.orderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart, $lte: monthEnd },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: '$product.name',
        totalQuantity: 1,
      },
    },
  ]);

  return {
    topSoldProduct: topSoldProduct[0] || null,
  };
}

}
