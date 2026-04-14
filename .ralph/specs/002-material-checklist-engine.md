# 规格 002：材料清单规则引擎运行时

## 背景
材料清单中心（MaterialChecklistCenter）是核心功能之一。需要根据不同的产品类型和客户场景，动态生成差异化的材料清单。

## 需求
1. 规则引擎运行时实现：
   - **默认值规则**（`ChecklistDefaultValueRule`）：字段默认填充
   - **必填规则**（`ChecklistRequiredRule`）：字段必填校验，支持 `requiredWhen` 条件
   - **可见性规则**（`ChecklistVisibilityRule`）：字段按条件显示/隐藏
   - **计算字段**（`ChecklistComputedField`）：基于表达式自动计算字段值

2. 运行时规则集加载：
   - 根据 `templateCode` 从后端加载 `ChecklistRuntimeRuleSet`
   - 前端本地维护表单状态树
   - 规则变更时自动触发字段联动

3. UI 交互：
   - 材料清单按模块分组展示
   - 必填字段标记红色星号
   - 条件字段按规则动态显示/隐藏
   - 计算字段实时更新

## 验收标准
- 规则引擎能正确解析并执行 `ChecklistRuntimeRuleSet`
- 材料清单表单支持至少 2 种不同模板切换
- 所有规则类型（默认值、必填、可见性、计算字段）均有测试覆盖
- 前端无 console.error
