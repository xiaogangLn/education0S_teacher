import { Label } from "@ui"
import { Select, Tag } from 'antd';
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// 班级数据
const classOptions = [
    { label: '九年级1班', value: 'class1' },
    { label: '九年级2班', value: 'class2' },
    { label: '九年级3班', value: 'class3' },
    { label: '九年级4班', value: 'class4' },
    { label: '九年级5班', value: 'class5' },
    { label: '九年级6班', value: 'class6' },
    { label: '九年级7班', value: 'class7' },
    { label: '九年级8班', value: 'class8' },
    { label: '九年级9班', value: 'class9' },
    { label: '九年级10班', value: 'class10' },
  ];
  
  // 年级数据（分组）
  const gradeOptions = [
    { label: '2026届（现初三）', value: 'grade3' },
    { label: '2025届（现初二）', value: 'grade2' },
    { label: '2024届（现初一）', value: 'grade1' },
  ];

const ClassInfo = () => {

    const {pathname} = useLocation();

    const [selectedSessionValue, setSelectedSessionValue] = useState('grade3');
    const [searchClassValue, setSearchClassValue] = useState('class3');
    const [selectDisabled, setSelectDisabled] = useState(false);


    useEffect(() => {
        console.log(pathname);
        if (pathname === '/home/instrument') {
            setSelectDisabled(true)
        } else {
            setSelectDisabled(false)
        }
    }, [pathname])

    return (
        <div className="flex items-center">
            <div className="flex items-center">
                <Label>届别：</Label>
                <Select
                    disabled={selectDisabled}
                    defaultValue={selectedSessionValue}
                    placeholder="请选择届别"
                    style={{
                        width: 180,
                        borderRadius: '20px',
                    }}
                    onChange={setSelectedSessionValue}
                    options={gradeOptions}
                />
            </div>
            <div className="flex items-center ml-[15px]">
                <Label>班级：</Label>
                <Select
                    disabled={selectDisabled}
                    options={classOptions}
                    placeholder="请选择班级"
                    style={{
                        width: 180,
                        borderRadius: '20px',
                    }}
                    defaultValue={searchClassValue}
                    onChange={setSearchClassValue}
                />
            </div>
            <div className="ml-[15px]">
                <Tag 
                    color="blue" 
                    style={{ fontSize: '16px', padding: '5px 10px', borderRadius: '20px' }}
                    >📚 当前：九年级3班 · 45人</Tag>
            </div>

        </div>

    )
}

export {
    ClassInfo
}