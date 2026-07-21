import { create } from "zustand";

export const useTaskStore = create((set) => ({
  tasks: [],
  selectedTask: null,

  setTasks: (tasks) => set({ tasks }),

  setSelectedTask: (task) => set({ selectedTask: task }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),

  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      ),
    })),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTask:
        state.selectedTask?.id === taskId ? null : state.selectedTask,
    })),

  clearTasks: () =>
    set({
      tasks: [],
      selectedTask: null,
    }),
}));