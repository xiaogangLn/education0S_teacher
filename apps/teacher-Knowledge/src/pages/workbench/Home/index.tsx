import { useEffect, useMemo, useState } from 'react';
import { Label } from '@ui';
import { Button, Modal, Segmented } from 'antd';
import { AppstoreOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useDebounce } from 'ahooks';
import { getRandomColor } from '@/utils/colorUtils';
import { useNavigate } from 'react-router-dom';
import { processingService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';
import { CreatePicker, type GenerateType } from './CreatePicker';
import { artifactDisplayName } from '@/utils/artifactName';
import { isCommercialTenant, loadPersistedUser } from '@/utils/currentUser';
import { ImeSafeInput } from '@/components/ImeSafeInput';

type ViewMode = 'card' | 'list';

const VIEW_STORAGE_KEY = 'eduos.home.viewMode';
const RECENT_SEARCH_THRESHOLD = 6;
const RECENT_SEARCH_DEBOUNCE_MS = 300;

function loadViewMode(): ViewMode {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    return raw === 'list' ? 'list' : 'card';
  } catch {
    return 'card';
  }
}

function fuzzyMatch(item: any, keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const haystack = [
    artifactDisplayName(item.title || item.topic, item.type),
    item.title,
    item.topic,
    item.subject,
    item.type,
    item.status,
    item.current_stage,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

const Home = () => {
  const navigate = useNavigate();
  const org = useOrgContext();
  const commercial = isCommercialTenant(loadPersistedUser());
  const [tasks, setTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
  const [recentQueryInput, setRecentQueryInput] = useState('');
  const recentQuery = useDebounce(recentQueryInput, { wait: RECENT_SEARCH_DEBOUNCE_MS });
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!commercial && !org.classId) {
      setTasks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const payload = extractPayload<{ items: any[] }>(
          await processingService.getList({
            page: 1,
            page_size: 40,
            ...(commercial ? {} : { class_id: org.classId }),
          }),
        );
        if (!cancelled) setTasks(payload?.items || []);
      } catch {
        if (!cancelled) setTasks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [commercial, org.classId]);

  const featured = tasks;
  const recent = tasks;
  const showRecentSearch = recent.length >= RECENT_SEARCH_THRESHOLD;

  const filteredRecent = useMemo(() => {
    if (!showRecentSearch || !recentQuery.trim()) return recent;
    return recent.filter((item) => fuzzyMatch(item, recentQuery));
  }, [recent, recentQuery, showRecentSearch]);

  const itemsWithColor = filteredRecent.map((item) => ({
    ...item,
    color: getRandomColor(),
  }));

  const emptyHint = `暂无${commercial ? '' : (org.className || org.gradeName ? `「${org.className || org.gradeName}」的` : '')}加工记录，点击下方创建开始。`;
  const recentEmptyHint = recentQuery.trim()
    ? `未找到与「${recentQuery.trim()}」匹配的记录`
    : emptyHint;

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const handleCreateGenerate = (type: GenerateType) => {
    setCreateOpen(false);
    navigate(`/workbench/instrument?type=${type}`);
  };

  const handleResearch = () => {
    setCreateOpen(false);
    navigate('/workbench/instrument?mode=research');
  };

  const handleLibrary = () => {
    setCreateOpen(false);
    navigate('/knowledge');
  };

  const handleHistory = (item: any) => {
    if (item.type === 'research') {
      navigate(`/workbench/instrument?mode=research&id=${item.id}`);
      return;
    }
    navigate(`/workbench/instrument?id=${item.id}`);
  };

  const metaText = (item: any, forRecent = false) => {
    if (item.type === 'research') return '查资料';
    if (forRecent) return `${item.subject || ''} · ${item.status || item.current_stage || ''}`.trim();
    return `${item.subject || ''} · ${item.current_stage || ''}`.trim();
  };

  const timeText = (item: any) => (
    item.updated_at ? new Date(item.updated_at).toLocaleString('zh-CN') : ''
  );

  const renderFeaturedCards = () => (
    <div className="flex flex-wrap gap-4 content-start">
      {featured.length === 0 && (
        <div className="text-sm text-gray-400 py-2">{emptyHint}</div>
      )}
      {featured.map((item) => (
        <div
          key={item.id}
          className="relative bg-white rounded-[16px] p-5 w-[min(100%,320px)] min-h-[190px] hover:shadow-lg cursor-pointer"
          onClick={() => handleHistory(item)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-400 rounded-[16px]" />
          <div className="relative py-4 px-2 text-white">
            <h3 className="font-bold line-clamp-2">{artifactDisplayName(item.title || item.topic, item.type)}</h3>
            <span className="text-[13px] text-white/90">{metaText(item)}</span>
            <div className="text-[12px] text-white/80 mt-1">{timeText(item)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFeaturedList = () => (
    <div className="flex flex-col gap-2">
      {featured.length === 0 && (
        <div className="text-sm text-gray-400 py-2">{emptyHint}</div>
      )}
      {featured.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleHistory(item)}
          className="flex items-center gap-3 w-full text-left rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-700 to-indigo-500 px-4 py-3 text-white hover:opacity-95 cursor-pointer"
        >
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{artifactDisplayName(item.title || item.topic, item.type)}</div>
            <div className="text-xs text-white/85 mt-0.5 truncate">{metaText(item)} · {timeText(item)}</div>
          </div>
          <span className="text-xs shrink-0 opacity-90">打开</span>
        </button>
      ))}
    </div>
  );

  const renderRecentCards = () => (
    <div className="flex flex-wrap gap-4 content-start">
      <div className="group relative z-10 w-[min(100%,320px)] min-h-[190px] h-[190px] bg-white rounded-[16px] overflow-hidden hover:shadow-lg shrink-0">
        <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-200">
          <PlusOutlined style={{ fontSize: '30px' }} />
        </div>
        <div className="absolute inset-0 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-opacity duration-200">
          <CreatePicker
            onSelectGenerate={handleCreateGenerate}
            onResearch={handleResearch}
            onLibrary={handleLibrary}
          />
        </div>
      </div>
      {itemsWithColor.map((item) => (
        <div
          onClick={() => handleHistory(item)}
          key={item.id}
          className={`
            ${item.color.bg}
            ${item.color.border}
            p-6 border
            w-[min(100%,320px)]
            min-h-[190px]
            hover:shadow-md ${item.color.hover}
            transition-all duration-300
            rounded-[16px]
            cursor-pointer
          `}
        >
          <h3 className="font-bold line-clamp-2">{artifactDisplayName(item.title || item.topic, item.type)}</h3>
          <span className="text-[13px] text-[#6b7280]">{metaText(item, true)}</span>
          <div className="text-[12px] text-[#6b7280] mt-1">{timeText(item)}</div>
          <div className="flex mt-3 gap-3">
            <Button
              style={{ backgroundColor: '#eef2ff', border: 'transparent' }}
              shape="round"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleHistory(item);
              }}
            >
              <span className="text-[12px] text-[#4f46e5] font-medium">继续</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecentList = () => (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        {itemsWithColor.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-400">{recentEmptyHint}</div>
        ) : (
          itemsWithColor.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 ${
                index > 0 ? 'border-t border-gray-100' : ''
              }`}
              onClick={() => handleHistory(item)}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-800 truncate">
                  {artifactDisplayName(item.title || item.topic, item.type)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">
                  {metaText(item, true)} · {timeText(item)}
                </div>
              </div>
              <Button
                size="small"
                shape="round"
                style={{ backgroundColor: '#eef2ff', border: 'transparent' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHistory(item);
                }}
              >
                <span className="text-[12px] text-[#4f46e5] font-medium">继续</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden">
        <section className="min-h-0 max-h-[50%] flex flex-col overflow-hidden px-4 pt-3 pb-2">
          <div className="shrink-0 pb-2 flex items-center justify-between">
            <Label className="font-bold text-[16px] text-[111827]">📌 历史精选生成记录</Label>
              <Segmented
              value={viewMode}
              onChange={(value) => handleViewMode(value as ViewMode)}
              options={[
                { label: '卡片', value: 'card', icon: <AppstoreOutlined /> },
                { label: '列表', value: 'list', icon: <UnorderedListOutlined /> },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {viewMode === 'card' ? renderFeaturedCards() : renderFeaturedList()}
          </div>
        </section>

        <section className="flex-1 min-h-0 flex flex-col px-4 pt-3 pb-2">
          <div className="shrink-0 pb-2 flex items-center gap-3">
            <Label className="font-bold text-[16px] text-[111827] shrink-0">💬 创建新教案、课件、试卷</Label>
            <div className="ml-auto flex items-center gap-2 min-w-0">
              {showRecentSearch && viewMode === 'list' ? (
                <ImeSafeInput
                  allowClear
                  size="middle"
                  onValueChange={setRecentQueryInput}
                  placeholder="模糊搜索标题 / 科目 / 类型"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-[240px] max-w-[40vw]"
                />
              ) : null}
              {viewMode === 'list' ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateOpen(true)}
                >
                  新建
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {viewMode === 'card' ? (
              <>
                {showRecentSearch && recentQuery.trim() && itemsWithColor.length === 0 ? (
                  <div className="text-sm text-gray-400 py-2">{recentEmptyHint}</div>
                ) : null}
                {renderRecentCards()}
              </>
            ) : (
              renderRecentList()
            )}
          </div>
        </section>
      </div>

      <Modal
        title="选择创建类型"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
        width={480}
      >
        <div className="h-[220px]">
          <CreatePicker
            onSelectGenerate={handleCreateGenerate}
            onResearch={handleResearch}
            onLibrary={handleLibrary}
          />
        </div>
      </Modal>
    </div>
  );
};

export { Home };
