const app = {
    render: (dataPath) => {
        // 读取 data.json 文件
        fetch(dataPath)
            .then(response => response.json())
            .then(data => {
                const my_app = document.body;
                app.replacePlaceholders(my_app, data);
            })
            .catch(error => console.error('Error fetching data:', error));

    },


    // 递归访问每个节点以及其子节点
    // 替换占位符，渲染列表
    replacePlaceholders: (node, data) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.id[0] === '#') {
                const container = document.getElementById(node.id);  //获得项目容器
                console.log(container);
                const item = container.firstElementChild;  //获得项目模版
                container.removeChild(item); //删除模版
                const clonedItem = item.cloneNode(true);
                app.replacePlaceholdersForItem(clonedItem, data, "2");
                container.appendChild(clonedItem);
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
            app.replacePlaceholders(child, data);
        }

        function getNestedValue(obj, keyPath) {
            return keyPath.split('.').reduce((acc, key) => acc && acc[key], obj);
        }
    },


    //为每个项目节点替换占位符
    replacePlaceholdersForItem: (node, data, pos) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // 遍历所有属性
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                const regex = /@(#?\w+(?:\.#?\w+)*)/g;
                let match_atr = '';
                let res_atr = '';
                let lastIndex_atr = 0;
                while ((match_atr = regex.exec(attr.value)) !== null) {
                    const value = match_atr[0] + pos;
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
            const regex = /@(#?\w+(?:\.#?\w+)*)/g;
            let match_text = '';
            let res_text = '';
            let lastIndex_text = 0;
            while ((match_text = regex.exec(node.textContent)) !== null) {
                const value = match_text[0] + pos;
                res_text += node.textContent.slice(lastIndex_text, match_text.index);
                res_text += value;
                lastIndex_text = match_text.index + match_text[0].length;
            }
            res_text += node.textContent.slice(lastIndex_text);
            node.textContent = res_text;
        }
        // 递归遍历子节点
        for (let child of node.childNodes) {
            app.replacePlaceholdersForItem(child, data,pos);
        }

    },

};


export default app;