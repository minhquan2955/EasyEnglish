# Login Page — PlayStation Design Template + Backend Integration

Date: 07-06-26
Complexity: Simple
Status: ⏳ PLANNED

> **Context:** See `process/context/all-context.md` for full project context. This plan touches `frontend/` (React + Vite + TailwindCSS v4) and reads from `backend/` (Express + MongoDB + JWT auth).

## Overview

Tạo trang đăng nhập (`/dang-nhap`) cho EasyEnglish, tuân theo hệ thống thiết kế PlayStation được định nghĩa trong `DESIGN-playstation.md` — sử dụng **light canvas mode** (nền trắng). Khi người dùng nhấn nút "Đăng nhập My EasyEnglish" trên Navbar, họ sẽ được chuyển đến trang đăng nhập. Trang này kết nối với backend API `POST /api/auth/login` đã có sẵn, lưu JWT token vào localStorage, và redirect sang trang Dashboard (`/dashboard`) sau khi đăng nhập thành công. Trang đăng ký không có — chỉ admin mới tạo tài khoản.

## Quick Links

- [Goals & Success Metrics](#goals--success-metrics)
- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Scope](#scope)
- [Functional Requirements](#functional-requirements)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Resume and Execution Handoff](#resume-and-execution-handoff)

## Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Trang đăng nhập hiển thị đúng PlayStation design system | Visual match với design tokens từ DESIGN-playstation.md |
| Kết nối thành công với backend `/api/auth/login` | Đăng nhập thành công trả về JWT token |
| Lưu trạng thái đăng nhập (JWT + user info) | Token được lưu vào localStorage, Navbar hiển thị tên user |
| Xử lý lỗi đăng nhập (sai email/mật khẩu, tài khoản bị khóa) | Hiển thị thông báo lỗi inline bằng `{colors.warning}` |
| Responsive trên mobile/tablet/desktop | Layout reflow đúng theo breakpoint system |

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:
- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each phase, document:
- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

## Execution Brief

### Phase 1: CORS + Vite Proxy Setup ⏳
**What happens:** Cấu hình Vite dev proxy để frontend gọi backend API tại `localhost:5000` không bị CORS block. Backend hiện không có `cors` middleware nên cần proxy.

**Test:** Chạy `npm run dev` (frontend) và backend server, gọi `fetch('/api/auth/login')` từ browser console.

**Verify:** Response trả về từ backend (có thể là 400 validation error, nhưng không phải CORS error).

**Done when:** Fetch request từ frontend tới `/api/auth/login` trả về JSON response từ backend.

---

### Phase 2: Login Page Component + PlayStation Design ⏳
**What happens:** Tạo component `Login.jsx` trong `src/pages/` với giao diện theo PlayStation design system:
- **Canvas:** Light canvas (`{colors.canvas-light}` — `#ffffff`) full-bleed
- **Layout:** Centered form card trên nền trắng, `max-width: 420px`
- **Form Card:** Sử dụng `{colors.surface-card}` (`#f5f7fa`) với `{rounded.md}` (8px), 1px border `{colors.hairline-light}`
- **Heading:** "Đăng nhập My EasyEnglish" dùng `{typography.heading-xl}` — Roboto 300, 28px, `{colors.ink}`
- **Inputs:** Email và Password theo `{component.text-input}` — `{rounded.sm}` (4px), height 48px, `{typography.body-md}`, 1px border `{colors.ash-light}`, focused state: 2px solid `{colors.primary}`
- **Button:** "Đăng nhập" theo `{component.button-primary}` — `{colors.primary}` (`#0070d1`), `{rounded.full}` (9999px), `{typography.button-lg}`, padding `12px 28px`, height 48px
- **Error message:** `{colors.warning}` (`#c81b3a`) cho validation/error text
- **Typography:** Roboto Light 300 cho headings, Inter 400/500 cho body/buttons (font substitutes per design doc)
- **Spacing:** `{spacing.lg}` (24px) gap giữa fields, `{spacing.xl}` (32px) padding trong card

**Test:** Mở `/dang-nhap` trên browser, kiểm tra visual match với design tokens.

**Verify:** Tất cả design tokens được áp dụng đúng (colors, typography, rounded, spacing).

**Done when:** Trang đăng nhập render đúng design, responsive trên mobile/tablet/desktop.

---

### Phase 3: Backend Integration + Auth State ⏳
**What happens:**
- Tạo `src/services/authService.js` để gọi `POST /api/auth/login` với `{ email, password }`
- Xử lý response: lưu `token` + user info (`_id`, `email`, `fullName`, `role`) vào `localStorage`
- Tạo `src/context/AuthContext.jsx` để quản lý auth state (isAuthenticated, user, login, logout)
- Wrap `<App />` với `<AuthProvider>`
- Login success → `navigate('/dashboard')` redirect sang trang Dashboard
- Login failure → hiển thị error message inline
- Tạo trang `Dashboard.jsx` đơn giản: hiển thị "Chào mừng, {fullName}!" + thông tin role + nút Đăng xuất

**Test:** Đăng nhập với tài khoản thật trong MongoDB → kiểm tra localStorage có token + user info → redirect sang `/dashboard`.

**Verify:** `localStorage.getItem('token')` trả về JWT string; `localStorage.getItem('user')` trả về user JSON; trang Dashboard hiển thị đúng tên user.

**Done when:** Flow đăng nhập end-to-end hoạt động: nhập email/password → submit → lưu token → redirect.

---

### Phase 4: Navbar Integration + Protected State ⏳
**What happens:**
- Cập nhật nút "Đăng nhập My EasyEnglish" trong Navbar:
  - Chưa đăng nhập: `<Link to="/dang-nhap">` thay vì `<a href="#">`
  - Đã đăng nhập: hiển thị tên user + avatar icon, dropdown menu "Đăng xuất"
- Thêm route `/dang-nhap` và `/dashboard` vào `App.jsx`
- Logout: clear localStorage, reset auth state, redirect về `/`
- Nếu user đã đăng nhập rồi mà vào `/dang-nhap` → tự redirect sang `/dashboard`

**Test:** Click "Đăng nhập My EasyEnglish" → chuyển tới `/dang-nhap` → đăng nhập → Navbar đổi sang trạng thái "đã đăng nhập" → Đăng xuất → trở lại trạng thái ban đầu.

**Verify:** Navbar state chuyển đổi đúng; reload page vẫn giữ trạng thái đăng nhập (đọc từ localStorage).

**Done when:** Full user journey: Navbar → Login → Redirect → Navbar shows user → Logout.

---

### Expected Outcome
- ✅ Trang `/dang-nhap` hoạt động với PlayStation design system
- ✅ Backend integration với `POST /api/auth/login` thành công
- ✅ JWT token được lưu và quản lý qua AuthContext
- ✅ Navbar chuyển đổi trạng thái đăng nhập/đăng xuất
- ✅ Xử lý lỗi đầy đủ (sai thông tin, tài khoản bị khóa)
- ✅ Responsive trên mọi breakpoint

## Scope

### In Scope
- Trang đăng nhập `/dang-nhap` (Login page)
- Kết nối với `POST /api/auth/login` backend API
- Auth state management (AuthContext + localStorage)
- Navbar integration (login button → login page, user state display)
- Error handling (validation errors, server errors, account locked)
- Responsive design theo PlayStation breakpoint system

### Out of Scope
- Trang đăng ký (Register page) — admin tạo tài khoản, không cần public register
- Quên mật khẩu / Reset password flow
- OAuth / Social login
- Remember me / Refresh token mechanism
- Admin dashboard / Protected route guards (ngoại trừ Navbar state)

## Assumptions and Constraints

1. Backend API `POST /api/auth/login` đã hoạt động đúng (đã xác nhận qua code review)
2. Backend server chạy tại `localhost:5000` trong dev mode
3. Frontend sử dụng TailwindCSS v4 + Vite + React 19
4. PlayStation SST được thay thế bằng Roboto Light (300) cho display và Inter cho body (theo design doc)
5. Không có CORS middleware trên backend → cần Vite proxy
6. Chỉ cần JWT token (1h expiry), không cần refresh token

## Functional Requirements

- **FR-1:** Form đăng nhập có 2 fields: Email (text) và Password (password)
- **FR-2:** Client-side validation: email format, password không trống
- **FR-3:** Submit form gọi `POST /api/auth/login` với `{ email, password }`
- **FR-4:** Success response → lưu token + user info → redirect sang `/dashboard`
- **FR-5:** Error response → hiển thị message inline (text `{colors.warning}`)
- **FR-6:** Loading state: button hiển thị "Đang đăng nhập..." khi đang gọi API
- **FR-9:** Trang Dashboard hiển thị thông tin user (fullName, role) để xác nhận đăng nhập thành công
- **FR-7:** Password visibility toggle (eye icon)
- **FR-8:** Navbar button link tới `/dang-nhap`; sau đăng nhập hiển thị user name + logout

## Non-Functional Requirements

- **NFR-1:** Trang login load dưới 1s (code-split nếu cần)
- **NFR-2:** Không lưu plaintext password ở bất kỳ đâu
- **NFR-3:** Token chỉ lưu trong localStorage (không cookie)
- **NFR-4:** Responsive trên 320px - 1920px+
- **NFR-5:** Keyboard accessible: Tab navigation, Enter to submit

## Acceptance Criteria

1. ✅ Truy cập `/dang-nhap` hiển thị form đăng nhập với PlayStation design (light canvas)
2. ✅ Nhập email + password đúng → đăng nhập thành công → redirect sang `/dashboard`
3. ✅ Nhập email sai → hiển thị "Email hoặc mật khẩu không đúng"
4. ✅ Nhập password sai → hiển thị "Email hoặc mật khẩu không đúng"
5. ✅ Tài khoản bị khóa → hiển thị "Tài khoản đã bị khóa..."
6. ✅ Navbar hiển thị tên user sau đăng nhập thành công
7. ✅ Click "Đăng xuất" → clear session → Navbar trở lại nút "Đăng nhập My EasyEnglish"
8. ✅ Reload page → vẫn giữ trạng thái đăng nhập (đọc token từ localStorage)
9. ✅ Form responsive trên mobile (320px) đến desktop (1440px+)
10. ✅ Design tokens match: `{colors.primary}`, `{colors.canvas-dark}`, `{colors.surface-dark-card}`, `{colors.warning}`, `{rounded.full}`, `{rounded.sm}`, `{typography.heading-xl}`, `{typography.button-lg}`

## Implementation Checklist

### Phase 1: CORS + Vite Proxy
- [ ] Thêm `server.proxy` config vào `frontend/vite.config.js` để proxy `/api` requests tới `http://localhost:5000`
- [ ] Test: chạy cả frontend (port 5173) + backend (port 5000), gọi fetch từ browser console

### Phase 2: Login Page Component
- [ ] Tạo `frontend/src/pages/Login.jsx` với full PlayStation design
- [ ] Tạo `frontend/src/pages/Login.css` (nếu cần custom styles ngoài Tailwind)
- [ ] Form fields: Email input, Password input (với toggle visibility), Submit button
- [ ] Loading state, Error state, Client-side validation
- [ ] Responsive layout (mobile-first)
- [ ] Test: visual review trên các breakpoints

### Phase 3: Backend Integration + Auth State
- [ ] Tạo `frontend/src/services/authService.js` — `loginUser(email, password)`
- [ ] Tạo `frontend/src/context/AuthContext.jsx` — `AuthProvider`, `useAuth` hook
- [ ] Wrap `<App />` với `<AuthProvider>` trong `main.jsx`
- [ ] Connect Login form submit → `authService.loginUser()` → save to context + localStorage
- [ ] Test: đăng nhập end-to-end với tài khoản thật

### Phase 4: Navbar Integration
- [ ] Cập nhật `Navbar.jsx`: nút "Đăng nhập" → `<Link to="/dang-nhap">`
- [ ] Cập nhật `Navbar.jsx`: khi đã đăng nhập, hiển thị user name + dropdown "Đăng xuất"
- [ ] Thêm `<Route path="/dang-nhap" element={<Login />} />` vào `App.jsx`
- [ ] Xử lý logout: clear localStorage, reset auth state, redirect
- [ ] Test: full user journey — Navbar → Login → Redirect → User state → Logout

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Backend không có CORS | API calls bị block | Sử dụng Vite proxy trong dev |
| JWT token hết hạn (1h) | User bị logout đột ngột | Hiển thị thông báo rõ ràng, redirect về login |
| localStorage bị clear | Mất session | Graceful fallback, không crash |
| Backend server không chạy | Login fail | Hiển thị error message network phù hợp |

## Integration Notes

### Backend API Contract

**POST `/api/auth/login`**
```json
// Request
{ "email": "string", "password": "string" }

// Success Response (200)
{
  "_id": "string",
  "email": "string",
  "fullName": "string",
  "role": "admin|teacher|student|parent",
  "phone": "string",
  "token": "JWT_STRING"
}

// Error Responses
// 401: { "message": "Email hoặc mật khẩu không đúng" }
// 403: { "message": "Tài khoản đã bị khóa. Hãy liên hệ quản trị viên" }
```

### Environment
- Frontend: Vite dev server at `localhost:5173`
- Backend: Express at `localhost:5000` (from `.env` PORT=5000)
- Database: MongoDB Atlas (`MONGO_URI` in `.env`)

### Data Model
- User model: `{ email, passwordHash, fullName, phone, avatar, role, status }`
- Roles: `admin`, `teacher`, `student`, `parent`
- Status: `active`, `inactive` (inactive = locked)

## Touchpoints

| File | Change Type | Description |
|------|------------|-------------|
| `frontend/vite.config.js` | MODIFY | Add API proxy config |
| `frontend/src/pages/Login.jsx` | NEW | Login page component |
| `frontend/src/services/authService.js` | NEW | Auth API service |
| `frontend/src/context/AuthContext.jsx` | NEW | Auth state context |
| `frontend/src/main.jsx` | MODIFY | Wrap with AuthProvider |
| `frontend/src/App.jsx` | MODIFY | Add /dang-nhap route |
| `frontend/src/components/Navbar.jsx` | MODIFY | Login link + user state |

## Public Contracts

- **New route:** `/dang-nhap` — public, accessible without auth
- **New context:** `useAuth()` hook — provides `{ user, isAuthenticated, login, logout }`
- **New service:** `authService.loginUser(email, password)` — returns user data + token
- **localStorage keys:** `token` (JWT string), `user` (JSON string)

## Blast Radius

- **Low risk:** Các trang khác không bị ảnh hưởng (không thay đổi logic existing pages)
- **Navbar change:** Chỉ thay đổi behavior của nút CTA (từ `<a href="#">` sang `<Link>` + user state)
- **main.jsx change:** Chỉ wrap thêm provider, không thay đổi render tree
- **App.jsx change:** Chỉ thêm 1 route mới, không ảnh hưởng routes hiện tại
- **Backend:** KHÔNG thay đổi — sử dụng API có sẵn

## Verification Evidence

| Phase | Evidence Required |
|-------|-------------------|
| Phase 1 | Screenshot browser console: fetch `/api/auth/login` trả về JSON (không CORS error) |
| Phase 2 | Screenshot trang login trên desktop + mobile, visual match design tokens |
| Phase 3 | Screenshot localStorage sau login thành công (token + user) |
| Phase 4 | Video/screenshots full journey: Navbar → Login → User state → Logout |

## Resume and Execution Handoff

### Context Files to Read
1. `DESIGN-playstation.md` — Full PlayStation design system tokens
2. `frontend/src/index.css` — Existing Tailwind theme config with PS palette
3. `backend/src/controllers/auth.controller.js` — Login API logic
4. `backend/src/models/User.js` — User schema

### Execution Entry Point
Start with Phase 1 (Vite proxy config) → Phase 2 (Login.jsx) → Phase 3 (AuthContext) → Phase 4 (Navbar)

### Key Decisions Already Made
- Dùng dark canvas mode cho trang login (phù hợp với PlayStation editorial aesthetic)
- Dùng Vite proxy thay vì CORS middleware (không sửa backend)
- Dùng localStorage cho token storage (simple, đủ cho scope hiện tại)
- Dùng React Context cho auth state (lightweight, không cần Redux)

## Post-Phase Testing

> Reference `process/context/tests/all-tests.md` for framework-specific test commands when adding automated tests.

### Phase 1: Proxy Verification
- Manual test: Open browser DevTools → Console → `fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }) }).then(r => r.json()).then(console.log)`
- Expected: JSON error response `{ message: "Email hoặc mật khẩu không đúng" }` — no CORS errors
- Error scenario: Stop backend → frontend should show network error, not crash

### Phase 2: Design Verification
- Manual test: Open `/dang-nhap` on desktop (1440px), tablet (768px), mobile (375px)
- Expected: Form card centered, inputs at correct height (48px), button fully rounded, correct colors
- Error scenario: Check `{colors.warning}` text renders for inline validation

### Phase 3: Auth Flow Verification
- Manual test: Login with valid credentials → check `localStorage.getItem('token')` and `localStorage.getItem('user')` in DevTools
- Expected: Token is a valid JWT string, user is a JSON object with `_id`, `email`, `fullName`, `role`
- Error scenario: Login with wrong password → error displayed inline; Login with inactive account → "Tài khoản đã bị khóa" message

### Phase 4: Full Journey Verification
- Manual test: Click "Đăng nhập My EasyEnglish" → login → verify Navbar shows user name → click Đăng xuất → verify Navbar reverts
- Expected: Full cycle works without page reload; page reload maintains auth state
- Error scenario: Clear localStorage manually → Navbar should show login button again

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode:** Import "Implementation Checklist" steps directly, execute phase by phase
- **RIPER-5:** This plan completes the PLAN phase → request EXECUTE to implement
- **After each phase:** STOP and verify before proceeding to next phase
- **If scope expands** (e.g., need Register page, protected routes): pause and convert to COMPLEX plan
