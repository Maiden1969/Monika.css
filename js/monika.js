const monika = {
    //指令集
    order: ["m-content", "m-value"],

    //从指定路径的JSON文件渲染页面数据
    renderData: (dataPath) => {
        // 读取 data.json 文件
        return fetch(dataPath)
            .then(response => response.json())
            .then(data => {
                const my_app = document.body;
                monika.replacePlaceholders(my_app, data);
                return data;
            })
            .catch(error => console.error('Error fetching data:', error));

    },

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
    //renderData渲染结束后才显示页面
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
            document.body.style.visibility = 'hidden';
            console.log(dataPath);
            const data = await monika.renderData(dataPath);
            document.body.style.visibility = 'visible';
            console.log("Render successful!");
            return data;
        } catch (error) {
            console.error('Error rendering data:', error);
        }
    },

    // 替换占位符，渲染列表
    // 递归访问每个节点以及其子节点
    replacePlaceholders: (node, data) => {
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
                    const flag = monika.replacePlaceholdersForItem(clonedItem, data, pos);
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
                        const value = getNestedValue(data, match_order[1]);
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
                        const value = getNestedValue(data, match_order[1]);
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
                    const value = getNestedValue(data, match_atr[1]);
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
                const value = getNestedValue(data, match_text[1]);
                res_text += node.textContent.slice(lastIndex_text, match_text.index);
                res_text += value;
                lastIndex_text = match_text.index + match_text[0].length;
            }
            res_text += node.textContent.slice(lastIndex_text);
            node.textContent = res_text;
        }
        // 递归遍历子节点
        for (let child of node.childNodes) {
            monika.replacePlaceholders(child, data);
        }

        //获取嵌套key值
        function getNestedValue(obj, keyPath) {
            return keyPath.split('.').reduce((acc, key) => acc && acc[key], obj);
        }

        //设置嵌套key值
        function setNestedValue(obj, keys, value) {
            if (keys.length === 1) {
                obj[keys[0]] = value;
                return;
            }

            const [firstKey, ...remainingKeys] = keys;
            if (!obj[firstKey]) {
                obj[firstKey] = {};
            }
            setNestedValue(obj[firstKey], remainingKeys, value);
        }

        //监听input事件的回调函数
        function handleInput(event) {
            const keys = event.target.getAttribute('m-value').split('.');
            //更新data中对应的数据
            setNestedValue(data, keys, event.target.value);
            //再次渲染页面,更新其它组件的value值
            monika.updatePage(document.body, event.target.value, event.target.getAttribute('m-value'));
        }
    },

    //为列表的每个项目节点替换占位符
    replacePlaceholdersForItem: (node, data, pos) => {

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
                    const value = getNestedValue(data, match_atr[1] + pos);
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
                const value = getNestedValue(data, match_text[1] + pos);
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
            const flag = monika.replacePlaceholdersForItem(child, data, pos);
            if (flag == 0)
                return 0;
        }

        function getNestedValue(obj, keyPath) {
            return keyPath.split('.').reduce((acc, key) => acc && acc[key], obj);
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

    //根据monika的语法@key1.key2.key3...获取数据
    $value: (data, keyPath) => {
        if (keyPath[0] === '@')
            keyPath = keyPath.slice(1);
        return keyPath.split('.').reduce((acc, key) => acc && acc[key], data);
    }
};

export default monika;

