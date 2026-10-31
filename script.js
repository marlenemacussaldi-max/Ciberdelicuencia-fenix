/* GAME STATE MANAGEMENT */
    const state = {
        studentFirstName: '',
        studentLastName: '',
        fullName: 'Detective',
        scores: { ch1: 0, ch2: 0, ch3: 0, ch4: 0 },
        ch1: { q1: false, q2: false, q3: false, gen: false },
        ch2: { c1_cat: null, c1_done: false, c1_awarded: 0, c2_cat: null, c2_done: false, c2_awarded: 0, c3_cat: null, c3_done: false, c3_awarded: 0 },
        ch3: { placed: {}, reflection: false },
        ch4: { main: false, extra: false },
        selectedItem: null,
        currentChallenge: 0,
        ch3Evaluated: false,
        timerInterval: null,
        timeRemaining: 40 * 60
    };

    /* FORM VALIDATION AND START MISSION */
    function handleStartMission(e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById('student-name').value.trim();
        const lastNameInput = document.getElementById('student-lastname').value.trim();
        const errorMsg = document.getElementById('id-error-msg');

        // Validation: Cannot be empty or contain only spaces
        if (!nameInput || !lastNameInput) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = '⚠️ Tenés que completar ambos campos (Nombre y Apellido) para comenzar la misión.';
            return;
        }

        errorMsg.style.display = 'none';
        state.studentFirstName = nameInput;
        state.studentLastName = lastNameInput;
        state.fullName = `${nameInput} ${lastNameInput}`;

        // Update HUD
        document.getElementById('agent-name').innerText = state.fullName;

        // Custom Welcome Banner for Challenge 1
        const welcomeBanner = document.getElementById('welcome-banner');
        welcomeBanner.textContent = `👋 ¡Bienvenido/a, ${state.fullName}! Tu misión comienza ahora. Demostrá tus habilidades y convertite en un verdadero detective digital.`;

        // Hide screen 0, show HUD & screen 1
        document.getElementById('screen-welcome').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');

        startMissionTimer();
        nextChallenge(1);
    }

    /* NAVIGATION & PROGRESS */
    function nextChallenge(chNum) {
        // No se puede avanzar hasta completar las actividades de la etapa actual.
        if (chNum === 2 && !(state.ch1.q1 && state.ch1.q2 && state.ch1.q3 && state.ch1.gen)) {
            alert('Completá correctamente las tres preguntas y el laboratorio de contraseñas antes de continuar.');
            return;
        }
        if (chNum === 3 && ![1, 2, 3].every(n => state.ch2[`c${n}_done`])) {
            alert('Completá los tres casos de detección de mensajes antes de continuar.');
            return;
        }
        if (chNum === 4 && !(state.ch3Evaluated && state.ch3.reflection)) {
            alert('Primero comprobá la clasificación y guardá tu reflexión.');
            return;
        }
        if (chNum === 'rules' && !(state.ch4.main && state.ch4.extra)) {
            alert('Respondé correctamente las dos situaciones del chat antes de continuar.');
            return;
        }

        document.querySelectorAll('.challenge-box').forEach(el => el.classList.add('hidden'));
        if (chNum === 'rules') {
            document.getElementById('screen-rules').classList.remove('hidden');
            updateProgress(90);
        } else {
            document.getElementById(`screen-ch${chNum}`).classList.remove('hidden');
            state.currentChallenge = chNum;
            updateProgress((chNum - 1) * 22 + 10);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function startMissionTimer() {
        clearInterval(state.timerInterval);
        state.timeRemaining = 40 * 60;
        updateTimerDisplay();
        state.timerInterval = setInterval(() => {
            if (state.timeRemaining > 0) {
                state.timeRemaining--;
                updateTimerDisplay();
            } else {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                const timer = document.getElementById('hud-timer');
                timer.textContent = '00:00';
                timer.setAttribute('aria-label', 'Tiempo finalizado');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        document.getElementById('hud-timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateScoreUI() {
        const total = state.scores.ch1 + state.scores.ch2 + state.scores.ch3 + state.scores.ch4;
        document.getElementById('hud-score').innerText = total;
    }

    function updateProgress(percent) {
        document.getElementById('hud-progress').style.width = percent + '%';
    }

    function confirmReset() {
        if (confirm("¿Estás seguro de que querés volver al inicio? Se perderá el progreso actual de la misión.")) {
            location.reload();
        }
    }

    /* CHALLENGE 1 LOGIC */
    function answerCh1(qNum, option, btn) {
        const parent = document.getElementById(`ch1-q${qNum}-opts`);
        parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'correct', 'wrong'));

        const fb = document.getElementById(`ch1-q${qNum}-fb`);
        fb.classList.remove('hidden', 'correct', 'wrong');

        let isCorrect = false;
        let explanation = '';

        if (qNum === 1) {
            isCorrect = (option === 'C');
            explanation = isCorrect 
                ? "¡Correcto! 'Rio!Nube47Tren' es larga, combina mayúsculas, minúsculas, números y símbolos, y no contiene datos personales."
                : "Incorrecto. '12345678' y 'martin2014' son muy fáciles de adivinar o deducir.";
        } else if (qNum === 2) {
            isCorrect = (option === 'B');
            explanation = isCorrect
                ? "¡Excelente! Las contraseñas son privadas. Nunca se comparten con amigos y deben ser distintas en cuentas importantes."
                : "Incorrecto. Compartir tu contraseña o usar fechas de nacimiento facilita que otros entren a tus cuentas.";
        } else if (qNum === 3) {
            isCorrect = (option === 'A');
            explanation = isCorrect
                ? "¡Muy bien! La verificación en dos pasos (2FA) agrega un código extra de seguridad para proteger tu cuenta."
                : "Incorrecto. Publicar claves o repetirlas debilita la seguridad de tus accesos.";
        }

        if (isCorrect) {
            btn.classList.add('correct');
            fb.classList.add('correct');
            fb.innerText = "✅ " + explanation;
            if (!state.ch1[`q${qNum}`]) {
                state.ch1[`q${qNum}`] = true;
                state.scores.ch1 = Math.min(25, state.scores.ch1 + 5);
                updateScoreUI();
            }
        } else {
            btn.classList.add('wrong');
            fb.classList.add('wrong');
            fb.innerText = "⚠️ " + explanation;
        }
    }

    function updatePass(awardPoints = true) {
        const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const charsLower = "abcdefghijkmnopqrstuvwxyz";
        const charsNum = "23456789";
        const charsSym = "!@#$%^&*";

        const u = document.getElementById('chk-upper').checked;
        const l = document.getElementById('chk-lower').checked;
        const n = document.getElementById('chk-num').checked;
        const s = document.getElementById('chk-sym').checked;
        const len = parseInt(document.getElementById('chk-len').value);

        let pool = "";
        if (u) pool += charsUpper;
        if (l) pool += charsLower;
        if (n) pool += charsNum;
        if (s) pool += charsSym;

        if (pool === "") {
            document.getElementById('generated-pass').innerText = "SELECCIONÁ OPCIONES";
            const evalFb = document.getElementById('pass-eval-fb');
            evalFb.className = 'feedback-box info';
            evalFb.innerText = 'Seleccioná al menos un tipo de carácter para generar una contraseña ficticia.';
            return;
        }

        let pass = "";
        for (let i = 0; i < len; i++) {
            pass += pool.charAt(Math.floor(Math.random() * pool.length));
        }

        document.getElementById('generated-pass').innerText = pass;

        const evalFb = document.getElementById('pass-eval-fb');
        if (u && l && n && s && len >= 10) {
            evalFb.className = "feedback-box correct";
            evalFb.innerText = awardPoints
                ? '🎯 ¡Excelente combinación! Cumple con todos los criterios de la práctica (+10 puntos).'
                : 'La combinación cumple los criterios. Presioná «Generar» para realizar la práctica y obtener los puntos.';
            if (awardPoints && !state.ch1.gen) {
                state.ch1.gen = true;
                state.scores.ch1 = Math.min(25, state.scores.ch1 + 10);
                updateScoreUI();
            }
        } else {
            evalFb.className = "feedback-box info";
            evalFb.innerText = "Sugerencia: Activa los 4 tipos de caracteres y fija una longitud de al menos 10 para máxima seguridad.";
        }
    }

    /* CHALLENGE 2 LOGIC */
    function selectPhish(caseNum, cat, btn) {
        const parent = btn.parentElement;
        parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.ch2[`c${caseNum}_cat`] = cat;
    }

    function checkPhishCase(caseNum) {
        const selected = state.ch2[`c${caseNum}_cat`];
        const textExp = document.getElementById(`ch2-exp-${caseNum}`).value.trim();
        const fb = document.getElementById(`ch2-fb-${caseNum}`);
        fb.classList.remove('hidden', 'correct', 'wrong');

        if (!selected) {
            alert("Por favor selecciona primero si el mensaje es Seguro, Sospechoso o Necesita Verificación.");
            return;
        }

        let isCatCorrect = false;
        let explanation = "";

        if (caseNum === 1) {
            isCatCorrect = (selected === 'sospechoso');
            explanation = "Es sospechoso porque promete un premio inesperado, apura a actuar rápido (5 min) y exige una contraseña.";
        } else if (caseNum === 2) {
            isCatCorrect = (selected === 'verificar');
            explanation = "Debe verificarse ingresando directamente a la plataforma oficial conocida, sin asumir autenticidad solo por la firma.";
        } else if (caseNum === 3) {
            isCatCorrect = (selected === 'sospechoso');
            explanation = "Es sospechoso porque un desconocido pide un código de verificación privado a cambio de beneficios virtuales.";
        }

        // El tercer caso otorga un punto adicional de explicación para completar 25.
        let bonusPts = 0;
        if (textExp.length >= 8) bonusPts = caseNum === 3 ? 4 : 3; 

        if (isCatCorrect) {
            fb.className = "feedback-box correct";
            fb.innerText = `✅ ¡Correcto! ${explanation} (+${5 + bonusPts} Pts)`;
            const awardedKey = `c${caseNum}_awarded`;
            const pointsToAward = 5 + bonusPts;
            // Si primero respondió sin explicación, puede agregarla después y ganar el extra.
            if (pointsToAward > state.ch2[awardedKey]) {
                state.scores.ch2 += pointsToAward - state.ch2[awardedKey];
                state.ch2[awardedKey] = pointsToAward;
                updateScoreUI();
            }
            state.ch2[`c${caseNum}_done`] = true;
        } else {
            fb.className = "feedback-box wrong";
            fb.innerText = `⚠️ Cuidado. ${explanation}`;
        }
    }

    /* CHALLENGE 3 LOGIC (DRAG/CLICK CLASSIFIER) */
    const itemData = {
        'item-1': { text: '🔑 Mi contraseña', type: 'protect' },
        'item-2': { text: '🏠 Mi dirección de casa', type: 'protect' },
        'item-3': { text: '🎮 Mi videojuego favorito', type: 'share' },
        'item-4': { text: '📲 Código de verificación en celular', type: 'protect' },
        'item-5': { text: '🏫 Foto con uniforme de mi escuela', type: 'protect' },
        'item-6': { text: '🎨 Un dibujo propio sin datos', type: 'share' }
    };

    function selectItem(id, name) {
        document.querySelectorAll('.drag-item').forEach(el => el.classList.remove('selected-item'));
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('selected-item');
            state.selectedItem = id;
        }
    }

    function placeSelectedItem(zoneType) {
        if (!state.selectedItem) return;
        const itemEl = document.getElementById(state.selectedItem);
        if (!itemEl) return;

        const targetZone = document.getElementById(zoneType === 'share' ? 'zone-share' : 'zone-protect');
        targetZone.appendChild(itemEl);
        itemEl.classList.remove('selected-item');

        state.ch3.placed[state.selectedItem] = zoneType;
        state.ch3Evaluated = false;
        state.selectedItem = null;
    }

    function evaluateCh3() {
        let correctCount = 0;
        const totalItems = Object.keys(itemData).length;

        for (let id in itemData) {
            const userZone = state.ch3.placed[id];
            if (userZone && userZone === itemData[id].type) {
                correctCount++;
            }
        }

        const points = Math.round((correctCount / totalItems) * 24);
        state.ch3Evaluated = true;
        state.scores.ch3 = Math.min(25, points + (state.ch3.reflection ? 1 : 0));
        updateScoreUI();

        const fb = document.getElementById('ch3-fb');
        fb.classList.remove('hidden');
        if (correctCount === totalItems) {
            fb.className = "feedback-box correct";
            fb.innerText = "🎯 ¡Perfecto! Clasificaste correctamente todos los elementos (24 Pts). Recordá que los datos de ubicación, credenciales y códigos nunca deben compartirse.";
        } else {
            fb.className = "feedback-box wrong";
            fb.innerText = `Has clasificado correctamente ${correctCount} de ${totalItems} elementos (${points} Pts). Revisa que las contraseñas, direcciones, fotos escolares y códigos estén en 'DEBO PROTEGERLO'.`;
        }
    }

    function checkCh3Reflection() {
        const txt = document.getElementById('ch3-reflection').value.trim();
        const fb = document.getElementById('ch3-ref-fb');
        fb.classList.remove('hidden');

        if (txt.length >= 5) {
            fb.className = "feedback-box correct";
            fb.innerText = "✅ Excelente respuesta. Proteger los datos evita que desconocidos se hagan pasar por vos o comprometan tu seguridad (+1 Pt).";
            if (!state.ch3.reflection) {
                state.ch3.reflection = true;
                state.scores.ch3 = Math.min(25, state.scores.ch3 + 1);
                updateScoreUI();
            }
        } else {
            fb.className = "feedback-box wrong";
            fb.innerText = "Escribe una respuesta breve expresando tu idea.";
        }
    }

    /* CHALLENGE 4 LOGIC */
    function answerCh4Main(option, btn) {
        const parent = document.getElementById('ch4-q1-opts');
        parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'correct', 'wrong'));
        const fb = document.getElementById('ch4-q1-fb');
        fb.classList.remove('hidden');

        if (option === 'B') {
            btn.classList.add('correct');
            fb.className = "feedback-box correct";
            fb.innerText = "✅ ¡Respuesta correcta! Pedir datos en secreto o fotos son señales claras de alarma. Interrumpir el contacto, bloquear, denunciar y buscar ayuda de un adulto es la conducta adecuada (+15 Pts).";
            if (!state.ch4.main) {
                state.ch4.main = true;
                state.scores.ch4 = Math.min(25, state.scores.ch4 + 15);
                updateScoreUI();
            }
        } else {
            btn.classList.add('wrong');
            fb.className = "feedback-box wrong";
            fb.innerText = "⚠️ Peligro. Nunca debes enviar fotos ni continuar conversaciones con personas que soliciten secretos o datos privados.";
        }
    }

    function answerCh4Extra(option, btn) {
        const parent = document.getElementById('ch4-q2-opts');
        parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'correct', 'wrong'));
        const fb = document.getElementById('ch4-q2-fb');
        fb.classList.remove('hidden');

        if (option === 'C') {
            btn.classList.add('correct');
            fb.className = "feedback-box correct";
            fb.innerText = "✅ ¡Excelente! Nunca te encuentres con desconocidos de Internet. Avisá de inmediato a un adulto de confianza (+10 Pts).";
            if (!state.ch4.extra) {
                state.ch4.extra = true;
                state.scores.ch4 = Math.min(25, state.scores.ch4 + 10);
                updateScoreUI();
            }
        } else {
            btn.classList.add('wrong');
            fb.className = "feedback-box wrong";
            fb.innerText = "⚠️ Riesgo elevado. Acudir a encuentros presenciales con gente que conociste en juegos/redes pone en riesgo tu integridad.";
        }
    }

    /* FINAL RULES CHECK */
    function checkRulesState() {
        const r1 = document.getElementById('rule-1').checked;
        const r2 = document.getElementById('rule-2').checked;
        const r3 = document.getElementById('rule-3').checked;
        const r4 = document.getElementById('rule-4').checked;

        const explanation = document.getElementById('rule-explanation').value.trim();
        document.getElementById('btn-finish-mission').disabled = !(r1 && r2 && r3 && r4 && explanation.length >= 10);
    }

    function finishMission() {
        const explanation = document.getElementById('rule-explanation').value.trim();
        const allRules = ['rule-1', 'rule-2', 'rule-3', 'rule-4'].every(id => document.getElementById(id).checked);
        if (!allRules || explanation.length < 10) {
            alert('Marcá las cuatro reglas y escribí una explicación de al menos 10 caracteres.');
            checkRulesState();
            return;
        }
        const total = state.scores.ch1 + state.scores.ch2 + state.scores.ch3 + state.scores.ch4;
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        
        document.getElementById('res-ch1').innerText = `${state.scores.ch1}/25`;
        document.getElementById('res-ch2').innerText = `${state.scores.ch2}/25`;
        document.getElementById('res-ch3').innerText = `${state.scores.ch3}/25`;
        document.getElementById('res-ch4').innerText = `${state.scores.ch4}/25`;
        document.getElementById('res-total').innerText = total;

        let rank = "";
        let msg = "";

        if (total >= 90) {
            rank = "🏆 Agente Experto en Ciberseguridad";
            msg = "¡Sobresaliente! Has demostrado un conocimiento maestro para navegar sin riesgos.";
        } else if (total >= 70) {
            rank = "🛡️ Detective Digital Avanzado";
            msg = "¡Muy buen trabajo! Superaste la meta recomendada con altos estándares de seguridad.";
        } else if (total >= 50) {
            rank = "🔍 Aprendiz de Ciberseguridad";
            msg = "¡Buen esfuerzo! Repasá las explicaciones para reforzar tus hábitos de protección.";
        } else {
            rank = "🕵️ Detective en Entrenamiento";
            msg = "Sigue practicando. La ciberseguridad se aprende analizando cada situación con cuidado.";
        }

        document.getElementById('res-rank').innerText = rank;
        document.getElementById('res-msg').innerText = msg;

        // Certificate Population
        document.getElementById('cert-agent-name').innerText = state.fullName;
        document.getElementById('cert-score').innerText = `${total}/100`;
        document.getElementById('cert-rank').innerText = rank;
        document.getElementById('cert-date').innerText = new Date().toLocaleDateString('es-ES');

        document.querySelectorAll('.challenge-box').forEach(el => el.classList.add('hidden'));
        document.getElementById('screen-results').classList.remove('hidden');
        updateProgress(100);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Inicializa el generador sin regalar puntos antes de que el alumno interactúe.
    updatePass(false);
    document.getElementById('rule-explanation').addEventListener('input', checkRulesState);
