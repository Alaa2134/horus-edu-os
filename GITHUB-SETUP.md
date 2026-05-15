# 🚀 رفع المشروع على GitHub وبناء الـ ISO تلقائياً

## الخطوة ١ — إنشاء Repository على GitHub

1. افتح [github.com/new](https://github.com/new)
2. اسم الـ repo: `horus-edu-os`
3. اجعله **Public** (علشان GitHub Actions مجاني)
4. اضغط **Create repository**

---

## الخطوة ٢ — رفع الملفات

افتح PowerShell في مجلد `os horus` ونفّذ:

```powershell
cd "c:\Users\ELSAKA\os horus"

git init
git add .
git commit -m "Initial commit: Horus Edu OS v1.0.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/horus-edu-os.git
git push -u origin main
```

> استبدل `YOUR_USERNAME` باسم حسابك على GitHub

---

## الخطوة ٣ — بناء الـ ISO (تلقائي)

بعد الرفع، لبناء الـ ISO ونشره كـ Release:

```powershell
# أنشئ tag جديد
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions سيشتغل تلقائياً على Ubuntu 22.04 ويبني الـ ISO (~45-90 دقيقة) ويرفعه في صفحة الـ Releases.

---

## الخطوة ٤ — تحميل الـ ISO

بعد اكتمال البناء:
- افتح: `https://github.com/YOUR_USERNAME/horus-edu-os/releases/latest`
- حمّل `horus-edu-os-1.0.0-amd64.iso` (~2-3 GB الحقيقي!)

---

## بدائل للاختبار الآن (بدون انتظار)

### WSL2 على Windows (أسرع طريقة):
```powershell
# PowerShell كـ Administrator
.\scripts\wsl-quickstart.ps1
```
يشغّل كل التطبيقات على `localhost:9100` و `localhost:9101` مباشرة.

### VMware (بعد بناء الـ ISO):
1. حمّل الـ ISO من GitHub Releases
2. افتح `vmware/horus-edu-os.vmx` في VMware
3. ضع الـ ISO في نفس المجلد
4. Power On

---

## متابعة البناء

- **Actions tab** في GitHub: `https://github.com/YOUR_USERNAME/horus-edu-os/actions`
- كل push لـ tag `v*` يبني release جديد تلقائياً
- Run manually: Actions → Build & Release → Run workflow
