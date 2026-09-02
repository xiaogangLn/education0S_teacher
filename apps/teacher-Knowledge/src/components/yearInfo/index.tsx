import { Label } from "@ui"
import { Select, Tag } from 'antd';
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

  
// 年级数据（分组）
const gradeOptions = [
    { label: '2025-2016', value: 'grade3' },
    { label: '2024-2015', value: 'grade2' },
    { label: '2023-2024', value: 'grade1' },
];

const YearInfo = () => {

    const {pathname} = useLocation();

    const [selectedSessionValue, setSelectedSessionValue] = useState('grade3');
    const [selectDisabled, setSelectDisabled] = useState(false);


    useEffect(() => {
        console.log(pathname);
        if (pathname === '/workbench/instrument') {
            setSelectDisabled(true)
        } else {
            setSelectDisabled(false)
        }
    }, [pathname])

    return (
        <div className="flex items-center">
            <div className="flex items-center">
                <Label>学年：</Label>
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
            <div className="ml-[15px]">
                <Tag 
                    color="blue" 
                    style={{ fontSize: '16px', padding: '5px 10px', borderRadius: '20px' }}
                    >📚 当前： 1500人</Tag>
            </div>

        </div>

    )
}

export {
    YearInfo
}