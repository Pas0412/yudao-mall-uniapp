import request from '@/sheep/request';

const LevelApi = {
  // 根据用户ID获得会员用户等级ID
  getUserLevelId: (userId) => {
    return request({
      url: '/member/user/get-level-id',
      method: 'GET',
      params: { userId },
      custom: {
        showLoading: true,
        auth: true,
      },
    });
  },
};

export default LevelApi;