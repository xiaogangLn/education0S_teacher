
import { AudioOutlined, FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, FileWordOutlined, FolderOutlined, LinkOutlined, TeamOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { FileItem, FileTypeIcon } from './types';
  
  // 模拟文件列表数据
  export const mockFiles: FileItem[] = [
    { id: '1', name: '2026届教学计划 · 数学', type: 'document', category: 'material', size: '2.4MB', updatedAt: '2026-08-30 14:20', creator: '张老师', permission: 'grade' },
    { id: '2', name: '月考成绩分析 · 1班', type: 'sheet', category: 'material', size: '1.8MB', updatedAt: '2026-08-29 16:00', creator: '李老师', permission: 'class' },
    { id: '3', name: '二次函数教案 · 草稿', type: 'document', category: 'draft', size: '856KB', updatedAt: '2026-08-28 22:10', creator: '张老师', permission: 'personal' },
    { id: '4', name: '函数图像动态演示', type: 'video', category: 'research', size: '45MB', updatedAt: '2026-08-27 10:30', creator: '教研组', permission: 'school' },
    { id: '5', name: '英语听力训练音频', type: 'audio', category: 'material', size: '12MB', updatedAt: '2026-08-26 15:40', creator: '赵老师', permission: 'grade' },
    { id: '6', name: '校本课程纲要 2026版', type: 'pdf', category: 'research', size: '3.2MB', updatedAt: '2026-08-25 09:00', creator: '教务处', permission: 'school' },
    { id: '7', name: '教研组共享资源导航', type: 'link', category: 'research', size: '-', updatedAt: '2026-08-24 11:20', creator: '王老师', permission: 'class' },
    { id: '8', name: '一元二次方程教案', type: 'word', category: 'material', size: '1.2MB', updatedAt: '2026-08-23 13:40', creator: '张老师', permission: 'grade' },
    { id: '9', name: '三角函数单元测试', type: 'sheet', category: 'exam', size: '2.1MB', updatedAt: '2026-08-22 09:30', creator: '李老师', permission: 'class' },
    { id: '10', name: '导数概念微课视频', type: 'video', category: 'personal', size: '68MB', updatedAt: '2026-08-21 16:20', creator: '张老师', permission: 'personal' },
    { id: '11', name: '教学课件素材库', type: 'folder', category: 'material', size: '-', updatedAt: '2026-08-20 11:00', creator: '教研组', permission: 'grade' },
    { id: '12', name: '学生作品集 · 数学建模', type: 'pdf', category: 'material', size: '5.6MB', updatedAt: '2026-08-19 09:00', creator: '李老师', permission: 'class' },
    { id: '13', name: '课堂活动照片集', type: 'image', category: 'personal', size: '23MB', updatedAt: '2026-08-18 16:30', creator: '张老师', permission: 'personal' },
    { id: '14', name: '教学演示PPT', type: 'ppt', category: 'material', size: '8.7MB', updatedAt: '2026-08-17 14:00', creator: '张老师', permission: 'grade' },
    { id: '15', name: '单元测试卷 · 函数', type: 'pdf', category: 'exam', size: '1.5MB', updatedAt: '2026-08-16 10:00', creator: '李老师', permission: 'class' },
  ];
  
  // 分类配置
  export const categoryConfig: Record<string, { label: string; }> = {
    all: { label: '全部' },
    material: { label: '本校资源' },
    exam: { label: '试卷' },
    personal: { label: '个人知识库' },
    draft: { label: '草稿箱' },
    research: { label: '教研组' },
  };
  
  // 文件类型图标映射
  export const fileTypeIconMap: Record<FileItem['type'], FileTypeIcon> = {
    document: { icon: <FileWordOutlined />, label: '文档', color: 'text-blue-500' },
    word: { icon: <FileWordOutlined />, label: 'Word', color: 'text-blue-600' },
    sheet: { icon: <FileExcelOutlined />, label: '表格', color: 'text-green-500' },
    video: { icon: <VideoCameraOutlined />, label: '视频', color: 'text-purple-500' },
    audio: { icon: <AudioOutlined />, label: '音频', color: 'text-pink-500' },
    pdf: { icon: <FilePdfOutlined />, label: 'PDF', color: 'text-red-500' },
    image: { icon: <FileImageOutlined />, label: '图片', color: 'text-orange-500' },
    link: { icon: <LinkOutlined />, label: '链接', color: 'text-cyan-500' },
    folder: { icon: <FolderOutlined />, label: '文件夹', color: 'text-yellow-500' },
    ppt: { icon: <FileTextOutlined />, label: 'PPT', color: 'text-orange-600' },
  };
  
  // 权限标签配置
  export const permissionConfig: Record<FileItem['permission'], { label: string; color: string }> = {
    school: { label: '学校', color: 'bg-green-100 text-green-700' },
    grade: { label: '年级', color: 'bg-purple-100 text-purple-700' },
    class: { label: '班级', color: 'bg-blue-100 text-blue-700' },
    personal: { label: '个人', color: 'bg-red-100 text-red-700' },
  };