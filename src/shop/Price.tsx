import {createContext,useContext} from 'react';
import {useShopLanguage} from './language';
import {money} from './ordersApi';
import {DEFAULT_EXCHANGE_RATE,toVnd,vnd} from './paymentTypes';
export const RateContext=createContext(DEFAULT_EXCHANGE_RATE);
export default function Price({cents,rate}:{cents:number;rate?:number}){
 const defaultRate=useContext(RateContext),{language}=useShopLanguage();
 return <span className="shop-dual-price"><span>{money(cents,language)}</span><small>~ {vnd(toVnd(cents,rate??defaultRate))}</small></span>;
}
