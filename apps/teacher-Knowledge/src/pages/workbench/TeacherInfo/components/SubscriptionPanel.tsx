import { useEffect, useMemo, useRef } from 'react';
import { Alert, Button, Progress, message } from 'antd';
import {
  CheckOutlined,
  InfoCircleFilled,
} from '@ant-design/icons';
import { PLAN_LABELS } from '@api/index';
import { remainingPlanDays } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';
import { useRefreshSession } from '@/hooks/useRefreshSession';

type PlanCode = 'basic' | 'pro' | 'turbo';

const PERIOD_DAYS = 30;

const PLAN_CARDS: Array<{
  code: PlanCode;
  name: string;
  price: string;
  priceUnit: string;
  features: string[];
  popular?: boolean;
  dark?: boolean;
}> = [
  {
    code: 'basic',
    name: '基础版',
    price: '¥0',
    priceUnit: '/月',
    features: [
      '基础教案生成',
      '有限资源配额',
      '标准模型支持',
      '师生画像约每 2 个月更新 1 次（共用）',
    ],
  },
  {
    code: 'pro',
    name: 'Pro 版',
    price: '¥30',
    priceUnit: '/月',
    popular: true,
    features: [
      '完整学生管理',
      '个性化作业与画像',
      '学情与教师能力匹配',
      '按套餐配额使用',
      '师生画像约每月更新 1 次（共用）',
    ],
  },
  {
    code: 'turbo',
    name: 'Turbo 版',
    price: '¥99',
    priceUnit: '/月',
    dark: true,
    features: [
      '包含 Pro 版所有功能',
      '思考过程保留',
      '高级模型调用',
      '更高配额与优先支持',
      '师生画像约每周更新 1 次（共用）',
    ],
  },
];

function portraitPolicyLabel(user?: {
  tenant?: {
    planCode?: string | null;
    portraitRefreshIntervalDays?: number;
    portraitRefreshPolicy?: string;
  } | null;
} | null) {
  const policy = user?.tenant?.portraitRefreshPolicy;
  if (policy) return policy;
  const days = user?.tenant?.portraitRefreshIntervalDays;
  if (days == null) {
    const plan = user?.tenant?.planCode;
    if (plan === 'turbo') return '约每周更新 1 次（间隔 7 天）';
    if (plan === 'pro') return '约每月更新 1 次（间隔 30 天）';
    return '约每 2 个月更新 1 次（间隔 60 天）';
  }
  if (days >= 60) return `约每 ${Math.round(days / 30)} 个月更新 1 次（间隔 ${days} 天）`;
  if (days >= 28) return `约每月更新 1 次（间隔 ${days} 天）`;
  if (days >= 7) return `约每周更新 1 次（间隔 ${days} 天）`;
  return `最少间隔 ${days} 天更新 1 次`;
}
function quotaPercent(used?: number, limit?: number | null) {
  if (limit == null || limit <= 0) return 0;
  return Math.min(100, Math.round(((used ?? 0) / limit) * 100));
}

function QuotaBar({
  label,
  used,
  limit,
}: {
  label: string;
  used?: number;
  limit?: number | null;
}) {
  const text = limit == null ? `${used ?? 0} / 不限` : `${used ?? 0} / ${limit}`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="tabular-nums text-gray-800">{text}</span>
      </div>
      <Progress
        percent={quotaPercent(used, limit)}
        showInfo={false}
        strokeColor="#3b82f6"
        trailColor="#e5e7eb"
        size={["100%", 8]}
      />
    </div>
  );
}

