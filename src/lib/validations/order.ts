import { z } from "zod";

export const createOrderSchema = z.object({
  deliveryType: z.enum(["delivery", "pickup", "express"]).default("delivery"),
  deliveryAddress: z
    .object({
      street: z.string(),
      district: z.string().optional(),
      city: z.string().default("Luanda"),
      province: z.string().default("Luanda"),
      country: z.string().default("AO"),
      notes: z.string().optional(),
    })
    .optional(),
  deliveryZoneId: z.string().uuid().optional(),
  deliverySlotId: z.string().uuid().optional(),
  scheduledDate: z.string().optional(), // ISO date string
  paymentMethod: z.enum([
    "multicaixa_express",
    "multicaixa_reference",
    "bank_transfer",
    "cash_on_delivery",
    "visa_mastercard",
    "paypal",
    "crypto",
    "store_credit",
  ]),
  customerNotes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        preparation: z.string().optional(),
        substitutionPolicy: z.enum(["contact", "similar", "cancel"]).optional(),
        customerNote: z.string().max(300).optional(),
      })
    )
    .min(1, "Deve adicionar pelo menos um produto"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "draft",
    "pending",
    "paid",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  note: z.string().optional(),
  courierId: z.string().uuid().optional(),
  cancelReason: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
