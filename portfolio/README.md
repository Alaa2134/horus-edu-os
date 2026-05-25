# 3laa.site — Alaa Saber Portfolio

بورتفوليو شخصي ثنائي اللغة (عربي/إنجليزي) لـ **علاء صابر**، مطوّر لغات البرمجة
وصانع **masrylang** و**لغة البرمجة بالعربي**.

A bilingual (Arabic/English) personal portfolio. Pure HTML/CSS/JS — no build step.

## التشغيل محلياً / Run locally

```bash
cd portfolio
python3 -m http.server 8080
# افتح / open http://localhost:8080
```

## الملفات / Structure

```
portfolio/
├── index.html        # الصفحة الكاملة
├── css/style.css     # التصميم الداكن + النيون
├── js/script.js      # تبديل اللغة، القائمة، الأنيميشن، الفورم
├── assets/
│   ├── favicon.svg
│   └── profile.jpg   # ⚠️ ضع صورتك هنا (انظر بالأسفل)
├── netlify.toml      # نشر Netlify
├── vercel.json       # نشر Vercel
└── CNAME             # دومين GitHub Pages: 3laa.site
```

## ⚠️ مهم: أضف صورتك / Add your photo

ضع صورتك الشخصية باسم **`assets/profile.jpg`**. لو الملف مش موجود، الموقع
بيعرض دائرة فيها الحروف الأولى (AS) تلقائياً.

Place your photo at `assets/profile.jpg`. If missing, an initials avatar shows automatically.

## ✍️ التعديلات المطلوبة منك / Things to update

- **LinkedIn**: في `index.html` غيّر `https://www.linkedin.com/in/alaa-saber` لرابطك الصحيح.
- **فورم التواصل / Contact form**: حالياً لو مفيش endpoint، الفورم بيفتح برنامج
  الإيميل تلقائياً. لتفعيل الإرسال المباشر:
  1. سجّل مجاناً على [formspree.io](https://formspree.io).
  2. خد الـ form ID وحُط مكان `your-id` في `action="https://formspree.io/f/your-id"` داخل `index.html`.

## النشر على دومين 3laa.site / Deploy

اختر أي طريقة:

- **Netlify**: اربط الريبو، اضبط *publish directory* = `portfolio`، ثم أضف الدومين `3laa.site`.
- **Vercel**: استورد الريبو، اضبط *root directory* = `portfolio`، ثم أضف الدومين.
- **GitHub Pages**: فعّل Pages على الفرع، واستخدم ملف `CNAME` الموجود (3laa.site).

في كل الحالات: عند مزوّد الدومين، وجّه `A`/`CNAME` records حسب تعليمات المنصة.
