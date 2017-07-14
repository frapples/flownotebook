
class NoteManager {
    constructor() {
        this.notebooks = [
            {
                name: '物理学',
                children: [
                    {
                        name: '经典力学',
                        children: [
                            {
                                name: '电学',
                                children: [
                                    '谈谈电磁感应的基本理解',
                                    '三相电流与远程输电',
                                    '电动势和直流电交流电',
                                    '在数字电路中的电流走向',
                                ]
                            },
                            {
                                name: '运动学',
                                children: [
                                    '谈谈万能的小车',
                                    '牛顿第二定律的意义',
                                    '动量守恒背后的本质',
                                    '能量守恒与永动机',
                                ]
                            },
                            {
                                name: '热力学',
                                children: [
                                    '谈热力学第二定律',
                                    '布朗运动和流体压强',
                                    '为什么存在绝对零度',
                                ]
                            }
                        ]
                    },
                    {
                        name: '量子力学',
                        children: [
                        ]
                    },
                    {
                        name: '相对论',
                        children: [
                        ]
                    }
                ],
            },
            {
                name: '经济学',
                children: []
            },
            {
                name: '计算机科学',
                children: []
            }
        ];

        this.onDataChanged = [];
    }

    get_notebooks = () => {
        return this.notebooks.map((e) => e.name);
    }

    get_workspaces = (notebook_id) => {
        return this.notebooks[notebook_id].children.map((e => e.name));
    }

    get_group_struct = (notebook_id, workspace_id) =>{
        return this.notebooks[notebook_id].children[workspace_id].children;
    }
}

export default NoteManager;
