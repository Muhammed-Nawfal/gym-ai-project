// components/AppModal.tsx
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { BicepsFlexed, X } from "lucide-react";
import React from "react";

type DialogBoxModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
  icon?: React.ReactNode;
  headerActions? : React.ReactNode;
};

export default function DialogBoxModal({
    open,
    onClose,
    title,
    children,
    maxWidthClass = "max-w-xl",
    icon,
    headerActions,
}: DialogBoxModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className={`card w-full ${maxWidthClass} max-h-[90vh] flex flex-col`}>
            {title && (
                <DialogTitle
                    as="div"
                    className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0"
                >
                  <div className="flex items-center gap-3 text-2xl font-semibold text-brand-gold">
                    {icon && <span className="shrink-0">{icon}</span>}
                    <span>{title}</span>
                  </div>

                    {headerActions && (
                      <div className="flex items-center gap-2">
                        {headerActions}
                      </div>
                    )}
                </DialogTitle>
            )}
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              {children}
            </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
