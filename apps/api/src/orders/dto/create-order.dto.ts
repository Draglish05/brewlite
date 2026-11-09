import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SIZES, TOPPINGS } from '../pricing';

export class OrderItemDto {
  @IsInt({ message: 'Mã sản phẩm không hợp lệ' })
  productId: number;

  @IsIn(SIZES, { message: 'Size không hợp lệ' })
  size: string;

  @IsArray()
  @IsIn(TOPPINGS, { each: true, message: 'Topping không hợp lệ' })
  toppings: string[];

  @IsInt()
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(20, { message: 'Số lượng tối đa là 20' })
  qty: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Giỏ hàng đang trống' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;
}
