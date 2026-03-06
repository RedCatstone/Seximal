import { browser } from '$app/environment';
import { getBaseName } from './otherMisc';

export const STORED_STATE = $state({
	base: browser ? JSON.parse(localStorage.getItem('seximal_base') || '6') : 6,
	quickMathsHighscores: browser ? JSON.parse(localStorage.getItem('seximal_quickMathsHighscores') || '{}') : {},
	get baseName() { return getBaseName(this.base); }
});

if (browser) $effect.root(() => {
	$effect(() => {
		localStorage.setItem('seximal_quickMathsHighscores', JSON.stringify(STORED_STATE.quickMathsHighscores));
		localStorage.setItem('seximal_base', JSON.stringify(STORED_STATE.base));
	});
});