# Ý tưởng: Tự động tạo thời khoá biểu học sinh

## Tổng quan
Trang web tĩnh (không có backend) giúp học sinh/phụ huynh tự động tạo thời khoá biểu học kỳ dựa trên các thông tin đầu vào. Toàn bộ logic xử lý chạy trên trình duyệt.

---

## Đầu vào (Input)

### Thông tin học kỳ
- Học kỳ: 1 hoặc 2
- Số tuần học trong học kỳ
- Có học thứ 7 không? (Thứ 2 → Thứ 6, hoặc Thứ 2 → Thứ 7)

### Buổi học
- Buổi sáng
- Buổi chiều
- Cả ngày (sáng + chiều)

### Danh sách môn học
Mỗi môn học bao gồm:
- Tên môn
- Tổng số tiết cả học kỳ (hệ thống tự chia đều theo tuần)
- Cho phép xếp 2 tiết liên nhau không? (đôi tiết)

---

## Đầu ra (Output)

- Thời khoá biểu theo tuần (lặp lại cố định mỗi tuần)
- Hiển thị dạng bảng: hàng = buổi/tiết, cột = ngày trong tuần
- Đảm bảo phân bổ đều các môn theo tuần
- Tuân thủ ràng buộc đôi tiết (nếu môn cho phép)

---

## Ràng buộc & Quy tắc xếp TKB

### Khung tiết
- Mỗi buổi tối đa **5 tiết**
- Học cả ngày = buổi sáng 5 tiết + buổi chiều 5 tiết = 10 tiết/ngày tối đa
- **Tiết tự học**: tuỳ chọn, cố định vào 1 ngày trong tuần (người dùng chọn thứ mấy qua dropdown). Tiết tự học chiếm 1-2 tiết cuối của buổi hôm đó, không xếp môn học vào các slot này.

### Phân bổ môn học
- Tổng tiết/tuần của mỗi môn = tổng tiết cả kỳ ÷ số tuần học, **làm tròn lên** (ưu tiên học xong trước khi hết kỳ)
- Môn có đôi tiết: ưu tiên xếp 2 tiết liên nhau trong cùng buổi
- Môn không có đôi tiết: mỗi ngày chỉ xếp tối đa 1 tiết của môn đó
- **Không xếp một môn 2 ngày liên tiếp**: ví dụ có Văn thứ 2 thì sớm nhất là thứ 4 mới có Văn tiếp. Nếu môn có quá nhiều tiết/tuần và bắt buộc phải xếp ngày liên tiếp thì cho phép, ưu tiên không liên tiếp trước.
- **Phân bổ đều tổng tiết theo ngày**: mỗi ngày cố gắng có số tiết xấp xỉ nhau. Ngày nào ít môn hơn thì học sinh kết thúc sớm (tiết cuối bỏ trống), không chuyển sang buổi khác.

### Thời khoá biểu
- Cố định, lặp lại giống nhau mỗi tuần trong suốt học kỳ

---

## Tech Stack
- Vue 3 + Vite
- PrimeVue 4 (UI)
- Pinia (state management, persistent)
- Vue Router
- Thuật toán xếp TKB chạy hoàn toàn client-side (JavaScript)

---

## Trạng thái
- [ ] Thiết kế giao diện nhập liệu
- [ ] Xây dựng thuật toán xếp TKB
- [ ] Hiển thị kết quả dạng bảng
- [ ] Cho phép xuất TKB (in / export)
