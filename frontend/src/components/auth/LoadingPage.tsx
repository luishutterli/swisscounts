const LoadingPage = () => {
  return (
    <div className="flex justify-center items-center bg-background min-h-screen">
      <div className="text-center">
        <div className="flex justify-center items-center bg-primary mx-auto mb-6 rounded-full w-16 h-16 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Lädt">
            <title>Lädt</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="mb-2 font-bold text-text text-2xl">
          SwissCounts
        </h2>
        <p className="text-text/70">Lädt...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
