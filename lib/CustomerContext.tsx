/**
 * CustomerContext — 全局客户上下文
 * 
 * 在任何工具中填入的客户信息（名称、行业、联系方式等）
 * 都会同步到这个 Context，其他工具可以自动预填。
 * 同时持久化到 localStorage，刷新后仍可恢复。
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CustomerProfile {
  name: string;          // 客户名称 / 企业名
  contactPerson: string; // 联系人（老板/财务/经办）
  phone: string;
  industry: string;      // 行业
  channel: string;       // 沟通渠道
  remark: string;
}

const EMPTY_PROFILE: CustomerProfile = {
  name: '',
  contactPerson: '',
  phone: '',
  industry: '',
  channel: '',
  remark: '',
};

const STORAGE_KEY = 'fwe_customer_ctx';

interface CustomerContextValue {
  customer: CustomerProfile;
  setCustomer: (partial: Partial<CustomerProfile>) => void;
  clearCustomer: () => void;
  hasCustomer: boolean;
}

const CustomerCtx = createContext<CustomerContextValue>({
  customer: EMPTY_PROFILE,
  setCustomer: () => {},
  clearCustomer: () => {},
  hasCustomer: false,
});

export const useCustomer = () => useContext(CustomerCtx);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomerState] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...EMPTY_PROFILE, ...JSON.parse(saved) } : EMPTY_PROFILE;
    } catch {
      return EMPTY_PROFILE;
    }
  });

  useEffect(() => {
    if (Object.values(customer).some(Boolean)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [customer]);

  const setCustomer = useCallback((partial: Partial<CustomerProfile>) => {
    setCustomerState(prev => ({ ...prev, ...partial }));
  }, []);

  const clearCustomer = useCallback(() => {
    setCustomerState(EMPTY_PROFILE);
  }, []);

  const hasCustomer = Boolean(customer.name);

  return (
    <CustomerCtx.Provider value={{ customer, setCustomer, clearCustomer, hasCustomer }}>
      {children}
    </CustomerCtx.Provider>
  );
};
