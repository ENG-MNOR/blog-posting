import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => (
  <>
    <Helmet>
      <title>Page not found | Nor Haji Osman</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">This page moved or never existed</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The link may be broken or the page may have been removed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/research">Browse research</Link>
        </Button>
      </div>
    </div>
  </>
);

export default NotFoundPage;
