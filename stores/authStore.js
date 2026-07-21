import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setAuth: ({user}) => set({ user }),
      clearAuth:()=>set({user:null}),
      setUser: (user)=>set({user}),
      setTokens:(value)=>set((state)=>{
        if(!state.user) return state
        return {user:{...state.user, monthlyAiCredits:value}}
    }),
      
      logout: () =>{ 
          set({user: null});
          localStorage.removeItem("user")
      },
}),
    {
      name: "user"   
     },
  ),
)