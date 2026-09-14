import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

type LegalKind = 'terms' | 'privacy';

const META: Record<LegalKind, { title: string; updatedAt: string; subtitle: string }> = {
  terms: {
    title: '用户服务协议',
    updatedAt: '2026年9月1日',
    subtitle: '使用 EducationOS 前，请仔细阅读本协议全部条款。',
  },
  privacy: {
    title: '隐私政策',
    updatedAt: '2026年9月1日',
    subtitle: '我们重视您与师生的个人信息保护，请了解我们如何收集与使用数据。',
  },
};

function LegalShell({
  kind,
  children,
}: {
  kind: LegalKind;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const meta = META[kind];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#e8f1ff_0%,#f5f7fb_45%,#eef2f7_100%)]">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-800 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              E
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Education<span className="text-blue-600">OS</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600"
          >
            返回
          </button>
        </div>

        <article className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
          <header className="border-b border-slate-100 pb-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-500">Legal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{meta.title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{meta.subtitle}</p>
            <p className="mt-3 text-xs text-slate-400">生效 / 更新日期：{meta.updatedAt}</p>
          </header>

          <div className="prose prose-slate mt-8 max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-h2:mt-8 prose-h2:text-xl prose-h2:text-slate-900 prose-p:text-sm prose-p:leading-7 prose-li:text-sm prose-li:leading-7">
            {children}
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6 text-sm">
            <div className="flex gap-4">
              <Link
                to="/legal/terms"
                className={kind === 'terms' ? 'font-medium text-blue-600' : 'text-slate-500 hover:text-blue-600'}
              >
                用户服务协议
              </Link>
              <Link
                to="/legal/privacy"
                className={kind === 'privacy' ? 'font-medium text-blue-600' : 'text-slate-500 hover:text-blue-600'}
              >
                隐私政策
              </Link>
            </div>
            <Link to="/" className="text-slate-400 hover:text-blue-600">
              返回登录
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}

export const TermsOfServicePage: React.FC = () => (
  <LegalShell kind="terms">
    <p>
      欢迎使用 EducationOS（以下简称「本平台」）。本《用户服务协议》（以下简称「本协议」）是您与本平台运营方之间就注册、登录及使用相关服务所订立的协议。
      您点击同意、注册账号或实际使用服务，即视为已阅读并同意本协议全部内容。
    </p>

    <h2>一、服务内容</h2>
    <p>本平台面向学校、教育机构及教师提供数字化教学相关能力，包括但不限于：</p>
    <ul>
      <li>账号与组织管理、教师工作台与知识库；</li>
      <li>教案 / 课件 / 试卷等教学内容生成与管理；</li>
      <li>学情分析、作业批改、师生画像及相关管理功能；</li>
      <li>教育版与商业版订阅能力（以实际开通情况为准）。</li>
    </ul>
    <p>我们可能根据产品迭代调整功能范围，并将通过页面公告或其他合理方式提示。</p>

    <h2>二、账号注册与安全</h2>
    <ul>
      <li>您应使用真实、准确、完整的信息注册，并及时更新。</li>
      <li>账号仅限本人或经授权的机构成员使用，不得出租、出借、转让或售卖。</li>
      <li>您须妥善保管账号、密码与验证码；因保管不善导致的损失，由您自行承担。</li>
      <li>如发现账号被盗用或存在安全风险，请立即联系管理员或客服处理。</li>
    </ul>

    <h2>三、使用规范</h2>
    <p>您承诺不得利用本平台从事下列行为：</p>
    <ul>
      <li>上传、生成或传播违法违规、侵权、淫秽、暴力或虚假信息；</li>
      <li>未经授权访问、爬取、破解系统，或干扰服务正常运行；</li>
      <li>将服务用于超出教育用途的违法商业活动；</li>
      <li>未经权利人许可，批量导出、转售或公开披露受保护的教学内容与学情数据；</li>
      <li>其他违反法律法规、公序良俗或本协议的行为。</li>
    </ul>

    <h2>四、内容与知识产权</h2>
    <ul>
      <li>本平台软件、界面、商标、文档等知识产权归运营方或其权利人所有。</li>
      <li>您上传或生成的内容，其合法权利归您或相应权利人所有；您授予本平台为提供服务所必需的使用、存储、展示与处理许可。</li>
      <li>AI 生成内容仅供教学辅助参考，您应自行审核后再用于教学实践。</li>
    </ul>

    <h2>五、订阅、配额与费用</h2>
    <ul>
      <li>商业版可能按套餐提供不同配额、画像更新频率与功能权限。</li>
      <li>具体价格、有效期与权益以订购页面、管理后台配置或书面约定为准。</li>
      <li>因欠费、到期或管理员调整导致的功能降权，不构成违约，但我们会尽量提前告知。</li>
    </ul>

    <h2>六、免责与责任限制</h2>
    <ul>
      <li>受网络、第三方模型服务、不可抗力等影响，服务可能出现中断或延迟，我们将尽力恢复。</li>
      <li>在法律允许范围内，本平台对间接损失、预期利益损失不承担责任。</li>
      <li>因您违反本协议或法律法规导致的索赔与损失，由您自行承担。</li>
    </ul>

    <h2>七、协议变更与终止</h2>
    <p>
      我们可能适时修订本协议。重大变更将通过站内公告等方式提示。若您继续使用服务，视为接受修订后的协议。
      您可停止使用并申请注销账号；我们也可在您严重违约时限制或终止服务。
    </p>

    <h2>八、法律适用与争议解决</h2>
    <p>
      本协议适用中华人民共和国法律（不含冲突法）。因本协议产生的争议，双方应协商解决；协商不成的，提交本平台运营方住所地有管辖权的人民法院诉讼解决。
    </p>

    <h2>九、联系我们</h2>
    <p>如对本协议有疑问，请通过学校管理员或平台客服渠道与我们联系。</p>
  </LegalShell>
);

export const PrivacyPolicyPage: React.FC = () => (
  <LegalShell kind="privacy">
    <p>
      EducationOS（以下简称「我们」）深知个人信息对您的重要性。本《隐私政策》说明我们在提供教育数字化服务过程中，如何收集、使用、存储、共享与保护个人信息，以及您享有的权利。
    </p>

    <h2>一、我们收集的信息</h2>
    <p>为实现账号与教学服务，我们可能收集以下信息：</p>
    <ul>
      <li>
        <strong>账号信息</strong>：手机号、用户名、姓名、邮箱、密码（加密存储）、角色与所属学校 / 年级 / 班级等。
      </li>
      <li>
        <strong>教学业务信息</strong>：教案、课件、试卷、作业、批改结果、知识库文档、审核记录等您主动提交或系统生成的内容。
      </li>
      <li>
        <strong>学情相关信息</strong>：学生基本信息（如学号、姓名、班级、家长联系方式）、成绩与掌握度、师生画像分析结果等，通常由学校或教师录入 / 授权处理。
      </li>
      <li>
        <strong>设备与日志信息</strong>：登录时间、IP、浏览器类型、操作日志等，用于安全审计与故障排查。
      </li>
    </ul>

    <h2>二、我们如何使用信息</h2>
    <ul>
      <li>提供注册登录、权限管控、教学生成、批改、学情分析与画像更新等核心功能；</li>
      <li>保障账号与系统安全，预防欺诈与滥用；</li>
      <li>改进产品体验、进行必要的统计分析（尽可能去标识化）；</li>
      <li>履行法律法规规定的义务，或响应监管、司法要求。</li>
    </ul>
    <p>我们不会将个人信息用于与教育服务无关的营销目的，除非另行征得您的同意。</p>

    <h2>三、未成年人与学生信息</h2>
    <p>
      本平台主要面向教师与教育机构。学生及相关未成年人信息原则上由学校或监护人授权的教师在履职范围内录入与管理。
      我们仅在提供教学与学情服务所必需的范围内处理，并要求使用者遵守教育管理部门与学校内部的数据管理规定。
    </p>

    <h2>四、共享、委托与跨境</h2>
    <ul>
      <li>未经同意，我们不会向无关第三方出售个人信息。</li>
      <li>为实现 AI 生成、短信验证等能力，我们可能委托具备安全保障能力的服务商处理必要数据，并要求其仅按指令处理。</li>
      <li>在法律法规允许或您明确授权的情况下，可与所属学校管理员共享必要的组织与使用数据。</li>
      <li>如涉及跨境传输，将另行告知并依法落实相应保护措施。</li>
    </ul>

    <h2>五、存储与安全</h2>
    <ul>
      <li>我们采取加密传输、访问控制、权限分级、日志审计等措施保护数据安全。</li>
      <li>信息保存期限为实现服务目的所必需的最短时间；超期后删除或匿名化，法律法规另有规定的除外。</li>
      <li>尽管已采取合理措施，互联网环境无法保证绝对安全，请您同时加强账号防护。</li>
    </ul>

    <h2>六、您的权利</h2>
    <p>在适用法律范围内，您可以：</p>
    <ul>
      <li>查询、更正您的账号资料；</li>
      <li>在符合学校管理要求的前提下，申请删除部分业务数据或注销账号；</li>
      <li>改变授权范围或撤回同意（可能影响部分功能使用）；</li>
      <li>获取本政策的解释说明。</li>
    </ul>
    <p>教育版账号的部分操作可能需由学校管理员代为处理。</p>

    <h2>七、Cookie 与同类技术</h2>
    <p>
      我们可能使用本地存储、Cookie 或同类技术保存登录态与偏好设置，以维持会话与改善体验。您可通过浏览器设置进行管理，但可能影响正常登录。
    </p>

    <h2>八、政策更新</h2>
    <p>
      我们可能适时更新本政策。更新后将在本页面公布生效日期；重大变更将以更显著方式提示。请定期查阅。
    </p>

    <h2>九、联系我们</h2>
    <p>
      如您对本政策或个人信息处理有疑问、投诉或建议，请通过学校管理员或平台客服渠道联系我们。我们将在合理期限内答复。
    </p>
  </LegalShell>
);

export default TermsOfServicePage;
