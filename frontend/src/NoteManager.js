
class NoteManager {
    constructor() {
        this.notebooks = [
            {
                name: '计算机科学',
                children: [
                    {
                        name: '编程',
                        children: [
                            {
                                name: 'C++',
                                children: [
                                    {
                                        key: 1,
                                        name: '谈虚函数的底层实现',
                                    },
                                    {
                                        key: 2,
                                        name: '如何用好RAII进行资源管理',
                                    },
                                    {
                                        key: 3,
                                        name: '谈多重继承的优劣',
                                    },
                                    {
                                        key: 14,
                                        name: '细数C++内存管理的那些坑',
                                    },

                                ]
                            },
                            {
                                name: 'java',
                                children: [
                                    {
                                        key: 4,
                                        name: 'java接口和匿名内部类的意义',
                                    },
                                    {
                                        key: 0,
                                        name: 'java Web编程笔记',
                                    },
                                    {
                                        key: 6,
                                        name: 'java反射机制的总结',
                                    },
                                    {
                                        key: 7,
                                        name: '谈java的对象模型',
                                    },
                                ]
                            },
                            {
                                name: 'python',
                                children: [
                                    {
                                        key: 8,
                                        name: 'python的不可变数据类型',
                                    },
                                    {
                                        key: 9,
                                        name: '用好python的装饰器',
                                    },
                                    {
                                        key: 10,
                                        name: 'python单元测试最佳实践',
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        name: '运维',
                        children: [
                            {
                                name: 'windows',
                                children: [
                                    {
                                        key: 111,
                                        name: 'windows组策略配置',
                                    },
                                    {
                                        key: 112,
                                        name: '从零搭建IIS服务器',
                                    },

                                ]
                            },

                            {
                                name: 'linux',
                                children: [
                                    {
                                        key: 113,
                                        name: 'linux发行版总结',
                                    },
                                    {
                                        key: 114,
                                        name: 'linux下mySQL的配置',
                                    },

                                ]
                            },
                        ]
                    },
                    {
                        name: '软件',
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
                name: '物理学',
                children: []
            }
        ];

        this.onDataChanged = [];
    }

    get_notebooks = () => {
        return [];
    }

    get_workspaces = (notebook_id) => {
        return [];
    }

    get_group_struct = (notebook_id, workspace_id) =>{
        return [];
    }

    get_note_content = (note_id) => {
        const input = `
# java Web编程笔记
java是一种强类型语言，java是行业内 **web技术** 中的热门语言之一。
## 开发环境配置
目前存在以下可以使用的IDE，可按需选用：
- Eclipse
- MyEclipse
- intellij idea

java web技术需要用到以下部分：
- jdk 基本的java开发环境
- servlet java用于web开发的标准API
- Tomcat java web开发的容器
- MySQL 一款开源的数据库

## servlet API介绍
servlet包含两个最主要的类，Request和Response。
                      `;
        return note_id == 0 ? input : "";
    }
}

export default NoteManager;
