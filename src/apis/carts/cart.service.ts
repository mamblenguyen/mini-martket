import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { User } from '../auth/UserSchema/user.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: string, productId: string, quantity: number) {
    // Kiểm tra user tồn tại không
    const userExists = await this.userModel.exists({ _id: userId });
    if (!userExists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Kiểm tra product tồn tại không
    const productExists = await this.productModel.exists({ _id: productId });
    if (!productExists) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: new Types.ObjectId(productId), quantity });
    }

    return cart.save();
  }
  // Lấy giỏ hàng của user (populate product info)
  async getCartByUser(userId: string) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product');
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (!item) throw new NotFoundException('Product not found in cart');

    item.quantity = quantity;
    return cart.save();
  }

  // Xóa 1 sản phẩm khỏi giỏ hàng
  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    return cart.save();
  }

  // Xóa toàn bộ giỏ hàng của user (xóa cart)
  async clearCart(userId: string) {
    return this.cartModel.findOneAndDelete({ user: userId });
  }

  async createShippingOrder(): Promise<any> {
    const apiUrl =
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create';

    // const token = '89fa679c-19b4-11ef-8c74-4ad7faca6bdc' ;      // 🔁 Thay bằng token test từ GHN
    // const shopId = '5087025';          // 🔁 Thay bằng Shop ID (số)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: '89fa679c-19b4-11ef-8c74-4ad7faca6bdc',
          ShopId: '5087025',
        },
        body: JSON.stringify({
          payment_type_id: 2,
          note: 'Tintest 123',
          required_note: 'KHONGCHOXEMHANG',
          return_phone: '0332190444',
          return_address: '39 NTT',
          return_district_id: null,
          return_ward_code: '',
          client_order_code: '',
          to_name: 'TinTest124',
          to_phone: '0987654321',
          to_address: '72 Thành Thái, Phường 14, Quận 10, Hồ Chí Minh, Vietnam',
          to_ward_code: '20308',
          to_district_id: 1444,
          cod_amount: 200000,
          content: 'Theo New York Times',
          weight: 200,
          length: 1,
          width: 19,
          height: 10,
          pick_station_id: 1444,
          deliver_station_id: null,
          insurance_value: 100000,
          service_id: 0,
          service_type_id: 2,
          coupon: null,
          pick_shift: [2],
          items: [
            {
              name: 'Áo Polo',
              code: 'Polo123',
              quantity: 1,
              price: 200000,
              length: 12,
              width: 12,
              height: 12,
              weight: 1200,
              category: {
                level1: 'Áo',
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData || 'Shipping error', 500);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Nếu lỗi xảy ra trước khi fetch trả kết quả (ví dụ như lỗi mạng)
      throw new HttpException(error.message || 'Shipping error', 500);
    }
  }
}
