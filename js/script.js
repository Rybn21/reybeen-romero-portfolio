const texts = [
	"Wawata Leader",
	"Software Engineer",
	"Virtual Assistant",
	"Tech Support",
];

let count = 0;
let index = 0;

let currentText = "";
let letter = "";

function typeWriter() {
	if (!document.getElementById("typing")) return;

	if (count === texts.length) {
		count = 0;
	}

	currentText = texts[count];

	letter = currentText.slice(0, ++index);

	document.getElementById("typing").textContent = letter;

	if (letter.length === currentText.length) {
		count++;
		index = 0;
		setTimeout(typeWriter, 1500);
	} else {
		setTimeout(typeWriter, 100);
	}
}

window.initTyping = function () {
	// reset counters and start if element exists
	count = 0;
	index = 0;
	typeWriter();
};

// start on initial load
window.addEventListener('DOMContentLoaded', () => {
	window.initTyping();
});

// SPA-like navigation: intercept internal nav links and load pages via fetch
window.initNavigation = function () {
	const prefetchCache = new Map();
	function isInternalLink(a) {
		try {
			const url = new URL(a.href, location.href);
			return url.origin === location.origin && url.pathname.endsWith('.html');
		} catch (e) {
			return false;
		}
	}

	async function loadPage(href, push = true, options = {}) {
		try {
			const url = new URL(href, location.href).toString();
			// normalize path+search for comparisons
			const normalize = (u) => {
				try { const n = new URL(u, location.href); return n.pathname + n.search; } catch(e){ return u; }
			};

			// try cached prefetched content first
			let text;
			if (prefetchCache.has(url)) {
				text = prefetchCache.get(url);
			} else {
				const res = await fetch(url, {cache: 'no-store'});
				if (!res.ok) return;
				text = await res.text();
			}
			const parser = new DOMParser();
			const doc = parser.parseFromString(text, 'text/html');

			// replace first <section> of the current document with the new one
			const newSection = doc.querySelector('section');
			const curSection = document.querySelector('section');
			if (newSection && curSection) {
				// animate current section out
				curSection.classList.add('is-exiting');
				await new Promise((resolve) => {
					const timeout = setTimeout(resolve, 600);
					curSection.addEventListener('transitionend', () => {
						clearTimeout(timeout);
						resolve();
					}, { once: true });
				});

				// perform replacement
				curSection.replaceWith(newSection);

				// prepare new section for enter animation
				newSection.classList.add('is-entering');
				// force reflow then remove class to trigger transition
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				newSection.getBoundingClientRect();
				requestAnimationFrame(() => newSection.classList.remove('is-entering'));

				// re-run any init functions present on the page
				if (typeof window.initTyping === 'function') {
					if (options && options.delayTyping) {
						setTimeout(window.initTyping, 5000);
					} else {
						window.initTyping();
					}
				}
			}

			// update title
			const newTitle = doc.querySelector('title');
			if (newTitle) document.title = newTitle.textContent;

			// update active nav links (compare pathname+search)
			document.querySelectorAll('nav a').forEach(a => {
				try{
					const aNorm = normalize(a.href);
					const uNorm = normalize(url);
					a.classList.toggle('active', aNorm === uNorm);
				}catch(e){ }
			});

			// push history
			if (push) history.pushState({url}, '', url);
			window.scrollTo({top:0, left:0});
		} catch (err) {
			console.error('Navigation error', err);
		}
	}

	document.addEventListener('click', (e) => {
		const a = e.target.closest && e.target.closest('a');
		if (!a) return;
		if (!isInternalLink(a)) return;
		// ignore if link has target or download
		if (a.target && a.target !== '' || a.hasAttribute('download')) return;
		e.preventDefault();
		const delayTyping = a.classList && a.classList.contains('start-btn');
		loadPage(a.getAttribute('href'), true, { delayTyping });
	});

	// prefetch on hover/focus to make transitions snappier
	document.addEventListener('mouseover', (e) => {
		const a = e.target.closest && e.target.closest('a');
		if (!a || !isInternalLink(a)) return;
		const href = new URL(a.getAttribute('href'), location.href).toString();
		if (prefetchCache.has(href)) return;
		fetch(href, {cache: 'no-store'}).then(r => r.ok ? r.text() : null).then(t => { if(t) prefetchCache.set(href, t); }).catch(()=>{});
	});

	document.addEventListener('focusin', (e) => {
		const a = e.target.closest && e.target.closest('a');
		if (!a || !isInternalLink(a)) return;
		const href = new URL(a.getAttribute('href'), location.href).toString();
		if (prefetchCache.has(href)) return;
		fetch(href, {cache: 'no-store'}).then(r => r.ok ? r.text() : null).then(t => { if(t) prefetchCache.set(href, t); }).catch(()=>{});
	});

	// handle back/forward
	window.addEventListener('popstate', (e) => {
		const url = (e.state && e.state.url) || location.href;
		loadPage(url, false, {});
	});
};