export default function SubscriptionPanel() {
  const user = useAppSelector((state) => state.user.current);
  const refreshSession = useRefreshSession();
  const plansRef = useRef<HTMLDivElement>(null);

  const planCode = (user?.tenant?.planCode || 'basic') as PlanCode;
  const days = remainingPlanDays(user?.tenant?.planExpiresAt);
  const trialDays = remainingPlanDays(user?.tenant?.studentTrialEndsAt);
  const students = user?.quotas?.students;
  const ai = user?.quotas?.aiGrading;
  const lessonPlan = user?.quotas?.lessonPlan;
  const courseware = user?.quotas?.courseware;
  const exam = user?.quotas?.exam;
  const expired = days != null && days < 0;
  const trialActive = trialDays != null && trialDays >= 0;
  const isBasic = planCode === 'basic';
  const planLabel = PLAN_LABELS[planCode] || planCode;
  const portraitPolicy = portraitPolicyLabel(user);

  const validityDays = useMemo(() => {
    if (days == null) return PERIOD_DAYS;
    if (expired) return 0;
    return Math.max(0, days);
  }, [days, expired]);

  const validityPercent = Math.min(100, Math.round((validityDays / PERIOD_DAYS) * 100));
  const studentPercent = quotaPercent(students?.used, students?.limit);

  useEffect(() => {
    void refreshSession().catch(() => undefined);
  }, [refreshSession]);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUpgrade = (target: PlanCode) => {
    if (target === planCode) return;
    message.info('请联系管理员开通或续期对应套餐（系统内支付通道筹备中）');
  };

  return (
    <div className="space-y-5 p-2 md:p-4">
      {/* 顶部三卡 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">当前套餐</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{planLabel}</div>
          {planCode !== 'turbo' ? (
            <Button
              type="default"
              className="mt-4 !h-8 !rounded-lg !border-blue-200 !px-4 !text-blue-500 hover:!border-blue-400 hover:!text-blue-600"
              onClick={scrollToPlans}
            >
              升级
            </Button>
          ) : (
            <div className="mt-4 text-sm text-gray-400">已是最高档</div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">本月有效期</div>
          <div
            className="mt-2 text-3xl font-bold tabular-nums"
            style={{ color: expired || validityDays <= 3 ? '#ef4444' : '#2563eb' }}
          >
            {days == null ? '未设置' : expired ? '已过期' : `${validityDays} 天`}
          </div>
          <Progress
            className="mt-4 !mb-0"
            percent={days == null ? 0 : validityPercent}
            showInfo={false}
            strokeColor="#3b82f6"
            trailColor="#e5e7eb"
            size={["100%", 6]}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">{isBasic ? '学生体验名额' : '学生名额'}</div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
                {students?.limit == null
                  ? `${students?.used ?? 0} / 不限`
                  : `${students?.used ?? 0} / ${students.limit} 人`}
              </div>
            </div>
            {students?.limit != null ? (
              <Progress
                type="circle"
                percent={studentPercent}
                size={72}
                strokeColor="#3b82f6"
                trailColor="#e5e7eb"
                format={() => (
                  <span className="text-xs text-gray-400">{studentPercent}%</span>
                )}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* 体验提示 */}
      {isBasic ? (
        <div
          className={`flex gap-3 rounded-2xl border px-4 py-3 ${
            trialActive
              ? 'border-blue-100 bg-blue-50 text-blue-900'
              : 'border-amber-100 bg-amber-50 text-amber-900'
          }`}
        >
          <InfoCircleFilled className={`mt-0.5 text-base ${trialActive ? 'text-blue-500' : 'text-amber-500'}`} />
          <div className="min-w-0 flex-1 text-sm leading-6">
            <div className="font-medium">
              {trialActive ? `学生管理体验剩余 ${trialDays} 天` : '学生管理体验已结束'}
            </div>
            <div className={trialActive ? 'text-blue-700/80' : 'text-amber-800/80'}>
              基础版不含学生管理模块。到期后不再开放。
              <button
                type="button"
                className="ml-1 inline font-medium text-blue-600 underline-offset-2 hover:underline"
                onClick={scrollToPlans}
              >
                了解详情 → 立即升级
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {expired ? (
        <Alert
          type="warning"
          showIcon
          message="套餐已到期，部分能力已降权"
          description="请联系管理员续期，或升级到 Pro / Turbo。"
        />
      ) : null}

      {/* 资源使用情况 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-base font-semibold text-gray-900">资源使用情况</div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <QuotaBar label="教案" used={lessonPlan?.used} limit={lessonPlan?.limit} />
          <QuotaBar label="课件" used={courseware?.used} limit={courseware?.limit} />
          <QuotaBar label="试卷" used={exam?.used} limit={exam?.limit} />
          <QuotaBar label="批改" used={ai?.used} limit={ai?.limit} />
        </div>
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">
          <div className="font-medium">师生画像更新次数（共用）</div>
          <div className="mt-1 text-blue-800/90">
            当前套餐：{portraitPolicy}。学生画像与教师画像共用同一间隔，批改后符合冷却期才会再次调模型回写。
          </div>
        </div>
      </div>

      {/* 订阅计划 */}
      <div ref={plansRef}>
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">选择您的订阅计划</h3>
          <p className="mt-1 text-sm text-gray-500">
            按月订阅；师生画像按套餐间隔控频（基础约 2 个月 / Pro 约每月 / Turbo 约每周各 1 次）
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLAN_CARDS.map((plan) => {
            const current = plan.code === planCode;
            const popular = Boolean(plan.popular);
            const dark = Boolean(plan.dark);

            return (
              <div
                key={plan.code}
                style={
                  dark
                    ? {
                        background: '#0f172a',
                        borderColor: '#1e293b',
                        color: '#ffffff',
                      }
                    : undefined
                }
                className={[
                  'relative flex min-h-[360px] flex-col rounded-2xl border p-6 shadow-sm transition',
                  dark
                    ? 'border-slate-800'
                    : popular
                      ? 'border-blue-400 bg-blue-50/60'
                      : 'border-gray-200 bg-white',
                ].join(' ')}
              >
                {popular ? (
                  <span className="absolute -top-3 right-5 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-medium text-white shadow-sm">
                    最受欢迎
                  </span>
                ) : null}

                <div
                  className="text-lg font-semibold"
                  style={{ color: dark ? '#ffffff' : '#111827' }}
                >
                  {plan.name}
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className="text-4xl font-bold tracking-tight"
                    style={{ color: dark ? '#ffffff' : '#111827' }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="mb-1 text-sm"
                    style={{ color: dark ? '#cbd5e1' : '#6b7280' }}
                  >
                    {plan.priceUnit}
                  </span>
                </div>

                <div
                  className="mt-5 text-sm font-medium"
                  style={{ color: dark ? '#cbd5e1' : '#6b7280' }}
                >
                  包含功能
                </div>
                <ul className="mt-3 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckOutlined
                        className="mt-0.5"
                        style={{ color: dark ? '#34d399' : '#3b82f6' }}
                      />
                      <span style={{ color: dark ? '#f1f5f9' : '#374151' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  block
                  size="large"
                  disabled={current}
                  className={[
                    'mt-6 !h-11 !rounded-xl !font-medium',
                    current
                      ? '!border-gray-200 !bg-gray-100 !text-gray-400'
                      : dark
                        ? '!border-white !bg-white !text-slate-900 hover:!bg-slate-100'
                        : popular
                          ? '!border-blue-500 !bg-blue-500 !text-white hover:!border-blue-600 hover:!bg-blue-600'
                          : '!border-blue-200 !bg-white !text-blue-600 hover:!border-blue-400',
                  ].join(' ')}
                  onClick={() => handleUpgrade(plan.code)}
                >
                  {current ? '当前使用中' : '立即升级'}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          第一期开通 / 续期由管理员在后台处理，系统内支付后续接入。
        </p>
      </div>
    </div>
  );
}
