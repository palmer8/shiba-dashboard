type PaymentFilter = {
  page?: number;
  ip?: string;
  email?: string;
  price?: number;
  date?: [Date, Date];
};

export type { PaymentFilter };
