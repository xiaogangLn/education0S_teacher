import { Label } from "@ui"
import { Button } from "antd"
import { PlusOutlined } from '@ant-design/icons';
import { getRandomColor } from "@/utils/colorUtils";
import { useNavigate } from "react-router-dom";


const schoolChoice = [
    {
        id: 1,
        name: '📝 二次函数图像与性质',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30',
        bgImage: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=200&fit=crop',
        author: '张文科'
    },
    {
        id: 2,
        name: '📝 一元二次方程',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30',
        bgImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=200&fit=crop',
        author: '李保全'
    },
    {
        id: 3,
        name: '📊 函数单元复习课件',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30',
        bgImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=200&fit=crop',
        author: '肖常鑫'
    },
    {
        id: 4,
        name: '📝 一元二次方程',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30',
        bgImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=200&fit=crop',
        author: '李保全'
    },
    {
        id: 5,
        name: '📊 函数单元复习课件',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30',
        bgImage: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=200&fit=crop',
        author: '肖常鑫'
    }
]

const historyItems = [
    {
        id: 1,
        name: '📝 二次函数图像与性质',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30'
    },
    {
        id: 2,
        name: '📝 一元二次方程',
        classDecs: "九年级数学 · 3版",
        updateTime: '2026-08-30 14:30'
    }
]

const Home = () => {
    const navigate = useNavigate();

    const itemsWithColor = historyItems.map((item) => ({
        ...item,
        color: getRandomColor(), // 每次刷新随机
    }));

    // 创建新会话
    const handleNewSeesion = () => {
        navigate('/workbench/instrument')
    }

    // 进入历史会话
    const handleHistory = (item: any) => {
        console.log('点击的当前会话信息', item)
        navigate('/workbench/instrument')
    }

    // 导出当前生成的信息
    const handleExport = (item: any) => {
        console.log('导出当前生成的信息', item)
    }

    // 查看历史精选
    const handleHistoryChoice = (item: any) => {
        console.log('查看历史精选', item)
    }

    return (
        <div>
            <div className="">
                <Label className="font-bold text-[16px] text-[111827]">📌 历史精选生成记录</Label>
                <div className="flex flex-wrap gap-5 py-4">
                    {schoolChoice.map((item, index) => (
                        <div 
                            key={index + item.name} 
                            className="relative bg-[white] rounded-[16px] p-5 min-w-[320px] hover:shadow-lg"
                            onClick={(item) => handleHistoryChoice(item)}
                        >
                             <div 
                                className="absolute inset-0 bg-cover bg-center rounded-[16px]"
                                style={{ backgroundImage: `url(${item.bgImage})` }}
                            />
                            {/* 遮罩层 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 rounded-[16px]" />
                            <div className="relative py-6 px-4 text-white">
                                <h3 className="font-bold">{item.name}</h3>
                                <span className="text-[13px] text-white">{item.classDecs}</span>
                                <div className="text-[12px] text-white m-[4px 0]">{item.updateTime}</div>
                                <div className="flex justify-end text-[14px] pt-[10px]">
                                    作者：{item.author}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="">
                <Label className="font-bold text-[16px] text-[111827]">💬 创建新产品</Label>
                <div className="flex flex-wrap gap-5 py-4">
                    <div 
                        className="bg-[white] rounded-[16px] min-w-[320px] text-center flex items-center justify-center cursor-pointer" 
                        onClick={() => handleNewSeesion()}
                    >
                        <PlusOutlined style={{fontSize: "30px"}} />
                    </div>
                    {itemsWithColor.map((item, index) => (
                        <div 
                            onClick={() => handleHistory(item)}
                            key={index + item.name} 
                            className={`
                                ${item.color.bg} 
                                ${item.color.border}
                                p-10 px-6 border 
                                min-w-[320px]
                                hover:shadow-[16px] ${item.color.hover}
                                transition-all duration-300
                                rounded-[16px]
                                cursor-pointer
                            `}
                        >
                            <h3 className="font-bold">{item.name}</h3>
                            <span className="text-[13px] text-[#6b7280]">{item.classDecs}</span>
                            <div className="text-[12px] text-[#6b7280] m-[4px 0]">{item.updateTime}</div>
                            <div className="flex mt-[15px] gap-5">
                                <Button 
                                    style={{backgroundColor: '#eef2ff', border: 'transparent'}} 
                                    shape="round"  
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleHistory(item)
                                    }}
                                >
                                    <span className="text-[12px] text-[#4f46e5] font-medium">继续</span>
                                </Button>
                                <Button 
                                    style={{backgroundColor: '#eef2ff', border: 'transparent'}}
                                    shape="round"  
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        // 导出
                                        handleExport(item)
                                    }}
                                >
                                    <span className="text-[12px] text-[#4f46e5] font-medium">导出</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export {
    Home
}