import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'

// Common
const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB ID' })

const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 49.99)`
    )

export const ReviewInputSchema = z.object({
  productId: z.number(),                // remplace `product`
  userId: z.string(),                   // remplace `user`
  isVerifiedPurchase: z.boolean(),
  title: z.string().min(1, 'Title is required'),
  comment: z.string().min(1, 'Comment is required'),
  rating: z
    .coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
})

export const ProductInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  image_path: z.string().optional(),
  image_2: z.string().optional(),
  image_3: z.string().optional(),
  image_4: z.string().optional(),
  additional_info: z.string().optional(),
  active: z.boolean().optional(),
})

export const ProductUpdateSchema = ProductInputSchema.extend({
  _id: z.string(),
})

// Order Item
export const OrderItemSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),
  product: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z
    .number()
    .int()
    .nonnegative('Quantity must be a non-negative number'),
  countInStock: z
    .number()
    .int()
    .nonnegative('Quantity must be a non-negative number'),
  image: z.string().min(1, 'Image is required'),
  price: Price('Price'),
  size: z.string().optional(),
  color: z.string().optional(),
})
export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  street: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  province: z.string().min(1, 'Province is required'),
  phone: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
})

// Order
export const OrderInputSchema = z.object({
  user: z.union([
    MongoId,
    z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  ]),
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentResult: z
    .object({
      id: z.string(),
      status: z.string(),
      email_address: z.string(),
      pricePaid: z.string(),
    })
    .optional(),
  itemsPrice: Price('Items price'),
  shippingPrice: Price('Shipping price'),
  taxPrice: Price('Tax price'),
  totalPrice: Price('Total price'),
  expectedDeliveryDate: z
    .date()
    .refine(
      (value) => value > new Date(),
      'Expected delivery date must be in the future'
    ),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional(),
  isPaid: z.boolean().default(false),
  paidAt: z.date().optional(),
})
// Cart

export const CartSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  shippingPrice: z.optional(z.number()),
  totalPrice: z.number(),
  paymentMethod: z.optional(z.string()),
  shippingAddress: z.optional(ShippingAddressSchema),
  deliveryDateIndex: z.optional(z.number()),
  expectedDeliveryDate: z.optional(z.date()),
})

// USER
const UserName = z
  .string()
  .min(2, { message: 'Username must be at least 2 characters' })
  .max(50, { message: 'Username must be at most 30 characters' })
const Email = z.string().min(1, 'Email is required').email('Email is invalid')
const Password = z.string().min(3, 'Password must be at least 3 characters')
const UserRole = z.string().min(1, 'role is required')

export const UserUpdateSchema = z.object({
  _id: z.string(),
  name: UserName,
  email: Email,
  role: UserRole,
  password: z.string().optional(),
})

export const UserInputSchema = z.object({
  name: UserName,
  email: Email,
  image: z.string().optional(),
  emailVerified: z.boolean(),
  role: UserRole,
  password: Password,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  address: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().min(1, 'Phone number is required'),
  }),
})

export const UserSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export const UserSignUpSchema = UserSignInSchema.extend({
  name: UserName,
  confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
export const UserNameSchema = z.object({
  name: UserName,
})

// WEBPAGE
export const WebPageInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  content: z.string().min(1, 'Content is required'),
  isPublished: z.boolean(),
})

export const WebPageUpdateSchema = WebPageInputSchema.extend({
  _id: z.string(),
})

// Setting

export const SiteLanguageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
})
export const CarouselSchema = z.object({
  id: z.number().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  button_text: z.string().optional(),
  button_url: z.string().optional(),
  image_path: z.string(),        // Obligatoire pour l'image
  position: z.number().optional(),
  active: z.boolean().optional(),
})

export const SiteCurrencySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  convertRate: z.coerce.number().min(0, 'Convert rate must be at least 0'),
  symbol: z.string().min(1, 'Symbol is required'),
})

export const PaymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  commission: z.coerce.number().min(0, 'Commission must be at least 0'),
})

export const DeliveryDateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  daysToDeliver: z.number().min(0, 'Days to deliver must be at least 0'),
  shippingPrice: z.coerce.number().min(0, 'Shipping price must be at least 0'),
  freeShippingMinPrice: z.coerce
    .number()
    .min(0, 'Free shipping min amount must be at least 0'),
})

export const SettingInputSchema = z.object({
  // PROMPT: create fields
  // codeium, based on the mongoose schema for settings
  common: z.object({
    isMaintenanceMode: z.boolean().default(false),
    maintenanceMessage: z.string(),
    defaultTheme: z
      .string()
      .default('dark'),
    defaultColor: z
      .string()
      .default('gold'),
  }),
  site: z.object({
    name: z.string().min(1, 'Name is required'),
    logo: z.string().min(1, 'logo is required'),
    slogan: z.string(),
    favicon: z.string(),
    description: z.string(),
    keywords: z.string(),
    url: z.string(),
    email: z.string(),
    phone: z.string(),
    author: z.string(),
    copyright: z.string(),
    address: z.string(),
  }),
  availableLanguages: z
    .array(SiteLanguageSchema),
  carousels: z
    .array(CarouselSchema),
  defaultLanguage: z.string(),
})


// RECIPE
export const RecipeInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  short_description: z.string().min(1, 'A short description is required'),
  status: z.string(),
  is_active: z.boolean(),
  category_id: z.number().optional(),
  paragraph_1: z.string(),
  paragraph_2: z.string(),
  image_url: z.string(),
  image: z.string().optional(),
  isPublished: z.boolean().default(false),
})

export const RecipeUpdateSchema = RecipeInputSchema.extend({
  _id: z.string(),
})


// BLOG
export const BlogInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  short_description: z.string().min(3, 'Short must be at least 3 characters'),
  category: z.string(),
  category_id: z.number().optional().nullable(),
  tag_ids: z.array(z.number()).optional(),
  image_url: z.string(),
  status: z.string(),
  full_content: z.string(),
  paragraph_1: z.string(),
  paragraph_2: z.string(),
  author_bio: z.string(),
  featured: z.boolean(),
  single_image_xl: z.string(),
  isPublished: z.boolean().default(false),

})

export const BlogUpdateSchema = BlogInputSchema.extend({
  _id: z.string(),
})

