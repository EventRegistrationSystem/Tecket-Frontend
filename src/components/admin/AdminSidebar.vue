<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore"; // Import userStore

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["toggle-sidebar"]);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const menuItems = computed(() => {
  const role = userStore.currentUser?.role;
  if (role === 'ADMIN') {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "pi pi-home",
        route: "/admin"
      },
      {
        id: "events",
        label: "Events",
        icon: "pi pi-calendar",
        route: "/admin/events",
      },
      {
        id: "users",
        label: "Users",
        icon: "pi pi-users",
        route: "/admin/users"
      },
      {
        id: "system-registrations",
        label: "Registrations",
        icon: "pi pi-list",
        route: "/admin/registrations"
      }
    ];
  } else if (role === 'ORGANIZER') {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "pi pi-home",
        route: "/admin"
      },
      {
        id: "my-events",
        label: "My Events",
        icon: "pi pi-calendar",
        route: "/admin/events"
      }
    ];
  }
  return []; 
});

const activeItem = computed(() => {
  const currentPath = route.path;
  const role = userStore.currentUser?.role;

  if (role === 'ORGANIZER') {
    
    if (currentPath.startsWith("/admin/events")) {
      return "my-events";
    }
    else if (currentPath === "/admin") {
      return "dashboard";
    }
  } else if (role === 'ADMIN') {
    if (currentPath.startsWith("/admin/events")) {
      return "events";
    } else if (currentPath.startsWith("/admin/users")) {
      return "users";
    } else if (currentPath.startsWith("/admin/registrations")) {
      return "system-registrations";
    } else if (currentPath === "/admin") { // Explicitly for /admin dashboard
      return "dashboard";
    }
  }
  // Fallback or if no specific item matches (e.g. deep admin sub-pages not in main nav)
  // Try to match based on the available menu items for the current role
  const currentTopLevelPath = "/" + currentPath.split('/')[1]; // e.g. /admin
  const matchedItem = menuItems.value.find(item => item.route === currentPath || item.route === currentTopLevelPath);
  if (matchedItem) return matchedItem.id;
  
  return ""; // Default if no match
});

const sidebarStyle = computed(() => {
  return {
    width: props.collapsed ? "4rem" : "15rem",
  };
});

const navigateTo = (item) => {
  router.push(item.route);
};

const toggleSidebar = () => {
  emit("toggle-sidebar");
};
</script>

<template>
  <div
    class="bg-dark text-white position-fixed top-0 start-0 vh-100 d-flex flex-column"
    :class="[props.collapsed ? 'sidebar-collapsed' : 'sidebar-expanded']"
    :style="sidebarStyle"
    style="transition: width 0.3s; z-index: 10"
  >
    <!-- Logo -->
    <div class="d-flex align-items-center border-bottom border-secondary p-3">
      <img
        v-if="props.collapsed"
        src="../../assets/cat.jpeg"
        alt="RegiMaster"
        style="height: 2rem"
      />
      <div v-else class="fs-4 fw-bold">
        <a href="/" style="cursor: pointer; text-decoration: none;">RegiMaster</a>
      </div>
      <button
        v-if="props.collapsed"
        @click="toggleSidebar"
        class="text-white rounded-circle p-1 ms-auto"
        style="background: none; border: none"
      >
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>


    <nav class="mt-3 flex-grow-1">
      <ul class="list-unstyled">
        <li v-for="item in menuItems" :key="item.id" style="cursor: pointer">
          <a
            @click="navigateTo(item)"
            class="d-flex align-items-center py-2 px-3 text-white text-decoration-none user-menu-item"
            :class="{ 'bg-secondary': activeItem === item.id }"
          >
            <i :class="item.icon" class="fs-5"></i>
            <span v-if="!props.collapsed" class="ms-3">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
    
    
    <div v-if="!props.collapsed" class="position-absolute bottom-0 end-0 m-3">
      <button
        @click="toggleSidebar"
        class="btn btn-secondary rounded-circle p-2"
      >
        <i
          :class="[
            props.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left',
          ]"
        ></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sidebar-collapsed {
  width: 60px;
}

.sidebar-expanded {
  width: 240px;
}

.user-menu-item:hover {
  background-color: #343a40;
  transition: background-color 0.3s;
}
</style>
