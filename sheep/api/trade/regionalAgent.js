import request from '@/sheep/request';

const RegionalAgentApi = {
  // ========== 地区代理功能 ==========
  
  // 获取个人代理信息
  getRegionalAgent: () => {
    return request({
      url: '/trade/regional-agent/get',
      method: 'GET',
    });
  },
  
  // 申请成为地区代理
  applyRegionalAgent: (data) => {
    return request({
      url: '/trade/regional-agent/apply',
      method: 'POST',
      data,
      custom: {
        showSuccess: true,
        successMsg: '申请提交成功',
      },
    });
  },
  
  // ========== 佣金记录功能 ==========
  
  // 获取个人佣金记录
  getRegionalAgentRecordPage: (params) => {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map((key) => {
        if (Array.isArray(params[key])) {
          return params[key].map(val => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      })
      .join('&');
    return request({
      url: `/trade/regional-agent/record/page?${queryString}`,
      method: 'GET',
    });
  },
  
  // ========== 提现功能 ==========
  
  // 申请提现
  createRegionalAgentWithdraw: (data) => {
    return request({
      url: '/trade/regional-agent/withdraw/create',
      method: 'POST',
      data,
      custom: {
        showSuccess: true,
        successMsg: '提现申请提交成功',
      },
    });
  },
  
  // 获取提现记录
  getRegionalAgentWithdrawPage: (params) => {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map((key) => {
        if (Array.isArray(params[key])) {
          return params[key].map(val => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      })
      .join('&');
    return request({
      url: `/trade/regional-agent/withdraw/page?${queryString}`,
      method: 'GET',
    });
  },
};

export default RegionalAgentApi;