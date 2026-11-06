# HueArt — Nhiếp ảnh Nghệ thuật Đặng Huy Trứ

Cửa hàng ảnh Việt / Anh / Pháp, đặt hàng trực tiếp, gửi tác phẩm và trang quản lý `/admin`. Mỗi ảnh có ba lựa chọn: file + thỏa thuận chuyển quyền tác giả 10 USD, file lớn 5 USD, bản in 40 × 60 cm có khung 7 USD (vận chuyển báo riêng).

## Deploy từ GitHub lên Vercel

Repo có sẵn `vercel.json` và API Node tại `api/backend.ts`. Không chỉ deploy trang tĩnh: API Vercel kết nối backend đang lưu đơn và ảnh trên Sites (Cloudflare D1/R2). Cách này giữ nguyên dữ liệu và ảnh đã duyệt. Backend Sites phải tiếp tục hoạt động.

1. Import repo vào project Vercel; dùng Node.js 24, không đặt Root Directory thành `src`.
2. Giữ các lệnh trong `vercel.json`: `npm ci`, `npm run build:vercel`, output `dist`.
3. Cấu hình ba biến **chỉ phía máy chủ**, cho cả Production và Preview:

| Biến | Nội dung |
| --- | --- |
| `HUEART_BACKEND_URL` | Origin HTTPS của backend Sites, không có đường dẫn phụ. |
| `HUEART_BACKEND_SERVICE_TOKEN` | Credential service-access do Sites cấp cho backend riêng tư. |
| `HUEART_BACKEND_BRIDGE_TOKEN` | Khóa server-to-server khớp `VERCEL_BRIDGE_TOKEN` trong backend Sites. |

Không thêm tiền tố `VITE_` cho các credential này. Không đưa credential hoặc mật khẩu vào GitHub. Không ghi đè các biến đăng nhập backend bằng giá trị mẫu.

Có thể thêm `HUEART_PUBLIC_HOSTS` để giới hạn API vào danh sách hostname được chỉ định, phân cách bằng dấu phẩy, không có `https://`. Nếu không đặt biến này, API hoạt động trên các domain được gán cho project Vercel.

4. Deploy, rồi kiểm tra:
   - `/api/health`: JSON `ok: true`, `database: true`, `uploads: true`.
   - `/admin`: form đăng nhập, không chuyển về cửa hàng.
   - Đăng nhập đúng → xem được đơn và tác phẩm. Sai mật khẩu → bị từ chối.
   - Đăng xuất → các API quản trị bị từ chối.
   - Tác phẩm “Đã chấp nhận” xuất hiện trong cửa hàng và đặt mua được.

Trên Vercel, admin dùng username/mật khẩu đã cấu hình tại backend. Trên Sites, trang admin vẫn yêu cầu cả danh tính chủ Site và mật khẩu. Cookie phiên là HttpOnly/Secure; phiên chỉ được lưu dạng băm ở máy chủ.

Ảnh gửi mới từ Vercel giới hạn **3 MB** để phù hợp giới hạn request của Vercel Functions. Bản Sites nhận tối đa 8 MB. Ảnh đã lưu được đọc trực tiếp từ kho R2 qua API có kiểm tra trạng thái duyệt. Các API được stream, không lưu đơn hay ảnh trong filesystem tạm của Vercel.

## Phát triển và kiểm tra

```sh
npm ci
npm run check
npm test
npm run build:vercel
```

`npm test` kiểm tra backend SQLite, phiên đăng nhập, duyệt / xuất bản tác phẩm, ba lựa chọn mua, ngôn ngữ và kết nối API Vercel → backend. Test dùng dữ liệu giả cục bộ; không gửi đơn thật hoặc dùng credential production.

`npm run dev` chạy giao diện Vite. Để thử API Vercel cục bộ, dùng môi trường Vercel với các biến trên; không dùng SQLite trong `/tmp` làm cơ sở dữ liệu production.

## Backend và quản trị

- `server/worker.ts`: API chạy trên Sites / Cloudflare Workers.
- `server/vercelProxy.ts`: cầu nối API chỉ chạy phía máy chủ Vercel, kiểm tra Origin và chỉ cho phép các đường dẫn HueArt.
- `server/adminAuth.ts`: kiểm tra mật khẩu PBKDF2, phiên, giới hạn đăng nhập sai.
- `db/schema.ts`, `drizzle/`: schema và migrations D1. Không sửa migration đã áp dụng.
- `src/shop/`: cửa hàng, gửi tác phẩm và quản lý đơn.

Backend hiện có được triển khai bằng workflow Sites, không bằng `vercel deploy`. `npm run build:hosted` tạo artifact Worker riêng. Mật khẩu và credential lưu trong biến bí mật của hosting, không nằm trong mã giao diện.

Xem [chi tiết quản lý đơn](docs-order-management.md). Website chưa có cổng thanh toán tự động; quản trị viên xác nhận tiền và giao ảnh sau khi liên hệ khách.

GitHub Actions còn đóng gói API bằng builder Vercel chính thức và chạy thử function sau biên dịch để phát hiện lỗi import chỉ xuất hiện trong môi trường serverless.
