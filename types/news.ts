export interface NewsItem {
  id: string
  title: string
  description: string
  content?: string // HTML content from uploaded file - can contain images, videos, lists, links in any order
  fullDescription?: string
  image?: string
  video?: string
  createdAt: string
  author?: string
  category?: string
}


