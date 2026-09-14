import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Form, Input, Modal, Select, Space, Table, Tag, Upload, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled, DownloadOutlined, InboxOutlined, PictureOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Allotment } from 'allotment';
import { knowledgeService, learningService, studentsService } from '@api/index';
import type { LearningRecordItem } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { fileToDataUrl } from '@/utils/compressImage';
import AnnotatedHomework, { downloadAnnotatedPages } from './AnnotatedHomework';
import { QrUploadModal, useQrUploadTicket } from '@/features/qrUpload';
import { useNavigate } from 'react-router-dom';
import { useOrgContext } from '@/hooks/useOrgContext';
import { useAppSelector } from '@/store/hooks';
import { canAiGrading, loadPersistedUser, quotaText } from '@/utils/currentUser';
import { useRefreshSession } from '@/hooks/useRefreshSession';
import 'allotment/dist/style.css';

const SUBJECT_MISMATCH_MESSAGE = '无法识别，学科不对应';

const STATUS_LABEL: Record<string, string> = {
  pending_confirm: '待确认',
  confirmed: '已确认',
  modified: '已修改',
  failed: '批改失败',
};

const LEARNING_STATUS_LABEL: Record<string, string> = {
  pending: '待提交',
  submitted: '待批改',
  graded: '已完成',
};

function formatLearningRecordLabel(item: LearningRecordItem) {
  const date = item.created_at ? new Date(item.created_at) : null;
  const dateText = date && !Number.isNaN(date.getTime()) ? `${date.getMonth() + 1}/${date.getDate()}` : '';
  return [
    item.student_name || '未命名学生',
    item.subject || '',
    item.assignment_title || '未命名作业',
    item.lesson_plan_title ? `教案：${item.lesson_plan_title}` : '',
    LEARNING_STATUS_LABEL[item.status] || item.status,
    dateText,
  ].filter(Boolean).join(' · ');
}

function isLearningRecordSource(record: any) {
  return record?.source === 'learning_record' || !!record?.learning_record_id;
}

function resolveTeacherSubjects(user?: { subjects?: string[] } | null): string[] {
  const list = (user?.subjects || []).map((item) => String(item).trim()).filter(Boolean);
  return list.length ? list : ['数学'];
}

function normalizeSubject(value?: string) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function isTeacherSubject(subject?: string, teacherSubjects: string[] = []) {
  const value = normalizeSubject(subject);
  if (!value) return true;
  return teacherSubjects.some((item) => normalizeSubject(item) === value);
}

type GradingVerdict = 'correct' | 'incorrect' | 'partial' | 'unanswered';

type GradingItem = {
  no: string;
  question: string;
  student_answer?: string;
  studentAnswer?: string;
  correct_answer?: string;
  correctAnswer?: string;
  verdict: GradingVerdict;
  comment: string;
  imageIndex?: number;
  image_index?: number;
  bbox?: { x: number; y: number; w: number; h: number } | number[];
};

const VERDICT_META: Record<GradingVerdict, { label: string; color: string; icon: React.ReactNode }> = {
  correct: { label: '正确', color: 'success', icon: <CheckCircleFilled className="text-green-500" /> },
  incorrect: { label: '错误', color: 'error', icon: <CloseCircleFilled className="text-red-500" /> },
  partial: { label: '部分正确', color: 'warning', icon: <CheckCircleFilled className="text-amber-500" /> },
  unanswered: { label: '未作答', color: 'default', icon: <CloseCircleFilled className="text-gray-400" /> },
};

function itemAnswer(item: GradingItem, key: 'student' | 'correct') {
  if (key === 'student') return item.student_answer || item.studentAnswer || '未作答';
  return item.correct_answer || item.correctAnswer || '—';
}

function countLabel(record: any) {
  if (record?.summary) return record.summary;
  if (typeof record?.correct_count === 'number' && typeof record?.incorrect_count === 'number') {
    return `正确 ${record.correct_count} · 错误 ${record.incorrect_count}`;
  }
  return '—';
}

