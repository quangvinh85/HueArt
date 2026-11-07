# Quản lý đơn hàng NHIẾP ẢNH NGHỆ THUẬT HUẾ

- Cửa hàng: `/`
- Quản lý đơn: `/admin` (đăng nhập bằng tài khoản chủ website).
- Khách gửi đơn ngay trên website. Số điện thoại bắt buộc, email không bắt buộc.
- Mỗi đơn được lưu ở D1 và trả về mã `DHT-YYYYMMDD-XXXXXXXX`.
- Máy chủ tính giá: file + bản quyền 10 USD; file lớn 5 USD; bản in 40 × 60 cm có khung 7 USD. Phí vận chuyển chờ người bán báo riêng.
- Quản trị viên tìm/lọc đơn, cập nhật phí vận chuyển, trạng thái đơn, trạng thái thanh toán và ghi chú nội bộ. Lịch sử cập nhật được lưu theo từng đơn.
- Chỉ đánh dấu đã thanh toán sau khi nhận tiền. Hệ thống chưa có cổng thanh toán hay tự gửi email/SMS.
- Website giữ nguyên quyền truy cập Sites hiện có. Nếu Site đang riêng tư, khách bên ngoài chưa truy cập được cửa hàng cho đến khi chủ Site đổi quyền chia sẻ.

## Máy chủ và quyền quản lý

`server/worker.ts` chạy trên Cloudflare Workers. `ADMIN_EMAIL` là biến môi trường phía máy chủ, cấu hình qua Sites; tuyệt đối không đưa vào mã giao diện. Quyền quản lý yêu cầu cả danh tính đăng nhập do Sites xác thực và email trùng danh sách quản trị đã cấu hình. ID tài khoản do Sites cấp được lưu trong lịch sử thay đổi.

Các API quản lý không chấp nhận service-bypass token làm danh tính quản trị. Không tự tạo tài khoản quản trị theo người truy cập đầu tiên.

## Phát triển

- `npm install --legacy-peer-deps` (kế thừa tổ hợp Vite/esbuild hiện tại).
- `npm run dev` chạy giao diện; các API cần môi trường Worker/D1.
- `npm run db:generate` tạo migration khi thay đổi schema.
- `npm run build:hosted` tạo Worker và frontend trong `dist/`.
- `node tests/orders-server.test.mjs` kiểm tra API bằng SQLite cục bộ sau build.
- `node tests/shop.test.mjs` kiểm tra các lựa chọn mua.
- `node_modules/.bin/tsc --noEmit` kiểm tra TypeScript.

Migration đã áp dụng không được chỉnh sửa. Thêm migration mới khi đổi schema. Không tạo bảng trong request handler. Không đưa bản sao dữ liệu khách hoặc file SQLite vào source/artefact.

## Gửi tác phẩm và giám tuyển

- Khách gửi ảnh JPG/PNG/WebP tối đa 8 MB trực tiếp trên website. Ảnh gốc được lưu riêng trong R2 (`BUCKET`), thông tin hồ sơ lưu ở D1; chỉ quản trị viên được xem file đã gửi.
- Trong `/admin`, chọn **Tác phẩm gửi đến** để xem 50 hồ sơ mới nhất và cập nhật trạng thái/ghi chú. Đánh dấu “Đã chấp nhận” và lưu sẽ xuất bản ảnh vào cửa hàng với ba lựa chọn mua hiện hành. Các hồ sơ đã chấp nhận trước đây cũng được hiển thị tự động. Đổi sang trạng thái khác sẽ gỡ ảnh khỏi cửa hàng và chặn đơn mới; các đơn đã đặt vẫn giữ thông tin ảnh tại thời điểm mua. Hai bên vẫn cần thống nhất quyền sử dụng.
- Giám tuyển gọi API qua máy chủ. Cấu hình `GEMINI_API_KEY` bằng biến bí mật trong Sites để bật Gemini; không đưa key vào mã trình duyệt. Khi chưa có key hoặc dịch vụ không sẵn sàng, giao diện ghi rõ đang dùng gợi ý theo bộ sưu tập.
- Việt / Anh / Pháp dùng chung dữ liệu giỏ hàng và đơn. Tiếng Việt là mặc định; ngôn ngữ đã chọn được ghi nhớ trong trình duyệt.

## Đăng nhập quản trị

Trang quản lý yêu cầu cả danh tính chủ website do Sites xác thực và đăng nhập username/mật khẩu riêng. Cấu hình `ADMIN_USERNAME` và `ADMIN_PASSWORD_HASH` bằng biến bí mật của Sites. Không ghi mật khẩu hay giá trị băm vào source, tài liệu hoặc trình duyệt.

Giá trị băm có định dạng `pbkdf2-sha256$100000$<salt-hex-24-bytes>$<derived-hash-hex-32-bytes>`; salt ngẫu nhiên được tạo riêng khi thiết lập. Phiên có hiệu lực tối đa 8 giờ, dùng cookie HttpOnly/Secure/Partitioned và chỉ lưu băm của token phiên trong D1. Đăng xuất hủy phiên phía máy chủ. Thay giá trị băm mật khẩu làm mất hiệu lực các phiên cũ. Sau 5 lần sai trong 15 phút, tài khoản tạm thời bị giới hạn đăng nhập.
