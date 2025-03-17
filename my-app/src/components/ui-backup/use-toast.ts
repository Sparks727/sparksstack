import { useToast as useToastHook } from "./toast";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  onClose?: () => void;
};

// This makes sure we can call toast() from anywhere in the app
export function toast(props: ToastProps) {
  // We can't use useToast() directly here since this is not a component
  // Instead, we schedule the toast to be shown on the next render cycle
  // by storing it in a global variable that the ToastProvider will check
  
  // Store the toast request in a global variable
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => {
      // This event will be picked up by the ToastProvider
      document.dispatchEvent(new CustomEvent('toast', { detail: props }));
    });
  }
  
  // Return dummy functions for compatibility
  return {
    id: "toast-" + Date.now(),
    dismiss: () => {},
    update: () => {},
  };
}

// Re-export the hook from the toast component
export const useToast = useToastHook; 