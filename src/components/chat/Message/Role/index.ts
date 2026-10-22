import { defineAsyncComponent } from 'vue'
import { Role } from '@/types/chat'

export const RoleComponents = {
  [Role.Assistant]: defineAsyncComponent(() => import('./Assistant.vue')),
  [Role.System]: defineAsyncComponent(() => import('./System.vue')),
  [Role.User]: defineAsyncComponent(() => import('./User.vue')),
}
