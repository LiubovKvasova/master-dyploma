import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const MenuItem = ({ children }: { children: ReactNode }) => (
  <NavigationMenuItem>
    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
      {children}
    </NavigationMenuLink>
  </NavigationMenuItem>
);

export const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <MenuItem>
          <Link to="/">Home</Link>
        </MenuItem>

        {
          !user && (
            <>
              <MenuItem>
                <Link to="/login">Ввійти</Link>
              </MenuItem>

              <MenuItem>
                <Link to="/register">Зареєструватись</Link>
              </MenuItem>
            </>
          )
        }

        {user && (
          <>
            <MenuItem>
              <Link to="/location">
                Локація
              </Link>
            </MenuItem>

            {
              user.role === 'employer' &&
                <>
                  <MenuItem>
                    <Link to="/create-job">
                      Створити оголошення
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <Link to="/myjobs">
                      Мої оголошення
                    </Link>
                  </MenuItem>
                </>
            }

            {
              user.role === 'worker' &&
                <>
                  <MenuItem>
                    <Link to="/search-job">
                      Пошук
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <Link to="/applications">
                      Заявки
                    </Link>
                  </MenuItem>
                </>
            }

            <MenuItem>
              <Link to="/settings">
                Налаштування
              </Link>
            </MenuItem>

            <MenuItem>
              <Link to="#" onClick={onLogout} className="text-red-500">
                Вийти
              </Link>
            </MenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
