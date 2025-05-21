<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { usersMockData } from "@/mock/usersMock.js";
import { getUserById, updateUser } from "@/api/userServices";

// 获取路由和路由器实例
const route = useRoute();
const router = useRouter();

const userId = route.params.userId;

// 定义响应式对象，用于存储查找到的用户和表单数据
const user = ref(null);
const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  phone_no: "",
  role: "",
});

// 页面加载后查找对应的用户，并初始化表单数据
onMounted(async () => {
  user.value = await getUserById(userId);
  if (user.value) {
    // 将查找到的用户数据复制到表单中
    form.value = {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      email: user.value.email,
      phoneNo: user.value.phoneNo,
      role: user.value.role,
    };
  }
  console.log("DONE Fetching User Data");
});

const updateUserData = async () => {
  const userData = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    phoneNo: form.value.phoneNo,
    role: form.value.role,
  };

  const message = await updateUser(userId, userData);

  console.log(message)
  if (message == "Successful") {
    // If update successful, then move to that user's detail
    router.push(`/admin/users/${userId}`);
  } else {
    window.alert("Error");
  }
};

// 取消编辑，返回用户列表
const cancelEdit = () => {
  router.push("/admin/users");
};
</script>

<!-- <script>
import router from "@/router";
import { updateUser } from "@/api/users";

export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      phoneNo: "",
      email: "",
      role: "",
      userId: this.$route.params.userId,
    };
  },

  methods: {
    async updateUserData() {
      const userData = {
        firstName: this.firstName,
        lastName: this.lastName,
        phoneNo: this.phoneNo,
        email: this.email,
        role: this.role,
      };

      console.log(userData);

      const message = await updateUser(this.userId, userData);

      if (message == "Successful") {
        // If update successful, then move to that user's detail
        // router.push(`/admin/users/${this.userId}`);
      } else {
        window.alert("Error");
      }
    },
  },
};
</script> -->

<template>
  <AdminLayout>
    <div class="container py-4">
      <!-- 页面头部，包含返回按钮 -->
      <div class="d-flex align-items-center mb-4">
        <button
          @click="cancelEdit"
          class="btn btn-outline-secondary me-2"
          title="Back"
        >
          <i class="pi pi-arrow-left me-1"></i>
          Back
        </button>
        <h1 class="display-6 mb-0">Edit User</h1>
      </div>

      <!-- 用户编辑表单 -->
      <div v-if="user" class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="updateUserData">
            <!-- 姓名 -->
            <div class="mb-3 row">
              <div class="col-md-6">
                <label for="first_name" class="form-label">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  v-model="form.firstName"
                  class="form-control"
                />
              </div>
              <div class="col-md-6">
                <label for="last_name" class="form-label">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  v-model="form.lastName"
                  class="form-control"
                />
              </div>
            </div>
            <!-- 邮箱 -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                v-model="form.email"
                class="form-control"
              />
            </div>
            <!-- 电话 -->
            <div class="mb-3">
              <label for="phone_no" class="form-label">Phone</label>
              <input
                type="text"
                id="phone_no"
                v-model="form.phoneNo"
                class="form-control"
              />
            </div>
            <!-- 角色选择 -->
            <div class="mb-3">
              <label for="role" class="form-label">Role</label>
              <select id="role" v-model="form.role" class="form-select">
                <option value="ADMIN">ADMIN</option>
                <option value="ORGANIZER">ORGANIZER</option>
                <option value="PARTICIPANT">PARTICIPANT</option>
              </select>
            </div>
            <!-- 按钮区域 -->
            <div class="d-flex justify-content-end">
              <button
                type="button"
                @click="cancelEdit"
                class="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 如果没有找到用户则显示提示信息 -->
      <div v-else class="alert alert-danger" role="alert">User not found.</div>
    </div>
  </AdminLayout>
</template>

<style scoped>
@media (max-width: 576px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .row .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
