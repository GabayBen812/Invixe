import AppNavigator from './navigation/AppNavigator';
import { RegistrationProvider } from './context/RegistrationContext';

export default function App() {
  return (
    <RegistrationProvider>
      <AppNavigator />
    </RegistrationProvider>
  );
}
