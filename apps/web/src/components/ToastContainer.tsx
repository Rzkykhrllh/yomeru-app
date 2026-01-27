"use client";

import { useToast } from "@/contexts/ToastContext";
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map((toast) => {
        const Icon = 
          toast.type === "success" ? CheckCircleIcon :
          toast.type === "error" ? ExclamationCircleIcon :
          InformationCircleIcon;

        const colorClasses =
          toast.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
          toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
          "bg-blue-50 text-blue-800 border-blue-200";

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-soft ${colorClasses} animate-slide-up`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => hideToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
