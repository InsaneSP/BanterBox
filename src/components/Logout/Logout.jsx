import "./logout.css";
import { useChatStore } from "../../lib/chatStore";
import { auth } from "../../lib/firebase";

const Logout = () => {
    const { resetChat } = useChatStore();
    
    const handleLogout = () => {
        auth.signOut();
        resetChat();
    };

    return (
        <div className="window">
            <p>You Better Come Back...</p>
            <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Logout;
