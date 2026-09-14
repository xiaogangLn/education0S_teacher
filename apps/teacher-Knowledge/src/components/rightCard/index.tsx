import React, { useEffect, useRef, useState } from 'react';
import {
  AppstoreOutlined,
  ExportOutlined,
  EyeOutlined,
  FileOutlined,
  FileTextOutlined,
  StarFilled,
  StarOutlined,
  CheckCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Divider, Input, Modal, Tag, Tooltip, Upload, message } from 'antd';
import type { TemplateType } from '@/pages/workbench/Instrument/types';
import { useSchoolTemplates, type WorkbenchTemplate } from './useSchoolTemplates';
import { useOrgContext } from '@/hooks/useOrgContext';
import { knowledgeService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { ArtifactPreview } from '@/components/artifactPreview';
import { exportByTemplate, resolveExportSpec } from '@/utils/exportByTemplate';

const FAVORITE_STORE = 'generationFavoriteDocs';

function readFavoriteMap(): Record<string, { docId: string; favorited: boolean }> {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_STORE) || '{}');
  } catch {
    return {};
  }
}

function writeFavoriteMap(map: Record<string, { docId: string; favorited: boolean }>) {
  localStorage.setItem(FAVORITE_STORE, JSON.stringify(map));
}

function templateIcon(kind: string) {
  if (kind === 'courseware') return <AppstoreOutlined />;
  if (kind === 'exam') return <FileTextOutlined />;
  return <FileOutlined />;
}

