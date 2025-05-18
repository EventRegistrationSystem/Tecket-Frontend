const authRoutes = [
  {
    path: "/signIn",
    name: "SignIn",
    component: () => import("@/views/auth/SignInView.vue")
  },
  {
    path: "/signUp",
    name: "SignUp",
    component: () => import("@/views/auth/SignUpView.vue")
  },
];

export default authRoutes;
