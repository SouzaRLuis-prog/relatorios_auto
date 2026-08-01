import { ReportFormWizard } from '@/components/ReportFormWizard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <ReportFormWizard />
      </div>
    </main>
  );
}