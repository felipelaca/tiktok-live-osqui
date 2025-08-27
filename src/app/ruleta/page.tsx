import RuletaPanel from '@/components/RuletaPanel';

export default function RuletaPage() {
  return (
    <div className="min-h-screen w-full bg-transparent">
      <RuletaPanel showButton={false} soundEnabled={true} />
    </div>
  );
}
