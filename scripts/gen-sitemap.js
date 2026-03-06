import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://cqpcwqqjbcgklrvnqpxr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcGN3cXFqYmNna2xydm5xcHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzE4NDEsImV4cCI6MjA3OTI0Nzg0MX0.klx0G4gOHm_vwxIXBPSOTm-V4ax_v9RSacBpDSP3Mgs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
  console.log('🚀 Generating sitemap.xml...');

  const BASE_URL = 'https://velmo.org';
  const urls = [
    { loc: BASE_URL + '/', priority: '1.0', changefreq: 'daily' }
  ];

  try {
    // 1. Fetch all public shops
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('slug, updated_at')
      .eq('is_public', true)
      .eq('is_active', true);

    if (shopsError) throw shopsError;

    if (shops) {
      console.log(`📦 Found ${shops.length} public shops.`);
      shops.forEach(shop => {
        urls.push({
          loc: `${BASE_URL}/s/${shop.slug}`,
          lastmod: shop.updated_at ? shop.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
          priority: '0.8',
          changefreq: 'weekly'
        });
      });
    }

    // 2. Fetch all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        updated_at,
        shop:shops (
          slug
        )
      `)
      .eq('is_active', true);

    if (productsError) throw productsError;

    if (products) {
      console.log(`🏷️ Found ${products.length} active products.`);
      products.forEach(p => {
        const shopSlug = p.shop?.slug;
        if (shopSlug) {
          urls.push({
            loc: `${BASE_URL}/s/${shopSlug}/p/${p.id}`,
            lastmod: p.updated_at ? p.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            priority: '0.6',
            changefreq: 'monthly'
          });
        }
      });
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const sitemapPath = 'c:/Users/shad/Documents/Vento/packages/vento_website/public/sitemap.xml';
    fs.writeFileSync(sitemapPath, xml);
    console.log(`✅ Sitemap created at: ${sitemapPath}`);
  } catch (err) {
    console.error('💥 Error generating sitemap:', err.message);
  }
}

generateSitemap();
