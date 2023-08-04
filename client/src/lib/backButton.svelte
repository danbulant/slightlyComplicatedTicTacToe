<script lang="ts">
  import { fly } from 'svelte/transition';
  import { DEFAULT_TRANSITION_DURATION } from './config';

  export let href: string | undefined = undefined;

  const duration = DEFAULT_TRANSITION_DURATION;
</script>

<a
  transition:fly={{ duration, delay: duration * 0.5, x: -60, opacity: 0 }}
  {href}
  on:click
  class="text-black dark:text-white arrow-back fixed top-0 left-0 w-4 h-4 m-4 p-2 transform transition-transform hover:-translate-x-1"
>
  <svg width="16" height="16">
    <line y1="50%" x1="0" y2="50%" x2="100%" stroke="currentColor" stroke-width="2" />
    <line y1="50%" x1="0" y2="100%" x2="50%" stroke="currentColor" stroke-width="2" />
    <line y1="50%" x1="0" y2="0" x2="50%" stroke="currentColor" stroke-width="2" />
  </svg>
</a>