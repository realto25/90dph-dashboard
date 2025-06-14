import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='flex h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <ClerkSignInForm />
      </div>
    </div>
  );
}
