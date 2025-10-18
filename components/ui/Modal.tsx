import React from "react";
import { cn } from "../../lib/utils";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    // If open is explicitly set to false, don't render
    if (open === false) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking directly on the backdrop, not on child elements
      if (e.target === e.currentTarget && onClose) {
        onClose();
      }
    };

    return (
      <div className="modal modal-open" onClick={handleBackdropClick}>
        <div className={cn("modal-box", className)} ref={ref} {...props}>
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
