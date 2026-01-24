import AddToCart from '@/components/shared/product/add-to-cart'
import { Card, CardContent } from '@/components/ui/card'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'

import ReviewList from './review-list'
import { generateId, round2 } from '@/lib/utils'
import SelectVariant from '@/components/shared/product/select-variant'
import ProductPrice from '@/components/shared/product/product-price'
import ProductGallery from '@/components/shared/product/product-gallery'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import { Separator } from '@/components/ui/separator'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import RatingSummary from '@/components/shared/product/rating-summary'
import ProductSlider from '@/components/shared/product/product-slider'
import { useTranslations } from 'next-intl'

interface ProductPageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export default async function ProductDetails({ params, searchParams }: ProductPageProps) {
  const { slug } = params
  const page = Number(searchParams.page || '1')

  const t = useTranslations()
  const product = await getProductBySlug(slug)

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product.id,
    page,
  })

  // Préparer les images pour la galerie
  const images = [
    product.image_path,
    product.image_2,
    product.image_3,
    product.image_4,
  ].filter(Boolean) as string[]

  return (
    <div>
      <AddToBrowsingHistory id={product.id} category={product.category || ''} />

      <section>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
          {/* Galerie */}
          <div className='col-span-2'>
            <ProductGallery images={images} />
          </div>

          {/* Détails du produit */}
          <div className='flex w-full flex-col gap-4 md:p-5 col-span-2'>
            <h1 className='font-bold text-lg lg:text-xl'>{product.name}</h1>

            <RatingSummary
              avgRating={product.avgRating || 0}
              numReviews={product.numReviews || 0}
              ratingDistribution={product.ratingDistribution || []}
            />

            <Separator className='my-2' />

            <div className='flex flex-col gap-3'>
              <ProductPrice
                price={product.price || 0}
                listPrice={product.listPrice || 0}
                forListing={false}
              />
            </div>

            <SelectVariant product={product} color={''} size={''} />

            <Separator className='my-2' />

            <div className='flex flex-col gap-2'>
              <p className='font-bold'>{t('Product.Description')}:</p>
              <p>{product.description}</p>
            </div>
          </div>

          {/* Ajouter au panier */}
          <div>
            <Card>
              <CardContent className='p-4 flex flex-col gap-4'>
                <ProductPrice price={product.price || 0} />

                {product.countInStock && product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className='text-destructive font-bold'>
                    {t('Product.Only X left in stock - order soon', {
                      count: product.countInStock,
                    })}
                  </div>
                )}

                {product.countInStock && product.countInStock > 0 ? (
                  <div className='text-green-700 text-xl'>{t('Product.In Stock')}</div>
                ) : (
                  <div className='text-destructive text-xl'>{t('Product.Out of Stock')}</div>
                )}

                {product.countInStock && product.countInStock > 0 && (
                  <AddToCart
                    item={{
                      clientId: generateId(),
                      product: product.id,
                      countInStock: product.countInStock,
                      name: product.name,
                      slug: product.slug || '',
                      category: product.category || '',
                      price: round2(product.price || 0),
                      quantity: 1,
                      image: images[0] || '',
                      size: undefined,
                      color: undefined,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className='mt-10' id='reviews'>
        <h2 className='text-xl font-bold mb-2'>{t('Product.Customer Reviews')}</h2>
        <ReviewList product={product} userId={undefined} />
      </section>

      {/* Related products */}
      <section className='mt-10'>
        <ProductSlider
          products={relatedProducts.data}
          title={t('Product.Best Sellers in', { name: product.category || '' })}
        />
      </section>

      {/* Browsing history */}
      <section>
        <BrowsingHistoryList className='mt-10' />
      </section>
    </div>
  )
}
