import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import InstructorInvite from './components/InstructorInvite';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <InstructorInvite />
    </main>
  );
}