export type Category = {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
};

export type Product = {
  id: number;
  category_id: number;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  price: number;
  stock: number;
  specs: Record<string, string>;
  image: string | null;
  devicemart_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  role: "user" | "admin";
};

export type OrderStatus = "pending" | "paid" | "shipping" | "delivered" | "cancelled";

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_no: string;
  user_id: string;
  status: OrderStatus;
  order_name: string;
  total_price: number;
  recipient: string;
  phone: string;
  address: string;
  memo: string | null;
  paid_at: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type Review = {
  id: number;
  product_id: number;
  user_id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
};
