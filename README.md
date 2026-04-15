# Phiếu Đăng Ký Ứng Tuyển CLB NCKH & Khởi Nghiệp

Form web responsive cho desktop (Windows) và điện thoại, có thể gửi dữ liệu trực tiếp về Google Sheet:

`https://docs.google.com/spreadsheets/d/1_IuVymQC4mOpTNFjRAP3OAM55N-nqG5OML2ArIHwA10/edit?usp=sharing`

## Cấu trúc

- `index.html`: giao diện phiếu đăng ký
- `styles.css`: giao diện chuyên nghiệp, responsive
- `script.js`: kiểm tra dữ liệu, gửi form, hiển thị thông báo cảm ơn
- `apps-script/Code.gs`: mã Google Apps Script nhận dữ liệu và ghi vào Sheet
- `assets/logo-clb.png`: logo CLB hiển thị ở đầu phiếu (bạn đặt file vào thư mục `assets`)

## Logo

- Form đã có sẵn vùng logo ở đầu trang.
- Đặt logo của bạn vào `assets/logo-clb.png`.
- Giao diện đã được tinh chỉnh theo bảng màu logo (xanh dương + xanh lá + điểm nhấn cam).

## Cách kết nối form với Google Sheet

1. Mở Google Sheet ở link trên.
2. Vào **Extensions > Apps Script**.
3. Dán nội dung file `apps-script/Code.gs` vào.
4. Bấm **Deploy > New deployment**.
5. Chọn loại **Web app**:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Deploy và copy URL dạng:
   - `https://script.google.com/macros/s/xxxxxx/exec`
7. Mở `script.js`, dán URL vào biến `APPS_SCRIPT_URL`.

Luu y:
- Dung URL Web App ket thuc bang `/exec`.
- Khong dung link Google Sheet va khong dung link `.../macros/library/...`.

## Chạy local

Chỉ cần mở file `index.html` hoặc chạy qua Live Server.

Sau khi gửi thành công sẽ hiện thông báo:

"Cảm ơn bạn đã quan tâm đăng ký, chúng tôi sẽ thông báo kết quả cho bạn qua email hoặc SĐT sau khi có kết quả. Trân trọng"
