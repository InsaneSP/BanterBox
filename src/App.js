import List from "./components/List/List";
import Chat from "./components/Chat/Chat";
import LoginPage from './components/login/login';
import Notification from "./components/notification/Notification";
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';
import { auth } from './lib/firebase';
import logo from './BanterBox.png'

const App = () => {
    const { currentUser, isLoading, fetchUserInfo } = useUserStore();
    const { chatId } = useChatStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            fetchUserInfo(user?.uid);
        });

        return () => {
            unSub();
        };
    }, [fetchUserInfo]);

    if (isLoading) return <div className='loading'><img src={logo} /></div>;

    return (
        <div className={currentUser ? "chat-container" : ""}>
            {currentUser ? (
                <>
                    <List />
                    {chatId && <Chat />}
                </>
            ) : (
                <LoginPage />
            )}
            <Notification />
        </div>
    );
}

export default App;