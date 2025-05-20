import { Metadata } from 'next';
import EventsList from '../../components/EventsList';
import UpcomingEvents from '../../components/UpcomingEvents';

export const metadata: Metadata = {
  title: 'Events | Kootenay Tech Community',
  description: 'Tech and AI events in the Kootenay region',
};

export default function EventsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Events</h1>
      <div className="grid gap-8">
        <UpcomingEvents />
        <EventsList />
      </div>
    </div>
  );
}