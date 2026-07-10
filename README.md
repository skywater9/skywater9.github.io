# Mühendislik Portföyü — Kullanım Kılavuzu

## İlk kurulum (tek seferlik, danışman tarafından yapılır)

1. Bu klasörü `kullaniciadi.github.io` adında yeni bir GitHub reposuna push et.
2. Repo → **Settings → Pages** → "Build and deployment" → Source: **GitHub Actions** seç.
3. `astro.config.mjs` içindeki `site:` alanını gerçek adresle güncelle.
4. `main` dalına ilk push'tan sonra **Actions** sekmesinde workflow'un yeşile döndüğünü
   kontrol et — site birkaç dakika içinde `https://kullaniciadi.github.io` adresinde yayında olur.

Bundan sonrası öğrencinin kendi başına yapabileceği kısım 👇

Bu site [Astro](https://astro.build) ile yapıldı ve GitHub Pages'te barındırılıyor.
**Aylık hiçbir ücret yok.** `main` dalına her `git push` yaptığında site birkaç dakika
içinde otomatik olarak güncelleniyor — elle bir "yayınlama" adımı yok.

## Yeni bir proje nasıl eklenir?

1. `src/content/` altında ilgili klasörü bul (örn. `frc-design`).
2. O klasöre yeni bir `.md` dosyası ekle (dosya adı Türkçe karakter/boşluk içermesin,
   örn. `2026-yeni-mekanizma.md`).
3. Dosyanın en üstüne, `ornek-*.md` dosyalarındaki gibi bir "frontmatter" bloğu yaz:

   ```md
   ---
   title: "Proje Başlığı"
   summary: "Tek cümlelik kısa özet."
   date: 2026-03-01
   tags: ["FRC", "CAD"]
   problem: "Neyi çözmeye çalıştın?"
   approach: "Nasıl çözdün, hangi araçları kullandın?"
   result: "Ölçülebilir sonuç neydi?"
   lesson: "Ne öğrendin / bir dahaki sefere ne değiştirirdin?"
   github: "https://github.com/kullaniciadi/frc-design"   # opsiyonel
   cad: "https://cad.onshape.com/..."                       # opsiyonel
   demo: "https://..."                                      # opsiyonel
   draft: false
   ---

   Buraya proje hakkında istediğin kadar uzun, serbest metin/görsel ekleyebilirsin.
   ```

4. Örnek (`ornek-*.md`) dosyalarını silmek istersen silebilirsin — onlar sadece
   sitenin boş görünmemesi için konuldu.
5. Değişikliği kaydet:
   ```bash
   git add .
   git commit -m "Yeni proje eklendi: Proje Başlığı"
   git push
   ```
6. GitHub reponun **Actions** sekmesinden build'in bittiğini görebilirsin (~1-2 dakika).
   Bittiğinde site otomatik güncellenmiş olur.

## Görsel eklemek

Görselleri `public/images/` klasörüne koy, sonra frontmatter'da
`cover: "/images/dosya-adi.jpg"` şeklinde referans ver.

## Yerelde önizleme (opsiyonel)

Değişikliği push etmeden önce bilgisayarında görmek istersen:

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:4321` açılır.

## Kategori isimlerini/sırasını değiştirmek

`src/data/collections.ts` dosyasındaki etiket, açıklama ve sıralamayı düzenle.
Yeni bir kategori (7. bir "sheet") eklemek istersen hem bu dosyaya hem de
`src/content.config.ts` içine yeni koleksiyonu eklemen ve
`src/content/` altında aynı isimde bir klasör açman yeterli.
