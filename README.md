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

## Quản lý thư viện ảnh

Trong `/admin`, tab **Thư viện ảnh** liệt kê cả ảnh có sẵn lẫn tác phẩm gửi lên đã được duyệt. Có tìm kiếm, bộ lọc và phân trang 12 ảnh. Admin sửa tên / địa điểm / câu chuyện theo ba ngôn ngữ, tác giả và bộ sưu tập; ẩn/hiện; chuyển ảnh vào thùng rác và khôi phục. Tác phẩm chưa được duyệt vẫn nằm ở tab **Tác phẩm gửi đến**. Ẩn/xóa chặn đơn mới và bỏ ảnh khỏi cửa hàng; đơn cũ giữ nguyên thông tin lúc đặt. Ảnh trong thùng rác chưa bị xóa vĩnh viễn khỏi kho.

Mỗi lần build tạo WebP 160/480/960/1440 px từ ảnh có sẵn, giữ file gốc nguyên vẹn. Admin dùng ảnh nhỏ 160 px, cửa hàng dùng `srcset` theo kích thước màn hình, chỉ tải ảnh gần màn hình và chỉ dựng thêm ảnh khi bấm “Xem thêm ảnh”. Vercel Image Optimization xử lý ảnh gửi lên đã duyệt; chỉ cho phép đường dẫn ảnh công khai của HueArt, không dùng trình tối ưu công khai cho ảnh quản trị riêng tư. Xem trước ảnh đã ẩn hoặc chưa duyệt chỉ tải khi mở chi tiết. Cache ảnh đã tối ưu trên Vercel có thể còn tối đa 60 giây sau khi ẩn; danh mục và đặt hàng kiểm tra trạng thái hiện tại trên máy chủ.

## Thanh toán và USD/VND

Vào `/admin` → **Cài đặt thanh toán** để nhập ngân hàng (BIN), số tài khoản, tên chủ tài khoản và bật chuyển khoản/VietQR. Không dùng tài khoản mẫu hoặc tài khoản cũ trong các component không còn hoạt động. Trước khi admin cấu hình, cửa hàng vẫn nhận đơn liên hệ thanh toán sau và COD cho đơn có bản in.

Giá bán tiếp tục được tính bằng USD; giao diện có giá VND nhỏ hơn, mặc định **1 USD = 26.000 VND**. Tỷ giá và tài khoản nhận tiền được lưu theo đơn. Thay đổi cài đặt áp dụng cho đơn mới; không thay đổi số tiền và tài khoản đã chỉ định cho đơn trước đó. Với đơn cũ chưa từng có thông tin ngân hàng, thông tin hiện tại được dùng khi khách bắt đầu thanh toán.

Sau khi lưu đơn, khách có thể quét VietQR (tạo ngay trong trình duyệt, không gửi dữ liệu sang dịch vụ tạo ảnh QR), chuyển khoản hoặc chờ người bán liên hệ. QR chứa đúng số tiền VND và mã đơn. Đơn in chưa có phí vận chuyển có thể trả trước tiền ảnh; phần vận chuyển được chốt và thu sau. Đơn chuyển quyền tác giả chỉ mở hướng dẫn chuyển khoản sau khi admin xác nhận thỏa thuận bằng văn bản.

Nút **Thông báo tôi đã chuyển khoản** chỉ tạo trạng thái **Khách báo đã chuyển · Chờ xác minh**, không tự đánh dấu đã nhận tiền. Admin đối chiếu tài khoản hoặc tiền COD, nhập số tiền thực nhận và chọn **Đã nhận một phần** hoặc **Đã thanh toán**. Lịch sử giữ các lần báo chuyển và xác nhận. Website chưa kết nối webhook ngân hàng để đối soát tự động.

Biên nhận có liên kết riêng chứa khóa ngẫu nhiên trong URL fragment (không gửi trong URL HTTP). API yêu cầu khóa qua header `X-HueArt-Checkout-Key`, không trả thông tin cá nhân khách; quyền xem/sửa danh sách đơn vẫn chỉ thuộc admin. Không công khai liên kết biên nhận của khách.

## Nút chat Zalo / Messenger

Vào `/admin` → **Cài đặt chat** để nhập số Zalo và link Facebook/Messenger (hoặc ID/username trang), bật từng kênh và lưu. Hỗ trợ số Việt Nam dạng `0…` / `+84…`; link Facebook được chuyển về `https://m.me/...`. Chưa cấu hình thì kênh tương ứng không xuất hiện, không dùng tài khoản mẫu.

