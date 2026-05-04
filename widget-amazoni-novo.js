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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        :root { --c-bg:#fff; --c-surface:#f7f6f4; --c-ink:#111; --c-muted:#999; --c-line:#e8e8e8; --c-danger:#cc3333; --font-display:'Bebas Neue',sans-serif; --font-body:'DM Sans',sans-serif; }

        @keyframes q-shake { 0%,50%,100%{transform:rotate(0deg)} 10%,30%{transform:rotate(-10deg)} 20%,40%{transform:rotate(10deg)} }
        .q-btn-trigger-ia { position:absolute; top:55px; right:30px; z-index:100; background:none; border:none; padding:0; cursor:pointer; width:72px; height:72px; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18)); animation:q-shake 3s infinite; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
        .q-btn-trigger-ia:hover { filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28)); }
        .q-btn-trigger-ia img { width:100%; height:100%; object-fit:contain; }
        @media(min-width:768px){ .q-btn-trigger-ia{width:65px;height:65px;} }

        .q-btn-inline-provador { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:12px 14px; background:transparent; color:#000; border:1px solid #000; border-radius:999px; font-family:'Work Sans',sans-serif; font-size:10px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:background 0.3s,color 0.3s; margin-bottom:8px; box-sizing:border-box; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
        .q-btn-inline-provador:hover { background:#000; color:#fff; }
        .q-btn-inline-provador svg { width:14px; height:14px; flex-shrink:0; }

        @keyframes q-modal-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        #q-modal-ia { display:none; position:fixed; inset:0; z-index:999999; background:rgba(240,238,235,0.96); font-family:var(--font-body); overflow-y:auto; box-sizing:border-box; }
        #q-modal-ia * { box-sizing:border-box; }
        .q-card-ia { width:100%; min-height:100vh; background:var(--c-bg); color:var(--c-ink); display:flex; flex-direction:column; position:relative; animation:q-modal-in 0.35s cubic-bezier(0.22,1,0.36,1); }
        @media(min-width:768px){ #q-modal-ia{display:none;align-items:center;justify-content:center;} .q-card-ia{width:460px;max-width:92vw;min-height:auto;max-height:96vh;box-shadow:0 32px 80px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06);overflow:hidden;} }
        .q-close-ia { position:absolute; top:18px; right:18px; background:none; border:none; font-size:26px; font-weight:300; color:var(--c-muted); cursor:pointer; z-index:10; line-height:1; padding:4px 6px; transition:color 0.2s; }
        .q-close-ia:hover { color:var(--c-ink); }
        .q-content-scroll { flex:1; padding:0; overflow-y:auto; text-align:left; display:flex; flex-direction:column; }
        .q-content-scroll::-webkit-scrollbar { width:3px; }
        .q-content-scroll::-webkit-scrollbar-thumb { background:var(--c-line); }
        @media(max-width:767px){ #q-modal-ia{display:none;overflow-y:auto;padding:20px;align-items:flex-start;justify-content:center;} #q-modal-ia[style*="flex"]{display:flex !important;} .q-card-ia{width:100%;max-width:420px;border:1px solid #e8e8e8;margin:auto;min-height:auto;} .q-content-scroll{flex:1;} }

        #q-header-provador { padding:24px 28px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px; border-bottom:1px solid var(--c-line); }
        #q-header-provador h1 { margin:0; font-family:var(--font-display); font-size:26px; letter-spacing:4px; text-transform:uppercase; color:var(--c-ink); font-weight:400; line-height:1; }

        #q-step-upload { display:flex; flex-direction:column; padding:24px 28px 28px; gap:20px; }

        .q-form-row { display:flex; flex-direction:column; gap:8px; }
        .q-form-row label { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--c-muted); }
        .q-input { display:block; width:100%; height:52px; padding:0 16px; border:none; border-bottom:1.5px solid var(--c-line); font-size:16px; font-family:var(--font-body); background:var(--c-surface); color:var(--c-ink); outline:none; border-radius:0; -webkit-appearance:none; appearance:none; box-sizing:border-box; }
        .q-input:focus { border-bottom-color:var(--c-ink); background:#fff; }
        .q-input::placeholder { color:#bbb; }
        .q-status-msg { display:none; font-size:10px; color:var(--c-danger); font-weight:600; margin-top:4px; }

        #q-upload-row { display:flex; gap:20px; justify-content:center; }
        #q-trigger-upload { width:130px; height:170px; border:2px dashed var(--c-line); background:var(--c-surface); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; cursor:pointer; transition:0.2s; }
        #q-trigger-upload:hover { border-color:var(--c-ink); background:#ebebeb; }
        #q-trigger-upload i { font-size:32px; color:var(--c-ink); }
        #q-trigger-upload span { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        #q-pre-view { width:130px; height:170px; overflow:hidden; border:1px solid var(--c-line); border-radius:8px; }
        #q-pre-img { width:100%; height:100%; object-fit:cover; }

        .q-terms-row { display:flex; align-items:flex-start; gap:10px; font-size:11.5px; color:var(--c-muted); cursor:pointer; line-height:1.5; justify-content:center; text-align:center; }
        .q-terms-row input { margin-top:3px; cursor:pointer; accent-color:var(--c-ink); flex-shrink:0; }
        .q-terms-row a { color:var(--c-ink); text-decoration:underline; text-underline-offset:2px; }

        .q-btn-black { width:100%; height:52px; background:var(--c-ink); color:#fff; border:none; border-radius:0; font-family:var(--font-display); font-size:17px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s; box-sizing:border-box; }
        .q-btn-black:hover:not(:disabled) { opacity:0.82; }
        .q-btn-black:disabled { background:#ccc; cursor:not-allowed; }
        .q-btn-outline { width:100%; height:52px; background:transparent; color:var(--c-ink); border:1.5px solid var(--c-line); border-radius:0; font-family:var(--font-display); font-size:17px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:0.2s; box-sizing:border-box; }
        .q-btn-outline:hover { border-color:var(--c-ink); }
        .q-btn-buy { width:100%; height:52px; background:var(--c-ink); color:#fff; border:none; border-radius:0; font-family:var(--font-display); font-size:17px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s; margin-bottom:12px; box-sizing:border-box; }
        .q-btn-buy:hover { opacity:0.82; }

        #q-step-confirm { position:absolute; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(2px); z-index:200; display:none; align-items:center; justify-content:center; padding:20px; }
        .q-confirm-box { background:#fff; width:100%; max-width:380px; padding:40px 30px; border:1px solid #e8e8e8; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.15); border-radius:4px; animation:q-modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1); }

        #q-step-pix { display:none; text-align:center; padding:36px 28px; flex-direction:column; gap:16px; align-items:center; }
        #q-step-pix h2 { font-family:var(--font-display); font-size:24px; letter-spacing:3px; text-transform:uppercase; margin:0; font-weight:400; }
        .q-pix-subtitle { font-size:13px; color:var(--c-muted); margin:0; line-height:1.6; }
        .q-pix-qr { width:180px; height:180px; border:1px solid var(--c-line); padding:6px; margin:0 auto; background:var(--c-surface); }
        .q-pix-qr img { width:100%; height:100%; }
        .q-pix-copiacola { display:flex; gap:8px; width:100%; max-width:320px; margin:0 auto; }
        .q-pix-copiacola input { flex:1; height:40px; padding:0 12px; border:1px solid var(--c-line); background:var(--c-surface); font-size:11px; font-family:var(--font-body); outline:none; min-width:0; }
        .q-pix-copiacola button { height:40px; padding:0 14px; background:var(--c-ink); color:#fff; border:none; font-size:10px; font-weight:600; letter-spacing:1px; text-transform:uppercase; cursor:pointer; }
        .q-pix-status { font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--c-muted); }
        @keyframes q-pix-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .q-pix-waiting { animation:q-pix-pulse 1.5s infinite ease-in-out; color:#d97706; }
        .q-pix-approved { color:#16a34a; }
        .q-pix-cancel { font-size:11px; color:var(--c-muted); text-decoration:underline; cursor:pointer; margin-top:4px; }

        @keyframes q-slide { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        @keyframes q-alt-show { 0%,5%{opacity:0;transform:translateY(6px)} 15%,45%{opacity:1;transform:translateY(0)} 55%,100%{opacity:0;transform:translateY(-6px)} }
        @keyframes q-alt-hide { 0%,55%{opacity:0;transform:translateY(6px)} 65%,95%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        .q-loading-texts { position:relative; height:36px; width:100%; display:flex; align-items:center; justify-content:center; margin-bottom:24px; }
        .q-loading-t1,.q-loading-t2 { position:absolute; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; }
        .q-loading-t1 { font-family:var(--font-display); font-size:18px; letter-spacing:4px; text-transform:uppercase; color:var(--c-ink); animation:q-alt-show 3.6s ease-in-out infinite; }
        .q-loading-t2 { animation:q-alt-hide 3.6s ease-in-out infinite; text-decoration:none; opacity:0; }
        .q-loading-t2 span { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--c-muted); font-family:var(--font-body); }
        .q-loading-t2 img { height:16px; width:auto; opacity:0.7; }
        #q-loading-box { display:none; padding:60px 28px; text-align:center; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; }
        .q-loading-bar { height:1px; background:var(--c-line); width:100%; position:relative; overflow:hidden; }
        .q-loading-bar > div { position:absolute; top:0; left:0; height:100%; width:35%; background:var(--c-ink); animation:q-slide 1.4s infinite linear; }

        #q-step-result { display:none; flex-direction:column; gap:0; }
        .q-card-ia.is-result #q-header-provador { display:none !important; }
        #q-result-img-col { width:100%; max-height:72vh; overflow:hidden; display:flex; align-items:center; justify-content:center; background:var(--c-surface); }
        #q-result-img-col img { width:100%; height:100%; object-fit:cover; object-position:top center; display:block; }
        #q-result-actions-col { display:flex; flex-direction:column; gap:10px; padding:20px 28px 0; }
        .q-res-title { display:block; font-family:var(--font-display); font-size:18px; letter-spacing:3px; text-transform:uppercase; color:var(--c-ink); padding:20px 28px 16px; border-bottom:1px solid var(--c-line); text-align:center; }
        .q-res-subtitle,.q-res-note { display:none; }
        .q-res-mobile-only { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; height:52px; background:var(--c-ink); color:#fff; border:none; font-family:var(--font-display); font-size:17px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; margin:0; text-decoration:none; box-sizing:border-box; }
        @media(min-width:768px){
            .q-card-ia.is-result{width:780px !important;max-width:90vw !important;max-height:92vh !important;}
            .q-card-ia.is-result .q-content-scroll{padding:0 !important;overflow-y:auto !important;display:flex !important;flex-direction:column !important;}
            .q-card-ia.is-result #q-step-result{display:flex !important;flex-direction:row !important;flex-wrap:wrap !important;width:100%;align-items:stretch;gap:0;}
            .q-card-ia.is-result .q-res-title{flex-basis:100%;order:-1;font-size:16px;padding:16px 24px;border-bottom:1px solid var(--c-line);}
            .q-card-ia.is-result #q-result-img-col{width:44% !important;min-height:360px !important;border-right:1px solid var(--c-line);flex-shrink:0;}
            .q-card-ia.is-result #q-result-img-col img{width:100% !important;height:100% !important;object-fit:cover !important;object-position:top center !important;}
            .q-card-ia.is-result #q-result-actions-col{width:56% !important;padding:28px 24px !important;display:flex !important;flex-direction:column !important;justify-content:flex-start;gap:10px;overflow-y:auto;}
            .q-card-ia.is-result .q-res-mobile-only{display:flex !important;}
        }

        #q-step-error{display:none;flex-direction:column;gap:24px;align-items:center;text-align:center;padding:52px 28px;}
        #q-step-error h2{font-family:var(--font-display);font-size:22px;letter-spacing:3px;text-transform:uppercase;margin:0;font-weight:400;}
        #q-step-error p{font-size:13px;color:var(--c-muted);margin:0;line-height:1.6;}


        #q-related-products { padding: 0 28px 28px; }
        #q-related-products h4 { font-family:var(--font-display); font-size:13px; letter-spacing:3px; text-transform:uppercase; color:var(--c-muted); margin:20px 0 12px; font-weight:400; }
        .q-related-grid { display:flex; gap:10px; overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; }
        .q-related-grid::-webkit-scrollbar { display:none; }
        .q-related-card { flex:0 0 calc(33.333% - 7px); min-width:88px; text-decoration:none; color:var(--c-ink); display:flex; flex-direction:column; gap:6px; }
        .q-related-card img { width:100%; aspect-ratio:1/1; object-fit:cover; border:1px solid var(--c-line); display:block; border-radius:3px; }
        .q-related-card-name { font-size:10px; font-weight:500; line-height:1.4; color:var(--c-ink); overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

        .q-powered-footer{background:var(--c-surface);padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:9px;flex-shrink:0;border-top:1px solid var(--c-line);text-decoration:none;}
        .q-powered-footer span{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--c-muted);}
        .q-quantic-logo{height:20px;opacity:0.7;}
    `
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
                            style="height:42px;width:auto;filter:brightness(0);"
                        />
                    </div>
                    <div id="q-step-upload">
                        <div class="q-form-row">
                            <label>Seu Celular</label>
                            <input type="tel" id="q-phone" class="q-input" placeholder="(11) 99999-9999" maxlength="15">
                            <div id="q-phone-error" class="q-status-msg">Insira um número válido</div>
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
                        <div class="q-pix-qr"><img id="q-pix-qr-img" alt="QR Code PIX"></div>
                        <div class="q-pix-copiacola">
                            <input type="text" id="q-pix-code" readonly placeholder="Código PIX...">
                            <button id="q-pix-copy-btn">Copiar</button>
                        </div>
                        <div id="q-pix-status-msg" class="q-pix-status q-pix-waiting">Aguardando pagamento...</div>
                        <p class="q-pix-cancel" id="q-pix-cancel">Cancelar</p>
                    </div>

                    <div id="q-loading-box">
                        <div class="q-loading-texts"><div class="q-loading-t1">Gerando Prova Virtual...</div><a href="https://provoulevou.com.br" target="_blank" class="q-loading-t2"><span>Powered by</span><img src="https://i.ibb.co/MD3B4FQf/Logo-provou-preto-1.png" alt="Provou Levou"></a></div>
                        <div class="q-loading-bar"><div></div></div>
                    </div>

                    <div id="q-step-result">
                        <div id="q-result-img-col">
                            <img id="q-final-view-img">
                        </div>
                        <div id="q-result-actions-col">
                            <span class="q-res-title">Veja como ficou em voc&ecirc; &#x2728;</span>
                            <div class="q-res-note"></div>
                            <button class="q-btn-outline" id="q-btn-back">Voltar ao Produto</button>
                            <p class="q-res-mobile-only" id="q-retry-btn">Tentar outra foto</p>
                        </div>
                    <div id="q-related-products" style="display:none;">
                        <h4>Veja tamb&eacute;m</h4>
                        <div class="q-related-grid" id="q-related-grid"></div>
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
                    <img src="https://i.ibb.co/MD3B4FQf/Logo-provou-preto-1.png" class="q-quantic-logo">
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
            return uniqueImgs.slice(0, 2);
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


        function loadRelatedProducts() {
            var grid = document.getElementById('q-related-grid');
            var section = document.getElementById('q-related-products');
            if (!grid || !section) return;
            var items = document.querySelectorAll('.js-swiper-related .js-item-product');
            if (!items.length) items = document.querySelectorAll('.js-item-product');
            var products = [];
            items.forEach(function(item) {
                if (products.length >= 3) return;
                var container = item.querySelector('[data-variants]');
                if (!container) return;
                try {
                    var variants = JSON.parse(container.getAttribute('data-variants'));
                    if (!variants || !variants.length) return;
                    var v = variants[0];
                    var imgRaw = v.image_url || '';
                    var img = imgRaw ? 'https:' + imgRaw.replace(/\\/g, '').replace('-1024-1024.webp', '-480-0.webp') : '';
                    var imgEl = item.querySelector('img[alt]');
                    var name = imgEl ? imgEl.getAttribute('alt').trim() : '';
                    var linkEl = item.querySelector('a[href*="/produtos/"]');
                    var link = linkEl ? linkEl.getAttribute('href') : '';
                    if (img && name) products.push({ name: name, img: img, link: link });
                } catch(e) {}
            });
            if (!products.length) return;
            while (grid.firstChild) grid.removeChild(grid.firstChild);
            products.forEach(function(p) {
                var a = document.createElement('a');
                a.className = 'q-related-card'; a.href = p.link || '#'; a.target = '_blank';
                var img = document.createElement('img'); img.src = p.img; img.alt = p.name; img.loading = 'lazy';
                var nameEl = document.createElement('span'); nameEl.className = 'q-related-card-name'; nameEl.textContent = p.name;
                a.appendChild(img); a.appendChild(nameEl); grid.appendChild(a);
            });
            section.style.display = 'block';
        }

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


        function checkFields() {
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = nums.length >= 10 && nums.length <= 11;
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

                if (prodImg) {
                    try {
                        const b = await fetch(prodImg).then(r => r.blob());
                        fd.append('product_image', b, 'product.jpg');
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
                    loadRelatedProducts();
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
