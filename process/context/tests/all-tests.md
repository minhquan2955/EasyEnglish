# EasyEnglish - All Tests

Last updated: (auto-generated)

Attach this file first when the task involves testing, verification, or test debugging.

This is the fast operator guide for the testing surface.

---

## What This Covers

- test runner selection
- quick commands by package
- fast debugging procedures
- current testing gaps worth remembering

## Quick Routing

(No deeper test docs yet. Add routing entries here as they are created.)

## Quick Decision Guide

### Hiện trạng (Current Status)
Dự án hiện **chưa áp dụng Unit Test hoặc E2E Test**. 

Đề xuất trong tương lai:
- Dùng `Jest` và `Supertest` cho Backend API.
- Dùng `Vitest` cho Frontend React (khi triển khai).

## Default Verification Order

1. Do chưa có automated test, Verification (kiểm thử) hiện tại tập trung vào kiểm tra thủ công.
2. Với Backend, chạy `npm run dev` và gọi API thông qua Postman hoặc file HTTP.
3. Chú trọng test các case overlap (trùng lặp lịch học, phòng học, giáo viên).

## Commands

| Package | Runner | Command | Ghi chú |
|---|---|---|---|
| Backend | - | `npm run dev` | Không phải test runner, dùng để dev server |

## Known Gaps

- Chưa có bất kỳ bộ Unit Test nào cho logic Controller và Service.
- Chưa test luồng phân quyền Role-based Access Control (RBAC).
- Cần ưu tiên viết test cho module tính toán overlap lịch học (`schedule.service.js` hoặc tương tự).