Nút nổi nằm ở góc phải dưới, mở trang chat hoặc ứng dụng qua liên kết HTTPS khi khách bấm. Hiệu ứng pulse tắt khi thiết bị bật giảm chuyển động. Nút tạm ẩn khi mở giỏ hàng, thanh toán hoặc hộp thoại; không tải SDK Facebook/Zalo bên ngoài. Cài đặt lưu ở khóa `contact` trong bảng `shop_settings`, độc lập với thanh toán. Phần đầu trang chỉ hiển thị USD; các vị trí giá khác vẫn hiển thị USD/VND.

## Admin thêm ảnh trực tiếp

Trong `/admin` → **Thư viện ảnh** → **Thêm ảnh**, chọn JPG/PNG/WebP, nhập tên và tác giả, chọn bộ sưu tập rồi lưu. Không cần nhập số điện thoại hay gửi qua luồng cộng tác viên. Mặc định ảnh hiển thị trên cửa hàng ngay sau khi lưu; bỏ chọn **Hiển thị trên cửa hàng sau khi lưu** để giữ ảnh ẩn. Ảnh đã thêm tiếp tục dùng các chức năng sửa, ẩn/hiện và thùng rác của thư viện.

Upload yêu cầu phiên admin và Origin hợp lệ. File gốc được lưu trong R2; trạng thái ẩn được thiết lập trước khi đưa ảnh vào danh mục để tránh xuất bản thoáng qua. Yêu cầu gửi lại cùng nội dung và khóa không tạo ảnh trùng. Gửi tác phẩm từ cửa hàng vẫn ở trạng thái chờ duyệt, không thể tự xuất bản bằng cách thêm cờ admin trong dữ liệu.

Vercel Production và Preview cần biến build **`NODEJS_HELPERS=0`** để Node adapter đọc được nguyên vẹn multipart/file bytes. Adapter tự xử lý JSON và giới hạn dung lượng. Giới hạn upload từ Vercel vẫn là 3 MB mỗi ảnh; trên Sites là 8 MB. Không commit credential; `NODEJS_HELPERS` chỉ là cấu hình không bí mật.

## Phí cộng tác viên gửi ảnh

Popup **Gửi tác phẩm** công bố mức phí tổng **20% doanh thu bán ảnh**: **10% cho quỹ Hội Nhiếp ảnh**, **10% chi phí quản trị**; tác giả nhận **80%**. Người gửi phải tích xác nhận điều kiện này, riêng với xác nhận quyền sử dụng ảnh. API kiểm tra phiên bản điều kiện và lưu tỷ lệ cố định cùng thời điểm đồng ý do máy chủ tạo; không tin tỷ lệ do client gửi.

Trong hồ sơ **Tác phẩm gửi đến**, admin xem được tỷ lệ và thời điểm xác nhận. Hồ sơ cũ không bị tự đánh dấu đã đồng ý; ảnh admin tải trực tiếp có nguồn `admin` và không đi qua chương trình phí cộng tác viên. Phần này công bố/lưu thỏa thuận, không tự chuyển tiền hay chi trả doanh thu.

### Storefront counters and Zalo order notifications

The footer counters start at 1,000,000 visits, 1,000 photos sold and 100 contributed works. Visits count one UUID per browser tab session (no IP or personal information is stored); repeat requests with that UUID do not increment again. Sales add quantities from paid, non-cancelled orders. Contributions add accepted contributor uploads, excluding direct admin uploads. These figures include the requested starting offsets.

In **Admin → Cài đặt chat → Thông báo đơn hàng qua Zalo**, create a bot in Zalo Bot Manager, save its Bot Token, send the bot a private message from the admin’s personal Zalo and use **Nhận tài khoản Zalo** to fill the recipient ID. Save, send a test, verify the correct account received it, then enable notifications and save. A phone number configured for the public chat button cannot send automated messages by itself. The account owner must complete bot creation in Zalo; no production token or recipient is prefilled.

Bot Tokens are encrypted in D1 using AES-GCM and a purpose-specific key derived from the existing server-only `VERCEL_BRIDGE_TOKEN`. Keep that secret stable or re-enter the Bot Token after rotation. Admin API responses only expose `tokenConfigured`, never the token or ciphertext. No token is stored in localStorage or sent to storefront visitors.

Successful checkouts create a durable notification record, then send in the Worker background (`waitUntil`). Messages include the customer’s contact information, address, note, all line items, USD/VND prices, shipping, total, payment method and current payment status. Long orders are split within Zalo’s 2,000-character limit. Concurrent/repeated checkout requests do not resend successful notifications. Zalo failures do not invalidate orders; recent delivery status and manual retry are available in admin. Before retrying a failed/unknown delivery, check Zalo: an upstream timeout can occur after receipt. Retry resumes after confirmed chunks. Interrupted sending jobs can be retried after 10 minutes. Messages are not sent until the owner configures and enables the bot.

Official Bot API documentation: https://bot.zapps.me/docs/apis/sendMessage/
