interface PageLoadingProps {
  className?: string;
}

export const PageLoading = ({ className = 'min-h-screen' }: PageLoadingProps) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);
