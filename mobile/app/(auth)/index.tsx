// Default auth route — redirect to login
import { Redirect } from 'expo-router';

export default function AuthIndex() {
  return <Redirect href="/login" />;
}
