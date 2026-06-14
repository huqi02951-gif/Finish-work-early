import AppLayout from '../components/layout/AppLayout';
import GrievanceGame from '../../components/games/grievance/GrievanceGame';

export default function GrievanceGamePage() {
  return (
    <AppLayout title="职场怨气回收站" showBack hideBottomNav hidePet>
      <GrievanceGame />
    </AppLayout>
  );
}
