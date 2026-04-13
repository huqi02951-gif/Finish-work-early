import type { ChecklistRuntimeRuleSet } from '../types';

export const POLICY_GUARANTEE_CHECKLIST_RUNTIME_RULES: ChecklistRuntimeRuleSet = {
  templateCode: 'policy_guarantee_checklist_v1',
  defaultValueRules: [
    { field: 'registeredInXiamen', defaultValue: true },
    { field: 'companyNature', defaultValue: 'private' },
    { field: 'requestedTermMonths', defaultValue: 12 },
    { field: 'isCircularLoanRequested', defaultValue: false },
    { field: 'hasOverdue', defaultValue: false },
    { field: 'hasExtension', defaultValue: false },
    { field: 'hasDebtReplacement', defaultValue: false },
    { field: 'hasMajorPenalty', defaultValue: false },
    { field: 'hasAbnormalOperation', defaultValue: false },
    { field: 'needOnsiteDueDiligence', defaultValue: false, readonly: true },
    { field: 'accessResult', defaultValue: 'pending', readonly: true },
  ],
  requiredRules: [
    { field: 'productCode', required: true },
    { field: 'companyName', required: true },
    { field: 'industryCategory', required: true },
    { field: 'requestedAmountWan', required: true },
    { field: 'loanPurpose', required: true },
    { field: 'taxCreditLevel', required: true },
    {
      field: 'taxPaidLast12MonthsWan',
      requiredWhen: [{ field: 'productCode', op: 'eq', value: 'chang_yi_dan' }],
    },
    {
      field: 'assetLiabilityRatio',
      requiredWhen: [{ field: 'requestedAmountWan', op: 'gt', value: 300 }],
    },
    {
      field: 'revenueCreditRatio',
      requiredWhen: [
        { field: 'productCode', op: 'eq', value: 'chang_yi_dan' },
        { field: 'requestedAmountWan', op: 'gt', value: 300 },
      ],
    },
  ],
  visibilityRules: [
    {
      field: 'isHighTech',
      visibleWhen: [{ field: 'industryCategory', op: 'eq', value: '建筑施工类' }],
    },
    {
      field: 'taxPaidLast12MonthsWan',
      visibleWhen: [{ field: 'productCode', op: 'eq', value: 'chang_yi_dan' }],
    },
    {
      field: 'assetLiabilityRatio',
      visibleWhen: [{ field: 'requestedAmountWan', op: 'gt', value: 300 }],
    },
    {
      field: 'revenueCreditRatio',
      visibleWhen: [
        { field: 'productCode', op: 'eq', value: 'chang_yi_dan' },
        { field: 'requestedAmountWan', op: 'gt', value: 300 },
      ],
    },
    {
      field: 'needOnsiteDueDiligence',
      visibleWhen: [{ field: 'requestedAmountWan', op: 'gt', value: 300 }],
    },
    {
      field: 'blockerReasons',
      visibleWhen: [{ field: 'accessResult', op: 'in', value: ['rejected', 'manual_review'] }],
    },
  ],
  computedFields: [
    {
      field: 'needOnsiteDueDiligence',
      type: 'boolean',
      expression: 'requestedAmountWan > 300',
    },
    {
      field: 'isTaxCreditBlocked',
      type: 'boolean',
      expression: "taxCreditLevel == 'D'",
    },
    {
      field: 'isChangYiDanHardGateHit',
      type: 'boolean',
      expression: "productCode == 'chang_yi_dan' && requestedAmountWan > 300",
    },
    {
      field: 'isConstructionBlocked',
      type: 'boolean',
      expression:
        "productCode == 'chang_yi_dan' && industryCategory == '建筑施工类' && isHighTech == false",
    },
    {
      field: 'isRepaymentModeMismatch',
      type: 'boolean',
      expression: 'isCircularLoanRequested == true',
    },
    {
      field: 'accessResult',
      type: 'enum',
      expression:
        "if isTaxCreditBlocked then 'rejected' else if isConstructionBlocked then 'rejected' else if hasOverdue || hasExtension || hasDebtReplacement then 'rejected' else if productCode == 'chang_yi_dan' && requestedAmountWan > 300 && (taxPaidLast12MonthsWan < 5 || assetLiabilityRatio > 70) then 'rejected' else if requestedAmountWan > 300 && (assetLiabilityRatio == null) then 'manual_review' else 'approved'",
    },
    {
      field: 'nextStep',
      type: 'text',
      expression:
        "if accessResult == 'approved' then '进入补件/尽调/报审流程' else if accessResult == 'manual_review' then '补充报表和说明后人工复核' else '建议更换产品或终止推进'",
    },
  ],
};
