export const Home = ({ user }: { user: any }) => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Головна</h1>
      {user ? (
        <p>Вітаю, {user.username}!</p>
      ) : (
        <p>Ви ще не ввійшли в систему.</p>
      )}
    </div>
  );
}
