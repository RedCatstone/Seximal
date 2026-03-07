import { browser } from '$app/environment';
import { getBaseName } from './otherMisc';

export const STATE = $state({
	base: getInitialBase(),
	quickMathsHighscores: browser ? JSON.parse(localStorage.getItem('seximal_quickMathsHighscores') || '{}') : {},
	get baseName() { return getBaseName(this.base); }
});

function getInitialBase() {
	if (browser) {
		const urlBase = parseInt(new URLSearchParams(window.location.search).get('base') ?? '');
		if (urlBase >= 2 && urlBase <= 36) return urlBase;
	}
	return 6;
}

if (browser) $effect.root(() => {
	$effect(() => {
		localStorage.setItem('seximal_quickMathsHighscores', JSON.stringify(STATE.quickMathsHighscores));
		// the base in the URLSearchParams is updated in src/routes/+layout.svelte
	});
});