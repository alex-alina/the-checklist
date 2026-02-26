import { Link } from 'react-router';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ArrowLeft, CheckCircle2, Share2 } from 'lucide-react';

interface HeaderProps {
  shareMessage: string;
  shareChecklistUrl: () => Promise<void>;
}

export const Header = ({ shareMessage, shareChecklistUrl }: HeaderProps) => {
  return (
    <div className="flex flex-col items-center h-24">
      <div className="flex justify-between w-full">
        <Link to="/">
          <PrimaryButton type="submit" className="w-40">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go back to lists
          </PrimaryButton>
        </Link>
        <PrimaryButton type="button" className="w-40" onClick={() => shareChecklistUrl()}>
          <Share2 className="w-5 h-5 mr-2" />
          Share checklist
        </PrimaryButton>
      </div>
      {shareMessage && (
        <div
          className="flex text-md text-green-700 border border-green-600 rounded w-fit mt-2 px-3 py-2"
          aria-live="polite"
        >
          <CheckCircle2 className="w-5 h-5 mr-3" />
          {shareMessage}
        </div>
      )}
    </div>
  );
};
