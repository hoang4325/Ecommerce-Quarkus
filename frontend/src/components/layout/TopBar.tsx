import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-primary text-white text-xs">
      <div className="container-shop relative flex h-9 items-center justify-center">
        <p className="text-center text-[11px] sm:text-xs">
          Sign up and get 20% off to your first order.{' '}
          <Link to="/register" className="font-semibold underline underline-offset-2">
            Sign Up Now
          </Link>
        </p>
        <button
          type="button"
          aria-label="Dismiss promotion"
          className="absolute right-4 hidden text-white/90 transition-colors hover:text-white sm:inline-flex"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
