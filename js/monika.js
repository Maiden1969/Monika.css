/**
 *   Monika.js
 * Author: 周康睿
 * Version: Beta
 * Description: 一款以数据为核心，基于字符串处理的轻量级、快速、高效的框架
 */


/**-------------------------------------*/

//以下为monika的属性介绍
/**
 * 1. data
 * 虚拟数据源
 * 最核心的属性，在页面初渲染时，monika.data会拷贝原始json数据。之后页面始终使用monika.data作为数据源。
 * 可以通过修改页面中的数据来修改monika.data的数据，也可以通过修改monika.data的数据来修改页面中的数据。
 */

/**
 * 2. order
 * 指令集，包含monika.js定义的所有指令
 * order = [m-content, m-value]
 */


/**-------------------------------------*/

// 以下为核心库函数介绍
/**
 * 1. render([dataPath])
 * 渲染页面函数，可选参数dataPath代表数据源文件的路径，默认值为 /data/当前页面名.json
 */

/**
 * 2. traverse(node)
 * 遍历节点 node 以及其所有字节点，替换占位符的内容
 * (如果遇到指令m-content、m-value，则替换对应的textContent和value的值)
 * 使用的数据源为monika.data
 */

/**
 * 3. traverseList(node)
 * 解析节点node(node应该是列表项目的容器)的项目模版，根据数据源monika.data中的数据渲染出项目列表
 * 渲染出的项目列表中的占位符都会被替换
 * 列表容器的id的首位必须为 '#' ，例如<div id = '#list'></div>
 * 如果希望项目列表的某个占位符分别为@#list.key.key1, @#list.key.key2,@#list.key.key3...那么项目模版的对应位置的占位符应该写 @#list.key.key。
 * 下面是一个例子:
 * 已知monika.data为:
 * {
 * "#list": {
        "title": {
            "title1": "title1",
            "title2": "title2",
            "title3": "title3",
            "title4": "title4"
        },
        "summary": {
            "summary1": "sum1",
            "summary2": "sum2",
            "summary3": "sum3",
            "summary4": "sum4"
        },
        "link": {
            "link1": "link1",
            "link2": "link2",
            "link3": "link3",
            "link4": "link4"
        }
    }
 * }
 * 
 * HTML代码为：
 * 
 * <div id="#list" class="monika-card-container">
        <div class="monika-card">
            <b>@#list.title.title</b>
            <span style="font-style: italic;">@#list.summary.summary</span>
            <a href=@#list.link.link target="_blank" class="monika-btn-arrow-right"></a>
        </div>
    </div>

    
    这将会被渲染为:
    <div id="#list" class="monika-card-container">
        <div class="monika-card">
            <b>title1</b>
            <span style="font-style: italic;">summary1</span>
            <a href=link1 target="_blank" class="monika-btn-arrow-right"></a>
        </div>
         <div class="monika-card">
            <b>title2</b>
            <span style="font-style: italic;">summary2</span>
            <a href=link2 target="_blank" class="monika-btn-arrow-right"></a>
        </div>
         <div class="monika-card">
            <b>title3</b>
            <span style="font-style: italic;">summary3</span>
            <a href=link3 target="_blank" class="monika-btn-arrow-right"></a>
        </div>
         <div class="monika-card">
            <b>title4</b>
            <span style="font-style: italic;">summary4</span>
            <a href=link4 target="_blank" class="monika-btn-arrow-right"></a>
        </div>
    </div>

    注意：在首次渲染页面，调用render()函数时，该方法会被调用一次。
 */

/**
 * 4. updatePage(node,newValue,keyPath)
 * 更新节点node以及其子节点
 * 这个函数只会更新monika指令绑定的数据，例如m-content、m-value
 * 如果参数node传入的是document.body，则相当于更新整个页面
 * 参数keyPath为想要更新的数据的路径，例如 @data.key1.key2.key3 ，其中的 @ 可以省略
 * 还会同步更新monika.data中的数据
 * 建议使用更强大的 $set(keyPath, newValue)
 */

/**
 * 5. $(id)
 * document.getElementById(id) 的简化
 */

/**
 * 6. $$(selector)
 * document.querySelectorAll(selector) 的简化
 */

/**
 * 7.$get(keyPath)
 * 获得monika.data中指定路径的值
 *  keyPath中的 @ 可以省略
 * 例如$get("@data.key1.key2"), $get("data.key1.key2")
 */

/**
 * 8.$set(keyPath, newValue)
 * 设置monika.data中指定路径的值，同时更新页面中所有通过指令绑定的相同路径的值（包括m-content、m-value等）
 */

