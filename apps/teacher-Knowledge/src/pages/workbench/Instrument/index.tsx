import { Allotment } from 'allotment';
import { LeftPanel } from '@/components/leftCard';
import { RightPanel } from '@/components/rightCard';
import { CenterPanel } from '@/components/centerCard';
import 'allotment/dist/style.css';

const Instrument = () => {
    return (
        <div className="overflow-hidden flex flex-col rounded-[16px] -mt-4" style={{ height: 'calc(100vh - 120px)' }}>
            {/* 三栏布局 - 使用 Allotment */}
            <Allotment className="flex-1">
                {/* 左侧面板 - 占 15% */}
                <Allotment.Pane 
                    minSize={400}
                    preferredSize="18%"
                    snap
                >
                   <LeftPanel />
                </Allotment.Pane>

                {/* 中间面板 - 最小 1000px，占剩余空间 */}
                <Allotment.Pane 
                    minSize={1000}
                    preferredSize="70%"
                    snap
                >
                   <CenterPanel />
                </Allotment.Pane>

                {/* 右侧面板 - 占 15% */}
                <Allotment.Pane 
                    minSize={300}
                    preferredSize="18%"
                    snap
                >
                    <RightPanel />
                </Allotment.Pane>
            </Allotment>
        </div>
    );
};

export { Instrument };