import { Helmet } from 'react-helmet-async';
import EventsList from '../../components/EventsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Tech Events - Kootenay Tech Community</title>
        <meta name="description" content="Upcoming tech events, workshops, and meetups in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <ActionBar />
          <EventsList />
        </div>
      </div>
    </>
  );
}
