const canvas = document.getElementById('spaceCanvas');
        const ctx = canvas.getContext('2d');

        let width, height;
        let stars = [];
        let shootingStars = [];
        let asteroids = [];
        let galaxyAngle = 0;

        // Interaksi kursor / sentuhan (Parallax ringan)
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX - width / 2) * 0.03;
            targetMouseY = (e.clientY - height / 2) * 0.03;
        });

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        // 1. INISIALISASI BINTANG BERLAPIS (PARALLAX DEPTH)
        const starColors = ['#ffffff', '#fde047', '#93c5fd', '#c4b5fd', '#bae6fd'];
        const numStars = 220;

        for (let i = 0; i < numStars; i++) {
            const layer = Math.random(); // 0 = jauh (lambat), 1 = dekat (lebih cepat)
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: layer * 1.8 + 0.4,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                alpha: Math.random(),
                speedY: layer * 0.25 + 0.04,
                speedX: (Math.random() - 0.5) * 0.08,
                twinkleSpeed: Math.random() * 0.025 + 0.005,
                depth: layer * 1.5 + 0.2,
                hasCrossFlare: layer > 0.88 // Bintang terang punya kilau silang 4 arah
            });
        }

        // 2. INISIALISASI PARTIKEL DEBU KOSMIK / ASTEROID KECIL
        for (let i = 0; i < 18; i++) {
            asteroids.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2.5 + 1.2,
                speedX: (Math.random() - 0.5) * 0.45,
                speedY: (Math.random() - 0.5) * 0.45,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.03
            });
        }

        // 3. FUNGSI MENGGAMBAR GALAKSI SPIRAL BERPUTAR DI KEJAUHAN
        function drawSpiralGalaxy(cx, cy, radius, angle) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // Inti cahaya galaksi
            const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            coreGrad.addColorStop(0, 'rgba(253, 224, 71, 0.25)');
            coreGrad.addColorStop(0.3, 'rgba(147, 51, 234, 0.14)');
            coreGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.06)');
            coreGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            // Lengan spiral titik-titik bintang kecil
            const arms = 2;
            const dotsPerArm = 35;
            for (let a = 0; a < arms; a++) {
                const armOffset = (Math.PI * 2 / arms) * a;
                for (let d = 0; d < dotsPerArm; d++) {
                    const dist = (d / dotsPerArm) * radius * 0.85;
                    const spiralTheta = armOffset + (d * 0.18);
                    const dx = Math.cos(spiralTheta) * dist;
                    const dy = Math.sin(spiralTheta) * dist * 0.55;

                    ctx.fillStyle = d % 3 === 0 ? 'rgba(253, 224, 71, 0.35)' : 'rgba(191, 219, 254, 0.3)';
                    ctx.beginPath();
                    ctx.arc(dx, dy, 1.1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // 4. FUNGSI MENGGAMBAR PLANET BERCINCIN DI SUDUT LAYAR
        function drawRingedPlanet(px, py, radius) {
            ctx.save();
            ctx.translate(px, py);

            // Cahaya atmosfer planet
            const glow = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.9);
            glow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.9, 0, Math.PI * 2);
            ctx.fill();

            // Bola Planet
            const planetGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
            planetGrad.addColorStop(0, '#38bdf8');
            planetGrad.addColorStop(0.5, '#1d4ed8');
            planetGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = planetGrad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            // Cincin Planet Miring
            ctx.rotate(-0.42);
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.38)';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 2.1, radius * 0.48, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 2.4, radius * 0.56, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        // 5. FUNGSI MEMBUAT BINTANG JATUH (METEOR) BERKILAU
        function createShootingStar() {
            if (Math.random() < 0.035 && shootingStars.length < 3) {
                const isGold = Math.random() > 0.6;
                shootingStars.push({
                    x: Math.random() * width * 1.2,
                    y: Math.random() * height * 0.3,
                    length: Math.random() * 110 + 60,
                    speed: Math.random() * 9 + 6,
                    angle: Math.PI / 4 + (Math.random() * 0.15 - 0.075),
                    alpha: 1,
                    color: isGold ? '253, 224, 71' : '255, 255, 255'
                });
            }
        }

        // LOOP ANIMASI UTAMA
        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Haluskan gerakan parallax kursor
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Gambar Galaksi Spiral Berputar di Kiri Atas
            galaxyAngle += 0.0025;
            drawSpiralGalaxy(width * 0.16 - mouseX * 0.4, height * 0.2 - mouseY * 0.4, 110, galaxyAngle);

            // Gambar Planet Bercincin di Kanan Bawah
            const planetFloatY = Math.sin(Date.now() * 0.001) * 6;
            drawRingedPlanet(width * 0.85 - mouseX * 0.6, height * 0.82 + planetFloatY - mouseY * 0.6, 26);

            // Gambar dan Perbarui Bintang-Bintang
            stars.forEach(star => {
                star.alpha += star.twinkleSpeed;
                if (star.alpha > 1 || star.alpha < 0.15) {
                    star.twinkleSpeed = -star.twinkleSpeed;
                }

                star.y -= star.speedY;
                star.x += star.speedX;

                if (star.y < 0) {
                    star.y = height;
                    star.x = Math.random() * width;
                }
                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;

                const drawX = star.x - mouseX * star.depth;
                const drawY = star.y - mouseY * star.depth;
                const currentAlpha = Math.max(0, Math.min(1, star.alpha));

                ctx.save();
                ctx.globalAlpha = currentAlpha;
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
                ctx.fill();

                // Efek kilau silang 4 sudut untuk bintang paling terang
                if (star.hasCrossFlare) {
                    ctx.strokeStyle = star.color;
                    ctx.lineWidth = 0.7;
                    const flareLen = star.radius * 4.5;
                    ctx.beginPath();
                    ctx.moveTo(drawX - flareLen, drawY);
                    ctx.lineTo(drawX + flareLen, drawY);
                    ctx.moveTo(drawX, drawY - flareLen);
                    ctx.lineTo(drawX, drawY + flareLen);
                    ctx.stroke();
                }
                ctx.restore();
            });

            // Gambar Partikel Debu Kosmik / Asteroid Kecil
            asteroids.forEach(ast => {
                ast.x += ast.speedX;
                ast.y += ast.speedY;
                ast.rotation += ast.rotSpeed;

                if (ast.x < 0) ast.x = width;
                if (ast.x > width) ast.x = 0;
                if (ast.y < 0) ast.y = height;
                if (ast.y > height) ast.y = 0;

                ctx.save();
                ctx.translate(ast.x - mouseX, ast.y - mouseY);
                ctx.rotate(ast.rotation);
                ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.fillRect(-ast.size / 2, -ast.size / 2, ast.size, ast.size * 0.7);
                ctx.restore();
            });

            // Gambar dan Perbarui Bintang Jatuh (Meteor)
            createShootingStar();
            shootingStars.forEach((s, index) => {
                const tailX = s.x - Math.cos(s.angle) * s.length;
                const tailY = s.y - Math.sin(s.angle) * s.length;

                const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
                grad.addColorStop(0, `rgba(${s.color}, ${s.alpha})`);
                grad.addColorStop(1, `rgba(${s.color}, 0)`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();

                // Titik kepala meteor bercahaya
                ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
                ctx.fill();

                s.x += Math.cos(s.angle) * s.speed;
                s.y += Math.sin(s.angle) * s.speed;
                s.alpha -= 0.015;

                if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
                    shootingStars.splice(index, 1);
                }
            });

            requestAnimationFrame(animate);
        }

        animate();