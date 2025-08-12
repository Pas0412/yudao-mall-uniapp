import request from '@/sheep/request';

const RegionalAgentApi = {
  // ========== 地区代理功能 ==========
  
  // 申请成为地区代理
  applyRegionalAgent: (data) => {
    return request({
      url: '/product/regional-agent/create',
      method: 'POST',
      data,
      custom: {
        showSuccess: true,
        successMsg: '申请提交成功',
      },
    });
  },
  
  // 获取地区代理信息
  getRegionalAgent: (id) => {
    return request({
      url: '/product/regional-agent/get',
      method: 'GET',
      params: { id },
    });
  },
  
  // 分页查询地区代理
  getRegionalAgentPage: (params) => {
    return request({
      url: '/product/regional-agent/page',
      method: 'GET',
      params,
    });
  },
  
  // 获取当前用户的地区代理
  getCurrentUserRegionalAgent: () => {
    return request({
      url: '/product/regional-agent/get-by-user',
      method: 'GET',
    });
  },
  
  // 检验用户是否已申请地区代理
  hasUserAppliedRegionalAgent: () => {
    return request({
      url: '/product/regional-agent/has-applied',
      method: 'GET',
    });
  },
  
  // ========== 佣金记录功能 ==========
  
  // 获取佣金记录详情
  getRegionalAgentRecord: (id) => {
    return request({
      url: '/product/regional-agent-record/get',
      method: 'GET',
      params: { id },
    });
  },
  
  // 分页查询佣金记录
  getRegionalAgentRecordPage: (params) => {
    return request({
      url: '/product/regional-agent-record/page',
      method: 'GET',
      params,
    });
  },
  
  // ========== 提现功能 ==========
  
  // 申请提现
  createRegionalAgentWithdraw: (data) => {
    return request({
      url: '/product/regional-agent-withdraw/create',
      method: 'POST',
      data,
      custom: {
        showSuccess: true,
        successMsg: '提现申请提交成功',
      },
    });
  },
  
  // 获取提现记录详情
  getRegionalAgentWithdraw: (id) => {
    return request({
      url: '/product/regional-agent-withdraw/get',
      method: 'GET',
      params: { id },
    });
  },
  
  // 分页查询提现记录
  getRegionalAgentWithdrawPage: (params) => {
    return request({
      url: '/product/regional-agent-withdraw/page',
      method: 'GET',
      params,
    });
  },

  // 获取我的代理信息（用于菜单权限判断）
  getMyAgent: () => {
    return request({
      url: '/product/regional-agent/get-by-user',
      method: 'GET',
    });
  },


};

export default RegionalAgentApi;