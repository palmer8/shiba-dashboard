type PaymentDto = {
  items: Payment[];
  total: number;
  page: number;
  totalPages: number;
};

type Payment = {
  id: string;
  transid: string;
  price: string;
  email: string;
  ip: string;
  packagename: string;
  date: Date;
};

export type { Payment, PaymentDto };