interface RightPanelProps {
  selectedTemplate?: TemplateType;
  selectedTemplateMeta?: WorkbenchTemplate | null;
  onSelectTemplate?: (template: TemplateType, meta?: WorkbenchTemplate) => void;
  currentTaskId?: string;
  recordTitle?: string;
  recordMarkdown?: string;
  answerMarkdown?: string;
  hideTemplates?: boolean;
  onOptimize?: (text: string) => void;
  optimizeMode?: 'stage' | 'final';
  optimizeStageTitle?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedTemplate,
  selectedTemplateMeta,
  onSelectTemplate,
  currentTaskId,
  recordTitle,
  recordMarkdown,
  answerMarkdown,
  hideTemplates = false,
  onOptimize,
  optimizeMode = 'final',
  optimizeStageTitle,
}) => {
  const org = useOrgContext();
  const { commonTemplates, schoolTemplates, uploading, subject, uploadTemplate, toBuiltinType } = useSchoolTemplates();
  const kindRef = useRef('lesson_plan');
  const selectedInfo = selectedTemplateMeta || commonTemplates.find((item) => item.builtin_type === selectedTemplate);
  const isItemSelected = (item: WorkbenchTemplate) =>
    selectedTemplateMeta?.id ? item.id === selectedTemplateMeta.id : item.builtin_type === selectedTemplate;
  const exportSpec = resolveExportSpec(selectedTemplateMeta?.kind || selectedInfo?.kind, selectedTemplateMeta?.builtin_type || selectedTemplate);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewMarkdown, setPreviewMarkdown] = useState('');
  const [exporting, setExporting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [optimizeText, setOptimizeText] = useState('');

  useEffect(() => {
    if (!currentTaskId) {
      setFavorited(false);
      return;
    }
    setFavorited(Boolean(readFavoriteMap()[currentTaskId]?.favorited));
  }, [currentTaskId]);

  const handleTemplateClick = (item: WorkbenchTemplate) => {
    onSelectTemplate?.(item.builtin_type, item);
  };

  const ensureRecord = (markdown?: string, emptyText = '还没有可预览的生成内容，请先开始生成') => {
    if (!markdown?.trim()) {
      message.warning(emptyText);
      return false;
    }
    return true;
  };

  const openPreview = (title: string, markdown?: string, emptyText?: string) => {
    if (!ensureRecord(markdown, emptyText)) return;
    setPreviewTitle(title);
    setPreviewMarkdown(markdown || '');
    setPreviewOpen(true);
  };

  const handlePreview = () => {
    openPreview(recordTitle || '生成预览', recordMarkdown);
  };

  const runExport = async (title: string, markdown?: string, emptyText?: string) => {
    if (!ensureRecord(markdown, emptyText)) return;
    setExporting(true);
    try {
      const spec = await exportByTemplate({
        title,
        markdown: markdown || '',
        kind: selectedTemplateMeta?.kind || selectedInfo?.kind,
        builtinType: selectedTemplateMeta?.builtin_type || selectedTemplate,
      });
      message.success(`已按「${selectedInfo?.title || selectedTemplate || '当前模板'}」导出为 ${spec.label}`);
    } catch {
      message.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => {
    runExport(recordTitle || '生成记录', previewMarkdown || recordMarkdown);
  };

  const handleFavorite = async () => {
    if (!ensureRecord(recordMarkdown)) return;
    setFavoriting(true);
    try {
      const store = readFavoriteMap();
      const existing = currentTaskId ? store[currentTaskId] : undefined;
      if (existing?.docId) {
        const result = extractPayload<{ favorited: boolean }>(await knowledgeService.toggleFavorite(existing.docId));
        const next = Boolean(result?.favorited);
        if (currentTaskId) {
          store[currentTaskId] = { docId: existing.docId, favorited: next };
          writeFavoriteMap(store);
        }
        setFavorited(next);
        message.success(next ? '已加入知识库收藏' : '已取消收藏');
        return;
      }
      const created = extractPayload<any>(await knowledgeService.create({
        title: recordTitle || '生成记录',
        type: 'document',
        content: recordMarkdown,
        permission: 'personal',
        category: selectedTemplateMeta?.kind || 'lesson_plan',
        subject: selectedTemplateMeta?.subject || '数学',
        grade_id: org.gradeId,
        source_key: currentTaskId ? `generation:${currentTaskId}` : undefined,
      }));
      const docId = created?.id || created?.document?.id;
      if (!docId) throw new Error('未返回文档');
      const fav = extractPayload<{ favorited: boolean }>(await knowledgeService.toggleFavorite(docId));
      const next = fav?.favorited !== false;
      if (currentTaskId) {
        store[currentTaskId] = { docId, favorited: next };
        writeFavoriteMap(store);
      }
      setFavorited(next);
      message.success('已收藏到知识库');
    } catch (error: any) {
      message.error(error?.message || '收藏失败');
    } finally {
      setFavoriting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 pl-7 border-b">
        <span className="font-semibold text-base">{hideTemplates ? '📌 产物' : '📌 模板与产物'}</span>
        {selectedInfo && !hideTemplates && (
          <Tag color="blue" className="text-xs">当前: {selectedInfo.title}</Tag>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 pl-7 space-y-4">
        {!hideTemplates && selectedTemplateMeta && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="text-xs text-blue-500 mb-1">本记录选用模板</div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                {templateIcon(selectedTemplateMeta.kind)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{selectedTemplateMeta.title}</div>
                <div className="text-xs text-gray-500">
                  {selectedTemplateMeta.source_label || selectedTemplateMeta.builtin_type}
                </div>
              </div>
            </div>
          </div>
        )}

        {!hideTemplates && (
          <>
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">常用模板</span>
            <span className="text-xs text-gray-400">{[org.gradeName, subject].filter(Boolean).join(' · ') || '当前学校'}</span>
          </div>
          {commonTemplates.length === 0 ? (
            <div className="text-xs text-gray-400">正在加载模板，或当前学校/学科暂无可用模板。</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {commonTemplates.map((item) => (
                <div
                  key={item.id}
                  className={`group bg-white p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isItemSelected(item)
                      ? 'border-blue-500 shadow-md bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                  onClick={() => handleTemplateClick(item)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isItemSelected(item)
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                    }`}>
                      {templateIcon(item.kind)}
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-800">{item.title}</div>
                      <Tag color={isItemSelected(item) ? 'blue' : 'default'} className="text-xs mt-1">
                        {item.source_label}
                      </Tag>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider className="my-2" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">本校教案/课件模板</span>
            <Upload
              accept=".md,.txt,.doc,.docx,.ppt,.pptx,.pdf"
              showUploadList={false}
              beforeUpload={(file) => {
                const selected = commonTemplates.find((item) => item.builtin_type === selectedTemplate);
                kindRef.current = selected?.kind === 'exam' ? 'exam' : selected?.kind === 'courseware' ? 'courseware' : 'lesson_plan';
                void uploadTemplate(file, kindRef.current, selected?.kind === 'exam' ? 'personal' : 'school');
                return false;
              }}
            >
              <Button type="link" size="small" icon={<UploadOutlined />} loading={uploading}>
                上传模板
              </Button>
            </Upload>
          </div>
          {schoolTemplates.length === 0 ? (
            <div className="text-xs text-gray-400">该学段活动没有校本模板，请上传教案/课件模板。</div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {schoolTemplates.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl cursor-pointer ${
                    isItemSelected(item)
                      ? 'bg-blue-50 border border-blue-400'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectTemplate?.(toBuiltinType(item.kind), item)}
                >
                  <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item.source_label} · {item.builtin_type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider className="my-2" />
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">本次生成记录</span>
          </div>
          {selectedTemplate === '试卷模板' ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileTextOutlined />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">学生卷</div>
                    <div className="text-xs text-gray-400 truncate">{recordTitle || '未命名试卷'} · 不含答案</div>
                  </div>
                </div>
                <div className="flex justify-end gap-1 mt-2">
                  <Tooltip title="预览学生卷">
                    <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openPreview(`${recordTitle || '试卷'} · 学生卷`, recordMarkdown, '学生卷尚未生成')} />
                  </Tooltip>
                  <Tooltip title={`导出 ${exportSpec.label}`}>
                    <Button type="text" size="small" icon={<ExportOutlined />} loading={exporting} onClick={() => runExport(`${recordTitle || '试卷'}-学生卷`, recordMarkdown, '学生卷尚未生成')} />
                  </Tooltip>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <CheckCircleOutlined />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">参考答案</div>
                    <div className="text-xs text-gray-400 truncate">
                      {answerMarkdown?.trim() ? '与学生卷题号对应' : '精修后在此展示'}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1 mt-2">
                  <Tooltip title="预览参考答案">
                    <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openPreview(`${recordTitle || '试卷'} · 参考答案`, answerMarkdown, '参考答案尚未生成，请先确认学生卷并进入精修')} />
                  </Tooltip>
                  <Tooltip title={`导出 ${exportSpec.label}`}>
                    <Button type="text" size="small" icon={<ExportOutlined />} loading={exporting} onClick={() => runExport(`${recordTitle || '试卷'}-参考答案`, answerMarkdown, '参考答案尚未生成')} />
                  </Tooltip>
                </div>
              </div>
            </div>
          ) : !recordMarkdown?.trim() ? (
            <div className="text-xs text-gray-400">开始生成后，这里会显示当前产物。</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileTextOutlined />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">{recordTitle || '未命名课题'}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {exportSpec.label} · {[selectedTemplate, org.className].filter(Boolean).join(' · ') || '当前班级'}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1 mt-2">
                  <Tooltip title={`预览 ${exportSpec.label}`}>
                    <Button type="text" size="small" icon={<EyeOutlined />} onClick={handlePreview} />
                  </Tooltip>
                  <Tooltip title={`导出 ${exportSpec.label}`}>
                    <Button type="text" size="small" icon={<ExportOutlined />} loading={exporting} onClick={handleExport} />
                  </Tooltip>
                  <Tooltip title={favorited ? '取消收藏' : '收藏到知识库'}>
                    <Button
                      type="text"
                      size="small"
                      icon={favorited ? <StarFilled className="text-amber-500" /> : <StarOutlined />}
                      loading={favoriting}
                      onClick={handleFavorite}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={`${previewTitle || recordTitle || '生成预览'} · ${exportSpec.label} 预览`}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="export" icon={<ExportOutlined />} onClick={() => runExport(previewTitle || recordTitle || '生成记录', previewMarkdown)}>导出 {exportSpec.label}</Button>,
          <Button key="fav" icon={favorited ? <StarFilled /> : <StarOutlined />} onClick={handleFavorite}>
            {favorited ? '已收藏' : '收藏'}
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewOpen(false)}>关闭</Button>,
        ]}
        width={exportSpec.format === 'ppt' ? 960 : exportSpec.format === 'doc' ? 860 : 720}
        destroyOnClose
      >
        <div className="max-h-[58vh] overflow-auto">
          <ArtifactPreview
            format={exportSpec.format}
            title={previewTitle || recordTitle || '生成预览'}
            markdown={previewMarkdown || ''}
          />
        </div>
        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
          <div className="mb-2 text-xs text-indigo-700">
            预览按{exportSpec.format === 'ppt' ? ' PPT' : exportSpec.format === 'doc' ? ' Word' : ' 当前'}文件类型呈现。
            {optimizeMode === 'stage'
              ? `对「${optimizeStageTitle || '当前阶段'}」不满意，直接说明修改意见，将只优化这一阶段。`
              : '效果不满意，直接说明修改意见，将按你的要求优化终稿。'}
          </div>
          <div className="flex gap-2">
            <Input.TextArea
              value={optimizeText}
              onChange={(event) => setOptimizeText(event.target.value)}
              placeholder={
                optimizeMode === 'stage'
                  ? `例如：${optimizeStageTitle || '这一阶段'}再写具体一点，突出本班薄弱点`
                  : exportSpec.format === 'ppt'
                    ? '例如：封面再简洁一些，例题页加一题变式'
                    : '例如：教学过程再写细一点，增加分层作业'
              }
              autoSize={{ minRows: 1, maxRows: 3 }}
              className="!min-h-[36px]"
            />
            <Button
              type="primary"
              disabled={!optimizeText.trim() || !onOptimize}
              onClick={() => {
                const text = optimizeText.trim();
                if (!text || !onOptimize) return;
                onOptimize(text);
                setOptimizeText('');
                setPreviewOpen(false);
                message.success(optimizeMode === 'stage'
                  ? `已提交修改意见，正在优化「${optimizeStageTitle || '当前阶段'}」`
                  : '已提交修改意见，正在优化终稿');
              }}
            >
              {optimizeMode === 'stage' ? '优化当前阶段' : '优化终稿'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
