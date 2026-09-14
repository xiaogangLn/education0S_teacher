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
  HistoryOutlined,
  RobotOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { MarkdownRenderer } from '@ui/components/MarkdownRenderer';
import type { ReviewDetail } from '../types';
import { statusLabelMap } from '../constants';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ReviewDetailModalProps {
  open: boolean;
  onClose: () => void;
  detail: ReviewDetail | null;
  loading?: boolean;
  submitting?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSubmitComment?: (content: string) => Promise<boolean>;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  open,
  onClose,
  detail,
  loading = false,
  submitting = false,
  onApprove,
  onReject,
  onSubmitComment,
}) => {
  const [comment, setComment] = useState('');

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      message.warning('请输入批注内容');
      return;
    }
    const ok = await onSubmitComment?.(comment.trim());
    if (ok) setComment('');
  };

  if (loading) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={820} centered>
        <div className="flex justify-center items-center h-80">
          <Spin size="large" tip="加载详情..." />
        </div>
      </Modal>
    );
  }

  if (!detail) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={820} centered>
        <Empty description="未找到详情" />
      </Modal>
    );
  }

  const statusLabel = statusLabelMap[detail.status];
  const isPending = detail.status === 'pending' || detail.status === 'reviewing';
  const markdown = detail.markdown || detail.content?.markdown || '';

  const renderContent = () => (
    <div className="space-y-4">
      <div>
        <Title level={4} className="mb-1">
          📝 {detail.title}
        </Title>
        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
          <span>👨‍🏫 {detail.author}</span>
          <span>·</span>
          <span>📚 {detail.className || '未分班'}</span>
          <span>·</span>
          <span>📖 {detail.subject}</span>
          <span>·</span>
          <span>🕐 {detail.submittedAt}</span>
          <Tag color={isPending ? 'warning' : detail.status === 'rejected' ? 'error' : 'success'}>
            {statusLabel}
          </Tag>
          {detail.aiGenerated && (
            <Tag color="purple" icon={<RobotOutlined />}>
              AI生成
            </Tag>
          )}
        </div>
      </div>

      <Divider className="my-3" />

      {markdown ? (
        <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4">
          <MarkdownRenderer content={markdown} />
        </div>
      ) : (
        <>
          {detail.content.objectives.length > 0 && (
            <div>
              <Text strong className="text-base block mb-2">📌 教学目标</Text>
              <div className="bg-gray-50 rounded-lg p-4">
                {detail.content.objectives.map((obj, index) => (
                  <div key={index} className="text-gray-700 py-1">{index + 1}. {obj}</div>
                ))}
              </div>
            </div>
          )}
          {detail.content.keyPoints.length > 0 && (
            <div>
              <Text strong className="text-base block mb-2">📌 教学重点</Text>
              <div className="bg-gray-50 rounded-lg p-4">
                {detail.content.keyPoints.map((point, index) => (
                  <div key={index} className="text-gray-700 py-1">• {point}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {detail.content.notes && (
        <Alert message="📝 备注" description={detail.content.notes} type="info" showIcon className="mt-2" />
      )}

      {detail.rejectReason && (
        <Alert message="📌 驳回原因" description={detail.rejectReason} type="error" showIcon className="mt-2" />
      )}
    </div>
  );

  const renderComments = () => (
    <div className="space-y-4">
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
                      backgroundColor:
                        item.type === 'approve' ? '#10b981' : item.type === 'reject' ? '#ef4444' : '#4f46e5',
                    }}
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <div className="flex items-center gap-2">
                    <Text strong>{item.author || '审核人'}</Text>
                    <Tag
                      color={item.type === 'approve' ? 'success' : item.type === 'reject' ? 'error' : 'default'}
                      className="text-xs"
                    >
                      {item.type === 'approve' ? '通过' : item.type === 'reject' ? '驳回' : '批注'}
                    </Tag>
                    <Text type="secondary" className="text-xs">{item.createdAt}</Text>
                  </div>
                }
                description={<Text className="text-sm text-gray-700">{item.content}</Text>}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无批注" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {isPending && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <Text strong className="block mb-2">💬 添加批注</Text>
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="输入批注内容..."
            className="mb-2"
          />
          <Space className="mt-4">
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitComment} loading={submitting}>
              提交批注
            </Button>
          </Space>
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="py-2">
      {detail.timeline.length === 0 ? (
        <Empty description="暂无审核历史" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline
          items={detail.timeline.map((item) => ({
            dot:
              item.type === 'approve' ? <CheckOutlined style={{ color: '#10b981' }} /> :
              item.type === 'reject' ? <CloseOutlined style={{ color: '#ef4444' }} /> :
              <ClockCircleOutlined style={{ color: '#6b7280' }} />,
            color: item.type === 'approve' ? 'green' : item.type === 'reject' ? 'red' : 'blue',
            children: (
              <div>
                <div className="flex items-center gap-2">
                  <Text strong>{item.author || '审核人'}</Text>
                  <Text type="secondary" className="text-xs">{item.createdAt}</Text>
                </div>
                <Text className="text-sm text-gray-600">{item.content}</Text>
              </div>
            ),
          }))}
        />
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        isPending ? (
          <Space>
            <Button onClick={onClose}>关闭</Button>
            <Button danger icon={<CloseOutlined />} onClick={() => onReject?.(detail.id)}>
              驳回
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              className="bg-green-500"
              loading={submitting}
              onClick={() => onApprove?.(detail.id)}
            >
              通过
            </Button>
          </Space>
        ) : (
          <Button onClick={onClose}>关闭</Button>
        )
      }
      width={860}
      centered
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">教案详情</span>
          <Tag color={isPending ? 'warning' : detail.status === 'rejected' ? 'error' : 'success'}>
            {statusLabel}
          </Tag>
        </div>
      }
      bodyStyle={{
        padding: '20px 24px',
        maxHeight: 'calc(100vh - 220px)',
        overflowY: 'auto',
      }}
    >
      <Tabs
        defaultActiveKey="content"
        items={[
          { key: 'content', label: <span><EditOutlined /> 教案内容</span>, children: renderContent() },
          { key: 'comments', label: <span><MessageOutlined /> 审核批注</span>, children: renderComments() },
          { key: 'timeline', label: <span><HistoryOutlined /> 审核历史</span>, children: renderTimeline() },
        ]}
      />
    </Modal>
  );
};

export default ReviewDetailModal;
