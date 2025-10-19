import { OnboardingFlow } from './OnboardingFlow';

export const Home = ({ user, setUser }: { user: any, setUser: any }) => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">
        {user?.introduced === false ?
          'Привіт! Для початку роботи нам треба знати дещо про тебе' :
          'Головна'
        }
      </h1>
      {!user ? (
        <p>Ви ще не ввійшли в систему.</p>
      ) : user.introduced ? (
        <p>Вітаю, {user.username}! Твоя поточна роль: {user.role}</p>
      ) : (
        <OnboardingFlow user={user} setUser={setUser} />
      )}
    </div>
  );
}
