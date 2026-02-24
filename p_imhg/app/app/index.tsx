import { Redirect } from 'expo-router'

// Root index — always redirect to login; root _layout.tsx handles auth
export default function Index() {
    return <Redirect href="/(auth)/login" />
}
