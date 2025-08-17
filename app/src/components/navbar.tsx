import { ReactNode } from 'react';
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
          !user &&
          <MenuItem>
            <Link to="/login">Login</Link>
          </MenuItem>
        }

        {
          !user &&
          <MenuItem>
            <Link to="/register">Register</Link>
          </MenuItem>
        }

        {user && (
          <MenuItem>
            <Link to="#" onClick={onLogout} className="text-red-500">
              Logout
            </Link>
          </MenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
