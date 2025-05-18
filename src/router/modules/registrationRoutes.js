const registrationRoutes = [
  {
    path: "/register/tickets", 
    name: "TicketSelection", 
    component: () => import("@/views/registration/TicketSelectionFormView.vue"),
  },
  {
    path: "/register/info", 
    name: "PersonalInfo", 
    component: () => import("@/views/registration/PersonalInfoFormView.vue"),
  },
  {
    path: "/register/questions", 
    name: "Questionnaire", 
    component: () => import("@/views/registration/QuestionnaireFormView.vue"),
  },
  {
    path: "/register/review",
    name: "ReviewRegistration", 
    component: () => import("@/views/registration/ReviewFormView.vue"),
  },
  {
    path: "/register/checkout", 
    name: "Checkout", 
    component: () => import("@/views/registration/CheckoutView.vue"),
  },
  {
    path: "/registration/success",
    name: "RegistrationSuccess",
    component: () => import("@/views/registration/RegistrationSuccessView.vue"), 
  },
  {
    path: "/registration/pending-payment",
    name: "RegistrationPendingPayment",
    component: () => import("@/views/registration/RegistrationPendingPaymentView.vue"), 
  },
];

export default registrationRoutes;
