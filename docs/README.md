# Tài liệu

| Thư mục / file | Nội dung | Thuộc phần |
|---|---|---|
| `requirements/` | Bối cảnh và phạm vi, SRS (FR, NFR), đặc tả use-case đặt và thanh toán | Task 1 |
| `diagrams/` | Sơ đồ UML. File `.puml` là mã nguồn, file `.svg` là ảnh xuất ra | Task 2, 3 |
| `architecture/` | Mô tả kiến trúc (`architecture.md`) và các quyết định kiến trúc (`adr/`) | Task 3 |
| `deployment.md` | Triển khai production, biến môi trường, quy trình phát hành, rollback | Task 5 |
| `traceability-matrix.md` | Ma trận truy vết yêu cầu, thiết kế, code, test | Task 5 |
| `contributing.md` | Quy ước nhánh, commit và Definition of Done | Task 4 |

## Sơ đồ trong `diagrams/`

| Sơ đồ | File |
|---|---|
| Use-case tổng quát | `usecase-overview` |
| Use-case đặt và thanh toán | `usecase-checkout` |
| Activity (luồng end-to-end) | `activity-checkout` |
| Sequence (đặt và thanh toán) | `sequence-checkout` |
| Class (mô hình miền) | `class-domain` |
| Deployment (production) | `deployment` |

Vẽ lại ảnh từ mã nguồn: `java -jar plantuml.jar -tsvg docs/diagrams/<tên>.puml`.
