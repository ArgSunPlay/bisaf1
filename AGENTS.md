# AGENTS.md — General Instructions & Development Protocol for BiSaf (بی‌صف)

## 🚨 MANDATORY EXECUTION PROTOCOL FOR AI AGENTS

Every AI Agent working on this project MUST strictly follow this sequence before and after making ANY changes to prevent regression or breaking existing functionality.

### 🔄 The Standard Lifecycle
`Map Check → Find Existing → Target Scope → Dependency Check → Surgical Change → Verification → Update Map`

---

## 📌 RULE 1: MANDATORY MAP CHECK BEFORE ANY EDIT
Before making ANY changes to code:
1. Read `project_management.md` to locate the target feature, data flow, state owner, and impact map.
2. Check existing files, helper functions, and assets in the codebase.
3. **DO NOT DUPLICATE** existing logic or recreate components that already exist. Extend or reuse existing implementations.

---

## 📌 RULE 2: PRESERVE & PROTECT EXISTING FUNCTIONALITY
- When requested to make a change to a specific view or component, **ONLY modify the requested area**.
- **STRICTLY FORBIDDEN**: Overwriting or resetting surrounding views, removing existing UI controls, or replacing real assets with non-existent placeholder paths.
- **ASSETS POLICY**: The project uses real step guide images located in `/src/assets/images/`:
  - Step 1 Scan: `bisaf_step_scan_1786231431644.jpg`
  - Step 2 Queue: `bisaf_step_queue_1786231442058.jpg`
  - Step 3 Notify: `bisaf_step_notify_1786231450473.jpg`
  Always import these assets directly via ESM imports (`import stepScanImg from ...`).

---

## 📌 RULE 3: QR PRINT STUDIO & EXPORT ENGINE STABILITY
- `QrPrintStudio.tsx` is the primary A4 printable poster generator for shopkeepers & marketers.
- It MUST maintain:
  1. High-resolution QR code rendering generated directly via `QRCode.toDataURL`.
  2. The 3-step visual scanning guide using the imported images from `/src/assets/images/`.
  3. PDF (`jsPDF`) and Image (`html-to-image`) export options configured with `skipFonts: true` and `cacheBust: true` to prevent CORS CSS exceptions.

---

## 📌 RULE 4: DATA FLOW & PERSISTENCE
- **Primary Source of Truth**: Supabase Cloud PostgreSQL + LocalStorage fallback sync (`SRV_STORAGE`).
- Never break fallback compatibility between LocalStorage and Supabase.
- Always use `toPersianDigits()` for Persian number formatting in UI views.

---

## 📌 RULE 5: POST-EDIT VERIFICATION & MAP UPDATE
After completing code changes:
1. Run `lint_applet` and `compile_applet` to ensure zero TypeScript errors or missing imports.
2. Update `project_management.md` to reflect any changes in components, state, or functions.

---

## 📌 RULE 6: STRICT RESPONSIVE ISOLATION (محدودیت دقیق تغییرات واکنش‌گرا)
When the user requests a change for a specific screen size or device view (e.g., "only on mobile" or "only on desktop"):
1. **DO NOT change shared JavaScript logic, state variables, or utility functions** if they are used across multiple breakpoints. 
2. **USE TAILWIND BREAKPOINTS (`sm:`, `md:`, `lg:`, `hidden`)** to isolate the change. Render both versions (the mobile version and the desktop version) in the DOM and use CSS to toggle their visibility based on the screen size.
3. **LITERAL SCOPE**: Apply the change EXACTLY to the requested view. Never generalize the change to other screen sizes. If it works on mobile, it MUST NOT break or alter the layout/data format on desktop.

---

## 📌 RULE 7: STRICT NO-UNSOLICITED-CHANGES POLICY (ممنوعیت مطلق تغییرات خودسرانه)
- **DO NOT** make ANY visual, styling (CSS/Tailwind classes), or structural changes to the UI unless explicitly and specifically requested by the user.
- **DO NOT** "beautify", "modernize", or alter the layout/colors of components based on your own judgment.
- **LITERAL EXECUTION ONLY**: Implement strictly what the user asked for. Modify ONLY the target elements mentioned in the prompt and their absolute functional dependencies. 
- If a change is not explicitly stated in the prompt, LEAVE IT ALONE.
