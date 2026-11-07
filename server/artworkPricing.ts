import {SALE_OPTIONS} from '../src/shop/catalog';
import {ApiError} from './orders';
export function validateArtworkPrices(value:unknown):Record<string,number>{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new ApiError(400,'Giá tác phẩm không hợp lệ.');
 const result:Record<string,number>={};
 for(const [id,amount] of Object.entries(value)){
  if(!SALE_OPTIONS.some(option=>option.id===id)||typeof amount!=='number'||!Number.isInteger(amount)||amount<1||amount>1000000)throw new ApiError(400,'Giá USD phải từ 0,01 đến 10.000, tối đa 2 chữ số thập phân.');
  result[id]=amount;
 }
 if(!SALE_OPTIONS.every(option=>Object.hasOwn(result,option.id)))throw new ApiError(400,'Vui lòng nhập đủ giá cho cả ba loại mua.');
 return result;
}
export function storedArtworkPrices(row:any):Record<string,number>{
 const admin=JSON.parse(row.admin_pricing_json||'{}');
 return Object.keys(admin).length?admin:JSON.parse(row.pricing_json||'{}');
}
