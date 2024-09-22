<script>
	import '../app.css';

  async function on_click_logo() {
    console.log("nav to website")
  }

</script>

<div class=" w-full bg-slate-200">
  <div type="button" class="w-full flex bg-slate-600 min-h-[64px] items-center px-16 text-slate-200 space-x-2 hover:cursor-pointer" onclick={() => on_click_logo()}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-component"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/></svg>
    <p class="text-slate-200 font-semibold text-2xl">
      ProxiRun
    </p>

  </div>
	<slot />
</div>
