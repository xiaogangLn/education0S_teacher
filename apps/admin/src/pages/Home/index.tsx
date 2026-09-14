import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  List,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  dashboardService,
  organizationsService,
  studentsService,
  usersService,
} from '@api/index';
import { asList, extractPayload } from '@/utils/api';

const emptyStats = {
  schools: { total: 0, new: 0, growth: 0 },
  teachers: { total: 0, new: 0, growth: 0 },
  students: { total: 0, new: 0, growth: 0 },
  lessonPlans: { total: 0, new: 0, growth: 0 },
  knowledgeFiles: { total: 0, new: 0, growth: 0 },
  assignments: { total: 0, new: 0, growth: 0 },
};

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, teachersRes, studentsRes, overviewRes, statsRes, activitiesRes] =
        await Promise.allSettled([
          organizationsService.getSchools(),
          usersService.getList({ role: 'teacher', page: 1, page_size: 1 }),
          studentsService.getList({ page: 1, page_size: 1 }),
          dashboardService.getOverview(),
          dashboardService.getStats(),
          dashboardService.getActivities({ limit: 8 }),
        ]);

      const schoolItems =
        schoolsRes.status === 'fulfilled' ? asList(extractPayload(schoolsRes.value)) : [];
      const teacherPayload =
        teachersRes.status === 'fulfilled' ? extractPayload<any>(teachersRes.value) : {};
      const studentPayload =
        studentsRes.status === 'fulfilled' ? extractPayload<any>(studentsRes.value) : {};
      const overview =
        overviewRes.status === 'fulfilled' ? extractPayload<any>(overviewRes.value) : {};
      const dashStats =
        statsRes.status === 'fulfilled' ? extractPayload<any>(statsRes.value) : {};
      const activityPayload =
        activitiesRes.status === 'fulfilled' ? extractPayload<any>(activitiesRes.value) : {};

      setStats({
        schools: { total: schoolItems.length, new: 0, growth: 0 },
        teachers: {
          total: teacherPayload?.total ?? overview?.stats?.total_teachers ?? 0,
          new: 0,
          growth: 0,
        },
        students: {
          total: studentPayload?.total ?? overview?.stats?.total_students ?? dashStats?.students?.total ?? 0,
          new: 0,
          growth: 0,
        },
        lessonPlans: {
          total:
            dashStats?.lesson_plans?.total ??
            overview?.stats?.total_lesson_plans ??
            0,
          new: 0,
          growth: 0,
        },
        knowledgeFiles: {
          total:
            dashStats?.documents?.total ??
            overview?.stats?.total_documents ??
            0,
          new: 0,
          growth: 0,
        },
        assignments: {
          total:
            dashStats?.assignments?.total ??
            overview?.stats?.total_assignments ??
            0,
          new: 0,
          growth: 0,
        },
      });

      const activityItems = asList(activityPayload).map((item: any, index: number) => ({
        id: String(item.id || index),
        type: item.type || 'update',
        user: item.user || item.operator || '系统',
        action: item.action || item.title || '更新了数据',
        target: item.target || item.description || '',
        time: item.time || item.created_at || '',
      }));
      setActivities(activityItems);
    } catch {
      setStats(emptyStats);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const statCards = [
    {
      title: '学校总数',
      value: stats.schools.total,
      icon: <SearchOutlined className="text-3xl text-blue-500" />,
      bg: 'bg-blue-50',
      newCount: stats.schools.new,
      growth: stats.schools.growth,
      link: '/application/schools',
    },
    {
      title: '教师总数',
      value: stats.teachers.total,
      icon: <UserOutlined className="text-3xl text-green-500" />,
      bg: 'bg-green-50',
      newCount: stats.teachers.new,
      growth: stats.teachers.growth,
      link: '/application/teachers',
    },
    {
      title: '学生总数',
      value: stats.students.total,
      icon: <TeamOutlined className="text-3xl text-purple-500" />,
      bg: 'bg-purple-50',
      newCount: stats.students.new,
      growth: stats.students.growth,
      link: '/application/students',
    },
    {
      title: '教案总数',
      value: stats.lessonPlans.total,
      icon: <BookOutlined className="text-3xl text-orange-500" />,
      bg: 'bg-orange-50',
      newCount: stats.lessonPlans.new,
      growth: stats.lessonPlans.growth,
      link: '/application',
    },
    {
      title: '知识库文件',
      value: stats.knowledgeFiles.total,
      icon: <FileTextOutlined className="text-3xl text-cyan-500" />,
      bg: 'bg-cyan-50',
      newCount: stats.knowledgeFiles.new,
      growth: stats.knowledgeFiles.growth,
      link: '/application',
    },
    {
      title: '作业总数',
      value: stats.assignments.total,
      icon: <FileTextOutlined className="text-3xl text-pink-500" />,
      bg: 'bg-pink-50',
      newCount: stats.assignments.new,
      growth: stats.assignments.growth,
      link: '/application',
    },
  ];

  return (
    <div className="p-4 flex flex-col h-full ">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 管理后台</h1>
          <p className="text-gray-400 text-sm mt-1">
            查看平台整体运营数据
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<FileTextOutlined />}
            onClick={loadData}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-6 flex-shrink-0">
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={index}>
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(card.link)}
              bodyStyle={{ padding: '16px 18px' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-400 font-medium">
                    {card.title}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value}
                  </div>
                  {card.newCount > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                        +{card.newCount} 新增
                      </span>
                      <span className="text-xs text-gray-400">
                        ↑ {card.growth}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="🕐 最近动态">
              <List
                itemLayout="horizontal"
                dataSource={activities}
                locale={{ emptyText: '暂无动态' }}
                renderItem={(item) => (
                  <List.Item className="hover:bg-gray-50 px-2 rounded-lg transition-colors">
                    <List.Item.Meta
                      avatar={
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">
                          {item.type === 'school' && '🏫'}
                          {item.type === 'teacher' && '👨‍🏫'}
                          {item.type === 'create' && '✨'}
                          {item.type === 'update' && '📝'}
                          {item.type === 'approve' && '✅'}
                          {!['school', 'teacher', 'create', 'update', 'approve'].includes(item.type) && '📋'}
                        </div>
                      }
                      title={
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{item.user}</span>
                          <span className="text-gray-500">{item.action}</span>
                          <span className="font-medium text-blue-600">{item.target}</span>
                          {item.time && (
                            <Badge
                              status="processing"
                              text={<span className="text-xs text-gray-400">{item.time}</span>}
                            />
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="⚡ 快捷操作" className="h-full">
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                  onClick={() => navigate('/application/schools')}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                    🏫
                  </div>
                  <span className="text-sm font-medium text-gray-700">新增学校</span>
                </div>

                <div
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all duration-200"
                  onClick={() => navigate('/application/teachers')}
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    👨‍🏫
                  </div>
                  <span className="text-sm font-medium text-gray-700">新增教师</span>
                </div>

                <div
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                  onClick={() => navigate('/application/students')}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                    🧑‍🎓
                  </div>
                  <span className="text-sm font-medium text-gray-700">新增学生</span>
                </div>

                <div
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all duration-200"
                  onClick={() => navigate('/application/classs')}
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                    📚
                  </div>
                  <span className="text-sm font-medium text-gray-700">新增班级</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
