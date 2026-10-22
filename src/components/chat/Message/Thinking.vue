<template>
  <div style="display:flex;align-items:center;justify-content:flex-start;padding:8px 4px;height:24px;">
    <div style="display:flex;gap:6px;align-items:center;">
      <div class="dot" />
      <div class="dot" style="animation-delay:200ms" />
      <div class="dot" style="animation-delay:400ms" />
    </div>
  </div>
</template>

<style scoped>
.dot {
  width: 6px; height: 6px; background: #d1d5db; border-radius: 50%;
  animation: dot-flow 1.4s ease-in-out infinite;
}
@keyframes dot-flow {
  0%, 100% { transform: translateY(0); background-color: #d1d5db; }
  50% { transform: translateY(-4px); background-color: #009dab; }
}
</style>
