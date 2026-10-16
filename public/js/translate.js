(function () {
    'use strict';

    const IPINFO_TOKEN = 'bd4b56636feb8e';
    const DEFAULT_LANG = 'en';
    const COOKIE_DAYS = 30;

    // Mã quốc gia IP -> mã ngôn ngữ Google Translate
    const LANG_MAP = {
        // English
        US: 'en', GB: 'en', CA: 'en', AU: 'en',
        NZ: 'en', IE: 'en', SG: 'en', ZA: 'en',
        NG: 'en', KE: 'en',

        // Spanish
        ES: 'es', MX: 'es', AR: 'es', CO: 'es',
        CL: 'es', PE: 'es', VE: 'es', UY: 'es',
        PY: 'es', BO: 'es', EC: 'es', CR: 'es',
        PA: 'es', GT: 'es', HN: 'es', SV: 'es',
        NI: 'es', DO: 'es', CU: 'es', PR: 'es',

        // Portuguese
        PT: 'pt', BR: 'pt',

        // Western Europe
        FR: 'fr', BE: 'fr', MC: 'fr',
        DE: 'de', AT: 'de', CH: 'de',
        IT: 'it', NL: 'nl', LU: 'fr',

        // Northern Europe
        SE: 'sv', NO: 'no', DK: 'da',
        FI: 'fi', IS: 'is',

        // Eastern Europe
        PL: 'pl', CZ: 'cs', SK: 'sk',
        HU: 'hu', RO: 'ro', BG: 'bg',
        HR: 'hr', SI: 'sl', RS: 'sr',
        BA: 'bs', ME: 'sr', MK: 'mk',
        AL: 'sq', GR: 'el', EE: 'et',
        LV: 'lv', LT: 'lt',

        // Asia
        VN: 'vi', JP: 'ja', KR: 'ko',
        CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-TW',
        TH: 'th', ID: 'id', MY: 'ms',
        PH: 'tl', IN: 'hi', PK: 'ur',
        BD: 'bn', NP: 'ne', KH: 'km',
        LA: 'lo', MM: 'my', MN: 'mn',

        // Middle East
        TR: 'tr', SA: 'ar', AE: 'ar',
        EG: 'ar', IQ: 'ar', MA: 'ar',
        DZ: 'ar', TN: 'ar', JO: 'ar',
        IL: 'he', IR: 'fa', AF: 'fa',

        // Russia and nearby countries
        RU: 'ru', UA: 'uk', BY: 'be',
        GE: 'ka', AM: 'hy', AZ: 'az',
        KZ: 'kk', UZ: 'uz',

        // Africa
        ET: 'am', TZ: 'sw', UG: 'en',
        GH: 'en', CM: 'fr', SN: 'fr',
        CI: 'fr', RW: 'rw'
    };

    // Ngôn ngữ có thể chọn thủ công
    const LANGUAGES = {
        en: 'English',
        vi: 'Tiếng Việt',
        es: 'Español',
        pt: 'Português',
        fr: 'Français',
        de: 'Deutsch',
        it: 'Italiano',
        nl: 'Nederlands',
        ja: '日本語',
        ko: '한국어',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        th: 'ไทย',
        id: 'Bahasa Indonesia',
        ms: 'Bahasa Melayu',
        tl: 'Filipino',
        hi: 'हिन्दी',
        ur: 'اردو',
        bn: 'বাংলা',
        ne: 'नेपाली',
        km: 'ខ្មែរ',
        lo: 'ລາວ',
        my: 'မြန်မာ',
        mn: 'Монгол',
        ru: 'Русский',
        uk: 'Українська',
        be: 'Беларуская',
        pl: 'Polski',
        cs: 'Čeština',
        sk: 'Slovenčina',
        hu: 'Magyar',
        ro: 'Română',
        bg: 'Български',
        hr: 'Hrvatski',
        sl: 'Slovenščina',
        sr: 'Српски',
        bs: 'Bosanski',
        mk: 'Македонски',
        sq: 'Shqip',
        el: 'Ελληνικά',
        et: 'Eesti',
        lv: 'Latviešu',
        lt: 'Lietuvių',
        sv: 'Svenska',
        no: 'Norsk',
        da: 'Dansk',
        fi: 'Suomi',
        is: 'Íslenska',
        tr: 'Türkçe',
        ar: 'العربية',
        he: 'עברית',
        fa: 'فارسی',
        az: 'Azərbaycanca',
        kk: 'Қазақша',
        uz: 'Oʻzbekcha',
        ka: 'ქართული',
        hy: 'Հայերեն',
        am: 'አማርኛ',
        sw: 'Kiswahili',
        rw: 'Kinyarwanda'
    };

    function getCookie(name) {
        const prefix = name + '=';
        const item = document.cookie
            .split('; ')
            .find(function (cookie) {
                return cookie.startsWith(prefix);
            });

        if (!item) return '';

        try {
            return decodeURIComponent(
                item.substring(prefix.length)
            );
        } catch (_) {
            return '';
        }
    }

    function setCookie(name, value) {
        const secure = location.protocol === 'https:'
            ? '; Secure'
            : '';

        document.cookie =
            name + '=' + encodeURIComponent(value) +
            '; path=/; max-age=' +
            (COOKIE_DAYS * 24 * 60 * 60) +
            '; SameSite=Lax' + secure;
    }

    function getSavedLanguage() {
        const value = getCookie('googtrans');
        const match = value.match(/^\/[^/]+\/([^/]+)$/);

        return match ? match[1] : '';
    }

    function setLanguage(lang) {
        if (!Object.prototype.hasOwnProperty.call(
            LANGUAGES, lang
        )) {
            console.warn('Unsupported language:', lang);
            return;
        }

        if (lang === DEFAULT_LANG) {
            // Trở về ngôn ngữ gốc
            setCookie('googtrans', '/en/en');
        } else {
            setCookie('googtrans', '/en/' + lang);
        }

        // Xóa trạng thái tự động nhận diện để không ghi đè
        // lựa chọn thủ công trong phiên hiện tại.
        try {
            sessionStorage.setItem(
                'manual-language-selection', '1'
            );
        } catch (_) {}

        location.reload();
    }

    async function detectCountry() {
        const url =
            'https://api.ipinfo.io/lite/me?token=' +
            encodeURIComponent(IPINFO_TOKEN);

        const response = await fetch(url, {
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error('IPinfo HTTP ' + response.status);
        }

        const data = await response.json();

        return (data.country_code || '').toUpperCase();
    }

    function waitForGoogleTranslate(timeout) {
        return new Promise(function (resolve) {
            if (
                window.google &&
                window.google.translate &&
                window.google.translate.TranslateElement
            ) {
                resolve(true);
                return;
            }

            let finished = false;
            let timer;

            function finish(ready) {
                if (finished) return;
                finished = true;

                clearTimeout(timer);

                window.removeEventListener(
                    'google-translate-ready', onReady
                );

                resolve(ready);
            }

            function onReady() {
                finish(true);
            }

            window.addEventListener(
                'google-translate-ready', onReady
            );

            timer = setTimeout(function () {
                finish(false);
            }, timeout || 10000);
        });
    }

    function populateLanguageSelector(selector) {
        if (!selector) return;

        // Chỉ tự tạo option nếu select đang trống
        if (selector.options.length === 0) {
            Object.entries(LANGUAGES).forEach(
                function ([code, label]) {
                    const option = document.createElement('option');
                    option.value = code;
                    option.textContent = label;
                    selector.appendChild(option);
                }
            );
        }

        const current = getSavedLanguage() || DEFAULT_LANG;

        if (LANGUAGES[current]) {
            selector.value = current;
        }

        selector.addEventListener('change', function () {
            setLanguage(selector.value);
        });
    }

    async function init() {
        const selector = document.getElementById('language');

        populateLanguageSelector(selector);

        // Ngôn ngữ đã được chọn trước đó: giữ nguyên
        const savedLanguage = getSavedLanguage();

        if (savedLanguage && LANGUAGES[savedLanguage]) {
            return;
        }

        // Nếu người dùng đã chọn thủ công thì không tự ghi đè
        try {
            if (
                sessionStorage.getItem(
                    'manual-language-selection'
                ) === '1'
            ) {
                return;
            }
        } catch (_) {}

        // Chỉ kiểm tra IP một lần trong mỗi phiên trình duyệt
        try {
            if (
                sessionStorage.getItem('ip-language-checked')
            ) {
                return;
            }

            sessionStorage.setItem(
                'ip-language-checked', '1'
            );
        } catch (_) {}

        try {
            const country = await detectCountry();
            const lang = LANG_MAP[country];

            // Không cần dịch nếu ngôn ngữ mặc định là tiếng Anh
            if (!lang || lang === DEFAULT_LANG) return;

            const ready = await waitForGoogleTranslate(10000);

            if (!ready) {
                console.warn(
                    'Google Translate chưa tải xong.'
                );
                return;
            }

            setCookie('googtrans', '/en/' + lang);
            location.reload();
        } catch (error) {
            try {
                sessionStorage.removeItem(
                    'ip-language-checked'
                );
            } catch (_) {}

            console.warn(
                'Không thể nhận diện ngôn ngữ từ IP:',
                error
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded', init, { once: true }
        );
    } else {
        init();
    }
})();
