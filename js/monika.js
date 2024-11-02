const monika = {
    //从指定路径的JSON文件渲染页面数据
    render: (dataPath) => {
        // 读取 data.json 文件
        fetch(dataPath)
            .then(response => response.json())
            .then(data => {
                const my_app = document.body;
                monika.replacePlaceholders(my_app, data);
            })
            .catch(error => console.error('Error fetching data:', error));

    },

    // 替换占位符，渲染列表
    // 递归访问每个节点以及其子节点
    replacePlaceholders: (node, data) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
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

        function getNestedValue(obj, keyPath) {
            return keyPath.split('.').reduce((acc, key) => acc && acc[key], obj);
        }
    },

    //为列表的每个项目节点替换占位符
    replacePlaceholdersForItem: (node, data, pos) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // 遍历所有属性
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                const regex = /@(#\w+(?:\.#?\w+)*)/g;
                let match_atr = '';
                let res_atr = '';
                let lastIndex_atr = 0;
                while ((match_atr = regex.exec(attr.value)) !== null) {
                    const value = getNestedValue(data,match_atr[1] + pos);
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

    //简化的ID选择器
    $ :(id) => {
        return document.getElementById(id);
    },

    //简化的标签、类选择器
    $$ :(selector) => {
        return document.querySelectorAll(selector);
    },
};

export default monika;

