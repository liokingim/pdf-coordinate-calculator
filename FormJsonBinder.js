class FormJsonBinder {
    constructor(root = document) {
        this.root = root;
        this.nameMap = this._buildNameMap();
    }

    _buildNameMap() {
        const map = new Map();
        const els = this.root.querySelectorAll("input[name], select[name], textarea[name]");
        els.forEach(el => {
            const name = el.getAttribute("name");
            if (!map.has(name)) map.set(name, []);
            map.get(name).push(el);
        });
        return map;
    }

    apply(data) {
        if (!data || typeof data !== "object") return;

        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                // 배열이면 key, key[] 둘 다 지원
                this._setArray(key, value);
            } else {
                this._setSingle(key, value);
            }
        }
    }

    _setSingle(name, value) {
        const els = this.nameMap.get(name) || [];
        if (els.length === 0) return;

        // radio 그룹
        if (els.some(el => el.tagName === "INPUT" && el.type === "radio")) {
            els.forEach(el => {
                if (el.tagName === "INPUT" && el.type === "radio") {
                    el.checked = String(el.value) === String(value);
                }
            });
            return;
        }

        // 일반 input/select/textarea
        els.forEach(el => {
            if (el.tagName === "INPUT") {
                if (el.type === "checkbox") el.checked = Boolean(value);
                else el.value = value ?? "";
            } else if (el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
                el.value = value ?? "";
            }
        });
    }

    _setArray(key, values) {
        const set = new Set(values.map(v => String(v)));

        // checkbox: name="key[]" 또는 name="key"
        const els = [
            ...(this.nameMap.get(`${key}[]`) || []),
            ...(this.nameMap.get(key) || [])
        ];

        els.forEach(el => {
            // checkbox 여러 개 선택
            if (el.tagName === "INPUT" && el.type === "checkbox") {
                el.checked = set.has(String(el.value));
            }

            // (옵션) select multiple 지원하고 싶으면 아래 주석 해제
            // if (el.tagName === "SELECT" && el.multiple) {
            //   Array.from(el.options).forEach(opt => {
            //     opt.selected = set.has(String(opt.value));
            //   });
            // }
        });
    }
}
