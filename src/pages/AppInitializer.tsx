
import { useEffect } from 'react';
import { createTestAdmin } from '@/services/adminService';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Create test admin account when the app loads
    const initializeApp = async () => {
      const admin = await createTestAdmin();
      if (admin) {
        console.log('Test admin credentials:', admin);
      }
    };

    initializeApp();
  }, []);

  return <>{children}</>;
};

export default AppInitializer;
