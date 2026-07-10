import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Ortak şema: her proje "Problem -> Yaklaşım -> Sonuç -> Çıkarım" akışıyla anlatılır
// (MIT CommLab'ın mühendislik portföyleri için önerdiği çerçeve).
const projectSchema = z.object({
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  cover: z.string().optional(), // kart/hero'da görünen ana görsel
  gallery: z.array(z.string()).default([]), // CAD render'ları, build fotoğrafları, vb. çoklu görsel
  video: z.string().url().optional(), // YouTube/Vimeo embed linki (örn. roket fırlatma videosu)
  cadEmbed: z.string().url().optional(), // Onshape/Fusion360 "public share" linki -> iframe olarak gömülür
  credit: z.string().optional(), // ör. "Mentored by [isim], MIT Mechanical Engineering"
  tags: z.array(z.string()).default([]),
  problem: z.string(),
  approach: z.string(),
  result: z.string(),
  lesson: z.string(),
  github: z.string().url().optional(),
  cad: z.string().url().optional(),
  demo: z.string().url().optional(),
  draft: z.boolean().default(false),
});

const makeCollection = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${dir}` }),
    schema: projectSchema,
  });

// Kategoriler öğrencinin gerçek çalışmalarına ve CV'sine göre kuruldu.
// Yeni bir kategori eklemek istersen: (1) burada bir satır ekle,
// (2) src/data/collections.ts'e görüntüleme bilgisini ekle,
// (3) src/content/ altında aynı isimde bir klasör aç.
export const collections = {
  research: makeCollection('research'),
  'frc-robotics': makeCollection('frc-robotics'),
  'cad-design': makeCollection('cad-design'),
  'rocket-design': makeCollection('rocket-design'),
  'stem-outreach': makeCollection('stem-outreach'),
};

