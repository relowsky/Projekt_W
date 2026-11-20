import * as THREE from "three";
			import { OrbitControls } from "three/addons/controls/OrbitControls.js";
			import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

			// ===== 1. Elementy interfejsu =====
			const lengthInput = document.getElementById("boxLength");
			const widthInput = document.getElementById("boxWidth");
			const depthInput = document.getElementById("boxDepth");
			const materialSelect = document.getElementById("boxMaterial");
			const qtyInput = document.getElementById("boxQty");

			const uploadBtn = document.getElementById("btnUpload");
			const downloadBtn = document.getElementById("btnDownloadUV");
			const uvPreview = document.getElementById("uvPreview");

			const unitPriceEl = document.getElementById("unitPrice");
			const totalPriceEl = document.getElementById("totalPrice");

			const finishMatteBtn = document.getElementById("finishMatte");
			const finishGlossyBtn = document.getElementById("finishGlossy");
			const viewport = document.getElementById("viewport");

			const steps = [...document.querySelectorAll(".step")].filter((s) =>
			s.querySelector("b")
			);

			// ===== 2. Konfiguracja =====
			const materialRates = [48, 56, 40];
			const fixedSetupCost = 2.0;
			const glossyExtraCharge = 0.1;
			const usdToPln = 4.0; // kurs: 1 USD

			let currentFinish = "matte";
			let uploadedImageUrl = null;

			// ===== 3. Scena 3D =====
			const scene = new THREE.Scene();

			const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
			const defaultCameraPos = new THREE.Vector3(3.5, 2.5, 4.5);
			camera.position.copy(defaultCameraPos);

			const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			viewport.prepend(renderer.domElement);

			const pmremGenerator = new THREE.PMREMGenerator(renderer);
			scene.environment = pmremGenerator.fromScene(
			new RoomEnvironment(),
			0.04
			).texture;

			const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
			sunLight.position.set(3, 5, 4);
			scene.add(sunLight);
			scene.add(new THREE.AmbientLight(0xffffff, 0.4));

			const controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.minDistance = 2;
			controls.maxDistance = 15;
			controls.autoRotateSpeed = 2;

			const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
			const boxMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe6dccb });
			const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
			scene.add(boxMesh);

			const boxEdges = new THREE.LineSegments(
			new THREE.EdgesGeometry(boxGeometry),
			new THREE.LineBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.25,
			})
			);
			boxMesh.add(boxEdges);

			function onResize() {
			const w = viewport.clientWidth;
			const h = viewport.clientHeight;
			if (!w || !h) return;
			renderer.setSize(w, h);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			}
			new ResizeObserver(onResize).observe(viewport);
			onResize();

			// ===== 4. Układ siatki (wspólny dla 3D, miniatury i PNG) =====
			function getDims() {
			return {
			L: Math.max(1, parseFloat(lengthInput.value) || 1),
			W: Math.max(1, parseFloat(widthInput.value) || 1),
			H: Math.max(1, parseFloat(depthInput.value) || 1),
			};
			}

			// Prostokąty ścianek w mm: [x, y, szerokość, wysokość]
			function getNetLayout() {
			const { L, W, H } = getDims();
			return {
			L,
			W,
			H,
			TW: 2 * W + 2 * L,
			TH: 2 * W + H,
			rects: {
			top: [W, 0, L, W],
			left: [0, W, W, H],
			front: [W, W, L, H],
			right: [W + L, W, W, H],
			back: [2 * W + L, W, L, H],
			bottom: [W, W + H, L, W],
			},
			};
			}

			// Kolejność ścian w BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
			const faceOrder = ["right", "left", "top", "bottom", "front", "back"];

			function updateBoxUV() {
			const { TW, TH, rects } = getNetLayout();
			const uv = boxGeometry.attributes.uv;

			faceOrder.forEach((name, f) => {
			const [x, y, w, h] = rects[name];
			for (let k = 0; k < 4; k++) {
						const ou = k % 2; // 0 = lewo, 1 = prawo
						const top = k < 2; // pierwsze dwa wierzchołki = góra ścianki
						const u = (x + ou * w) / TW;
						const v = 1 - (y + (top ? 0 : h)) / TH;
						uv.setXY(f * 4 + k, u, v);
					}
				});
				uv.needsUpdate = true;
			}

			// ===== 5. Aktualizacja modelu 3D =====
			function updateBoxScale() {
				const { L, W, H } = getDims();
				const k = 3 / Math.max(L, W, H);
				boxMesh.scale.set(L * k, H * k, W * k);
				updateBoxUV();
			}

			function updateMaterialFinish() {
				if (currentFinish === "glossy") {
					boxMaterial.roughness = 0.12;
					boxMaterial.clearcoat = 1.0;
					boxMaterial.clearcoatRoughness = 0.05;
					boxMaterial.envMapIntensity = 1.2;
				} else {
					boxMaterial.roughness = 0.9;
					boxMaterial.clearcoat = 0.0;
					boxMaterial.envMapIntensity = 0.4;
				}
				boxMaterial.needsUpdate = true;
			}

			function applyTextureToBox() {
				if (!uploadedImageUrl) return;
				new THREE.TextureLoader().load(uploadedImageUrl, (texture) => {
					texture.colorSpace = THREE.SRGBColorSpace;
					texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
					if (boxMaterial.map) boxMaterial.map.dispose();
					boxMaterial.map = texture;
					boxMaterial.color.set(0xffffff);
					boxMaterial.needsUpdate = true;
				});
			}

			// ===== 6. Pętla renderowania =====
			(function animate() {
				requestAnimationFrame(animate);
				controls.update();
				renderer.render(scene, camera);
			})();

			// ===== 7. Przyciski podglądu 3D =====
			function zoomByFactor(factor) {
				const offset = camera.position.clone().sub(controls.target);
				offset.multiplyScalar(factor);
				offset.setLength(
					THREE.MathUtils.clamp(
						offset.length(),
						controls.minDistance,
						controls.maxDistance
					)
				);
				camera.position.copy(controls.target).add(offset);
			}

			document.getElementById("btnPlus").onclick = () => zoomByFactor(0.8);
			document.getElementById("btnMinus").onclick = () => zoomByFactor(1.25);

			const rotateBtn = document.getElementById("btnRotate");
			rotateBtn.onclick = () => {
				controls.autoRotate = !controls.autoRotate;
				rotateBtn.classList.toggle("active", controls.autoRotate);
			};

			document.getElementById("btnReset").onclick = () => {
				camera.position.copy(defaultCameraPos);
				controls.target.set(0, 0, 0);
				controls.autoRotate = false;
				rotateBtn.classList.remove("active");
			};

			// ===== 8. Cena =====
			function calculatePrice() {
				const { L, W, H } = getDims();
				const qty = Math.max(1, parseInt(qtyInput.value) || 1);

				const areaM2 = (2 * (L * W + L * H + W * H)) / 1000000;
				let unit =
					areaM2 * materialRates[parseInt(materialSelect.value)] +
					fixedSetupCost;

				if (currentFinish === "glossy") unit *= 1 + glossyExtraCharge;

				let discount = 0;
				if (qty >= 1000) discount = 0.15;
				else if (qty >= 500) discount = 0.08;
				else if (qty >= 100) discount = 0.03;
				unit *= 1 - discount;
				const unitPln = unit * usdToPln;
				const fmt = (n) =>
	                n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

				unitPriceEl.textContent = fmt(unitPln) + " zł / szt.";
				totalPriceEl.textContent = fmt(unitPln * qty) + " zł";
			}

			// ===== 9. Miniatura UV w panelu =====
			function updateUVPreviewLayout() {
				const { L, W, H, TW, TH } = getNetLayout();
				uvPreview.style.gridTemplateColumns = `${W}fr ${L}fr ${W}fr ${L}fr`;
				uvPreview.style.gridTemplateRows = `${W}fr ${H}fr ${W}fr`;
				uvPreview.style.height = "auto";
				uvPreview.style.aspectRatio = `${TW} / ${TH}`;
			}

			function applyUploadedImageToUVPreview() {
				if (!uploadedImageUrl) return;

				const { TW, TH, rects } = getNetLayout();
				const map = {
					".face-top": rects.top,
					".face-ls": rects.left,
					".face-front": rects.front,
					".face-rs": rects.right,
					".face-back": rects.back,
					".face-bottom": rects.bottom,
				};

				for (const [selector, [x, y, w, h]] of Object.entries(map)) {
					const face = uvPreview.querySelector(selector);
					face.style.backgroundImage = `url(${uploadedImageUrl})`;
					face.style.backgroundRepeat = "no-repeat";
					face.style.backgroundSize = `${(TW / w) * 100}% ${(TH / h) * 100}%`;
					face.style.backgroundPosition = `${(x / (TW - w)) * 100}% ${
						(y / (TH - h)) * 100
					}%`;
					face.style.color = "transparent";
					face.style.borderColor = "transparent";
				}
			}

			// ===== 10. Wgrywanie grafiki =====
			const hiddenFileInput = document.createElement("input");
			hiddenFileInput.type = "file";
			hiddenFileInput.accept = "image/*";
			hiddenFileInput.style.display = "none";
			document.body.appendChild(hiddenFileInput);

			uploadBtn.addEventListener("click", () => hiddenFileInput.click());

			hiddenFileInput.addEventListener("change", (event) => {
				const file = event.target.files[0];
				if (!file) return;

				if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
				uploadedImageUrl = URL.createObjectURL(file);

				applyUploadedImageToUVPreview();
				applyTextureToBox();
			});

			// ===== 11. Mat / połysk =====
			function setFinish(finish) {
				currentFinish = finish;
				finishMatteBtn.classList.toggle("active", finish === "matte");
				finishGlossyBtn.classList.toggle("active", finish === "glossy");
				updateMaterialFinish();
				calculatePrice();
			}
			finishMatteBtn.onclick = () => setFinish("matte");
			finishGlossyBtn.onclick = () => setFinish("glossy");

			// ===== 12. Kroki na dole =====
			steps.forEach((step) => {
				step.style.cursor = "pointer";
				step.addEventListener("click", () => {
					steps.forEach((s) => s.classList.remove("active"));
					step.classList.add("active");
				});
			});

			// ===== 13. Reakcja na zmiany pól =====
			[lengthInput, widthInput, depthInput, materialSelect, qtyInput].forEach(
				(input) => {
					input.addEventListener("input", () => {
						calculatePrice();
						updateUVPreviewLayout();
						updateBoxScale();
						applyUploadedImageToUVPreview();
					});
				}
			);

			// ===== 14. Pobieranie szablonu UV (PNG) =====
			function downloadUV() {
				const { L, W, H, TW, TH, rects } = getNetLayout();

				const scale = 10; // 1 mm = 10 px
				const canvas = document.createElement("canvas");
				canvas.width = TW * scale;
				canvas.height = TH * scale;
				const ctx = canvas.getContext("2d");

				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.strokeStyle = "#e11d48";
				ctx.lineWidth = 3;
				ctx.setLineDash([25, 15]);

				const labels = {
					top: "GÓRA",
					left: "BOK L",
					front: "PRZÓD",
					right: "BOK P",
					back: "TYŁ",
					bottom: "SPÓD",
				};

				ctx.fillStyle = "#9ca3af";
				ctx.font = `${Math.min(W, H) * scale * 0.2}px sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				for (const [name, [x, y, w, h]] of Object.entries(rects)) {
					ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);
					ctx.fillText(
						labels[name],
						(x + w / 2) * scale,
						(y + h / 2) * scale
					);
				}

				const link = document.createElement("a");
				link.download = `szablon-uv-${L}x${W}x${H}mm.png`;
				link.href = canvas.toDataURL("image/png");
				link.click();
			}
			downloadBtn.addEventListener("click", downloadUV);

			// ===== 15. Start =====
			calculatePrice();
			updateUVPreviewLayout();
			updateBoxScale();
			updateMaterialFinish();