window.addEventListener('DOMContentLoaded', () => {
	window.initNavigation();
});



//FOR GALLERY MODAL
const galleries = {

gallery1: [
"../assets/project1/cover.png",
"../assets/project1/1.png",
"../assets/project1/2.png",
"../assets/project1/3.png", 
],

gallery2: [
"../assets/project2/cover.png",
"../assets/project2/1.png",
"../assets/project2/2.png",
"../assets/project2/3.png",
"../assets/project2/4.png",


]

};

let currentGallery = null;
let currentIndex = 0;

function openGallery(galleryId){

	currentGallery = galleryId;

	currentIndex = 0;

	const modal = document.getElementById('gallery-modal');
	const message = document.getElementById('gallery-modal-message');
	const image = document.getElementById('gallery-modal-image');
	const counter = document.getElementById('gallery-modal-counter');
	const controls = document.getElementById('gallery-modal-controls');

	if (!modal || !message || !image || !counter || !controls) return;

	const items = galleries[galleryId] || [];

	modal.style.display = 'flex';
	document.body.classList.add('gallery-open');

	if (!items.length) {
		message.textContent = 'Images for this project are not available yet.';
		message.style.display = 'block';
		image.style.display = 'none';
		controls.style.display = 'none';
		counter.textContent = '';
		return;
	}

	message.style.display = 'none';
	image.style.display = 'block';
	controls.style.display = 'flex';

	updateGallery();

}

function closeGallery(){

	const modal = document.getElementById('gallery-modal');
	if (modal) modal.style.display = 'none';
	document.body.classList.remove('gallery-open');

}

function nextImage(){

	if (!galleries[currentGallery] || !galleries[currentGallery].length) return;

    if(
        currentIndex <
        galleries[currentGallery].length - 1
    ){

        currentIndex++;

    }else{

        currentIndex = 0;

    }

    updateGallery();

}

function prevImage(){

	if (!galleries[currentGallery] || !galleries[currentGallery].length) return;

    if(currentIndex > 0){

        currentIndex--;

    }else{

        currentIndex =
        galleries[currentGallery].length - 1;

    }

    updateGallery();

}

function updateGallery(){

	const items = galleries[currentGallery] || [];

	if (!items.length) return;

    const image = document.getElementById(
		'gallery-modal-image'
    );

    const counter = document.getElementById(
		'gallery-modal-counter'
    );

    image.src =
	items[currentIndex];

    counter.innerHTML =
    (currentIndex + 1)
    +
    " / "
    +
    galleries[currentGallery].length;

}

function isMobileZoomViewport(){

	return window.matchMedia('(max-width: 768px)').matches;

}

function openProjectImageZoom(imageSrc, imageAlt){

	const modal = document.getElementById('project-image-zoom-modal');
	const target = document.getElementById('project-image-zoom-target');

	if (!modal || !target) return;

	target.src = imageSrc;
	target.alt = imageAlt || 'Expanded project preview image';
	modal.style.display = 'flex';
	document.body.classList.add('image-zoom-open');

}

function closeProjectImageZoom(){

	const modal = document.getElementById('project-image-zoom-modal');
	const target = document.getElementById('project-image-zoom-target');

	if (modal) modal.style.display = 'none';
	if (target) target.src = '';
	document.body.classList.remove('image-zoom-open');

}

function initProjectImageZoom(){

	const previewImages = document.querySelectorAll('.project-preview img');

	if (!previewImages.length) return;

	previewImages.forEach((img) => {

		img.addEventListener('click', (event) => {

			if (!isMobileZoomViewport()) return;

			event.preventDefault();
			event.stopPropagation();

			openProjectImageZoom(img.currentSrc || img.src, img.alt);

		});

	});

	document.addEventListener('keydown', (event) => {

		if (event.key === 'Escape') closeProjectImageZoom();

	});

}

window.addEventListener('DOMContentLoaded', () => {
	initProjectImageZoom();
});

//FOR BACKGROUND MUSIC
const musicBtn = document.getElementById("musicBtn");
const bgMusic = document.getElementById("bgMusic");

if (musicBtn && bgMusic) {
	musicBtn.addEventListener("click", () => {

    if(bgMusic.paused){

        bgMusic.volume = 0.3;
        bgMusic.play();

    }else{

        bgMusic.pause();

    }

	});
}