/**-------------------------------------*/


const monika = {
    //指令集
    order: ["m-content", "m-value"],

    //虚拟数据，可以实时更新
    //只有第一次渲染页面才会访问真数据，之后再次渲染(更新)页面都访问虚拟数据
    data: {},

    //从指定的JSON文件渲染页面数据
    renderByData: async (data) => {
        try {
            const my_app = document.body;
            monika.replacePlaceholders(my_app, data);
            return data;
        } catch (error) {
            console.error('Error rendering data:', error);
        }
    },

    //从指定的JSON文件路径渲染页面数据，或者根据规则自动寻找/data/filename.json
    //给monika.data注入原始值
    //渲染结束后才显示页面
    render: async (dataPath = 'default.json') => {
        try {
            if (dataPath === 'default.json') {
                //获得当前页面的url
                const url = new URL(window.location.href);
                //获得.html后缀的文件名
                const fileName = url.pathname.split('/').pop();
                //改为.json后缀
                dataPath = "/data/" + fileName.replace(/\.html$/, '.json');
            }
            //渲染未完成时，页面不显示
            document.body.style.visibility = 'hidden';

          await fetch(dataPath)
                .then(response => response.json())
                .then(data => {
                    const my_app = document.body;
                    monika.data = data;
                    monika.traverse(my_app, data);
                    document.body.style.visibility = 'visible';
                    return data;
                })
                .catch(error => console.error('Error fetching data:', error));
        } catch (error) {
            console.error('Error rendering data:', error);
        }
    },

    // 替换占位符，渲染列表
    // 递归访问每个节点以及其子节点
    traverse: (node) => {
        const data = monika.data;
        //处理元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
            //渲染列表
            if (node.id[0] === '#') {
                const container = document.getElementById(node.id);  //获得项目容器
                const item = container.firstElementChild;  //获得项目模版
                container.removeChild(item); //删除模版
                let pos = 1;
                while (1) {
                    const clonedItem = item.cloneNode(true);
                    const flag = monika.traverseList(clonedItem, pos);
                    if (flag) {
                        container.appendChild(clonedItem);
                        pos++;
                    }
                    else
                        break;
                }
            }
            // 遍历所有属性
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                //处理指令m-content
                if (attr.name === monika.order[0]) {
                    const regex = /@(#?\w+(?:\.#?\w+)*)/g;
                    let match_order = '';
                    let res_order = '';
                    let lastIndex_order = 0;
                    while ((match_order = regex.exec(attr.value)) !== null) {
                        const value = monika.$get(match_order[1]);
                        res_order += attr.value.slice(lastIndex_order, match_order.index);
                        res_order += value;
                        lastIndex_order = match_order.index + match_order[0].length;

                    }
                    res_order += attr.value.slice(lastIndex_order);

                    if (node.textContent !== res_order)
                        node.textContent = res_order;

                    continue;
                }

                //处理指令m-value
                if (attr.name === monika.order[1]) {

                    const regex = /@(#?\w+(?:\.#?\w+)*)/g;
                    let match_order = '';
                    let res_order = '';
                    let lastIndex_order = 0;
                    while ((match_order = regex.exec(attr.value)) !== null) {
                        const value = monika.$get(match_order[1]);
                        res_order += attr.value.slice(lastIndex_order, match_order.index);
                        res_order += value;
                        lastIndex_order = match_order.index + match_order[0].length;

                    }
                    res_order += attr.value.slice(lastIndex_order);
                    if (node.value !== res_order)
                        node.value = res_order;

                    //为该节点添加监视器,value改变时立刻根据m-value的地址更新data的值,然后再次渲染页面,实现数据同步
                    node.addEventListener('input', handleInput);
                    continue;
                }

                //处理其它一般属性
                const regex = /@(#?\w+(?:\.#?\w+)*)/g;
                let match_atr = '';
                let res_atr = '';
                let lastIndex_atr = 0;
                while ((match_atr = regex.exec(attr.value)) !== null) {
                    const value = monika.$get(match_atr[1]);
                    res_atr += attr.value.slice(lastIndex_atr, match_atr.index);
                    res_atr += value;
                    lastIndex_atr = match_atr.index + match_atr[0].length;

                }
                res_atr += attr.value.slice(lastIndex_atr);
                node.attributes[i].value = res_atr;
            }
        }

        //处理文本节点
        if (node.nodeType === Node.TEXT_NODE) {
            const regex = /@(#?\w+(?:\.#?\w+)*)/g;
            let match_text = '';
            let res_text = '';
            let lastIndex_text = 0;
            while ((match_text = regex.exec(node.textContent)) !== null) {
                const value = monika.$get(match_text[1]);
                res_text += node.textContent.slice(lastIndex_text, match_text.index);
                res_text += value;
                lastIndex_text = match_text.index + match_text[0].length;
            }
            res_text += node.textContent.slice(lastIndex_text);
            node.textContent = res_text;
        }
        // 递归遍历子节点
        for (let child of node.childNodes) {
            monika.traverse(child);
        }

        //监听input事件的回调函数
        function handleInput(event) {
            const keyPath = event.target.getAttribute('m-value');
            //更新data中对应的数据
            monika.$set(keyPath, event.target.value);
            monika.data = data;
            //再次渲染页面,更新其它组件的value值
            // monika.updatePage(document.body, event.target.value, event.target.getAttribute('m-value'));
            monika.$set( event.target.getAttribute('m-value'),event.target.value);
        }
    },

    //为列表的每个项目节点替换占位符
    traverseList: (node,pos) => {
        const data = monika.data;

        //遍历所有标签结点
        if (node.nodeType === Node.ELEMENT_NODE) {
            // 遍历所有属性
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                const regex = /@(#\w+(?:\.#?\w+)*)/g;
                let match_atr = '';
                let res_atr = '';
                let lastIndex_atr = 0;
                while ((match_atr = regex.exec(attr.value)) !== null) {
                    const value = monika.$get(match_atr[1] + pos);
                    if (typeof value === 'undefined') return 0;
                    res_atr += attr.value.slice(lastIndex_atr, match_atr.index);
                    res_atr += value;
                    lastIndex_atr = match_atr.index + match_atr[0].length;

                }
                res_atr += attr.value.slice(lastIndex_atr);
                node.attributes[i].value = res_atr;
            }
        }

        //遍历所有文本节点
        if (node.nodeType === Node.TEXT_NODE) {
            const regex = /@(#\w+(?:\.#?\w+)*)/g;
            let match_text = '';
            let res_text = '';
            let lastIndex_text = 0;
            while ((match_text = regex.exec(node.textContent)) !== null) {
                const value = monika.$get(match_text[1] + pos);
                if (typeof value === 'undefined') return 0;
                res_text += node.textContent.slice(lastIndex_text, match_text.index);
                res_text += value;
                lastIndex_text = match_text.index + match_text[0].length;
            }
            res_text += node.textContent.slice(lastIndex_text);
            node.textContent = res_text;
        }
        // 递归遍历子节点
        for (let child of node.childNodes) {
            const flag = monika.traverseList(child,pos);
            if (flag == 0)
                return 0;
        }

        return 1;
    },

    //更新页面，只替换特定的占位符(路径keyPath相同)
    updatePage: (node, newValue, keyPath) => {
        //更新属性值
        if (node.nodeType === Node.ELEMENT_NODE) {
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                if (attr.value === keyPath && attr.name === monika.order[1]) {
                    node.value = newValue;
                }

                if (attr.value === keyPath && attr.name === monika.order[0]) {
                    node.textContent = newValue;
                }
            }
        }

        // 递归遍历子节点
        for (let child of node.childNodes) {
            monika.updatePage(child, newValue, keyPath);
        }
    },


    //简化的ID选择器
    $: (id) => {
        return document.getElementById(id);
    },

    //简化的标签、类选择器
    $$: (selector) => {
        return document.querySelectorAll(selector);
    },

    //根据monika的语法keyPath = @key1.key2.key3...获取数据
    //keyPath也可以省略开头的@
    //不能通过修改该函数的返回值来修改monika.data
    $get: (keyPath) => {
        if (keyPath[0] === '@') keyPath = keyPath.slice(1);
        return keyPath.split('.').reduce((acc, key) => acc && acc[key], monika.data);
    },

    //根据monika的语法keyPath = @key1.key2.key3...设置数据，并且实时更新页面
    //keyPath也可以省略开头的@
    //修改monika.data
    $set: (keyPath, value, data = monika.data) => {
        if (keyPath[0] === '@') keyPath = keyPath.slice(1);
        const keys = keyPath.split('.');
        if (keys.length === 1) {
            data[keys[0]] = value;
            if (keyPath[0] !== '@') keyPath = '@' + keyPath;
            monika.updatePage(document.body, value, keyPath);
            return;
        }
        const [firstKey, ...remainingKeys] = keys;
        if (!data[firstKey]) data[firstKey] = '';
        monika.$set(remainingKeys.join('.'), value, data[firstKey]);
    }
};

export default monika;

