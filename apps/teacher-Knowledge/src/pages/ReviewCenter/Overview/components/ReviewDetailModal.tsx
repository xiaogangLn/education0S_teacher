// components/ReviewDetailModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  Tag,
  Spin,
  Empty,
  Button,
  Timeline,
  Input,
  Space,
  Divider,
  Typography,
  Alert,
  message,
  Avatar,
  Tabs,
  List,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  SendOutlined,
  PaperClipOutlined,
  HistoryOutlined,
  RobotOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { ReviewDetail } from '../types';
import { statusColorMap, statusLabelMap } from '../constants';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ReviewDetailModalProps {
  open: boolean;
  onClose: () => void;
  detail: ReviewDetail | null;
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  open,
  onClose,
  detail,
  loading = false,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      message.warning('请输入批注内容');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('批注提交成功');
      setComment('');
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = () => {
    if (detail && onApprove) {
      onApprove(detail.id);
      message.success('已通过审批');
    }
  };

  const handleReject = () => {
    if (detail && onReject) {
      const reason = prompt('请输入驳回原因：');
      if (reason && reason.trim()) {
        onReject(detail.id);
        message.success('已驳回');
      }
    }
  };

  if (loading) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={820}
        centered
      >
        <div className="flex justify-center items-center h-80">
          <Spin size="large" tip="加载详情..." />
        </div>
      </Modal>
    );
  }

  if (!detail) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={820}
        centered
      >
        <Empty description="未找到详情" />
      </Modal>
    );
  }

  const statusColor = statusColorMap[detail.status];
  const statusLabel = statusLabelMap[detail.status];

  // 渲染教案内容
  const renderContent = () => (
    <div className="space-y-4">
      {/* 标题区域 */}
      <div>
        <Title level={4} className="mb-1">
          📝 {detail.title}
        </Title>
        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
          <span>👨‍🏫 {detail.author}</span>
          <span>·</span>
          <span>📚 {detail.className}</span>
          <span>·</span>
          <span>📖 {detail.subject}</span>
          <span>·</span>
          <span>🕐 {detail.submittedAt}</span>
          <Tag color={statusColor}>{statusLabel}</Tag>
          {detail.aiGenerated && (
            <Tag color="purple" icon={<RobotOutlined />}>
              AI生成
            </Tag>
          )}
        </div>
      </div>

      <Divider className="my-3" />

      {/* 教学目标 */}
      <div>
        <Text strong className="text-base block mb-2">
          📌 教学目标
        </Text>
        <div className="bg-gray-50 rounded-lg p-4">
          {detail.content.objectives.map((obj, index) => (
            <div key={index} className="text-gray-700 py-1">
              {index + 1}. {obj}
            </div>
          ))}
        </div>
      </div>

      {/* 教学重点 */}
      <div>
        <Text strong className="text-base block mb-2">
          📌 教学重点
        </Text>
        <div className="bg-gray-50 rounded-lg p-4">
          {detail.content.keyPoints.map((point, index) => (
            <div key={index} className="text-gray-700 py-1">
              • {point}
            </div>
          ))}
        </div>
      </div>

      {/* 课时安排 */}
      <div>
        <Text strong className="text-base block mb-2">
          📌 课时安排
        </Text>
        <div className="bg-gray-50 rounded-lg p-4">
          {detail.content.schedule.map((item, index) => (
            <div key={index} className="text-gray-700 py-1">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* 备注 */}
      {detail.content.notes && (
        <Alert
          message="📝 备注"
          description={detail.content.notes}
          type="info"
          showIcon
          className="mt-2"
        />
      )}

      {/* 驳回原因 */}
      {detail.rejectReason && (
        <Alert
          message="📌 驳回原因"
          description={detail.rejectReason}
          type="error"
          showIcon
          className="mt-2"
        />
      )}
    </div>
  );

  // 渲染审核批注
  const renderComments = () => (
    <div className="space-y-4">
      {/* 批注列表 */}
      {detail.comments.length > 0 ? (
        <List
          className="bg-gray-50 rounded-lg p-2"
          itemLayout="horizontal"
          dataSource={detail.comments}
          renderItem={(item) => (
            <List.Item className="border-b border-gray-100 last:border-0 px-2">
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: item.type === 'approve' ? '#10b981' :
                                     item.type === 'suggestion' ? '#f59e0b' :
                                     '#4f46e5',
                    }}
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <div className="flex items-center gap-2">
                    <Text strong>{item.author}</Text>
                    <Tag
                      color={
                        item.type === 'approve' ? 'success' :
                        item.type === 'suggestion' ? 'warning' :
                        'default'
                      }
                      className="text-xs"
                    >
                      {item.type === 'approve' ? '✅ 通过' :
                       item.type === 'suggestion' ? '💡 建议' :
                       '📌 系统'}
                    </Tag>
                    <Text type="secondary" className="text-xs">
                      {item.createdAt}
                    </Text>
                  </div>
                }
                description={
                  <Text className="text-sm text-gray-700">{item.content}</Text>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无批注" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {/* 批注输入 */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <Text strong className="block mb-2">
          💬 添加批注
        </Text>
        <TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="输入批注内容..."
          className="mb-2"
        />
        <Space className='mt-4'>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmitComment}
            loading={submitting}
          >
            提交批注
          </Button>
          <Button icon={<PaperClipOutlined />}>附件</Button>
        </Space>
      </div>

      {/* 快速操作 */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleApprove}
          className="bg-green-500 hover:bg-green-600"
        >
          批准通过
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={handleReject}
        >
          驳回修改
        </Button>
        <Button icon={<HistoryOutlined />}>历史版本</Button>
        <Button icon={<EditOutlined />} className="ml-auto">
          生成审核意见
        </Button>
      </div>
    </div>
  );

  // 渲染时间线
  const renderTimeline = () => (
    <div className="py-2">
      <Timeline
        items={detail.timeline.map((item) => ({
          dot:
            item.type === 'submit' ? <ClockCircleOutlined style={{ color: '#4f46e5' }} /> :
            item.type === 'approve' ? <CheckOutlined style={{ color: '#10b981' }} /> :
            item.type === 'suggestion' ? <EditOutlined style={{ color: '#f59e0b' }} /> :
            item.type === 'reject' ? <CloseOutlined style={{ color: '#ef4444' }} /> :
            <ClockCircleOutlined style={{ color: '#6b7280' }} />,
          color:
            item.type === 'submit' ? 'blue' :
            item.type === 'approve' ? 'green' :
            item.type === 'suggestion' ? 'gold' :
            item.type === 'reject' ? 'red' : 'gray',
          children: (
            <div>
              <div className="flex items-center gap-2">
                <Text strong>{item.author}</Text>
                <Text type="secondary" className="text-xs">
                  {item.createdAt}
                </Text>
              </div>
              <Text className="text-sm text-gray-600">{item.content}</Text>
            </div>
          ),
        }))}
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      centered
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">📄 教案详情</span>
          <Tag color={statusColor}>{statusLabel}</Tag>
        </div>
      }
      bodyStyle={{
        padding: '20px 24px',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
      }}
    >
      <Tabs defaultActiveKey="content" className="review-detail-tabs">
        <TabPane
          tab={<span><EditOutlined /> 教案内容</span>}
          key="content"
        >
          {renderContent()}
        </TabPane>

        <TabPane
          tab={<span><MessageOutlined /> 审核批注</span>}
          key="comments"
        >
          {renderComments()}
        </TabPane>

        <TabPane
          tab={<span><HistoryOutlined /> 审核历史</span>}
          key="timeline"
        >
          {renderTimeline()}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ReviewDetailModal;