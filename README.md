# DMLEditor 项目说明文档

## 1. 项目架构

DMLEditor 是一个基于 Vue 3 的数据库模型设计工具，采用了现代前端技术栈构建。

### 技术栈
- **前端框架**：Vue 3 + TypeScript
- **状态管理**：Pinia
- **UI 组件库**：Element Plus
- **CSS 框架**：Tailwind CSS
- **图形引擎**：AntV X6（用于绘制数据库关系图）
- **路由管理**：Vue Router

### 架构设计
- **组件化设计**：采用 Vue 3 组件化设计，将功能模块拆分为可复用组件
- **状态管理**：使用 Pinia 进行全局状态管理，维护图表数据和应用状态
- **响应式布局**：使用 Tailwind CSS 实现响应式界面设计
- **图形交互**：基于 AntV X6 实现数据库表和关系的可视化设计

## 2. 文件目录说明

```
DMLEditor/
├── public/                  # 静态资源目录
├── src/                     # 源代码目录
│   ├── assets/              # 资源文件（如 CSS、图片等）
│   │   └── tailwind.css     # Tailwind CSS 配置
│   ├── components/          # 组件目录
│   │   ├── TableNode.vue    # 表节点组件
│   │   ├── ProgressNode.vue # 进度节点组件
│   │   └── diagram/         # 图表相关组件
│   │       ├── EditorHeader.vue         # 编辑器头部工具栏
│   │       ├── EditorProperties.vue     # 属性编辑面板
│   │       ├── EditorToolbox.vue        # 工具箱面板
│   │       ├── ExportDialog.vue         # 导出对话框
│   │       ├── ProjectSettingsDialog.vue # 项目设置对话框
│   │       ├── RelationEditDialog.vue   # 关系编辑对话框
│   │       └── TableEditDialog.vue      # 表编辑对话框
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.vue   # 主布局组件
│   ├── pages/               # 页面组件
│   │   ├── ModelEditor.vue  # 模型编辑器页面
│   │   └── ProjectList.vue  # 项目列表页面
│   ├── stores/              # Pinia 状态管理
│   │   └── useDiagramStore.ts # 图表状态管理
│   ├── utils/               # 工具函数
│   │   ├── diagramUtils.ts  # 图表工具函数
│   │   └── sqlGenerator.ts  # SQL 生成工具
│   ├── App.vue              # 应用根组件
│   ├── main.ts              # 应用入口文件
│   └── router.ts            # 路由配置
└── node_modules/            # 依赖包目录
```

## 3. 功能列举

### 项目管理功能
1. **项目列表**：查看、创建、复制和删除数据库模型项目
2. **项目创建**：创建新的数据库模型项目，设置项目名称和描述
3. **项目导入/导出**：支持项目的导入和导出功能

### 数据库模型设计功能
1. **表管理**：
   - 创建、编辑和删除数据库表
   - 设置表名和表注释
   - 管理表字段（名称、类型、主键、非空等属性）

2. **关系管理**：
   - 创建表之间的关系连接（一对一、一对多、多对多）
   - 设置关系类型和外键字段
   - 添加关系注释

3. **可视化编辑**：
   - 拖拽调整表的位置
   - 缩放和平移画布
   - 选择和编辑表或关系

4. **画布操作**：
   - 撤销/重做操作
   - 重置视图
   - 放大/缩小视图

### 导出功能
1. **SQL 导出**：
   - 支持多种数据库类型（MySQL、PostgreSQL、SQL Server、Oracle、SQLite）
   - 可选是否包含注释和 DROP 语句
   - SQL 预览功能

2. **图像导出**：
   - 支持多种格式（PNG、JPEG、SVG、PDF）
   - 可调整导出图像质量
   - 图像预览功能

3. **JSON 导出**：导出项目数据为 JSON 格式

### 示例模板
1. **电商系统数据库**：包含用户、商品、订单、订单项等表及其关系
2. **博客系统数据库**：包含用户、文章、评论、标签等表及其关系

### 工具功能
1. **SQL 生成**：根据设计的数据库模型自动生成 SQL 语句
2. **表关系可视化**：直观展示表之间的关系和外键连接
3. **注释功能**：为表、字段和关系添加注释，提高模型可读性