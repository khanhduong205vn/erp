# ERP

## Mô tả
Đây là dự án ERP gồm hai phần chính:
- **backend/**: Node.js (Express) phục vụ API và quản lý cơ sở dữ liệu.
- **frontend/**: Ứng dụng React sử dụng Vite để xây dựng giao diện người dùng.

## Cấu trúc thư mục
```
backend/
  src/
    routes/
    database.js
    index.js
  package.json
frontend/
  src/
    components/
    pages/
    services/
    ...
  package.json
```

## Hướng dẫn cài đặt

### Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các package:
   ```bash
   npm install
   ```
3. Khởi động server:
   ```bash
   npm start
   ```

### Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các package:
   ```bash
   npm install
   ```
3. Chạy ứng dụng:
   ```bash
   npm run dev
   ```
