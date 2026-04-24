# Hướng dẫn Deploy lên Cloudflare Pages

## 1. Chuẩn bị Locally

### Build project
```bash
npm install
npm run build
```

### Test xem build có hoạt động không
```bash
npm run preview
```

## 2. Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 3. Deploy lên Cloudflare Pages

### Option 1: Dùng Cloudflare Dashboard (Dễ nhất)
1. Đi tới [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Chọn **Pages** > **Create a project**
3. Chọn **Connect to Git**
4. Authorize GitHub và chọn repository
5. Config:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### Option 2: Dùng Wrangler CLI

```bash
# Cài Wrangler
npm install -g @cloudflare/wrangler

# Login vào Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist
```

## 4. Kiểm tra CORS

Nếu bạn gặp lỗi CORS, backend cần config:
```
Access-Control-Allow-Origin: https://your-domain.pages.dev
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 5. Environment Variables trên Cloudflare

Nếu backend URL thay đổi, bạn có thể:
1. Vào **Pages** > **Settings** > **Environment variables**
2. Thêm `VITE_API_BASE_URL` = `https://backend-url.com`
3. Redeploy

## File cấu hình
- `.env` - Local development
- `.env.production` - Production
- `vite.config.js` - Build config
- `wrangler.toml` - Cloudflare config
- `public/_redirects` - SPA routing

## Các URL sau khi deploy
- Frontend: `https://your-project-name.pages.dev`
- Backend API: `https://robena-nonapparitional-knox.ngrok-free.dev`

Hãy thử build locally trước, sau đó push lên GitHub và deploy từ Cloudflare!
