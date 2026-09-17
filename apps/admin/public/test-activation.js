// 测试用户激活功能
// 在浏览器控制台运行此脚本来测试真正的用户状态改变

async function testUserActivation() {
  console.log('=== 测试用户状态真正改变 ===');

  const userId = 'cmu4dmhuj000e8wr5or5lpbdo';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXRxdHNkeDMwMDAwcG5kNnV5aHoxMjkxIiwicGhvbmUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInJvbGVzIjpbImFkbWluIl0sInNjaG9vbElkIjpudWxsLCJncmFkZUlkIjpudWxsLCJpYXQiOjE3ODk2NjIxMTMsImV4cCI6MTc5MDI2NjkxM30.Jr81R6mNrfHeB0gUtmOJTmaI_Gc6rFSAu3v63M0SvIE';

  try {
    // 1. 首先检查用户状态
    console.log('\n1. 检查用户状态...');
    const getUserResponse = await fetch(`/api/v1/users/${userId}`);
    const userData = await getUserResponse.json();
    console.log('用户数据:', userData);

    // 2. 激活用户
    console.log('\n2. 激活用户...');
    const activateResponse = await fetch(`/api/v1/users/${userId}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const activateData = await activateResponse.json();
    console.log('激活响应:', activateData);

    // 3. 再次检查用户状态
    console.log('\n3. 验证状态改变...');
    const getUserAfterResponse = await fetch(`/api/v1/users/${userId}`);
    const getUserAfterData = await getUserAfterResponse.json();
    console.log('激活后用户数据:', getUserAfterData);

    // 4. 检查localStorage持久化
    console.log('\n4. 检查localStorage持久化...');
    const storedUsers = localStorage.getItem('mock_users_data');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const targetUser = users.find((u: any) => u.id === userId);
      console.log('localStorage中的用户状态:', targetUser ? {
        id: targetUser.id,
        is_active: targetUser.is_active,
        real_name: targetUser.real_name,
        role: targetUser.role
      } : '用户不存在');
    }

    console.log('\n=== 测试完成 ===');

    return {
      initialStatus: userData.data?.user?.is_active,
      activateSuccess: activateData.code === 0,
      finalStatus: getUserAfterData.data?.user?.is_active,
      statusChanged: userData.data?.user?.is_active !== getUserAfterData.data?.user?.is_active
    };

  } catch (error) {
    console.error('测试失败:', error);
    return { error: error.message };
  }
}

// 运行测试
testUserActivation().then(results => {
  console.log('\n=== 测试结果 ===');
  console.log(JSON.stringify(results, null, 2));
});