import { create } from "zustand";

export const store = create((set) => ({
  user: null,
  islogin: false,

  globalLogin: (userdata) => {
    set({
      user: userdata,
      islogin: true,
    });
  },

  globalLogout: () => {
    set({
      user: null,
      islogin: false,
    });
  },
}));