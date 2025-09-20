/**
 * Master App Context Provider
 * Combines all context providers in the correct hierarchy
 */

import { AuthProvider } from './AuthContext';
import { OrganizationProvider } from './OrganizationContext';
import { FacilityProvider } from './FacilityContext';
import { EmissionProvider } from './EmissionContext';
import { UserProvider } from './UserContext';
import { NotificationProvider } from './NotificationContext';

export const AppContextProvider = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <OrganizationProvider>
          <UserProvider>
            <FacilityProvider>
              <EmissionProvider>
                {children}
              </EmissionProvider>
            </FacilityProvider>
          </UserProvider>
        </OrganizationProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default AppContextProvider;
