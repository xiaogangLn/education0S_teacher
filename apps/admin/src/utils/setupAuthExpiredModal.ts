import { Modal } from 'antd';
import { setAuthExpiredHandler } from '@api/index';

const LOGIN_PATH = '/';

function shouldPromptReLogin() {
  const path = window.location.pathname;
  return path !== LOGIN_PATH && !path.startsWith('/m/');
}

/** 认证过期：单按钮弹框，确认后跳转登录页 */
export function setupAuthExpiredModal() {
  setAuthExpiredHandler(() => {
    if (!shouldPromptReLogin()) {
      return;
    }

    Modal.warning({
      title: '登录已过期',
      content: '认证信息已过期，请重新登录后再继续操作。',
      okText: '重新登录',
      centered: true,
      keyboard: false,
      maskClosable: false,
      closable: false,
      onOk: () => {
        window.location.href = LOGIN_PATH;
      },
    });
  });
}
