import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://admin.avanticameroun.cm',
      lastModified: new Date(),
    }
  ]
}
