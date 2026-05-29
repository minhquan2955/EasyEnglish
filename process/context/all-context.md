# EasyEnglish - All Context

Last updated: (auto-generated)

This file is the root context entrypoint for the repo.

Use it for two things:

1. quick routing to the right context pack or root file
2. broad architecture and repository understanding

Start here before loading deeper context files.

---

## How This File Works (the `all-*.md` Convention)

Every `process/context/` directory has one `all-*.md` entrypoint that acts as an attachable quick router for that domain. This root file (`all-context.md`) is the top-level router. Context groups each have their own `all-{group}.md` entrypoint.

## Current Root Entry Points

| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |
| `process/context/tests/all-tests.md` | testing, verification, debugging test failures, execution planning |
| `process/context/planning/all-planning.md` | plan-shape calibration, planning examples, SIMPLE vs COMPLEX reference docs |

## Current Context Groups

| Group | Entry point | Scope |
|---|---|---|
| `planning/` | `process/context/planning/all-planning.md` | plan-shape calibration, planning examples, SIMPLE vs COMPLEX reference docs |
| `tests/` | `process/context/tests/all-tests.md` | test runners, commands, debugging, gaps |

## Task Routing Table

| If the task involves... | Start with |
|---|---|
| architecture or stack questions | this file |
| testing or verification | `process/context/tests/all-tests.md` |
| creating a new plan | `process/context/planning/all-planning.md` |

## Repository Structure

```
easyenglish_project/
  backend/            -- Node.js, Express API server
    src/
      controllers/    -- Application logic (grade, user, attendance)
      models/         -- Mongoose schemas
      routes/         -- Express routers
      services/       -- Business logic (scheduling, overlaps)
      validations/    -- Zod schemas for request validation
  frontend/           -- React, Axios (Pending UI Implementation)
  process/            -- Agent harnesses and project context
```

## Technology Stack

- **Framework:** Node.js, Express (Backend), React (Frontend)
- **Database:** MongoDB via Mongoose ORM
- **Cache / Session:** Redis (For Schedule Cache, Permissions, Session)
- **Validation:** Zod (Backend Request Validation)
- **API Client:** Axios (Frontend)
- **Package Manager:** pnpm

## Key Patterns and Conventions

**Validation:** Luôn sử dụng Zod để validate request payload/params TRƯỚC KHI xử lý logic trong Controller.

**API Response:** Luôn trả về dữ liệu theo 1 định dạng chuẩn duy nhất cho mọi API (ví dụ: `{ success: true, data: ... }` hoặc `{ success: false, error: ... }`).

**Phân quyền (RBAC):** Hệ thống có 4 đối tượng: Học sinh, Giáo viên, Phụ huynh, Quản trị viên. Phân quyền rất chặt chẽ, người nào chỉ xem/chỉnh sửa dữ liệu của người nấy.

**Xử lý trùng lặp (Overlap Detection):** Logic sắp xếp giáo viên và phòng học là phần phức tạp nhất. Phải đặc biệt chú ý đến thuật toán xử lý ranh giới thời gian để tránh trùng lặp phòng và giáo viên.

## Chiến thuật Cache (Redis Strategy)

1. **Cache Lịch học (Schedule Cache):** Lịch học theo tuần/tháng (`schedule:class:{classId}:week:{weekNum}`). Xóa cache khi có sự thay đổi.
2. **Cache Phân quyền (Role/Permissions):** Cache quyền hạn (`user:{userId}:roles`) để giảm tải MongoDB.
3. **Quản lý Session / Rate Limiting:** Chống spam đăng nhập và lưu Refresh Token để thu hồi quyền truy cập khi cần.

## Environment and Configuration

- Chạy Backend bằng lệnh `npm run dev` (node --env-file=.env --watch server.js).
- Chưa cấu hình 3rd-party services.
- Dự án phát triển độc lập (Solo project).

## Scan Metadata

- Generated: 2026-05-29
- Mode: vc-setup
- Package manager: pnpm
