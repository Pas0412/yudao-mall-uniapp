<!-- 代理中心  -->
<template>
  <s-layout
    navbar="inner"
    class="index-wrap"
    title="代理中心"
    :bgStyle="bgStyle"
    :onShareAppMessage="shareInfo"
  >
    <!-- 代理商信息 -->
    <agent-info />
    <!-- 账户信息 -->
    <agent-account-info />
    <!-- 菜单栏 -->
    <agent-menu />
    <!-- 代理记录 -->
    <agent-log />

    <!-- 权限弹窗 -->
    <agent-auth />
  </s-layout>
</template>

<script setup>
  import { computed } from 'vue';
  import agentInfo from './components/agent-info.vue';
  import agentAccountInfo from './components/agent-account-info.vue';
  import agentLog from './components/agent-log.vue';
  import agentMenu from './components/agent-menu.vue';
  import agentAuth from './components/agent-auth.vue';
  import sheep from '@/sheep';
  import { SharePageEnum } from '@/sheep/helper/const';

  /** 代理邀请 */
  const shareInfo = computed(() => {
    return sheep.$platform.share.getShareInfo(
      {
        params: {
          page: SharePageEnum.HOME.value, // 用户通邀请进入到首页
        },
      },
      {
        type: 'user',
      },
    );
  });

  const bgStyle = {
    color: '#F7D598',
  };
</script>

<style lang="scss" scoped>
  :deep(.page-main) {
    background-size: 100% 100% !important;
  }
</style>