const SmartGradingPage: React.FC = () => {
  const navigate = useNavigate();
  const org = useOrgContext();
  const currentUser = useAppSelector((state) => state.user.current);
  const refreshSession = useRefreshSession();
  const teacherSubjects = useMemo(
    () => resolveTeacherSubjects(currentUser || loadPersistedUser()),
    [currentUser],
  );
  const teacherSubject = teacherSubjects[0] || '数学';
  const gradingAllowed = canAiGrading(currentUser || loadPersistedUser());
  const aiQuota = (currentUser || loadPersistedUser())?.quotas?.aiGrading;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [learningRecords, setLearningRecords] = useState<LearningRecordItem[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const imageValue = Form.useWatch('images', form);
  const imageCount = imageValue?.fileList?.length || 0;
  const studentId = Form.useWatch('student_id', form);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const payload = extractPayload<{ items: any[] }>(await knowledgeService.getGradingList({ page: 1, page_size: 20 }));
      setItems(payload?.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const gradingTicket = useQrUploadTicket({
    onDone: () => {
      message.success('手机已提交，正在查看批改记录');
      loadList();
    },
  });

  const loadLearningRecords = useCallback(async () => {
    try {
      const payload = extractPayload<{ items: LearningRecordItem[] }>(
        await learningService.getList({
          class_id: org.classId,
          student_id: studentId,
          page: 1,
          page_size: 50,
        }),
      );
      setLearningRecords(payload?.items || []);
    } catch {
      setLearningRecords([]);
    }
  }, [org.classId, studentId]);

  useEffect(() => {
    form.setFieldsValue({ subject: teacherSubject });
  }, [form, teacherSubject]);

  useEffect(() => {
    loadList();
    studentsService.getList({ page: 1, page_size: 100 }).then((res) => {
      const payload = extractPayload<{ items: any[] }>(res);
      setStudents(payload?.items || []);
    }).catch(() => undefined);
  }, [loadList]);

  useEffect(() => {
    loadLearningRecords();
  }, [loadLearningRecords]);

  const handleLearningRecordChange = (id?: string) => {
    if (!id) return;
    const record = learningRecords.find((item) => item.id === id);
    if (!record) return;
    if (record.subject && !isTeacherSubject(record.subject, teacherSubjects)) {
      message.error(SUBJECT_MISMATCH_MESSAGE);
      form.setFieldValue('learning_record_id', undefined);
      return;
    }
    form.setFieldsValue({
      learning_record_id: id,
      assignment_title: record.assignment_title || form.getFieldValue('assignment_title'),
      student_id: record.student_id,
      subject: record.subject && isTeacherSubject(record.subject, teacherSubjects) ? record.subject : teacherSubject,
    });
  };

  const requireTitleOrRecord = async (_: unknown, value: string) => {
    const title = form.getFieldValue('assignment_title');
    const recordId = form.getFieldValue('learning_record_id');
    if (!String(title || value || '').trim() && !recordId) {
      throw new Error('请输入作业标题或选择学习记录');
    }
  };

  const handleSubmit = async () => {
    if (!gradingAllowed) {
      message.error('本月 AI 批改次数已用完，请升级套餐');
      return;
    }
    const values = await form.validateFields();
    const selectedRecord = learningRecords.find((item) => item.id === values.learning_record_id);
    if (selectedRecord?.subject && !isTeacherSubject(selectedRecord.subject, teacherSubjects)) {
      message.error(SUBJECT_MISMATCH_MESSAGE);
      return;
    }
    setLoading(true);
    try {
      const imageUrls: string[] = [];
      for (const file of values.images?.fileList || []) {
        const raw = file.originFileObj as File | undefined;
        if (raw) imageUrls.push(await fileToDataUrl(raw));
      }
      const payload = extractPayload<{ status?: string; ai_feedback?: string; summary?: string; subject_mismatch?: boolean }>(
        await knowledgeService.gradingPhoto({
          student_id: values.student_id,
          subject: values.subject && isTeacherSubject(values.subject, teacherSubjects) ? values.subject : teacherSubject,
          assignment_title: values.assignment_title,
          learning_record_id: values.learning_record_id,
          image_urls: imageUrls,
        }),
      );
      if (payload?.subject_mismatch || String(payload?.ai_feedback || payload?.summary || '').includes('学科不对应')) {
        message.error(SUBJECT_MISMATCH_MESSAGE);
      } else {
        message.success('已提交拍照批改');
      }
      form.resetFields();
      form.setFieldsValue({ subject: teacherSubject });
      await loadList();
      void refreshSession().catch(() => undefined);
    } catch (error: any) {
      message.error(error?.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQr = async () => {
    if (!gradingAllowed) {
      message.error('本月 AI 批改次数已用完，请升级套餐');
      return;
    }
    const values = await form.validateFields(['assignment_title', 'learning_record_id', 'student_id', 'subject']);
    const selectedRecord = learningRecords.find((item) => item.id === values.learning_record_id);
    if (selectedRecord?.subject && !isTeacherSubject(selectedRecord.subject, teacherSubjects)) {
      message.error(SUBJECT_MISMATCH_MESSAGE);
      return;
    }
    await gradingTicket.create({
      purpose: 'grade',
      student_id: values.student_id,
      class_id: org.classId,
      subject: values.subject && isTeacherSubject(values.subject, teacherSubjects) ? values.subject : teacherSubject,
      assignment_title: values.assignment_title,
      learning_record_id: values.learning_record_id,
    });
  };

  const openDetail = async (id: string) => {
    const payload = extractPayload<{ record: any }>(await knowledgeService.getGradingDetail(id));
    const record = payload?.record || payload;
    setDetail(record);
    setFeedback('');
    setPreviewOpen(false);
  };

  const annotatedPages = useMemo(() => {
    const images = (detail?.images || []) as string[];
    return images.map((src, index) => {
      const imageItems = (detail?.items || []).filter(
        (item: GradingItem) => (item.imageIndex ?? item.image_index ?? 0) === index,
      );
      return {
        src,
        items: imageItems.length ? imageItems : index === 0 ? detail?.items || [] : [],
      };
    });
  }, [detail]);

  const handleDownloadAnnotated = async () => {
    if (!annotatedPages.length) return;
    setDownloading(true);
    try {
      await downloadAnnotatedPages(annotatedPages, `${detail?.assignment_title || '作业'}-原图批注`);
      message.success('已开始下载原图批注');
    } catch (error: any) {
      message.error(error?.message || '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🤖 智能批改</h2>
          <p className="text-sm text-gray-500">填写作业标题，或选择一次学习记录，上传照片按题给出正确/错误批注</p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>

      <Card
        title="提交拍照批改"
        className="overflow-hidden shrink-0"
        styles={{ body: { padding: 0, height: 260 } }}
      >
        <Form form={form} layout="vertical" className="h-full">
          <div className="flex h-full flex-col overflow-hidden">
            <Allotment className="flex-1" defaultSizes={[0.3, 0.7]} proportionalLayout>
              <Allotment.Pane minSize={320} preferredSize="32%">
                <div className="box-border h-full overflow-y-auto bg-[#F8FAFC] p-4 pl-6">
                  <div className="flex gap-3">
                    <Form.Item name="student_id" label="学生" className="mb-4 min-w-0 flex-1">
                      <Select
                        showSearch
                        allowClear
                        placeholder="选择学生"
                        optionFilterProp="label"
                        options={students.map((item) => ({ value: item.id, label: `${item.name}（${item.student_no}）` }))}
                        onChange={(id?: string) => {
                          const recordId = form.getFieldValue('learning_record_id');
                          if (!recordId) return;
                          const record = learningRecords.find((item) => item.id === recordId);
                          if (record && id && record.student_id !== id) {
                            form.setFieldValue('learning_record_id', undefined);
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="subject" label="学科" className="mb-4 min-w-0 flex-1">
                      {teacherSubjects.length > 1 ? (
                        <Select
                          options={teacherSubjects.map((item) => ({ label: item, value: item }))}
                        />
                      ) : (
                        <Input disabled />
                      )}
                    </Form.Item>
                  </div>
                  <div className="flex items-start gap-2">
                    <Form.Item
                      name="assignment_title"
                      label="作业标题"
                      className="mb-3 min-w-0 flex-1"
                      dependencies={['learning_record_id']}
                      rules={[{ validator: requireTitleOrRecord }]}
                    >
                      <Input placeholder="手动填写标题" />
                    </Form.Item>
                    <div className="mt-[30px] flex h-8 shrink-0 items-center text-sm font-medium leading-none text-gray-500">
                      或
                    </div>
                    <Form.Item
                      name="learning_record_id"
                      label="学习记录"
                      className="mb-3 min-w-0 flex-1"
                      dependencies={['assignment_title']}
                      rules={[{ validator: requireTitleOrRecord }]}
                    >
                      <Select
                        showSearch
                        allowClear
                        placeholder="选择一次学习记录"
                        optionFilterProp="label"
                        popupMatchSelectWidth={false}
                        styles={{ popup: { root: { minWidth: 420 } } }}
                        options={learningRecords.map((item) => ({
                          value: item.id,
                          label: formatLearningRecordLabel(item),
                        }))}
                        onChange={handleLearningRecordChange}
                      />
                    </Form.Item>
                  </div>
                  <div className="mb-2 text-xs text-gray-500">
                    本月批改 {quotaText(aiQuota?.used, aiQuota?.limit)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      icon={<QrcodeOutlined />}
                      loading={gradingTicket.creating}
                      disabled={!gradingAllowed}
                      onClick={handleCreateQr}
                    >
                      扫码拍照
                    </Button>
                    <Button type="primary" className="flex-1" loading={loading} disabled={!gradingAllowed} onClick={handleSubmit}>
                      {loading ? '识别中…' : '提交批阅'}
                    </Button>
                  </div>
                </div>
              </Allotment.Pane>
              <Allotment.Pane minSize={360} preferredSize="70%">
                <div className="box-border flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-4">
                  <div className="mb-2 text-sm text-gray-700">作业照片</div>
                  <Form.Item
                    name="images"
                    className="mb-0 min-h-0 flex-1 [&_.ant-form-item-row]:h-full [&_.ant-form-item-control]:h-full [&_.ant-form-item-control-input]:h-full [&_.ant-form-item-control-input-content]:h-full"
                  >
                    <Upload.Dragger
                      beforeUpload={() => false}
                      listType="picture"
                      maxCount={6}
                      accept="image/*"
                      multiple
                      className={`!flex flex-col justify-center !border-dashed !bg-[#F8FAFC] hover:!border-indigo-300 ${
                        imageCount ? '' : 'h-full'
                      }`}
                    >
                      <p className="ant-upload-drag-icon !mb-2">
                        <InboxOutlined className="text-4xl text-indigo-400" />
                      </p>
                      <p className="ant-upload-text !text-sm !text-gray-600">点击或拖拽作业照片到这里</p>
                      <p className="ant-upload-hint !text-xs !text-gray-400">支持 jpg / png，最多 6 张</p>
                    </Upload.Dragger>
                  </Form.Item>
                </div>
              </Allotment.Pane>
            </Allotment>
          </div>
        </Form>
      </Card>

      <Card
        title="批改记录"
        className="flex-1 min-h-0"
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        styles={{
          header: { flex: 'none' },
          body: {
            flex: '1 1 0%',
            minHeight: 0,
            overflowY: 'auto',
            paddingBottom: 20,
          },
        }}
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={false}
          columns={[
            { title: '学生', dataIndex: 'student_name' },
            { title: '学科', dataIndex: 'subject' },
            {
              title: '作业',
              dataIndex: 'assignment_title',
              render: (value: string, record) => (
                <div className="min-w-0">
                  <div className="truncate">{value || '—'}</div>
                  {isLearningRecordSource(record) ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Tag color="blue">学习记录</Tag>
                      {record.lesson_plan_title ? (
                        <span className="text-xs text-gray-400">教案：{record.lesson_plan_title}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ),
            },
            {
              title: '批改结果',
              render: (_, record) => countLabel(record),
            },
            {
              title: '状态',
              dataIndex: 'status',
              render: (value: string) => <Tag>{STATUS_LABEL[value] || value}</Tag>,
            },
            {
              title: '操作',
              render: (_, record) => (
                <Button type="link" onClick={() => openDetail(record.id)}>
                  查看
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title="批改详情"
        open={!!detail}
        width={860}
        onClose={() => {
          setPreviewOpen(false);
          setDetail(null);
        }}
      >
        {detail && (
          <Space direction="vertical" className="w-full" size="middle">
            <div className="text-sm text-gray-600">
              {detail.student_name || '未关联'} · {detail.subject || ''} · {detail.assignment_title}
              {isLearningRecordSource(detail) ? (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Tag color="blue">学习记录</Tag>
                  {detail.lesson_plan_title ? <span>教案：{detail.lesson_plan_title}</span> : null}
                </span>
              ) : null}
            </div>
            {detail.summary ? <div className="font-medium">{detail.summary}</div> : null}
            {annotatedPages.length > 0 ? (
              <Button type="primary" ghost icon={<PictureOutlined />} onClick={() => setPreviewOpen(true)}>
                查看原图批注
              </Button>
            ) : null}
            {(detail.items || []).length > 0 ? (
              <div className="space-y-3">
                {(detail.items as GradingItem[]).map((item) => {
                  const meta = VERDICT_META[item.verdict] || VERDICT_META.incorrect;
                  return (
                    <div
                      key={`${item.no}-${item.question}`}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="font-semibold">第 {item.no} 题</div>
                        <Tag color={meta.color} icon={meta.icon}>
                          {meta.label}
                        </Tag>
                      </div>
                      <div className="space-y-2 text-[15px] leading-7">
                        <div>
                          <div className="text-xs text-gray-400">题目</div>
                          <div>{item.question || '—'}</div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div>
                            <div className="text-xs text-gray-400">学生作答</div>
                            <div>{itemAnswer(item, 'student')}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">参考答案</div>
                            <div>{itemAnswer(item, 'correct')}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">批注</div>
                          <div className={item.verdict === 'incorrect' || item.verdict === 'unanswered' ? 'text-red-600' : 'text-green-700'}>
                            {item.comment || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-[15px] leading-7">
                {detail.ai_feedback || '暂无逐题批注'}
              </div>
            )}
            <Input.TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="教师补充批注（可选）" />
            <Space>
              <Button
                type="primary"
                onClick={async () => {
                  await knowledgeService.confirmGrading(detail.id, true, feedback);
                  message.success('已确认');
                  setPreviewOpen(false);
                  setDetail(null);
                  loadList();
                }}
              >
                确认批改
              </Button>
              <Button
                onClick={async () => {
                  await knowledgeService.updateGrading(detail.id, { feedback });
                  message.success('已保存补充批注');
                  setPreviewOpen(false);
                  setDetail(null);
                  loadList();
                }}
              >
                保存批注
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>

      <Modal
        title="原图批注"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={920}
        centered
        zIndex={1200}
        destroyOnHidden
        footer={[
          <Button key="download" icon={<DownloadOutlined />} loading={downloading} onClick={handleDownloadAnnotated}>
            下载
          </Button>,
          <Button key="close" onClick={() => setPreviewOpen(false)}>
            关闭
          </Button>,
        ]}
      >
        <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
          {annotatedPages.map((page, index) => (
            <AnnotatedHomework key={index} src={page.src} items={page.items} />
          ))}
        </div>
      </Modal>

      <QrUploadModal
        open={gradingTicket.open}
        qrUrl={gradingTicket.qrUrl}
        ticket={gradingTicket.ticket}
        onClose={gradingTicket.close}
      />
    </div>
  );
};

export default SmartGradingPage;
