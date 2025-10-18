import React from "react";
import { cn } from "../../lib/utils";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open = false, onClose, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <div className="modal modal-open" onClick={onClose}>
        <div
          className={cn("modal-box", className)}
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("modal-header", className)} ref={ref} {...props} />
));
ModalHeader.displayName = "ModalHeader";

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("modal-body", className)} ref={ref} {...props} />
));
ModalBody.displayName = "ModalBody";

const ModalActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("modal-action", className)} ref={ref} {...props} />
));
ModalActions.displayName = "ModalActions";

export { Modal, ModalHeader, ModalBody, ModalActions };
