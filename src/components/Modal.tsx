import ReactDOM from 'react-dom';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded shadow-lg p-6 z-10">
        {title && <div className="text-h5 font-semibold mb-4">{title}</div>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-3">{footer}</div>
      </div>
    </div>,
    document.body
  );
}
