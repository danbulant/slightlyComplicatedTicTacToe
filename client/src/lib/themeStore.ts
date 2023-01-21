import { writable } from 'svelte/store';

let theme = "light";
if(typeof window !== 'undefined') {
    theme = localStorage.getItem('theme')!;
    if(!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = "dark"
    } else if(!theme) {
        theme = "light"
    }
}

export const themeStore = writable(theme);

let firstRun = true;
themeStore.subscribe(value => {
    if(firstRun) {
        firstRun = false;
        return;
    }
    localStorage.setItem('theme', value);
});