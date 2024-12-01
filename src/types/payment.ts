import { Dto } from "./global-return";

type Payment = {
  id: string;
  transid: string;
  price: string;
  email: string;
  ip: string;
  packagename: string;
  date: Date;
};

type PaymentDto = Dto<Payment>;

export type { Payment, PaymentDto };
