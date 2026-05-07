(function () {
    // ===============================================
    // 0. CHUMBAR A API KEY AQUI DIRETO NO CÓDIGO
    // ===============================================
    const apiKey = "pl_live_a31fb1af31bf4f0cee1fd89a258c9e2d925829363d65617c50f1018a59dc1de3";
    window.PROVOU_LEVOU_API_KEY = apiKey;

    const WEBHOOK_PROVA = 'https://n8n.segredosdodrop.com/webhook/gerador-oculos';
    const WEBHOOK_CHECK_LIMIT = 'https://n8n.segredosdodrop.com/webhook/amazoni-check-limit';
    // PIX desativado por enquanto
    // const WEBHOOK_PIX = 'https://n8n.segredosdodrop.com/webhook/califa-pix';
    // const WEBHOOK_PIX_STATUS = 'https://n8n.segredosdodrop.com/webhook/califa-pix-status';
    const SIZES_TOP = ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', '3XG', '4XG', '5XG'];
    const SIZES_BOTTOM = ['36/XXP', '38/XP', '40/P', '42/M', '44/G', '46/XG', '48/XXG', '50/3XG', '52/4XG', '54/5XG'];
    const SIZES_BOTTOM_SW = ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', '3XG', '4XG', '5XG'];


    const GRADE = {
        regular: [49, 51, 54, 57, 61, 62, 64, 66, 70, 73],
        oversized: [58, 60, 62, 64, 66, 70, 73, 76, 79, 83],
        oversizedSS: [58, 61, 63, 67, 70, 74, 78, 82, 87, 92],
        hoodie: [50, 53, 55, 58, 62, 65, 69, 74, 79, 83],
        boxyHoodie: [61, 77, 78, 79, 80, 81, 82, 83, 84, 85],
        puffer: [53, 56, 59, 61, 70, 74, 78, 82, 86, 90],
        vest: [52, 55, 57, 59, 63, 66, 70, 72, 76, 82],
        boxyHenley: [54, 56, 58, 64, 66, 68, 70, 76, 78, 84],
        bottomTailoring: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        bottomSweat: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        underwear: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        quadrilTailoring: [48, 50, 52, 56, 58, 60, 62, 64, 66, 68],
        quadrilSweat: [48, 50, 52, 54, 56, 58, 60, 62, 64, 66],
        quadrilUnderwear: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
    };


    function detectProduct(name) {
        const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (/tailoring/.test(n) || /\d\/\d\s*short/.test(n) || /\b(1\/5|2\/5|3\/5|4\/5)\b/.test(n)) return { category: 'bottom', fit: 'tailoring' };
        if (/underwear|cueca/.test(n)) return { category: 'bottom', fit: 'underwear' };
        if (/sweatpant|sweatshort|sweat pant|sweat short|calca|bermuda/.test(n)) return { category: 'bottom', fit: 'sweat' };
        if (/henley/.test(n)) return { category: 'top', fit: 'boxyHenley' };
        if (/boxy.*(hoodie|crewneck|crew)/.test(n) || /(hoodie|crewneck|crew).*boxy/.test(n)) return { category: 'top', fit: 'boxyHoodie' };
        if (/puffer|jacket/.test(n)) return { category: 'top', fit: 'puffer' };
        if (/vest/.test(n)) return { category: 'top', fit: 'vest' };
        if (/(hoodie|hoodie zip|half zip|crewneck|crew neck)/.test(n) && !/oversized|boxy|short sleeve/.test(n)) return { category: 'top', fit: 'hoodie' };
        if (/oversized.*(hoodie|crewneck|crew|short sleeve)/.test(n) || /short sleeve.*(hoodie|crewneck)/.test(n)) return { category: 'top', fit: 'oversizedSS' };
        if (/oversized|boxy tee|2\/4/.test(n)) return { category: 'top', fit: 'oversized' };
        return { category: 'top', fit: 'regular' };
    }


    function estimarTorax(altura, peso) {
        if (altura < 3) altura *= 100;
        let circ = 0.65 * peso + 56;
        const imc = peso / Math.pow(altura / 100, 2);
        if (imc > 30) circ += 4; else if (imc > 25) circ += 2;
        return circ;
    }


    function findClosest(arr, val) {
        let idx = 0, minDiff = Infinity;
        arr.forEach((v, i) => { const d = Math.abs(v - val); if (d < minDiff) { minDiff = d; idx = i; } });
        return idx;
    }


    let recommendedSize = 'M';
    let currentProduct = { category: 'top', fit: 'regular' };

    function calculateFinalSize() {
        // Feature desativada: não faz mais cálculos de tamanho
        return;
    }


    // ─── LOCK / UNLOCK SCROLL DA PÁGINA ──────────────────────────────────────────


    let scrollY = 0;


    function lockBodyScroll() {
        scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflowY = 'scroll';
    }


    function unlockBodyScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
    }


    // ─── ESTILOS ──────────────────────────────────────────────────────────────────


    const styles = `
        :root {
            --q-primary: #000000;
            --q-bg: #ffffff;
            --q-border: #000000;
            --q-gray: #f5f5f5;
            --q-text: #000000;
            --q-text-light: #666666;
        }

        /* ═══════════════════════════════════════════════
           BOTÃO TRIGGER (selo flutuante sobre a imagem)
        ═══════════════════════════════════════════════ */
        @keyframes q-shake {
            0%, 50%, 100% { transform: rotate(0deg); }
            10%, 30% { transform: rotate(-10deg); }
            20%, 40% { transform: rotate(10deg); }
        }
        .q-btn-trigger-ia {
            position: absolute;
            top: 55px; right: 30px;
            z-index: 100;
            background: none; border: none; padding: 0;
            cursor: pointer;
            width: 72px; height: 72px;
            display: flex; align-items: center; justify-content: center;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.18));
            animation: q-shake 3s infinite;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }
        .q-btn-trigger-ia:hover { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.28)); }
        .q-btn-trigger-ia svg { width: 100%; height: 100%; overflow: visible; }
        @media (min-width: 768px) {
            .q-btn-trigger-ia { width: 65px; height: 65px; }
        }

        /* ═══════════════════════════════════════════════
           BOTÃO INLINE (acima do botão de comprar)
        ═══════════════════════════════════════════════ */
        .q-btn-inline-provador {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            width: 100%;
            padding: 12px 14px;
            background: transparent;
            color: #000;
            border: 1px solid #000;
            border-radius: 999px;
            font-family: 'Work Sans', sans-serif;
            font-weight: 600; font-size: 10px;
            letter-spacing: 1.5px; text-transform: uppercase;
            cursor: pointer;
            transition: background 0.3s, color 0.3s;
            margin-bottom: 8px;
            box-sizing: border-box;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }
        .q-btn-inline-provador:hover { background: #000; color: #fff; }
        .q-btn-inline-provador svg { width: 14px; height: 14px; flex-shrink: 0; }

        /* ═══════════════════════════════════════════════
           MODAL OVERLAY
        ═══════════════════════════════════════════════ */
        #q-modal-ia {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(255,255,255,0.98);
            font-family: 'Inter', sans-serif;
            overflow-y: auto;
            box-sizing: border-box;
        }
        #q-modal-ia * { box-sizing: border-box; }

        /* ═══════════════════════════════════════════════
           CARD (container principal) - mobile first
        ═══════════════════════════════════════════════ */
        .q-card-ia {
            width: 100%;
            min-height: 100vh;
            background: #fff;
            color: #000;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        @media (min-width: 768px) {
            #q-modal-ia { display: none; align-items: center; justify-content: center; }
            .q-card-ia {
                width: 620px;
                max-width: 92vw;
                min-height: auto;
                max-height: 94vh;
                border: 1px solid #000;
                overflow: hidden;
            }
        }

        /* ═══════════════════════════════════════════════
           CLOSE BUTTON
        ═══════════════════════════════════════════════ */
        .q-close-ia {
            position: absolute;
            top: 16px; right: 16px;
            background: none; border: none;
            font-size: 28px; font-weight: 300;
            color: #000;
            cursor: pointer;
            z-index: 10;
            line-height: 1;
            padding: 4px 8px;
        }

        /* ═══════════════════════════════════════════════
           CONTENT SCROLL
        ═══════════════════════════════════════════════ */
        .q-content-scroll {
            flex: 1;
            padding: 24px 20px 24px;
            overflow-y: auto;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .q-content-scroll::-webkit-scrollbar { width: 4px; }
        .q-content-scroll::-webkit-scrollbar-thumb { background: #e5e5e5; }

        /* Mobile: conteúdo não ocupa a tela toda — card se ajusta ao conteúdo */
        @media (max-width: 767px) {
            .q-card-ia {
                min-height: auto;
                padding-top: env(safe-area-inset-top, 0px);
                padding-bottom: env(safe-area-inset-bottom, 0px);
            }
            #q-modal-ia {
                display: none;
                overflow-y: auto;
                padding: 20px;
                align-items: flex-start;
                justify-content: center;
            }
            #q-modal-ia[style*="flex"] { display: flex !important; }
            .q-card-ia {
                width: 100%;
                max-width: 420px;
                border: 1px solid #000;
                margin: auto;
            }
            .q-content-scroll {
                flex: none;
                padding: 28px 20px;
            }
        }

        /* ═══════════════════════════════════════════════
           HEADER
        ═══════════════════════════════════════════════ */
        #q-header-provador {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        }
        #q-header-provador h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        /* ═══════════════════════════════════════════════
           STEP UPLOAD (tela principal)
        ═══════════════════════════════════════════════ */
        #q-step-upload {
            display: flex;
            flex-direction: column;
            gap: 24px;
            align-items: stretch;
        }

        /* Form rows */
        .q-form-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }
        .q-form-row label {
            display: block;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #000;
            text-align: center;
        }

        /* Input */
        .q-input {
            display: block;
            width: 100%;
            height: 56px;
            padding: 0 16px;
            margin: 0;
            background: transparent;
            border: 1px solid #000;
            border-radius: 0;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
            color: #000;
            text-align: center;
            outline: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            box-sizing: border-box;
        }
        .q-input:focus { border-width: 2px; padding: 0 15px; }
        @media (max-width: 767px) {
            .q-input {
                height: 72px !important;
                padding: 0 20px !important;
                font-size: 22px !important;
                font-weight: 500 !important;
                letter-spacing: 0.02em !important;
            }
            .q-input:focus { padding: 0 19px !important; }
        }
        .q-input::placeholder { color: #999; }

        .q-provas-msg {
            font-size: 11px; margin-top: 6px; letter-spacing: 0.3px;
            color: var(--c-muted); min-height: 14px; transition: color 0.2s;
        }
        .q-provas-msg.is-warn { color: var(--c-danger); font-weight: 500; }


        /* Error message */
        .q-status-msg {
            display: none;
            font-size: 10px;
            letter-spacing: 1px;
            color: #ef4444;
            font-weight: 600;
            text-align: center;
            text-transform: uppercase;
            margin-top: 4px;
        }

        /* Upload row */
        #q-upload-row {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        #q-trigger-upload {
            width: 140px; height: 180px;
            border: 1px solid #000;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            transition: 0.3s;
        }
        #q-trigger-upload:hover { background: #ebebeb; }
        #q-trigger-upload i { font-size: 32px; color: #000; }
        #q-trigger-upload span {
            font-size: 10px; font-weight: 700;
            letter-spacing: 1.5px; text-transform: uppercase;
        }
        #q-pre-view {
            display: none;
            width: 140px; height: 180px;
            border: 1px solid #000;
            overflow: hidden;
        }
        #q-pre-view img { width: 100%; height: 100%; object-fit: cover; }

        /* Terms */
        .q-terms-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            justify-content: center;
            font-size: 12px;
            line-height: 1.5;
            color: #64748b;
            cursor: pointer;
            max-width: 340px;
            margin: 0 auto;
            text-align: left;
        }
        .q-terms-row input { margin-top: 3px; cursor: pointer; accent-color: #000; flex-shrink: 0; }
        .q-terms-row a { color: #8b5cf6; text-decoration: underline; }

        /* Buttons */
        .q-btn-black {
            width: 100%;
            height: 54px;
            background: #000;
            color: #fff;
            border: 1px solid #000;
            border-radius: 0;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            transition: 0.3s;
            box-sizing: border-box;
        }
        .q-btn-black:hover:not(:disabled) { background: #fff; color: #000; }
        .q-btn-black:disabled {
            background: #f5f5f5;
            color: #999;
            border-color: #e0e0e0;
            cursor: not-allowed;
        }
        .q-btn-outline {
            width: 100%;
            height: 54px;
            background: #fff;
            color: #000;
            border: 1px solid #000;
            border-radius: 0;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            transition: 0.3s;
            box-sizing: border-box;
        }
        .q-btn-outline:hover { background: #000; color: #fff; }

        /* ═══════════════════════════════════════════════
           PIX SCREEN
        ═══════════════════════════════════════════════ */
        #q-step-pix {
            display: none;
            text-align: center;
            padding: 20px 0;
            flex-direction: column;
            gap: 16px;
            align-items: center;
        }
        #q-step-pix h2 {
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0;
        }
        .q-pix-subtitle {
            font-size: 12px;
            color: #666;
            letter-spacing: 0.5px;
            margin: 0;
            line-height: 1.5;
        }
        .q-pix-qr {
            width: 200px; height: 200px;
            border: 1px solid #000;
            padding: 8px;
        }
        .q-pix-qr img { width: 100%; height: 100%; }
        .q-pix-copiacola {
            display: flex;
            gap: 8px;
            width: 100%;
            max-width: 340px;
        }
        .q-pix-copiacola input {
            flex: 1;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #000;
            background: #f5f5f5;
            font-size: 11px;
            font-family: 'Inter', sans-serif;
            outline: none;
            min-width: 0;
            box-sizing: border-box;
        }
        .q-pix-copiacola button {
            height: 42px;
            padding: 0 16px;
            background: #000;
            color: #fff;
            border: 1px solid #000;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            white-space: nowrap;
        }
        .q-pix-status {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #666;
        }
        @keyframes q-pix-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .q-pix-waiting { animation: q-pix-pulse 1.5s infinite ease-in-out; color: #f59e0b; }
        .q-pix-approved { color: #22c55e; }
        .q-pix-cancel {
            font-size: 11px;
            color: #666;
            text-decoration: underline;
            cursor: pointer;
            margin-top: 6px;
        }

        /* ═══════════════════════════════════════════════
           LOADING
        ═══════════════════════════════════════════════ */
        @keyframes q-slide { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes q-pulse-text { 0%,100% { opacity: 0.4; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1); } }
        #q-loading-box {
            display: none;
            padding: 60px 0;
            text-align: center;
        }
        #q-loading-box > div:first-child {
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 20px;
            animation: q-pulse-text 1.5s infinite ease-in-out;
        }
        .q-loading-bar {
            height: 2px;
            background: #f5f5f5;
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        .q-loading-bar > div {
            position: absolute;
            top: 0; left: 0;
            height: 100%; width: 30%;
            background: #000;
            animation: q-slide 1.5s infinite linear;
        }

        /* ═══════════════════════════════════════════════
           RESULT SCREEN
        ═══════════════════════════════════════════════ */
        #q-step-result {
            display: none;
            flex-direction: column;
            gap: 24px;
            align-items: stretch;
        }
        #q-result-img-col {
            width: 100%;
            border: 1px solid #000;
            background: #f5f5f5;
            overflow: hidden;
        }
        #q-result-img-col img { width: 100%; height: auto; display: block; }
        #q-result-actions-col {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .q-res-title, .q-res-subtitle, .q-res-note { display: none; }
        .q-res-mobile-only {
            margin: 10px 0 0;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #666;
            cursor: pointer;
            text-decoration: underline;
            text-underline-offset: 4px;
        }

        /* Result mode on desktop */
        @media (min-width: 768px) {
            .q-card-ia.is-result {
                width: 1000px !important;
                max-width: 92vw !important;
                height: 660px !important;
            }
            .q-card-ia.is-result #q-header-provador,
            .q-card-ia.is-result .q-powered-footer { display: none !important; }
            .q-card-ia.is-result .q-content-scroll {
                padding: 0 !important;
                height: 100% !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 0 !important;
            }
            .q-card-ia.is-result #q-step-result {
                display: flex !important;
                flex-direction: row !important;
                width: 100%; height: 100%;
                align-items: stretch;
                gap: 0 !important;
            }
            .q-card-ia.is-result #q-result-img-col {
                width: 45% !important; height: 100% !important;
                margin: 0 !important;
                border: none !important;
                border-right: 1px solid #000 !important;
                position: relative !important;
                flex-shrink: 0;
            }
            .q-card-ia.is-result #q-result-img-col img {
                position: absolute !important; top: 0; left: 0;
                width: 100% !important; height: 100% !important;
                object-fit: cover !important;
                object-position: top center !important;
            }
            .q-card-ia.is-result #q-result-actions-col {
                width: 55% !important; height: 100% !important;
                padding: 40px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                box-sizing: border-box;
                overflow-y: auto;
            }
            .q-card-ia.is-result .q-res-title {
                display: block !important;
                font-size: 20px; font-weight: 700;
                letter-spacing: 2px; text-transform: uppercase;
                color: #000; margin-bottom: 4px;
            }
            .q-card-ia.is-result .q-res-mobile-only { display: none !important; }
            .q-card-ia.is-result .q-close-ia { top: 16px; right: 16px; z-index: 10; }
        }

        /* ═══════════════════════════════════════════════
           POWERED FOOTER
        ═══════════════════════════════════════════════ */
        .q-powered-footer {
            background: #fff;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-shrink: 0;
            border-top: 1px solid #f5f5f5;
            text-decoration: none;
        }
        .q-powered-footer span {
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #666;
        }

        #q-step-error {
            display: none;
            flex-direction: column;
            gap: 24px;
            align-items: center;
            text-align: center;
            padding: 40px 0;
        }
        #q-step-error h2 {
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0;
            color: #000;
        }
        #q-step-error p {
            font-size: 13px;
            color: #666;
            margin: 0;
            line-height: 1.6;
        }
        .q-quantic-logo {
            height: 22px;
            filter: brightness(0);
        }
    `;


    // ─── IMAGEM DO BOTÃO (trigger) ─────────────────────────────────────────────
    const stampImageHTML = `<img src="https://cdn.shopify.com/s/files/1/0636/6334/1746/files/logo_provador.png?v=1772494793" alt="Provador Virtual" style="width:100%;height:100%;object-fit:contain;">`;



    // ─── HTML ─────────────────────────────────────────────────────────────────────


    const html = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>
                <div class="q-content-scroll">
                    <div id="q-header-provador">
                        <h1>Provador Virtual</h1>
                        <img
                            src="https://i.ibb.co/5XKzBNxw/amazoni-logo.webp"
                            alt="AMAZONI GLASSES"
                            style="height:60px;width:auto;filter:brightness(0);"
                        />
                    </div>
                    <div id="q-step-upload">
                        <div class="q-form-row">
                            <label>Seu Celular</label>
                            <input type="tel" id="q-phone" class="q-input" placeholder="(11) 99999-9999" maxlength="15">
                            <div id="q-phone-error" class="q-status-msg">Insira um número válido</div>
                            <div id="q-provas-restantes" class="q-provas-msg"></div>
                        </div>

                        <div class="q-form-row" id="q-photo-selector-group" style="display:none;">
                            <label>Selecione a foto da peça:</label>
                            <div id="q-product-images-container" style="display:flex; gap:15px; justify-content:center;"></div>
                        </div>

                        <div id="q-upload-row">
                            <div id="q-trigger-upload">
                                <i class="ph ph-camera-plus"></i>
                                <span>Enviar Foto</span>
                                <input type="file" id="q-real-input" accept="image/*" style="display:none">
                            </div>
                            <div id="q-pre-view">
                                <img id="q-pre-img">
                            </div>
                        </div>

                        <label class="q-terms-row">
                            <input type="checkbox" id="q-accept-terms">
                            <span>Ao continuar, concordo com os <a href="http://provoulevou.com.br/termos.html" target="_blank">Termos e Condições</a></span>
                        </label>

                        <button class="q-btn-black" id="q-btn-generate" disabled>Provar óculos</button>
                    </div>

                    <div id="q-step-pix">
                        <h2>Prova Extra</h2>
                        <p class="q-pix-subtitle">Você atingiu o limite de 3 provas grátis.<br>Pague R$1 via PIX para gerar mais uma:</p>
                        <p style="font-size: 11px; color: var(--c-muted); margin: 8px 0 0; line-height: 1.5; text-align: center;">&#8505;&#65039; Cobran&#231;a feita pela Provou Levou, n&#227;o pela loja</p>
                        <div class="q-pix-qr"><img id="q-pix-qr-img" alt="QR Code PIX"></div>
                        <div class="q-pix-copiacola">
                            <input type="text" id="q-pix-code" readonly placeholder="Código PIX...">
                            <button id="q-pix-copy-btn">Copiar</button>
                        </div>
                        <div id="q-pix-status-msg" class="q-pix-status q-pix-waiting">Aguardando pagamento...</div>
                        <p class="q-pix-cancel" id="q-pix-cancel">Cancelar</p>
                    </div>

                    <div id="q-loading-box">
                        <div>Gerando Prova Virtual...</div>
                        <div class="q-loading-bar"><div></div></div>
                    </div>

                    <div id="q-step-result">
                        <div id="q-result-img-col">
                            <img id="q-final-view-img">
                        </div>
                        <div id="q-result-actions-col">
                            <span class="q-res-title">Provador Virtual</span>
                            <div class="q-res-note"></div>
                            <button class="q-btn-outline" id="q-btn-back">Voltar ao Produto</button>
                            <p class="q-res-mobile-only" id="q-retry-btn">Tentar outra foto</p>
                        </div>
                    <div id="q-step-error">
                        <h2>Provador fora do ar</h2>
                        <p>Voltamos em breve &#x1F64F;</p>
                        <button class="q-btn-outline" id="q-error-back">Voltar ao Produto</button>
                    </div>
                    </div>
                </div>
                <a href="https://provoulevou.com.br" target="_blank" class="q-powered-footer">
                    <span>Powered by</span>
                    <img src="https://provoulevou.com.br/assets/provoulevou-logo.png" class="q-quantic-logo">
                </a>
            </div>
        </div>
    `;


    // ─── INIT ─────────────────────────────────────────────────────────────────────


    function init() {
        // --- FILTRO DE CATEGORIA (HAT) ---
        const productNameNormalized = (document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title).toUpperCase();
        if (productNameNormalized.includes('HAT')) {
            return;
        }

        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);


        if (!window.phosphorIconsLoaded) {
            const ph = document.createElement('script');
            ph.src = 'https://unpkg.com/@phosphor-icons/web';
            document.head.appendChild(ph);
            window.phosphorIconsLoaded = true;
        }


        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);


        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);


        // ── Botão imagem PNG ──
        const openBtn = document.createElement('button');
        openBtn.className = 'q-btn-trigger-ia';
        openBtn.id = 'q-open-ia';
        openBtn.setAttribute('aria-label', 'Abrir Provador Virtual');
        openBtn.innerHTML = stampImageHTML;


        // IMPORTANTE: containers SEM swiper vêm primeiro — no mobile, se o selo
        // cai dentro de `.js-product-slide` (slide do Swiper), o gesto de swipe
        // do tema engole o tap e o botão nunca abre.
        const imgContainers = ['[data-store^="product-image-"]', '.product-image-column', '.product__media-wrapper', '.product-gallery__media', '.product-image-main', '.product-media-container', '.product-gallery', '.product-single__media', '.media-gallery', '.js-swiper-product', '.product__media', '[data-media-id]', '.product__media-item', '.js-product-slide'];

        function tryPlaceTriggerBtn() {
            // 1ª prioridade: container que tenha <img> dentro (evita cair em slide de vídeo)
            for (const sel of imgContainers) {
                const els = document.querySelectorAll(sel);
                for (const el of els) {
                    if (el.querySelector('img')) {
                        if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
                        el.appendChild(openBtn);
                        return true;
                    }
                }
            }
            // 2ª prioridade: qualquer container correspondente
            for (const sel of imgContainers) {
                const el = document.querySelector(sel);
                if (el) {
                    if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
                    el.appendChild(openBtn);
                    return true;
                }
            }
            return false;
        }

        if (!tryPlaceTriggerBtn()) {
            // Container não pronto ainda (ex: após F5 no mobile).
            // Observa DOM até 5s aguardando o container aparecer.
            const observer = new MutationObserver(() => {
                if (tryPlaceTriggerBtn()) observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                if (!openBtn.isConnected) {
                    openBtn.style.cssText = 'position:fixed;bottom:30px;right:20px;top:auto;z-index:100;';
                    document.body.appendChild(openBtn);
                }
            }, 5000);
        }


        const modal = document.getElementById('q-modal-ia');

        // ── Botão inline acima do botão de compra ──
        const inlineBtn = document.createElement('button');
        inlineBtn.className = 'q-btn-inline-provador';
        inlineBtn.type = 'button';

        const inlineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        inlineSvg.setAttribute('viewBox', '0 0 24 24');
        inlineSvg.setAttribute('fill', 'none');
        inlineSvg.setAttribute('stroke', 'currentColor');
        inlineSvg.setAttribute('stroke-width', '1.5');
        inlineSvg.setAttribute('stroke-linecap', 'round');
        inlineSvg.setAttribute('stroke-linejoin', 'round');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2');
        const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', '12');
        circle1.setAttribute('cy', '7');
        circle1.setAttribute('r', '4');
        inlineSvg.appendChild(path1);
        inlineSvg.appendChild(circle1);
        inlineBtn.appendChild(inlineSvg);

        const inlineBtnText = document.createTextNode('Provador Virtual');
        inlineBtn.appendChild(inlineBtnText);

        inlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        });

        // Posiciona acima do botão de compra — prioriza posições FORA da linha
        // quantidade/submit (evita conflito com handlers do tema e largura restrita).
        const productForm = document.querySelector('form.js-product-form, form#product_form');
        const variantsContainer = document.querySelector('.js-product-variants');
        const buyBtn = document.querySelector('.js-addtocart, .btn-add-to-cart, [data-component="product.add-to-cart"]');
        if (variantsContainer) {
            variantsContainer.parentNode.insertBefore(inlineBtn, variantsContainer.nextSibling);
        } else if (productForm) {
            productForm.parentNode.insertBefore(inlineBtn, productForm);
        } else if (buyBtn) {
            buyBtn.parentNode.insertBefore(inlineBtn, buyBtn);
        }
        const genBtn = document.getElementById('q-btn-generate');
        const uploadStep = document.getElementById('q-step-upload');

        const closeBtn = document.getElementById('q-close-btn');
        const backBtn = document.getElementById('q-btn-back');
        const retryBtn = document.getElementById('q-retry-btn');
        const realInput = document.getElementById('q-real-input');
        const triggerUpload = document.getElementById('q-trigger-upload');
        const phoneInput = document.getElementById('q-phone');


        let userPhoto = null;
        let selectedProductImgUrl = '';

        // Upgrade Nuvemshop CDN URLs to 1024px version
        function upgradeImgUrl(url) {
            if (url.includes('mitiendanube.com') || url.includes('nuvemshop.com')) {
                return url.replace(/-\d+-\d+\.webp/, '-1024-1024.webp');
            }
            return url;
        }

        function extractImages() {
            const containersSelectors = '.js-product-slide, .product-image-column, .js-swiper-product, [data-store^="product-image-"], .product__media-wrapper, .product-gallery__media, .product__media, .product-image-main, .product-media-container, [data-media-id], .product__media-item, .product-gallery, .product-single__media, .media-gallery, [data-component="product.gallery"], .swiper-slide:not(.swiper-slide-duplicate), .slider-wrapper';
            const possibleContainers = Array.from(document.querySelectorAll(containersSelectors));
            let imgEls = [];
            possibleContainers.forEach(c => {
                if (!c.closest('#q-modal-ia')) {
                    const foundImgs = c.querySelectorAll('img');
                    imgEls.push(...Array.from(foundImgs));
                }
            });
            let uniqueImgs = [];
            imgEls.forEach(img => {
                let src = img.dataset?.src || img.getAttribute('data-src') || img.src;

                if (src && src.includes('data:image')) {
                    const parentA = img.closest('a');
                    if (parentA && parentA.href && !parentA.href.includes('javascript:')) {
                        src = parentA.href;
                    } else if (img.getAttribute('data-srcset')) {
                        src = img.getAttribute('data-srcset').split(',')[0].trim().split(' ')[0];
                    }
                }

                if (!src || src.includes('data:image')) return;

                const lowerSrc = src.toLowerCase();
                const invalidKeywords = ['provador', 'logo', 'provoulevou', 'icon', 'play', 'video', 'transparent', 'placeholder', 'blank', 'spacer'];
                if (invalidKeywords.some(kw => lowerSrc.includes(kw))) return;

                // Filter out tiny images (1x1 pixels, spacers, etc.)
                if (img.naturalWidth > 0 && img.naturalWidth < 50) return;
                if (img.naturalHeight > 0 && img.naturalHeight < 50) return;

                let cleanSrc = src.split('?')[0].replace(/-\d+-\d+\.webp|_\d+x\d+/, '');

                // Upgrade to 1024px version
                src = upgradeImgUrl(src);

                if (!uniqueImgs.some(u => u.split('?')[0].replace(/-\d+-\d+\.webp|_\d+x\d+/, '') === cleanSrc)) {
                    uniqueImgs.push(src);
                }
            });
            if (uniqueImgs.length === 0) {
                const og = document.querySelector('meta[property="og:image"]')?.content;
                if (og) uniqueImgs.push(upgradeImgUrl(og));
            }
            return uniqueImgs.slice(0, 4);
        }

        function populateImageSelector() {
            const imgs = extractImages();
            const group = document.getElementById('q-photo-selector-group');

            group.style.display = 'none';
            selectedProductImgUrl = imgs[0] || '';
            return;
        }

        // Scripts do tema (appPlanweb na Amazoni) fazem
        // `body.innerHTML = body.innerHTML.replaceAll(...)` e destacam o nosso
        // modal do DOM. Nossa referência continua válida (handlers preservados),
        // só precisa ser re-anexada ao novo body antes de abrir.
        // CRÍTICO: o re-parse também cria uma CÓPIA "morta" do modal (sem
        // listeners) no novo body. Se deixarmos as duas, getElementById
        // retorna a cópia morta primeiro e quebra botões internos (upload de
        // foto, gerar etc.). Removemos qualquer duplicata antes de re-anexar.
        function ensureModalInDom() {
            const existing = document.getElementById('q-modal-ia');
            if (existing && existing !== modal) existing.remove();
            if (!modal.isConnected) document.body.appendChild(modal);
            // NÃO removemos as cópias dos botões (selo/inline) criadas pelo
            // re-parse: elas são o que o usuário vê e clica. Nossa delegação
            // global no document trata o clique nelas independente de listeners.
        }

        function openModal() {
            ensureModalInDom();
            modal.style.display = 'flex';
            lockBodyScroll();
            if (typeof _checkProvasRestantes === 'function') _checkProvasRestantes();
        }


        function closeModal() {
            modal.style.display = 'none';
            unlockBodyScroll();
        }


        function applyProduct(product) {
            currentProduct = product;
        }


        function handleTriggerClick(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        }

        openBtn.addEventListener('click', handleTriggerClick, true);

        // Delegação global como fallback — captura cliques em qualquer instância
        // dos botões (selo ou inline), mesmo que o tema re-renderize o DOM.
        document.addEventListener('click', function (e) {
            const t = e.target && e.target.closest && e.target.closest('.q-btn-trigger-ia, .q-btn-inline-provador');
            if (t) handleTriggerClick(e);
        }, true);


        closeBtn.onclick = () => closeModal();
        backBtn.onclick = () => closeModal();


        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });


        retryBtn.onclick = () => {
            document.getElementById('q-step-result').style.display = 'none';
            document.getElementById('q-step-upload').style.display = 'block';
            document.querySelector('.q-card-ia').classList.remove('is-result');
            userPhoto = null;
            document.getElementById('q-pre-view').style.display = 'none';
            checkFields();
        };


        triggerUpload.onclick = () => realInput.click();

        function showError() {
            var lb = document.getElementById('q-loading-box');
            var su = document.getElementById('q-step-upload');
            var se = document.getElementById('q-step-error');
            if (lb) lb.style.display = 'none';
            if (su) su.style.display = 'none';
            if (se) se.style.display = 'flex';
        }
        var _eb = document.getElementById('q-error-back'); if (_eb) _eb.onclick = function() { closeModal(); };



        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            checkFields();
        });

        // ── Contador de provas restantes (debounced) ──
        let _provasDebounce;
        const _provasMsg = document.getElementById('q-provas-restantes');
        async function _checkProvasRestantes() {
            if (!_provasMsg) return;
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = (nums.length === 10 || nums.length === 11) && /^[1-9][1-9]/.test(nums) && (nums.length === 10 || nums[2] === '9');
            // Phone vazio/incompleto → manda '0' pra pegar só o ip_count.
            const phone = phoneOk ? '55' + nums : '0';
            try {
                const r = await fetch(WEBHOOK_CHECK_LIMIT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const d = await r.json();
                const used = Math.max(d.phone_count || 0, d.ip_count || 0, d.count || 0);
                const restantes = Math.max(0, 3 - used);
                if (restantes > 0) {
                    _provasMsg.textContent = restantes + (restantes === 1 ? ' prova restante hoje' : ' provas restantes hoje');
                    _provasMsg.classList.remove('is-warn');
                } else {
                    _provasMsg.textContent = 'Limite de 3 provas atingido — pague R$1 via PIX para mais uma.';
                    _provasMsg.classList.add('is-warn');
                }
            } catch(_) { _provasMsg.textContent = ''; _provasMsg.classList.remove('is-warn'); }
        }
        phoneInput.addEventListener('input', () => {
            clearTimeout(_provasDebounce);
            _provasDebounce = setTimeout(_checkProvasRestantes, 600);
        });



        function checkFields() {
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = (nums.length === 10 || nums.length === 11) && /^[1-9][1-9]/.test(nums) && (nums.length === 10 || nums[2] === '9');
            document.getElementById('q-phone-error').style.display = (phoneInput.value.length > 0 && !phoneOk) ? 'block' : 'none';
            phoneInput.style.borderColor = (phoneInput.value.length > 0 && !phoneOk) ? '#ef4444' : 'var(--q-border)';

            genBtn.disabled = !(userPhoto && phoneOk && document.getElementById('q-accept-terms').checked);
        }


        ['q-h-val', 'q-w-val', 'q-cin-val', 'q-quad-val'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', checkFields);
        });

        document.getElementById('q-accept-terms').onchange = checkFields;


        realInput.onchange = (e) => {
            userPhoto = e.target.files[0];
            if (userPhoto) {
                const rd = new FileReader();
                rd.onload = ev => {
                    document.getElementById('q-pre-img').src = ev.target.result;
                    document.getElementById('q-pre-view').style.display = 'block';
                    checkFields();
                };
                rd.readAsDataURL(userPhoto);
            }
        };


        function resizeImage(fileOrBlob, maxSize) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width, h = img.height;
                    if (w <= maxSize && h <= maxSize) { resolve(fileOrBlob); return; }
                    if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                    else { w = Math.round(w * maxSize / h); h = maxSize; }
                    const c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(img, 0, 0, w, h);
                    c.toBlob(b => resolve(b), 'image/jpeg', 0.95);
                };
                const url = URL.createObjectURL(fileOrBlob instanceof Blob ? fileOrBlob : new Blob([fileOrBlob]));
                img.src = url;
            });
        }

        // ── PIX: polling e controle ──
        let pixPollingTimer = null;

        function stopPixPolling() {
            if (pixPollingTimer) { clearInterval(pixPollingTimer); pixPollingTimer = null; }
        }

        function showPixScreen() {
            uploadStep.style.display = 'none';
            document.getElementById('q-step-pix').style.display = 'block';
            document.getElementById('q-pix-status-msg').textContent = 'Aguardando pagamento...';
            document.getElementById('q-pix-status-msg').className = 'q-pix-status q-pix-waiting';
        }

        function hidePixScreen() {
            stopPixPolling();
            document.getElementById('q-step-pix').style.display = 'none';
        }

        async function createPixAndPoll() {
            showPixScreen();
            try {
                const resp = await fetch(WEBHOOK_PIX, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'cliente@provoulevou.com.br', phone: '55' + phoneInput.value.replace(/\D/g, '') })
                });
                const pix = await resp.json();
                if (!pix.payment_id || !pix.qr_code) throw new Error('PIX inválido');

                document.getElementById('q-pix-qr-img').src = 'data:image/png;base64,' + pix.qr_code_base64;
                document.getElementById('q-pix-code').value = pix.qr_code;

                // Polling a cada 3s por até 5min
                let attempts = 0;
                pixPollingTimer = setInterval(async () => {
                    attempts++;
                    if (attempts > 100) { stopPixPolling(); return; }
                    try {
                        const sr = await fetch(WEBHOOK_PIX_STATUS + '?payment_id=' + pix.payment_id);
                        const st = await sr.json();
                        if (st.status === 'approved') {
                            stopPixPolling();
                            document.getElementById('q-pix-status-msg').textContent = 'Pagamento confirmado!';
                            document.getElementById('q-pix-status-msg').className = 'q-pix-status q-pix-approved';
                            setTimeout(() => {
                                hidePixScreen();
                                runGeneration();
                            }, 1200);
                        }
                    } catch (_) {}
                }, 3000);
            } catch (e) {
                hidePixScreen();
                uploadStep.style.display = 'block';
                alert('Erro ao gerar PIX. Tente novamente.');
            }
        }

        // Botão copiar PIX
        document.getElementById('q-pix-copy-btn').onclick = () => {
            const code = document.getElementById('q-pix-code').value;
            navigator.clipboard.writeText(code).then(() => {
                document.getElementById('q-pix-copy-btn').textContent = 'Copiado!';
                setTimeout(() => { document.getElementById('q-pix-copy-btn').textContent = 'Copiar'; }, 2000);
            });
        };

        // Botão cancelar PIX
        document.getElementById('q-pix-cancel').onclick = () => {
            hidePixScreen();
            uploadStep.style.display = 'block';
        };

        // ── GERAÇÃO PRINCIPAL ──
        async function runGeneration() {
            const keyToUse = window.PROVOU_LEVOU_API_KEY;
            if (!keyToUse || keyToUse.includes("COLOQUE_A_CHAVE_AQUI")) {
                alert("Erro: API Key não configurada neste script.");
                return;
            }

            const prodImg = selectedProductImgUrl || (document.querySelector('meta[property="og:image"]')?.content || '');
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;

            uploadStep.style.display = 'none';
            document.getElementById('q-loading-box').style.display = 'block';

            try {
                const fd = new FormData();
                fd.append('person_image', userPhoto, 'person.jpg');
                fd.append('whatsapp', '55' + phoneInput.value.replace(/\D/g, ''));
                fd.append('phone_raw', phoneInput.value);
                fd.append('product_name', prodName);
                fd.append('product_type', currentProduct.category);
                fd.append('product_fit', currentProduct.fit);
                fd.append('api_key', keyToUse);

                if (currentProduct.category === 'top') {
                    fd.append('height', '');
                    fd.append('weight', '');
                } else {
                    fd.append('height', '');
                    fd.append('weight', '');
                    fd.append('cintura', '');
                    fd.append('quadril', '');
                }

                // Coleta até 4 fotos do produto: 1ª como binary (compat), 2ª-4ª como base64 text.
                // 1ª = prodImg (escolhida pelo cliente ou default); demais = extractImages() exceto a 1ª.
                let allProdImgs = [];
                if (prodImg) allProdImgs.push(prodImg);
                try {
                    if (typeof extractImages === 'function') {
                        const extra = extractImages();
                        for (const u of extra) {
                            const cleanU = String(u || '').split('?')[0];
                            if (!allProdImgs.some(p => String(p).split('?')[0] === cleanU)) {
                                allProdImgs.push(u);
                            }
                        }
                    }
                } catch (_) {}
                allProdImgs = allProdImgs.slice(0, 4);
                console.log('[PL Amazoni] Enviando', allProdImgs.length, 'fotos do produto');
                for (let _pi = 0; _pi < allProdImgs.length; _pi++) {
                    try {
                        const _b = await fetch(allProdImgs[_pi]).then(r => r.blob());
                        if (_pi === 0) {
                            fd.append('product_image', _b, 'product.jpg');
                        } else {
                            const _b64 = await new Promise((resolve, reject) => {
                                const _r = new FileReader();
                                _r.onloadend = () => resolve(_r.result.split(',')[1]);
                                _r.onerror = reject;
                                _r.readAsDataURL(_b);
                            });
                            fd.append('product_image_' + (_pi+1) + '_b64', _b64);
                        }
                    } catch (_) { }
                }

                calculateFinalSize();

                const res = await fetch(WEBHOOK_PROVA, { method: 'POST', body: fd });

                const contentType = res.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.error) {
                        document.getElementById('q-loading-box').style.display = 'none';
                        document.getElementById('q-step-upload').style.display = 'block';
                        if (data.error === "Chave invalida, vencida ou inativa." || data.error.includes("vencida ou inativa")) {
                            alert("App desativado nesta loja");
                        } else {
                            alert(data.error);
                        }
                        return;
                    }
                }

                if (res.ok) {
                    const blob = await res.blob();
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-final-view-img').src = URL.createObjectURL(blob);
                    document.querySelector('.q-card-ia').classList.add('is-result');
                    document.getElementById('q-step-result').style.display = 'flex';
                } else if (res.status === 401 || res.status === 403) {
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-step-upload').style.display = 'block';
                    alert("App desativado nesta loja");
                } else { throw new Error(); }
            } catch (e) {
                document.getElementById('q-loading-box').style.display = 'none';
                document.getElementById('q-step-upload').style.display = 'block';
                alert('Ocorreu um erro ao processar sua imagem (ou chave/servidor indisponíveis). Tente novamente.');
            }
        }

        genBtn.onclick = async () => {
            if (!userPhoto) return;

            const phone = '55' + phoneInput.value.replace(/\D/g, '');
            genBtn.disabled = true;

            try {
                const resp = await fetch(WEBHOOK_CHECK_LIMIT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const data = await resp.json();
                if (data.limited) {
                    genBtn.disabled = false;
                    alert('Você atingiu o limite de provas gratuitas.');
                    genBtn.disabled = false;
                    return;
                }
            } catch (_) {
                // se o check falhar, deixa gerar (evita bloquear por erro de rede)
            }

            genBtn.disabled = false;
            runGeneration();
        };
    }

    // ─── EXECUTA APENAS EM PÁGINAS DE PRODUTO ────────────────────────────────────
    const isProductPage = window.location.pathname.includes('/products/') || window.location.pathname.includes('/product/') || window.location.pathname.includes('/produtos/') || window.location.pathname.includes('/produto/') || window.location.pathname.includes('/p/') || window.location.pathname.includes('preview.html') || document.querySelector('meta[property="og:type"][content="product"]');

    if (isProductPage) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }

})();
