(function () {
    'use strict';

    const IPINFO_TOKEN = 'bd4b56636feb8e';

    // Country code -> Google Translate language code
    const LANG_MAP = {
        ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es',
        PE: 'es', VE: 'es', UY: 'es', EC: 'es', BO: 'es',
        PY: 'es', CR: 'es', PA: 'es', GT: 'es', HN: 'es',
        SV: 'es', NI: 'es', DO: 'es', CU: 'es', PR: 'es',

        PT: 'pt', BR: 'pt',
        FR: 'fr', BE: 'fr',
        DE: 'de', AT: 'de',
        IT: 'it',
        NL: 'nl',
        GB: 'en', US: 'en', CA: 'en', AU: 'en',
        NZ: 'en', IE: 'en', ZA: 'en', NG: 'en', KE: 'en',

        JP: 'ja',
        KR: 'ko',
        CN: 'zh-CN',
        TW: 'zh-TW', HK: 'zh-TW',
        VN: 'vi',
        TH: 'th',
        ID: 'id',
        MY: 'ms',
        PH: 'tl',
        IN: 'hi',
        PK: 'ur',
        BD: 'bn',

        RU: 'ru',
        UA: 'uk',
        PL: 'pl',
        CZ: 'cs',
        SK: 'sk',
        HU: 'hu',
        RO: 'ro',
        BG: 'bg',
        GR: 'el',
        SE: 'sv',
        NO: 'no',
        DK: 'da',
        FI: 'fi',
        TR: 'tr',
        SA: 'ar',
        AE: 'ar',
        EG: 'ar',
        IL: 'he',
        IR: 'fa'
    };

    function getCookie(name) {
        const prefix = name + '=';
        const item = document.cookie
            .split('; ')
            .find(function (cookie) {
                return cookie.startsWith(prefix);
            });

        return item
            ? decodeURIComponent(item.substring(prefix.length))
            : '';
    }

    function setCookie(name, value) {
        document.cookie =
            name + '=' + encodeURIComponent(value) +
            '; path=/; max-age=2592000; SameSite=Lax';
    }

    function setLanguage(lang) {
        if (!lang) return;

        // The source language of this page is English.
        setCookie('googtrans', '/en/' + lang);

        // Reload so Google Translate reads the new cookie.
        location.reload();
    }

    async function detectCountry() {
        const response = await fetch(
            'https://api.ipinfo.io/lite/me?token=' +
            encodeURIComponent(IPINFO_TOKEN),
            { headers: { Accept: 'application/json' } }
        );

        if (!response.ok) {
            throw new Error('IPinfo HTTP ' + response.status);
        }

        const data = await response.json();
        return (data.country_code || '').toUpperCase();
    }

    function waitForGoogleTranslate(timeout) {
        return new Promise(function (resolve) {
            if (window.google &&
                google.translate &&
                google.translate.TranslateElement) {
                resolve(true);
                return;
            }

            let done = false;

            function finish(ready) {
                if (done) return;
                done = true;
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

            const timer = setTimeout(function () {
                finish(false);
            }, timeout || 10000);
        });
    }

    async function init() {
        const selector = document.getElementById('language');

        // Manual language selection takes priority.
        if (selector) {
            selector.addEventListener('change', function () {
                setLanguage(selector.value);
            });
        }

        const existing = getCookie('googtrans');
        const savedLang = existing.split('/')[2];

        if (savedLang && savedLang !== 'en') {
            if (selector) selector.value = savedLang;
            return;
        }

        // Avoid repeated API calls in the same browser session.
        try {
            const alreadyChecked =
                sessionStorage.getItem('ip-language-checked');

            if (alreadyChecked) return;

            sessionStorage.setItem('ip-language-checked', '1');

            const country = await detectCountry();
            const lang = LANG_MAP[country];

            if (!lang || lang === 'en') return;

            // Set the language cookie only after Google Translate loads.
            const ready = await waitForGoogleTranslate(10000);

            if (!ready) {
                sessionStorage.removeItem('ip-language-checked');
                return;
            }

            setLanguage(lang);
        } catch (error) {
            sessionStorage.removeItem('ip-language-checked');
            console.warn('Could not detect visitor language:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
